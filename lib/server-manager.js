// @flow

import path from 'path';
import * as ls from './languageclient';
import {CompositeDisposable} from 'atom';
import {type Logger} from './logger';
import LinterPushV2Adapter from './adapters/linter-push-v2-adapter';

// The necessary elements for a server that has started or is starting.
export type ActiveServer = {
  disposable: CompositeDisposable;
  projectPath: string;
  process: child_process$ChildProcess;
  connection: ls.LanguageClientConnection;
  capabilities: ls.ServerCapabilities;
  linterPushV2?: LinterPushV2Adapter;
}

// Manages the language server lifecycles and their associated objects necessary
// for adapting them to Atom and Atom IDE UI.
export class ServerManager {
  _activeServers: Array<ActiveServer> = [];
  _startingServerPromises: Map<string, Promise<ActiveServer>> = new Map();
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
      const server = await this.getServer(editor, {shouldStart: true});
      if (server != null) {
        this._editorToServer.set(editor, server);
        this._disposable.add(editor.onDidDestroy(() => {
          this._editorToServer.delete(editor);
          this.stopUnusedServers();
        }));
      }
    }
  }

  getActiveServers(): Array<ActiveServer> {
    return this._activeServers.splice();
  }

  async getServer(textEditor: atom$TextEditor,
    {shouldStart}: {shouldStart?: boolean} = {shouldStart: false}): Promise<?ActiveServer> {
    const finalProjectPath = this.determineProjectPath(textEditor);
    if (finalProjectPath == null) { // Files not yet saved have no path
      return null;
    }

    const foundActiveServer = this._activeServers.find(s => finalProjectPath == s.projectPath);
    if (foundActiveServer) { return foundActiveServer; }

    const startingPromise = this._startingServerPromises.get(finalProjectPath);
    if (startingPromise) {
      return startingPromise;
    }

    return shouldStart && this._startForEditor(textEditor) ? await this.startServer(finalProjectPath) : null;
  }

  async startServer(projectPath: string): Promise<ActiveServer> {
    this._logger.debug(`Server starting "${projectPath}"`);
    const startingPromise = this._startServer(projectPath);
    this._startingServerPromises.set(projectPath, startingPromise);
    const startedActiveServer = await startingPromise;
    this._activeServers.push(startedActiveServer);
    this._startingServerPromises.delete(projectPath);
    this._logger.debug(`Server started "${projectPath}"`);
    return startedActiveServer;
  }

  async stopUnusedServers(): Promise<void> {
    const usedServers = new Set(this._editorToServer.values());
    const unusedServers = this._activeServers.filter(s => !usedServers.has(s));
    if (unusedServers.length > 0) {
      this._logger.debug(`Stopping ${unusedServers.length} unused servers`);
      await Promise.all(unusedServers.map(s => this.stopServer(s)));
    }
  }

  async stopAllServers(): Promise<void> {
    this._logger.debug("Stopping all servers");
    await Promise.all(this._activeServers.map(s => this.stopServer(s)));
  }

  async stopServer(server: ActiveServer): Promise<void> {
    this._logger.debug(`Server stopping "${server.projectPath}"`);
    // Immediately remove the server to prevent further usage.
    // If we re-open the file after this point, we'll get a new server.
    const serverIndex = this._activeServers.indexOf(server);
    this._activeServers.splice(serverIndex, 1);
    server.disposable.dispose();
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
    return !projectPath.endsWith(path.sep) ? path.join(projectPath, path.sep) : projectPath;
  }

  projectPathsChanged(projectPaths: Array<string>): void {
    const pathsSet = new Set(projectPaths.map(this.normalizePath));
    const serversToStop = this._activeServers.filter(s => !pathsSet.has(s.projectPath));
    Promise.all(serversToStop.map(s => this.stopServer(s)));
    this.updateNormalizedProjectPaths();
  }
}
