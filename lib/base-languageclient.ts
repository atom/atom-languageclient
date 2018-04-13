import * as cp from 'child_process';
import * as ls from './languageclient';
import * as rpc from 'vscode-jsonrpc';
import * as path from 'path';
import Convert from './convert.js';
import Utils from './utils';
import { Socket } from 'net';
import { LanguageClientConnection } from './languageclient';
import {
  ConsoleLogger,
  NullLogger,
  Logger,
} from './logger';
import {
  LanguageServerProcess,
  ServerManager,
  ActiveServer,
} from './server-manager.js';
import {
  CompositeDisposable,
  TextEditor,
} from 'atom';

export { ActiveServer, LanguageClientConnection, LanguageServerProcess };
export type ConnectionType = 'stdio' | 'socket' | 'ipc';

// Public: AutoLanguageClient provides a simple way to have all the supported
// Atom-IDE services wired up entirely for you by just subclassing it and
// implementing startServerProcess/getGrammarScopes/getLanguageName and
// getServerName.
export default abstract class BaseLanguageClient {
  private _isDeactivating: boolean = false;

  protected _disposable = new CompositeDisposable();
  protected processStdErr: string = '';
  protected _serverManager!: ServerManager;
  protected logger!: Logger;
  protected name!: string;
  protected socket!: Socket;

  // You must implement these so we know how to deal with your language and server
  // -------------------------------------------------------------------------

  // Return an array of the grammar scopes you handle, e.g. [ 'source.js' ]
  protected abstract getGrammarScopes(): string[];

  // Return the name of the language you support, e.g. 'JavaScript'
  protected abstract getLanguageName(): string;

  // Return the name of your server, e.g. 'Eclipse JDT'
  protected abstract getServerName(): string;

  // Start your server process
  protected abstract startServerProcess(projectPath: string): LanguageServerProcess | Promise<LanguageServerProcess>;

  // Start adapters that are not shared between servers
  protected abstract startExclusiveAdapters(server: ActiveServer): void;

  // Report busy status
  protected abstract reportBusyWhile<T>(message: string, promiseGenerator: () => Promise<T>): Promise<T>;

  // You might want to override these for different behavior
  // ---------------------------------------------------------------------------

  // Determine whether we should start a server for a given editor if we don't have one yet
  protected shouldStartForEditor(editor: TextEditor): boolean {
    return this.getGrammarScopes().includes(editor.getGrammar().scopeName);
  }

  // Return the parameters used to initialize a client - you may want to extend capabilities
  protected getInitializeParams(projectPath: string, process: LanguageServerProcess): ls.InitializeParams {
    return {
      processId: process.pid,
      rootPath: projectPath,
      rootUri: Convert.pathToUri(projectPath),
      capabilities: {
        workspace: {
          applyEdit: true,
          workspaceEdit: {
            documentChanges: true,
          },
          didChangeConfiguration: {
            dynamicRegistration: false,
          },
          didChangeWatchedFiles: {
            dynamicRegistration: false,
          },
          symbol: {
            dynamicRegistration: false,
          },
          executeCommand: {
            dynamicRegistration: false,
          },
        },
        textDocument: {
          synchronization: {
            dynamicRegistration: false,
            willSave: true,
            willSaveWaitUntil: true,
            didSave: true,
          },
          completion: {
            dynamicRegistration: false,
            completionItem: {
              snippetSupport: true,
              commitCharactersSupport: false,
            },
            contextSupport: true,
          },
          hover: {
            dynamicRegistration: false,
          },
          signatureHelp: {
            dynamicRegistration: false,
          },
          references: {
            dynamicRegistration: false,
          },
          documentHighlight: {
            dynamicRegistration: false,
          },
          documentSymbol: {
            dynamicRegistration: false,
          },
          formatting: {
            dynamicRegistration: false,
          },
          rangeFormatting: {
            dynamicRegistration: false,
          },
          onTypeFormatting: {
            dynamicRegistration: false,
          },
          definition: {
            dynamicRegistration: false,
          },
          codeAction: {
            dynamicRegistration: false,
          },
          codeLens: {
            dynamicRegistration: false,
          },
          documentLink: {
            dynamicRegistration: false,
          },
          rename: {
            dynamicRegistration: false,
          },
        },
        experimental: {},
      },
    };
  }

  // Early wire-up of listeners before initialize method is sent
  protected preInitialization(_connection: LanguageClientConnection): void {}

  // Late wire-up of listeners after initialize method has been sent
  protected postInitialization(_server: ActiveServer): void {}

  // Determine whether to use ipc, stdio or socket to connect to the server
  protected getConnectionType(): ConnectionType {
    return this.socket != null ? 'socket' : 'stdio';
  }

  // Return the name of your root configuration key
  protected getRootConfigurationKey(): string {
    return '';
  }

  // Optionally transform the configuration object before it is sent to the server
  protected mapConfigurationObject(configuration: any): any {
    return configuration;
  }

  // Helper methods that are useful for implementors
  // ---------------------------------------------------------------------------

  // Gets a LanguageClientConnection for a given TextEditor
  protected async getConnectionForEditor(editor: TextEditor): Promise<LanguageClientConnection | null> {
    const server = await this._serverManager.getServer(editor);
    return server ? server.connection : null;
  }

  // Restart all active language servers for this language client in the workspace
  protected async restartAllServers() {
    await this._serverManager.restartAllServers();
  }

  // Default implementation of the rest of the AutoLanguageClient
  // ---------------------------------------------------------------------------

  // Activate does very little for perf reasons - hooks in via ServerManager for later 'activation'
  public activate(): void {
    this.name = `${this.getLanguageName()} (${this.getServerName()})`;
    this.logger = this.getLogger();
    this._serverManager = new ServerManager(
      (p) => this.startServer(p),
      this.logger,
      (e) => this.shouldStartForEditor(e),
      (filepath) => this.filterChangeWatchedFiles(filepath),
      this.reportBusyWhile.bind(this),
      this.getServerName(),
    );
    this._serverManager.startListening();
    process.on('exit', () => this.exitCleanup.bind(this));
  }

  private exitCleanup(): void {
    this._serverManager.terminate();
  }

  // Deactivate disposes the resources we're using
  public async deactivate(): Promise<any> {
    this._isDeactivating = true;
    this._disposable.dispose();
    this._serverManager.stopListening();
    await this._serverManager.stopAllServers();
  }

  protected spawnChildNode(args: string[], options: cp.SpawnOptions = {}): cp.ChildProcess {
    this.logger.debug(`starting child Node "${args.join(' ')}"`);
    options.env = options.env || Object.create(process.env);
    options.env.ELECTRON_RUN_AS_NODE = '1';
    options.env.ELECTRON_NO_ATTACH_CONSOLE = '1';
    return cp.spawn(process.execPath, args, options);
  }

  // By default LSP logging is switched off but you can switch it on via the core.debugLSP setting
  protected getLogger(): Logger {
    return atom.config.get('core.debugLSP') ? new ConsoleLogger(this.name) : new NullLogger();
  }

  private async startServer(projectPath: string): Promise<ActiveServer> {
    return this.reportBusyWhile(
      `Starting ${this.getServerName()} for ${path.basename(projectPath)}`,
      () => this.startServerInternal(projectPath),
    );
  }

  // Starts the server by starting the process, then initializing the language server and starting adapters
  private async startServerInternal(projectPath: string): Promise<ActiveServer> {
    let process;
    process = await this.startServerProcess(projectPath);
    this.captureServerErrors(process, projectPath);
    const connection = new LanguageClientConnection(this.createRpcConnection(process), this.logger);
    this.preInitialization(connection);
    const initializeParams = this.getInitializeParams(projectPath, process);
    const initialization = connection.initialize(initializeParams);
    this.reportBusyWhile(
      `${this.getServerName()} initializing for ${path.basename(projectPath)}`,
      () => initialization,
    );
    const initializeResponse = await initialization;
    const newServer = {
      projectPath,
      process,
      connection,
      capabilities: initializeResponse.capabilities,
      disposable: new CompositeDisposable(),
    };
    this.postInitialization(newServer);
    connection.initialized();
    connection.on('close', () => {
      if (!this._isDeactivating) {
        this._serverManager.stopServer(newServer);
        if (!this._serverManager.hasServerReachedRestartLimit(newServer)) {
          this.logger.debug(`Restarting language server for project '${newServer.projectPath}'`);
          this._serverManager.startServer(projectPath);
        } else {
          this.logger.warn(`Language server has exceeded auto-restart limit for project '${newServer.projectPath}'`);
          atom.notifications.addError(
            // tslint:disable-next-line:max-line-length
            `The ${this.name} language server has exited and exceeded the restart limit for project '${newServer.projectPath}'`);
        }
      }
    });

    const configurationKey = this.getRootConfigurationKey();
    if (configurationKey) {
      this._disposable.add(
        atom.config.observe(configurationKey, (config) => {
          const mappedConfig = this.mapConfigurationObject(config || {});
          if (mappedConfig) {
            connection.didChangeConfiguration({
              settings: mappedConfig,
            });
          }
        }));
    }

    this.startExclusiveAdapters(newServer);
    return newServer;
  }

  private captureServerErrors(childProcess: LanguageServerProcess, projectPath: string): void {
    childProcess.on('error', (err) => this.handleSpawnFailure(err));
    childProcess.on('exit', (code, signal) => this.logger.debug(`exit: code ${code} signal ${signal}`));
    childProcess.stderr.setEncoding('utf8');
    childProcess.stderr.on('data', (chunk: Buffer) => {
      const errorString = chunk.toString();
      this.handleServerStderr(errorString, projectPath);
      // Keep the last 5 lines for packages to use in messages
      this.processStdErr = (this.processStdErr + errorString)
        .split('\n')
        .slice(-5)
        .join('\n');
    });
  }

  private handleSpawnFailure(err: any): void {
    atom.notifications.addError(
      `${this.getServerName()} language server for ${this.getLanguageName()} unable to start`,
      {
        dismissable: true,
        description: err.toString(),
      },
    );
  }

  // Creates the RPC connection which can be ipc, socket or stdio
  private createRpcConnection(process: LanguageServerProcess): rpc.MessageConnection {
    let reader: rpc.MessageReader;
    let writer: rpc.MessageWriter;
    const connectionType = this.getConnectionType();
    switch (connectionType) {
      case 'ipc':
        reader = new rpc.IPCMessageReader(process as cp.ChildProcess);
        writer = new rpc.IPCMessageWriter(process as cp.ChildProcess);
        break;
      case 'socket':
        reader = new rpc.SocketMessageReader(this.socket);
        writer = new rpc.SocketMessageWriter(this.socket);
        break;
      case 'stdio':
        reader = new rpc.StreamMessageReader(process.stdout);
        writer = new rpc.StreamMessageWriter(process.stdin);
        break;
      default:
        return Utils.assertUnreachable(connectionType);
    }

    return rpc.createMessageConnection(reader, writer, {
      log: (..._args: any[]) => {},
      warn: (..._args: any[]) => {},
      info: (..._args: any[]) => {},
      error: (...args: any[]) => {
        this.logger.error(args);
      },
    });
  }

  public shouldSyncForEditor(editor: TextEditor, projectPath: string): boolean {
    return this.isFileInProject(editor, projectPath) && this.shouldStartForEditor(editor);
  }

  protected isFileInProject(editor: TextEditor, projectPath: string): boolean {
    return (editor.getURI() || '').startsWith(projectPath);
  }

  /**
   * `didChangeWatchedFiles` message filtering, override for custom logic.
   * @param filePath path of a file that has changed in the project path
   * @return false => message will not be sent to the language server
   */
  protected filterChangeWatchedFiles(_filePath: string): boolean {
    return true;
  }

  /**
   * Called on language server stderr output.
   * @param stderr a chunk of stderr from a language server instance
   */
  protected handleServerStderr(stderr: string, _projectPath: string) {
    stderr.split('\n').filter((l) => l).forEach((line) => this.logger.warn(`stderr ${line}`));
  }
}
