// @flow

import path from 'path';
import * as ls from './languageclient';
import {CompositeDisposable} from 'atom';
import {type Logger} from './logger';

export type ActiveServer = {
  disposable: CompositeDisposable;
  projectPath: string;
  process: child_process$ChildProcess;
  connection: ls.LanguageClientConnection;
  capabilities: ls.ServerCapabilities;
}

export class ServerManager {
  _activeServers: Array<ActiveServer> = [];
  _disposable: CompositeDisposable;
  _editorToServer: Map<atom$TextEditor, ActiveServer> = new Map();
  _logger: Logger;
  _normalizedProjectPaths: Array<string> = [];
  _startForEditor: (editor: atom$TextEditor) => boolean;
  _startServer: (projectPath: string) => Promise<ActiveServer>;

  constructor(startServer: (projectPath: string) => Promise<ActiveServer>, logger: Logger, startForEditor: (editor: atom$TextEditor) => boolean) {
    this._startServer = startServer;
    this._logger = logger;
    this._startForEditor = startForEditor;
    this.updateNormalizedProjectPaths();
    this._disposable = new CompositeDisposable(
      atom.project.onDidChangePaths(this.projectPathsChanged.bind(this)),
      atom.textEditors.observe(this.observeTextEditors.bind(this)),
    );
  }

  dispose(): void {
    this.stopAllServers();
    this._disposable.dispose();
  }

  async observeTextEditors(editor: atom$TextEditor): Promise<void> {
    if (!this._editorToServer.has(editor)) {
      const server = await this.getOrStartServer(editor);
      if (server != null) {
        this._editorToServer.set(editor, server);
        this._disposable.add(editor.onDidDestroy(() => {
          this._editorToServer.delete(editor);
          this.stopUnusedServers();
        }));
      }
    }
  }

  getServer(textEditor: atom$TextEditor, projectPath?: string): ?ActiveServer {
    const finalProjectPath = projectPath || this.determineProjectPath(textEditor);
    if (finalProjectPath == null) { return null; }

    const foundActiveServer = this._activeServers.find(s => finalProjectPath == s.projectPath);
    if (foundActiveServer) { return foundActiveServer; }

    return null;
  }

  async getOrStartServer(textEditor: atom$TextEditor): Promise<?ActiveServer> {
    const finalProjectPath = this.determineProjectPath(textEditor);
    if (finalProjectPath == null) { return null; }

    const server = this.getServer(textEditor, finalProjectPath);
    if (server != null) { return server; }

    return !this._startForEditor(textEditor) ? null : await this.startServer(finalProjectPath);
  }

  async startServer(projectPath: string): Promise<ActiveServer> {
    this._logger.debug(`Server starting "${projectPath}"`);
    const startedActiveServer = await this._startServer(projectPath);
    this._activeServers.push(startedActiveServer);
    this._logger.debug(`Server started "${projectPath}"`);
    return startedActiveServer;
  }

  async stopUnusedServers(): Promise<void> {
    const usedServers = new Set(this._editorToServer.values());
    const unusedServers = this._activeServers.filter(s => usedServers.has(s));
    if (unusedServers.length > 0) {
      this._logger.debug(`Stopping ${unusedServers.length} unused servers`);
    }
    await Promise.all(unusedServers.map(this.stopServer));
  }

  async stopAllServers(): Promise<void> {
    this._logger.debug("Stopping all servers");
    await Promise.all(this._activeServers.map(this.stopServer));
  }

  async stopServer(server: ActiveServer): Promise<void> {
    this._logger.debug(`Server stopping "${server.projectPath}"`);
    await server.connection.shutdown();
    server.process.kill();
    this._logger.debug(`Server stopped "${server.projectPath}"`);
  }

  determineProjectPath(textEditor: atom$TextEditor): ?string {
    const filePath = textEditor.getPath();
    if (filePath == null) { return null; }
    return this._normalizedProjectPaths.find(d => filePath.startsWith(d));
  }

  updateNormalizedProjectPaths(): void {
    this._normalizedProjectPaths = atom.project.getDirectories().map(d => this.normalizePath(d.getPath()));
  }

  normalizePath(projectPath: string): string {
    return projectPath.endsWith(path.sep) ? path.join(projectPath, path.sep) : projectPath;
  }

  projectPathsChanged(projectPaths: Array<string>): void {
    const pathsSet = new Set(projectPaths);
    const serversToStop = this._activeServers.filter(s => !pathsSet.has(s.projectPath));
    Promise.all(serversToStop.map(this.stopServer));
    this.updateNormalizedProjectPaths();
  }
}
