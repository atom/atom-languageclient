import DocumentSyncAdapter from './adapters/document-sync-adapter';
import LinterPushV2Adapter from './adapters/linter-push-v2-adapter';
import LoggingConsoleAdapter from './adapters/logging-console-adapter';
import SignatureHelpAdapter from './adapters/signature-help-adapter';
import Convert from './convert';
import * as path from 'path';
import * as stream from 'stream';
import * as ls from './languageclient';
import * as atomIde from 'atom-ide';
import { EventEmitter } from 'events';
import { Logger } from './logger';
import {
  CompositeDisposable,
  ProjectFileEvent,
  TextEditor,
} from 'atom';

// Public: Defines the minimum surface area for an object that resembles a
// ChildProcess.  This is used so that language packages with alternative
// language server process hosting strategies can return something compatible
// with AutoLanguageClient.startServerProcess.
export interface LanguageServerProcess extends EventEmitter {
  stdin: stream.Writable;
  stdout: stream.Readable;
  stderr: stream.Readable;
  pid: number;

  kill(signal?: string): void;
  on(event: 'error', listener: (err: Error) => void): this;
  on(event: 'exit', listener: (code: number, signal: string) => void): this;
}

// The necessary elements for a server that has started or is starting.
export interface ActiveServer {
  disposable: CompositeDisposable;
  projectPath: string;
  process: LanguageServerProcess;
  connection: ls.LanguageClientConnection;
  capabilities: ls.ServerCapabilities;
  linterPushV2?: LinterPushV2Adapter;
  loggingConsole?: LoggingConsoleAdapter;
  docSyncAdapter?: DocumentSyncAdapter;
  signatureHelpAdapter?: SignatureHelpAdapter;
}

interface RestartCounter {
  restarts: number;
  timerId: NodeJS.Timer;
}

// Manages the language server lifecycles and their associated objects necessary
// for adapting them to Atom IDE.
export class ServerManager {
  private _activeServers: ActiveServer[] = [];
  private _startingServerPromises: Map<string, Promise<ActiveServer>> = new Map();
  private _restartCounterPerProject: Map<string, RestartCounter> = new Map();
  private _stoppingServers: ActiveServer[] = [];
  private _disposable: CompositeDisposable = new CompositeDisposable();
  private _editorToServer: Map<TextEditor, ActiveServer> = new Map();
  private _logger: Logger;
  private _normalizedProjectPaths: string[] = [];
  private _startForEditor: (editor: TextEditor) => boolean;
  private _startServer: (projectPath: string) => Promise<ActiveServer>;
  private _changeWatchedFileFilter: (filePath: string) => boolean;
  private _getBusySignalService: () => atomIde.BusySignalService | null;
  private _languageServerName: string;
  private _isStarted = false;

  constructor(
    startServer: (projectPath: string) => Promise<ActiveServer>,
    logger: Logger,
    startForEditor: (editor: TextEditor) => boolean,
    changeWatchedFileFilter: (filePath: string) => boolean,
    busySignalServiceGetter: () => atomIde.BusySignalService | null,
    languageServerName: string,
  ) {
    this._languageServerName = languageServerName;
    this._startServer = startServer;
    this._logger = logger;
    this._startForEditor = startForEditor;
    this.updateNormalizedProjectPaths();
    this._changeWatchedFileFilter = changeWatchedFileFilter;
    this._getBusySignalService = busySignalServiceGetter;
  }

  public startListening(): void {
    if (!this._isStarted) {
      this._disposable = new CompositeDisposable();
      this._disposable.add(atom.textEditors.observe(this.observeTextEditors.bind(this)));
      this._disposable.add(atom.project.onDidChangePaths(this.projectPathsChanged.bind(this)));
      if (atom.project.onDidChangeFiles) {
        this._disposable.add(atom.project.onDidChangeFiles(this.projectFilesChanged.bind(this)));
      }
    }
  }

  public stopListening(): void {
    if (this._isStarted) {
      this._disposable.dispose();
      this._isStarted = false;
    }
  }

  private observeTextEditors(editor: TextEditor): void {
    // Track grammar changes for opened editors
    const listener = editor.observeGrammar((grammar) => this._handleGrammarChange(editor));
    this._disposable.add(editor.onDidDestroy(() => listener.dispose()));
    // Try to see if editor can have LS connected to it
    this._handleTextEditor(editor);
  }

  private async _handleTextEditor(editor: TextEditor): Promise<void> {
    if (!this._editorToServer.has(editor)) {
      // editor hasn't been processed yet, so process it by allocating LS for it if necessary
      const server = await this.getServer(editor, {shouldStart: true});
      if (server != null) {
        // There LS for the editor (either started now and already running)
        this._editorToServer.set(editor, server);
        this._disposable.add(
          editor.onDidDestroy(() => {
            this._editorToServer.delete(editor);
            this.stopUnusedServers();
          }),
        );
      }
    }
  }

  private _handleGrammarChange(editor: TextEditor) {
    if (this._startForEditor(editor)) {
      // If editor is interesting for LS process the editor further to attempt to start LS if needed
      this._handleTextEditor(editor);
    } else {
      // Editor is not supported by the LS
      const server = this._editorToServer.get(editor);
      // If LS is running for the unsupported editor then disconnect the editor from LS and shut down LS if necessary
      if (server) {
        // LS is up for unsupported server
        if (server.docSyncAdapter) {
          const syncAdapter = server.docSyncAdapter.getEditorSyncAdapter(editor);
          if (syncAdapter) {
            // Immitate editor close to disconnect LS from the editor
            syncAdapter.didClose();
          }
        }
        // Remove editor from the cache
        this._editorToServer.delete(editor);
        // Shut down LS if it's used by any other editor
        this.stopUnusedServers();
      }
    }
  }

  public getActiveServers(): ActiveServer[] {
    return this._activeServers.slice();
  }

  public async getServer(
    textEditor: TextEditor,
    {shouldStart}: {shouldStart?: boolean} = {shouldStart: false},
  ): Promise<ActiveServer | null> {
    const finalProjectPath = this.determineProjectPath(textEditor);
    if (finalProjectPath == null) {
      // Files not yet saved have no path
      return null;
    }

    const foundActiveServer = this._activeServers.find((s) => finalProjectPath === s.projectPath);
    if (foundActiveServer) {
      return foundActiveServer;
    }

    const startingPromise = this._startingServerPromises.get(finalProjectPath);
    if (startingPromise) {
      return startingPromise;
    }

    return shouldStart && this._startForEditor(textEditor) ? await this.startServer(finalProjectPath) : null;
  }

  public async startServer(projectPath: string): Promise<ActiveServer> {
    this._logger.debug(`Server starting "${projectPath}"`);
    const startingPromise = this._startServer(projectPath);
    this._startingServerPromises.set(projectPath, startingPromise);
    try {
      const startedActiveServer = await startingPromise;
      this._activeServers.push(startedActiveServer);
      this._startingServerPromises.delete(projectPath);
      this._logger.debug(`Server started "${projectPath}" (pid ${startedActiveServer.process.pid})`);
      return startedActiveServer;
    } catch (e) {
      this._startingServerPromises.delete(projectPath);
      throw e;
    }
  }

  public async stopUnusedServers(): Promise<void> {
    const usedServers = new Set(this._editorToServer.values());
    const unusedServers = this._activeServers.filter((s) => !usedServers.has(s));
    if (unusedServers.length > 0) {
      this._logger.debug(`Stopping ${unusedServers.length} unused servers`);
      await Promise.all(unusedServers.map((s) => this.stopServer(s)));
    }
  }

  public async stopAllServers(): Promise<void> {
    for (const [projectPath, restartCounter] of this._restartCounterPerProject) {
      clearTimeout(restartCounter.timerId);
      this._restartCounterPerProject.delete(projectPath);
    }

    await Promise.all(this._activeServers.map((s) => this.stopServer(s)));
  }

  public async restartAllServers(): Promise<void> {
    this.stopListening();
    await this.stopAllServers();
    this._editorToServer = new Map();
    this.startListening();
  }

  public hasServerReachedRestartLimit(server: ActiveServer) {
    let restartCounter = this._restartCounterPerProject.get(server.projectPath);

    if (!restartCounter) {
      restartCounter = {
        restarts: 0,
        timerId: setTimeout(() => {
          this._restartCounterPerProject.delete(server.projectPath);
        }, 3 * 60 * 1000 /* 3 minutes */),
      };

      this._restartCounterPerProject.set(server.projectPath, restartCounter);
    }

    return ++restartCounter.restarts > 5;
  }

  public async stopServer(server: ActiveServer): Promise<void> {
    const busySignalService = this._getBusySignalService();
    const signal = busySignalService && busySignalService.reportBusy(
      `Stopping ${this._languageServerName} for ${path.basename(server.projectPath)}`,
    );
    try {
      this._logger.debug(`Server stopping "${server.projectPath}"`);
      // Immediately remove the server to prevent further usage.
      // If we re-open the file after this point, we'll get a new server.
      this._activeServers.splice(this._activeServers.indexOf(server), 1);
      this._stoppingServers.push(server);
      server.disposable.dispose();
      if (server.connection.isConnected) {
        await server.connection.shutdown();
      }

      for (const [editor, mappedServer] of this._editorToServer) {
        if (mappedServer === server) {
          this._editorToServer.delete(editor);
        }
      }

      this.exitServer(server);
      this._stoppingServers.splice(this._stoppingServers.indexOf(server), 1);
    } finally {
      signal && signal.dispose();
    }
  }

  public exitServer(server: ActiveServer): void {
    const pid = server.process.pid;
    try {
      if (server.connection.isConnected) {
        server.connection.exit();
        server.connection.dispose();
      }
    } finally {
      server.process.kill();
    }
    this._logger.debug(`Server stopped "${server.projectPath}" (pid ${pid})`);
  }

  public terminate(): void {
    this._stoppingServers.forEach((server) => {
      this._logger.debug(`Server terminating "${server.projectPath}"`);
      this.exitServer(server);
    });
  }

  public determineProjectPath(textEditor: TextEditor): string | null {
    const filePath = textEditor.getPath();
    if (filePath == null) {
      return null;
    }
    return this._normalizedProjectPaths.find((d) => filePath.startsWith(d)) || null;
  }

  public updateNormalizedProjectPaths(): void {
    this._normalizedProjectPaths = atom.project.getDirectories().map((d) => this.normalizePath(d.getPath()));
  }

  public normalizePath(projectPath: string): string {
    return !projectPath.endsWith(path.sep) ? path.join(projectPath, path.sep) : projectPath;
  }

  public async projectPathsChanged(projectPaths: string[]): Promise<void> {
    const pathsSet = new Set(projectPaths.map(this.normalizePath));
    const serversToStop = this._activeServers.filter((s) => !pathsSet.has(s.projectPath));
    await Promise.all(serversToStop.map((s) => this.stopServer(s)));
    this.updateNormalizedProjectPaths();
  }

  public projectFilesChanged(fileEvents: ProjectFileEvent[]): void {
    if (this._activeServers.length === 0) {
      return;
    }

    for (const activeServer of this._activeServers) {
      const changes: ls.FileEvent[] = [];
      for (const fileEvent of fileEvents) {
        if (fileEvent.path.startsWith(activeServer.projectPath) && this._changeWatchedFileFilter(fileEvent.path)) {
          changes.push(Convert.atomFileEventToLSFileEvents(fileEvent)[0]);
        }
        if (
          fileEvent.oldPath &&
          fileEvent.oldPath.startsWith(activeServer.projectPath) &&
          this._changeWatchedFileFilter(fileEvent.oldPath)
        ) {
          changes.push(Convert.atomFileEventToLSFileEvents(fileEvent)[1]);
        }
      }
      if (changes.length > 0) {
        activeServer.connection.didChangeWatchedFiles({changes});
      }
    }
  }
}
