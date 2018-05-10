import * as cp from 'child_process';
import * as ls from './languageclient';
import * as rpc from 'vscode-jsonrpc';
import * as path from 'path';
import * as atomIde from 'atom-ide';
import * as linter from 'atom/linter';
import Convert from './convert.js';
import ApplyEditAdapter from './adapters/apply-edit-adapter';
import AutocompleteAdapter from './adapters/autocomplete-adapter';
import CodeActionAdapter from './adapters/code-action-adapter';
import CodeFormatAdapter from './adapters/code-format-adapter';
import CodeHighlightAdapter from './adapters/code-highlight-adapter';
import DatatipAdapter from './adapters/datatip-adapter';
import DefinitionAdapter from './adapters/definition-adapter';
import DocumentSyncAdapter from './adapters/document-sync-adapter';
import FindReferencesAdapter from './adapters/find-references-adapter';
import LinterPushV2Adapter from './adapters/linter-push-v2-adapter';
import LoggingConsoleAdapter from './adapters/logging-console-adapter';
import NotificationsAdapter from './adapters/notifications-adapter';
import OutlineViewAdapter from './adapters/outline-view-adapter';
import SignatureHelpAdapter from './adapters/signature-help-adapter';
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
  AutocompleteDidInsert,
  AutocompleteProvider,
  AutocompleteRequest,
  AutocompleteSuggestion,
  CompositeDisposable,
  Disposable,
  Point,
  Range,
  TextEditor,
} from 'atom';
import {CommandAdapter} from './adapters/command-adapter';

export { ActiveServer, LanguageClientConnection, LanguageServerProcess };
export type ConnectionType = 'stdio' | 'socket' | 'ipc';

// Public: AutoLanguageClient provides a simple way to have all the supported
// Atom-IDE services wired up entirely for you by just subclassing it and
// implementing startServerProcess/getGrammarScopes/getLanguageName and
// getServerName.
export default class AutoLanguageClient {
  private _disposable = new CompositeDisposable();
  private _serverManager: ServerManager;
  private _consoleDelegate: atomIde.ConsoleService;
  private _linterDelegate: linter.IndieDelegate;
  private _signatureHelpRegistry: atomIde.SignatureHelpRegistry | null;
  private _lastAutocompleteRequest: AutocompleteRequest;
  private _isDeactivating: boolean;

  // Available if consumeBusySignal is setup
  protected busySignalService: atomIde.BusySignalService;

  protected processStdErr: string = '';
  protected logger: Logger;
  protected name: string;
  protected socket: Socket;

  // Shared adapters that can take the RPC connection as required
  protected autoComplete: AutocompleteAdapter;
  protected datatip: DatatipAdapter;
  protected definitions: DefinitionAdapter;
  protected findReferences: FindReferencesAdapter;
  protected outlineView: OutlineViewAdapter;

  // You must implement these so we know how to deal with your language and server
  // -------------------------------------------------------------------------

  // Return an array of the grammar scopes you handle, e.g. [ 'source.js' ]
  protected getGrammarScopes(): string[] {
    throw Error('Must implement getGrammarScopes when extending AutoLanguageClient');
  }

  // Return the name of the language you support, e.g. 'JavaScript'
  protected getLanguageName(): string {
    throw Error('Must implement getLanguageName when extending AutoLanguageClient');
  }

  // Return the name of your server, e.g. 'Eclipse JDT'
  protected getServerName(): string {
    throw Error('Must implement getServerName when extending AutoLanguageClient');
  }

  // Start your server process
  protected startServerProcess(projectPath: string): LanguageServerProcess | Promise<LanguageServerProcess> {
    throw Error('Must override startServerProcess to start language server process when extending AutoLanguageClient');
  }

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
            dynamicRegistration: true,
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
  protected preInitialization(connection: LanguageClientConnection): void {}

  // Late wire-up of listeners after initialize method has been sent
  protected postInitialization(server: ActiveServer): void {}

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
      () => this.busySignalService,
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

  // Starts the server by starting the process, then initializing the language server and starting adapters
  private async startServer(projectPath: string): Promise<ActiveServer> {
    const startingSignal = this.busySignalService && this.busySignalService.reportBusy(
      `Starting ${this.getServerName()} for ${path.basename(projectPath)}`,
    );
    let process;
    try {
      process = await this.startServerProcess(projectPath);
    } finally {
      startingSignal && startingSignal.dispose();
    }
    this.captureServerErrors(process, projectPath);
    const connection = new LanguageClientConnection(this.createRpcConnection(process), this.logger);
    this.preInitialization(connection);
    const initializeParams = this.getInitializeParams(projectPath, process);
    const initialization = connection.initialize(initializeParams);
    this.busySignalService && this.busySignalService.reportBusyWhile(
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
      log: (...args: any[]) => {},
      warn: (...args: any[]) => {},
      info: (...args: any[]) => {},
      error: (...args: any[]) => {
        this.logger.error(args);
      },
    });
  }

  // Start adapters that are not shared between servers
  private startExclusiveAdapters(server: ActiveServer): void {
    ApplyEditAdapter.attach(server.connection);
    NotificationsAdapter.attach(server.connection, this.name, server.projectPath);

    if (DocumentSyncAdapter.canAdapt(server.capabilities)) {
      server.docSyncAdapter =
        new DocumentSyncAdapter(
          server.connection,
          (editor) => this.shouldSyncForEditor(editor, server.projectPath),
          server.capabilities.textDocumentSync,
          this.busySignalService,
        );
      server.disposable.add(server.docSyncAdapter);
    }

    server.linterPushV2 = new LinterPushV2Adapter(server.connection);
    if (this._linterDelegate != null) {
      server.linterPushV2.attach(this._linterDelegate);
    }
    server.disposable.add(server.linterPushV2);

    server.loggingConsole = new LoggingConsoleAdapter(server.connection);
    if (this._consoleDelegate != null) {
      server.loggingConsole.attach(this._consoleDelegate({ id: this.name, name: 'abc' }));
    }
    server.disposable.add(server.loggingConsole);

    if (SignatureHelpAdapter.canAdapt(server.capabilities)) {
      server.signatureHelpAdapter = new SignatureHelpAdapter(server, this.getGrammarScopes());
      if (this._signatureHelpRegistry != null) {
        server.signatureHelpAdapter.attach(this._signatureHelpRegistry);
      }
      server.disposable.add(server.signatureHelpAdapter);
    }

    server.commands = new CommandAdapter(server.connection);
    server.commands.initialize(server.capabilities);
    server.disposable.add(server.commands);
  }

  public shouldSyncForEditor(editor: TextEditor, projectPath: string): boolean {
    return this.isFileInProject(editor, projectPath) && this.shouldStartForEditor(editor);
  }

  protected isFileInProject(editor: TextEditor, projectPath: string): boolean {
    return (editor.getURI() || '').startsWith(projectPath);
  }

  // Autocomplete+ via LS completion---------------------------------------
  public provideAutocomplete(): AutocompleteProvider {
    return {
      selector: this.getGrammarScopes()
        .map((g) => g.includes('.') ? '.' + g : g)
        .join(', '),
      inclusionPriority: 1,
      suggestionPriority: 2,
      excludeLowerPriority: false,
      getSuggestions: this.getSuggestions.bind(this),
      onDidInsertSuggestion: this.onDidInsertSuggestion.bind(this),
      getSuggestionDetailsOnSelect: this.getSuggestionDetailsOnSelect.bind(this),
    };
  }

  protected async getSuggestions(
    request: AutocompleteRequest,
  ): Promise<AutocompleteSuggestion[]> {
    const server = await this._serverManager.getServer(request.editor);
    if (server == null || !AutocompleteAdapter.canAdapt(server.capabilities)) {
      return [];
    }

    this.autoComplete = this.autoComplete || new AutocompleteAdapter();
    this._lastAutocompleteRequest = request;
    return this.autoComplete.getSuggestions(server, request, this.onDidConvertAutocomplete,
      atom.config.get('autocomplete-plus.minimumWordLength'));
  }

  protected async getSuggestionDetailsOnSelect(
    suggestion: AutocompleteSuggestion): Promise<AutocompleteSuggestion | null> {
    const request = this._lastAutocompleteRequest;
    if (request == null) { return null; }
    const server = await this._serverManager.getServer(request.editor);
    if (server == null || !AutocompleteAdapter.canResolve(server.capabilities) || this.autoComplete == null) {
      return null;
    }

    return this.autoComplete.completeSuggestion(server, suggestion, request, this.onDidConvertAutocomplete);
  }

  protected onDidConvertAutocomplete(
    completionItem: ls.CompletionItem,
    suggestion: AutocompleteSuggestion,
    request: AutocompleteRequest,
  ): void {
  }

  protected onDidInsertSuggestion(arg: AutocompleteDidInsert): void {}

  // Definitions via LS documentHighlight and gotoDefinition------------
  public provideDefinitions(): atomIde.DefinitionProvider {
    return {
      name: this.name,
      priority: 20,
      grammarScopes: this.getGrammarScopes(),
      getDefinition: this.getDefinition.bind(this),
    };
  }

  protected async getDefinition(editor: TextEditor, point: Point): Promise<atomIde.DefinitionQueryResult | null> {
    const server = await this._serverManager.getServer(editor);
    if (server == null || !DefinitionAdapter.canAdapt(server.capabilities)) {
      return null;
    }

    this.definitions = this.definitions || new DefinitionAdapter();
    return this.definitions.getDefinition(
      server.connection,
      server.capabilities,
      this.getLanguageName(),
      editor,
      point,
    );
  }

  // Outline View via LS documentSymbol---------------------------------
  public provideOutlines(): atomIde.OutlineProvider {
    return {
      name: this.name,
      grammarScopes: this.getGrammarScopes(),
      priority: 1,
      getOutline: this.getOutline.bind(this),
    };
  }

  protected async getOutline(editor: TextEditor): Promise<atomIde.Outline | null> {
    const server = await this._serverManager.getServer(editor);
    if (server == null || !OutlineViewAdapter.canAdapt(server.capabilities)) {
      return null;
    }

    this.outlineView = this.outlineView || new OutlineViewAdapter();
    return this.outlineView.getOutline(server.connection, editor);
  }

  // Linter push v2 API via LS publishDiagnostics
  public consumeLinterV2(registerIndie: (params: {name: string}) => linter.IndieDelegate): void {
    this._linterDelegate = registerIndie({name: this.name});
    if (this._linterDelegate == null) {
      return;
    }

    for (const server of this._serverManager.getActiveServers()) {
      if (server.linterPushV2 != null) {
        server.linterPushV2.attach(this._linterDelegate);
      }
    }
  }

  // Find References via LS findReferences------------------------------
  public provideFindReferences(): atomIde.FindReferencesProvider {
    return {
      isEditorSupported: (editor: TextEditor) => this.getGrammarScopes().includes(editor.getGrammar().scopeName),
      findReferences: this.getReferences.bind(this),
    };
  }

  protected async getReferences(editor: TextEditor, point: Point): Promise<atomIde.FindReferencesReturn | null> {
    const server = await this._serverManager.getServer(editor);
    if (server == null || !FindReferencesAdapter.canAdapt(server.capabilities)) {
      return null;
    }

    this.findReferences = this.findReferences || new FindReferencesAdapter();
    return this.findReferences.getReferences(server.connection, editor, point, server.projectPath);
  }

  // Datatip via LS textDocument/hover----------------------------------
  public consumeDatatip(service: atomIde.DatatipService): void {
    this._disposable.add(
      service.addProvider({
        providerName: this.name,
        priority: 1,
        grammarScopes: this.getGrammarScopes(),
        validForScope: (scopeName: string) => {
          return this.getGrammarScopes().includes(scopeName);
        },
        datatip: this.getDatatip.bind(this),
      }),
    );
  }

  protected async getDatatip(editor: TextEditor, point: Point): Promise<atomIde.Datatip | null> {
    const server = await this._serverManager.getServer(editor);
    if (server == null || !DatatipAdapter.canAdapt(server.capabilities)) {
      return null;
    }

    this.datatip = this.datatip || new DatatipAdapter();
    return this.datatip.getDatatip(server.connection, editor, point);
  }

  // Console via LS logging---------------------------------------------
  public consumeConsole(createConsole: atomIde.ConsoleService): Disposable {
    this._consoleDelegate = createConsole;

    for (const server of this._serverManager.getActiveServers()) {
      if (server.loggingConsole == null) {
        server.loggingConsole = new LoggingConsoleAdapter(server.connection);
      }
      server.loggingConsole.attach(this._consoleDelegate({ id: this.name, name: 'abc' }));
    }

    // No way of detaching from client connections today
    return new Disposable(() => { });
  }

  // Code Format via LS formatDocument & formatDocumentRange------------
  public provideCodeFormat(): atomIde.RangeCodeFormatProvider {
    return {
      grammarScopes: this.getGrammarScopes(),
      priority: 1,
      formatCode: this.getCodeFormat.bind(this),
    };
  }

  protected async getCodeFormat(editor: TextEditor, range: Range): Promise<atomIde.TextEdit[]> {
    const server = await this._serverManager.getServer(editor);
    if (server == null || !CodeFormatAdapter.canAdapt(server.capabilities)) {
      return [];
    }

    return CodeFormatAdapter.format(server.connection, server.capabilities, editor, range);
  }

  public provideCodeHighlight(): atomIde.CodeHighlightProvider {
    return {
      grammarScopes: this.getGrammarScopes(),
      priority: 1,
      highlight: (editor, position) => {
        return this.getCodeHighlight(editor, position);
      },
    };
  }

  protected async getCodeHighlight(editor: TextEditor, position: Point): Promise<Range[] | null> {
    const server = await this._serverManager.getServer(editor);
    if (server == null || !CodeHighlightAdapter.canAdapt(server.capabilities)) {
      return null;
    }

    return CodeHighlightAdapter.highlight(server.connection, server.capabilities, editor, position);
  }

  public provideCodeActions(): atomIde.CodeActionProvider {
    return {
      grammarScopes: this.getGrammarScopes(),
      priority: 1,
      getCodeActions: (editor, range, diagnostics) => {
        return this.getCodeActions(editor, range, diagnostics);
      },
    };
  }

  protected async getCodeActions(editor: TextEditor, range: Range, diagnostics: atomIde.Diagnostic[]) {
    const server = await this._serverManager.getServer(editor);
    if (server == null || !CodeActionAdapter.canAdapt(server.capabilities)) {
      return null;
    }

    return CodeActionAdapter.getCodeActions(
      server.connection,
      server.capabilities,
      server.linterPushV2,
      editor,
      range,
      diagnostics,
    );
  }

  public consumeSignatureHelp(registry: atomIde.SignatureHelpRegistry): Disposable {
    this._signatureHelpRegistry = registry;
    for (const server of this._serverManager.getActiveServers()) {
      if (server.signatureHelpAdapter != null) {
        server.signatureHelpAdapter.attach(registry);
      }
    }
    return new Disposable(() => {
      this._signatureHelpRegistry = null;
    });
  }

  public consumeBusySignal(service: atomIde.BusySignalService): Disposable {
    this.busySignalService = service;
    return new Disposable(() => delete this.busySignalService);
  }

  /**
   * `didChangeWatchedFiles` message filtering, override for custom logic.
   * @param filePath path of a file that has changed in the project path
   * @return false => message will not be sent to the language server
   */
  protected filterChangeWatchedFiles(filePath: string): boolean {
    return true;
  }

  /**
   * Called on language server stderr output.
   * @param stderr a chunk of stderr from a language server instance
   */
  private handleServerStderr(stderr: string, projectPath: string) {
    stderr.split('\n').filter((l) => l).forEach((line) => this.logger.warn(`stderr ${line}`));
  }
}
