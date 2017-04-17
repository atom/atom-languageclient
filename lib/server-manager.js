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
  _startServer: (projectPath: string) => Promise<ActiveServer>;
  _logger: Logger;
  _editors: WeakMap<atom$TextEditor, ServerManager> = new WeakMap();
  _normalizedProjectPaths: Array<string> = [];

  constructor(startServer: (projectPath: string) => Promise<ActiveServer>, logger: Logger) {
    this._startServer = startServer;
    this._logger = logger;
    this._disposable = new CompositeDisposable(
      atom.project.onDidChangePaths(this.projectPathsChanged.bind(this)),
      atom.textEditors.observe(this.observeTextEditors.bind(this)),
    );
    this.updateNormalizedProjectPaths();
  }

  dispose(): void {
    this.stopAllServers();
    this._disposable.dispose();
  }

  observeTextEditors(editor: atom$TextEditor): void {
    if (!this._editors.has(editor)) {
      this._editors.set(editor, this);
      this._disposable.add(editor.onDidDestroy(() => {
        this._editors.delete(editor);
      }));
    }
  }

  async getServer(textEditor: atom$TextEditor): Promise<?ActiveServer> {
    const projectPath = this.determineProjectPath(textEditor);
    if (projectPath == null) { return null; }

    const foundActiveServer = this._activeServers.find(s => projectPath == s.projectPath);
    if (foundActiveServer) { return foundActiveServer; }

    this._logger.debug(`Server starting "${projectPath}"`);
    const startedActiveServer = await this._startServer(projectPath);
    this._activeServers.push(startedActiveServer);
    this._logger.debug(`Server started "${projectPath}"`);
    return startedActiveServer;
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
    this._normalizedProjectPaths = atom.project.getDirectories().filter(d => d.isDirectory()).map(d => this.normalizePath(d.getPath()));
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
