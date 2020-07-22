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
import RenameAdapter from './adapters/rename-adapter';
import SignatureHelpAdapter from './adapters/signature-help-adapter';
import * as Utils from './utils';
import { Socket } from 'net';
import { LanguageClientConnection } from './languageclient';
import {
  ConsoleLogger,
  FilteredLogger,
  Logger,
} from './logger';
import {
  LanguageServerProcess,
  ServerManager,
  ActiveServer,
} from './server-manager.js';
import {
  Disposable,
  CompositeDisposable,
  Point,
  Range,
  TextEditor,
} from 'atom';
import * as ac from 'atom/autocomplete-plus';
import { TextEdit, CodeAction } from 'atom-ide';

export { ActiveServer, LanguageClientConnection, LanguageServerProcess };
export type ConnectionType = 'stdio' | 'socket' | 'ipc';

export interface ServerAdapters {
  linterPushV2: LinterPushV2Adapter;
  loggingConsole: LoggingConsoleAdapter;
  signatureHelpAdapter?: SignatureHelpAdapter;
}

/**
 * Public: AutoLanguageClient provides a simple way to have all the supported
 * Atom-IDE services wired up entirely for you by just subclassing it and
 * implementing at least
 * - `startServerProcess`
 * - `getGrammarScopes`
 * - `getLanguageName`
 * - `getServerName`
 */
export default class AutoLanguageClient {
  private _disposable!: CompositeDisposable;
  private _serverManager!: ServerManager;
  private _consoleDelegate?: atomIde.ConsoleService;
  private _linterDelegate?: linter.IndieDelegate;
  private _signatureHelpRegistry?: atomIde.SignatureHelpRegistry;
  private _lastAutocompleteRequest?: ac.SuggestionsRequestedEvent;
  private _isDeactivating: boolean = false;
  private _serverAdapters = new WeakMap<ActiveServer, ServerAdapters>();

  /** Available if consumeBusySignal is setup */
  protected busySignalService?: atomIde.BusySignalService;

  protected processStdErr: string = '';
  protected logger!: Logger;
  protected name!: string;
  protected socket!: Socket;

  // Shared adapters that can take the RPC connection as required
  protected autoComplete?: AutocompleteAdapter;
  protected datatip?: DatatipAdapter;
  protected definitions?: DefinitionAdapter;
  protected findReferences?: FindReferencesAdapter;
  protected outlineView?: OutlineViewAdapter;

  // You must implement these so we know how to deal with your language and server
  // -------------------------------------------------------------------------

  /** Return an array of the grammar scopes you handle, e.g. [ 'source.js' ] */
  protected getGrammarScopes(): string[] {
    throw Error('Must implement getGrammarScopes when extending AutoLanguageClient');
  }

  /** Return the name of the language you support, e.g. 'JavaScript' */
  protected getLanguageName(): string {
    throw Error('Must implement getLanguageName when extending AutoLanguageClient');
  }

  /** Return the name of your server, e.g. 'Eclipse JDT' */
  protected getServerName(): string {
    throw Error('Must implement getServerName when extending AutoLanguageClient');
  }

  /** Start your server process */
  protected startServerProcess(_projectPath: string): LanguageServerProcess | Promise<LanguageServerProcess> {
    throw Error('Must override startServerProcess to start language server process when extending AutoLanguageClient');
  }

  // You might want to override these for different behavior
  // ---------------------------------------------------------------------------

  /** (Optional) Determine whether we should start a server for a given editor if we don't have one yet */
  protected shouldStartForEditor(editor: TextEditor): boolean {
    return this.getGrammarScopes().includes(editor.getGrammar().scopeName);
  }

  /** (Optional) Return the parameters used to initialize a client - you may want to extend capabilities */
  protected getInitializeParams(projectPath: string, process: LanguageServerProcess): ls.InitializeParams {
    return {
      processId: process.pid,
      rootPath: projectPath,
      rootUri: Convert.pathToUri(projectPath),
      workspaceFolders: [],
      capabilities: {
        workspace: {
          applyEdit: true,
          configuration: false,
          workspaceEdit: {
            documentChanges: true,
          },
          workspaceFolders: false,
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
            hierarchicalDocumentSymbolSupport: true,
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

          // We do not support these features yet.
          // Need to set to undefined to appease TypeScript weak type detection.
          implementation: undefined,
          typeDefinition: undefined,
          colorProvider: undefined,
          foldingRange: undefined,
        },
        experimental: {},
      },
    };
  }

  /** (Optional) Early wire-up of listeners before initialize method is sent */
  protected preInitialization(_connection: LanguageClientConnection): void { }

  /** (Optional) Late wire-up of listeners after initialize method has been sent */
  protected postInitialization(_server: ActiveServer): void { }

  /** (Optional) Determine whether to use ipc, stdio or socket to connect to the server */
  protected getConnectionType(): ConnectionType {
    return this.socket != null ? 'socket' : 'stdio';
  }

  /** (Optional) Return the name of your root configuration key */
  protected getRootConfigurationKey(): string {
    return '';
  }

  /** (Optional) Transform the configuration object before it is sent to the server */
  protected mapConfigurationObject(configuration: any): any {
    return configuration;
  }

  // Helper methods that are useful for implementors
  // ---------------------------------------------------------------------------

  /** Gets a LanguageClientConnection for a given TextEditor */
  protected async getConnectionForEditor(editor: TextEditor): Promise<LanguageClientConnection | null> {
    const server = await this._serverManager.getServer(editor);
    return server ? server.connection : null;
  }

  /** Restart all active language servers for this language client in the workspace */
  protected async restartAllServers(): Promise<void> {
    await this._serverManager.restartAllServers();
  }

  // Default implementation of the rest of the AutoLanguageClient
  // ---------------------------------------------------------------------------

  /** Activate does very little for perf reasons - hooks in via ServerManager for later 'activation' */
  public activate(): void {
    this._disposable = new CompositeDisposable();
    this.name = `${this.getLanguageName()} (${this.getServerName()})`;
    this.logger = this.getLogger();
    this._serverManager = new ServerManager(
      (p) => this.startServer(p),
      this.logger,
      (e) => this.shouldStartForEditor(e),
      (filepath) => this.filterChangeWatchedFiles(filepath),
      this.reportBusyWhile,
      this.getServerName(),
    );
    this._serverManager.startListening();
    process.on('exit', () => this.exitCleanup.bind(this));
  }

  private exitCleanup(): void {
    this._serverManager.terminate();
  }

  /** Deactivate disposes the resources we're using */
  public async deactivate(): Promise<any> {
    this._isDeactivating = true;
    this._disposable.dispose();
    this._serverManager.stopListening();
    await this._serverManager.stopAllServers();
  }

  protected spawnChildNode(args: string[], options: cp.SpawnOptions = {}): cp.ChildProcess {
    this.logger.debug(`starting child Node "${args.join(' ')}"`);
    options.env = options.env || Object.create(process.env);
    if (options.env) {
      options.env.ELECTRON_RUN_AS_NODE = '1';
      options.env.ELECTRON_NO_ATTACH_CONSOLE = '1';
    }
    return cp.spawn(process.execPath, args, options);
  }

  /** LSP logging is only set for warnings & errors by default unless you turn on the core.debugLSP setting */
  protected getLogger(): Logger {
    const filter = atom.config.get('core.debugLSP')
      ? FilteredLogger.DeveloperLevelFilter
      : FilteredLogger.UserLevelFilter;
    return new FilteredLogger(new ConsoleLogger(this.name), filter);
  }

  /** Starts the server by starting the process, then initializing the language server and starting adapters */
  private async startServer(projectPath: string): Promise<ActiveServer> {
    const process = await this.reportBusyWhile(
      `Starting ${this.getServerName()} for ${path.basename(projectPath)}`,
      async () => this.startServerProcess(projectPath),
    );
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
            `The ${this.name} language server has exited and exceeded the restart limit for project '${newServer.projectPath}'`);
        }
      }
    });

    const configurationKey = this.getRootConfigurationKey();
    if (configurationKey) {
      newServer.disposable.add(
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

  /** Creates the RPC connection which can be ipc, socket or stdio */
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
      log: (..._args: any[]) => { },
      warn: (..._args: any[]) => { },
      info: (..._args: any[]) => { },
      error: (...args: any[]) => {
        this.logger.error(args);
      },
    });
  }

  /** Start adapters that are not shared between servers */
  private startExclusiveAdapters(server: ActiveServer): void {
    ApplyEditAdapter.attach(server.connection);
    NotificationsAdapter.attach(server.connection, this.name, server.projectPath);

    if (DocumentSyncAdapter.canAdapt(server.capabilities)) {
      const docSyncAdapter =
        new DocumentSyncAdapter(
          server.connection,
          (editor) => this.shouldSyncForEditor(editor, server.projectPath),
          server.capabilities.textDocumentSync,
          this.reportBusyWhile,
        );
      server.disposable.add(docSyncAdapter);
    }

    const linterPushV2 = new LinterPushV2Adapter(server.connection);
    if (this._linterDelegate != null) {
      linterPushV2.attach(this._linterDelegate);
    }
    server.disposable.add(linterPushV2);

    const loggingConsole = new LoggingConsoleAdapter(server.connection);
    if (this._consoleDelegate != null) {
      loggingConsole.attach(this._consoleDelegate({ id: this.name, name: this.getLanguageName() }));
    }
    server.disposable.add(loggingConsole);

    let signatureHelpAdapter: SignatureHelpAdapter | undefined;
    if (SignatureHelpAdapter.canAdapt(server.capabilities)) {
      signatureHelpAdapter = new SignatureHelpAdapter(server, this.getGrammarScopes());
      if (this._signatureHelpRegistry != null) {
        signatureHelpAdapter.attach(this._signatureHelpRegistry);
      }
      server.disposable.add(signatureHelpAdapter);
    }

    this._serverAdapters.set(server, {
      linterPushV2, loggingConsole, signatureHelpAdapter,
    });
  }

  public shouldSyncForEditor(editor: TextEditor, projectPath: string): boolean {
    return this.isFileInProject(editor, projectPath) && this.shouldStartForEditor(editor);
  }

  protected isFileInProject(editor: TextEditor, projectPath: string): boolean {
    return (editor.getPath() || '').startsWith(projectPath);
  }

  // Autocomplete+ via LS completion---------------------------------------
  public provideAutocomplete(): ac.AutocompleteProvider {
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
    request: ac.SuggestionsRequestedEvent,
  ): Promise<ac.AnySuggestion[]> {
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
    suggestion: ac.AnySuggestion,
  ): Promise<ac.AnySuggestion | null> {
    const request = this._lastAutocompleteRequest;
    if (request == null) { return null; }
    const server = await this._serverManager.getServer(request.editor);
    if (server == null || !AutocompleteAdapter.canResolve(server.capabilities) || this.autoComplete == null) {
      return null;
    }

    return this.autoComplete.completeSuggestion(server, suggestion, request, this.onDidConvertAutocomplete);
  }

  protected onDidConvertAutocomplete(
    _completionItem: ls.CompletionItem,
    _suggestion: ac.AnySuggestion,
    _request: ac.SuggestionsRequestedEvent,
  ): void {
  }

  protected onDidInsertSuggestion(_arg: ac.SuggestionInsertedEvent): void { }

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
  public consumeLinterV2(registerIndie: (params: { name: string }) => linter.IndieDelegate): void {
    this._linterDelegate = registerIndie({ name: this.name });
    if (this._linterDelegate == null) {
      return;
    }

    for (const server of this._serverManager.getActiveServers()) {
      const linterPushV2 = this.getServerAdapter(server, 'linterPushV2');
      if (linterPushV2 != null) {
        linterPushV2.attach(this._linterDelegate);
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
      const loggingConsole = this.getServerAdapter(server, 'loggingConsole');
      if (loggingConsole) {
        loggingConsole.attach(this._consoleDelegate({ id: this.name, name: this.getLanguageName() }));
      }
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

  public provideRangeCodeFormat(): atomIde.RangeCodeFormatProvider {
    return {
      grammarScopes: this.getGrammarScopes(),
      priority: 1,
      formatCode: this.getRangeCodeFormat.bind(this),
    };
  }

  protected async getRangeCodeFormat(editor: TextEditor, range: Range): Promise<atomIde.TextEdit[]> {
    const server = await this._serverManager.getServer(editor);
    if (server == null || !server.capabilities.documentRangeFormattingProvider) {
      return [];
    }

    return CodeFormatAdapter.formatRange(server.connection, editor, range);
  }

  public provideFileCodeFormat(): atomIde.FileCodeFormatProvider {
    return {
      grammarScopes: this.getGrammarScopes(),
      priority: 1,
      formatEntireFile: this.getFileCodeFormat.bind(this),
    };
  }

  public provideOnSaveCodeFormat(): atomIde.OnSaveCodeFormatProvider {
    return {
      grammarScopes: this.getGrammarScopes(),
      priority: 1,
      formatOnSave: this.getFileCodeFormat.bind(this),
    };
  }

  protected async getFileCodeFormat(editor: TextEditor): Promise<atomIde.TextEdit[]> {
    const server = await this._serverManager.getServer(editor);
    if (server == null || !server.capabilities.documentFormattingProvider) {
      return [];
    }

    return CodeFormatAdapter.formatDocument(server.connection, editor);
  }

  public provideOnTypeCodeFormat(): atomIde.OnTypeCodeFormatProvider {
    return {
      grammarScopes: this.getGrammarScopes(),
      priority: 1,
      formatAtPosition: this.getOnTypeCodeFormat.bind(this),
    };
  }

  protected async getOnTypeCodeFormat(
    editor: TextEditor,
    point: Point,
    character: string,
  ): Promise<atomIde.TextEdit[]> {
    const server = await this._serverManager.getServer(editor);
    if (server == null || !server.capabilities.documentOnTypeFormattingProvider) {
      return [];
    }

    return CodeFormatAdapter.formatOnType(server.connection, editor, point, character);
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

  protected async getCodeActions(
    editor: TextEditor,
    range: Range,
    diagnostics: atomIde.Diagnostic[]
  ): Promise<CodeAction[] | null> {
    const server = await this._serverManager.getServer(editor);
    if (server == null || !CodeActionAdapter.canAdapt(server.capabilities)) {
      return null;
    }

    return CodeActionAdapter.getCodeActions(
      server.connection,
      server.capabilities,
      this.getServerAdapter(server, 'linterPushV2'),
      editor,
      range,
      diagnostics,
    );
  }

  public provideRefactor(): atomIde.RefactorProvider {
    return {
      grammarScopes: this.getGrammarScopes(),
      priority: 1,
      rename: this.getRename.bind(this),
    };
  }

  protected async getRename(
    editor: TextEditor,
    position: Point,
    newName: string
  ): Promise<Map<string, TextEdit[]> | null> {
    const server = await this._serverManager.getServer(editor);
    if (server == null || !RenameAdapter.canAdapt(server.capabilities)) {
      return null;
    }

    return RenameAdapter.getRename(
      server.connection,
      editor,
      position,
      newName,
    );
  }

  public consumeSignatureHelp(registry: atomIde.SignatureHelpRegistry): Disposable {
    this._signatureHelpRegistry = registry;
    for (const server of this._serverManager.getActiveServers()) {
      const signatureHelpAdapter = this.getServerAdapter(server, 'signatureHelpAdapter');
      if (signatureHelpAdapter != null) {
        signatureHelpAdapter.attach(registry);
      }
    }
    return new Disposable(() => {
      this._signatureHelpRegistry = undefined;
    });
  }

  public consumeBusySignal(service: atomIde.BusySignalService): Disposable {
    this.busySignalService = service;
    return new Disposable(() => delete this.busySignalService);
  }

  /**
   * `didChangeWatchedFiles` message filtering, override for custom logic.
   * @param filePath Path of a file that has changed in the project path
   * @returns `false` => message will not be sent to the language server
   */
  protected filterChangeWatchedFiles(_filePath: string): boolean {
    return true;
  }

  /**
   * Called on language server stderr output.
   * @param stderr A chunk of stderr from a language server instance
   */
  protected handleServerStderr(stderr: string, _projectPath: string): void {
    stderr.split('\n').filter((l) => l).forEach((line) => this.logger.warn(`stderr ${line}`));
  }

  private getServerAdapter<T extends keyof ServerAdapters>(
    server: ActiveServer, adapter: T,
  ): ServerAdapters[T] | undefined {
    const adapters = this._serverAdapters.get(server);
    return adapters && adapters[adapter];
  }

  protected reportBusyWhile: Utils.ReportBusyWhile = async (title, f) => {
    if (this.busySignalService) {
      return this.busySignalService.reportBusyWhile(title, f);
    } else {
      return this.reportBusyWhileDefault(title, f);
    }
  }

  protected reportBusyWhileDefault: Utils.ReportBusyWhile = async (title, f) => {
    this.logger.info(`[Started] ${title}`);
    let res;
    try {
      res = await f();
    } finally {
      this.logger.info(`[Finished] ${title}`);
    }
    return res;
  }
}
