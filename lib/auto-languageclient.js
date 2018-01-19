// @flow

import * as cp from 'child_process';
import * as ls from './languageclient';
import * as rpc from 'vscode-jsonrpc';
import path from 'path';
import {CompositeDisposable, Disposable} from 'atom';
import {ConsoleLogger, NullLogger, type Logger} from './logger';
import {ServerManager, type ActiveServer} from './server-manager.js';
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
import NotificationsAdapter from './adapters/notifications-adapter';
import OutlineViewAdapter from './adapters/outline-view-adapter';
import SignatureHelpAdapter from './adapters/signature-help-adapter';

type ConnectionType = 'stdio' | 'socket' | 'ipc';

// Public: AutoLanguageClient provides a simple way to have all the supported
// Atom-IDE services wired up entirely for you by just subclassing it and
// implementing startServerProcess/getGrammarScopes/getLanguageName and
// getServerName.
export default class AutoLanguageClient {
  _disposable = new CompositeDisposable();
  _serverManager: ServerManager;
  _linterDelegate: linter$V2IndieDelegate;
  _signatureHelpRegistry: ?atomIde$SignatureHelpRegistry;
  _lastAutocompleteRequest: ?atom$AutocompleteRequest;
  _isDeactivating: boolean;

  // Available if consumeBusySignal is setup
  busySignalService: ?atomIde$BusySignalService;

  processStdErr: string = '';
  logger: Logger;
  name: string;
  socket: net$Socket;

  // Shared adapters that can take the RPC connection as required
  autoComplete: ?AutocompleteAdapter;
  datatip: ?DatatipAdapter;
  definitions: ?DefinitionAdapter;
  findReferences: ?FindReferencesAdapter;
  outlineView: ?OutlineViewAdapter;

  // You must implement these so we know how to deal with your language and server
  // -------------------------------------------------------------------------

  // Return an array of the grammar scopes you handle, e.g. [ 'source.js' ]
  getGrammarScopes(): Array<string> {
    throw Error('Must implement getGrammarScopes when extending AutoLanguageClient');
  }

  // Return the name of the language you support, e.g. 'JavaScript'
  getLanguageName(): string {
    throw Error('Must implement getLanguageName when extending AutoLanguageClient');
  }

  // Return the name of your server, e.g. 'Eclipse JDT'
  getServerName(): string {
    throw Error('Must implement getServerName when extending AutoLanguageClient');
  }

  // Start your server process
  startServerProcess(projectPath: string): child_process$ChildProcess | Promise<child_process$ChildProcess> {
    throw Error('Must override startServerProcess to start language server process when extending AutoLanguageClient');
  }

  // You might want to override these for different behavior
  // ---------------------------------------------------------------------------

  // Determine whether we should start a server for a given editor if we don't have one yet
  shouldStartForEditor(editor: atom$TextEditor): boolean {
    return this.getGrammarScopes().includes(editor.getGrammar().scopeName);
  }

  // Return the parameters used to initialize a client - you may want to extend capabilities
  getInitializeParams(projectPath: string, process: child_process$ChildProcess): ls.InitializeParams {
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
            willSaveWaitUntil: false,
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
  preInitialization(connection: ls.LanguageClientConnection): void {}

  // Late wire-up of listeners after initialize method has been sent
  postInitialization(server: ActiveServer): void {}

  // Determine whether to use ipc, stdio or socket to connect to the server
  getConnectionType(): ConnectionType {
    return this.socket != null ? 'socket' : 'stdio';
  }

  // Return the name of your root configuration key
  getRootConfigurationKey(): string {
    return '';
  }

  // Optionally transform the configuration object before it is sent to the server
  mapConfigurationObject(configuration: any): any {
    return configuration;
  }

  // Helper methods that are useful for implementors
  // ---------------------------------------------------------------------------

  // Gets a LanguageClientConnection for a given TextEditor
  async getConnectionForEditor(editor: atom$TextEditor): Promise<?ls.LanguageClientConnection> {
    const server = await this._serverManager.getServer(editor);
    return server ? server.connection : null;
  }

  // Restart all active language servers for this language client in the workspace
  async restartAllServers() {
    await this._serverManager.restartAllServers();
  }

  // Default implementation of the rest of the AutoLanguageClient
  // ---------------------------------------------------------------------------

  // Activate does very little for perf reasons - hooks in via ServerManager for later 'activation'
  activate(): void {
    this.name = `${this.getLanguageName()} (${this.getServerName()})`;
    this.logger = this.getLogger();
    this._serverManager = new ServerManager(
      p => this.startServer(p),
      this.logger,
      e => this.shouldStartForEditor(e),
      filepath => this.filterChangeWatchedFiles(filepath),
      () => this.busySignalService,
      this.getServerName(),
    );
    this._serverManager.startListening();
    process.on('exit', () => this.exitCleanup.bind(this));
  }

  exitCleanup(): void {
    this._serverManager.terminate();
  }

  // Deactivate disposes the resources we're using
  async deactivate(): Promise<any> {
    this._isDeactivating = true;
    this._disposable.dispose();
    this._serverManager.stopListening();
    await this._serverManager.stopAllServers();
  }

  spawnChildNode(args: Array<string>, options?: child_process$spawnOpts = {}): child_process$ChildProcess {
    this.logger.debug(`starting child Node "${args.join(' ')}"`);
    options.env = options.env || Object.create(process.env);
    options.env.ELECTRON_RUN_AS_NODE = '1';
    options.env.ELECTRON_NO_ATTACH_CONSOLE = '1';
    return cp.spawn(process.execPath, args, options);
  }

  // By default LSP logging is switched off but you can switch it on via the core.debugLSP setting
  getLogger(): Logger {
    return atom.config.get('core.debugLSP') ? new ConsoleLogger(this.name) : new NullLogger();
  }

  // Starts the server by starting the process, then initializing the language server and starting adapters
  async startServer(projectPath: string): Promise<ActiveServer> {
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
    const connection = new ls.LanguageClientConnection(this.createRpcConnection(process), this.logger);
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
      if (!this.isDeactivating) {
        this._serverManager.stopServer(newServer);
        if (!this._serverManager.hasServerReachedRestartLimit(newServer)) {
          this.logger.debug(`Restarting language server for project '${newServer.projectPath}'`);
          this._serverManager.startServer(projectPath);
        } else {
          this.logger.warn(`Language server has exceeded auto-restart limit for project '${newServer.projectPath}'`);
          atom.notifications.addError(`The ${this.name} language server has exited and exceeded the restart limit for project '${newServer.projectPath}'`);
        }
      }
    });

    const configurationKey = this.getRootConfigurationKey();
    if (configurationKey) {
      this._disposable.add(
        atom.config.observe(configurationKey, config => {
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

  captureServerErrors(childProcess: child_process$ChildProcess, projectPath: string): void {
    childProcess.on('error', err => this.handleSpawnFailure(err));
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

  handleSpawnFailure(err: any): void {
    atom.notifications.addError(
      `${this.getServerName()} language server for ${this.getLanguageName()} unable to start`,
      {
        dismissable: true,
        description: err.toString(),
      },
    );
  }

  // Creates the RPC connection which can be ipc, socket or stdio
  createRpcConnection(process: child_process$ChildProcess): rpc.Connection {
    let reader, writer;
    const connectionType = this.getConnectionType();
    switch (connectionType) {
      case 'ipc':
        reader = new rpc.IPCMessageReader(process);
        writer = new rpc.IPCMessageWriter(process);
        break;
      case 'socket':
        reader = new rpc.SocketMessageReader(this.socket);
        writer = new rpc.SocketMessageWriter(this.socket);
        break;
      case 'stdio':
        reader = new rpc.StreamMessageReader(process.stdout);
        writer = new rpc.StreamMessageWriter(process.stdin);
        break;
    }

    return rpc.createMessageConnection(reader, writer, {
      error: m => {
        this.logger.error(m);
      },
    });
  }

  // Start adapters that are not shared between servers
  startExclusiveAdapters(server: ActiveServer): void {
    ApplyEditAdapter.attach(server.connection);
    NotificationsAdapter.attach(server.connection, this.name);

    if (DocumentSyncAdapter.canAdapt(server.capabilities)) {
      server.docSyncAdapter = new DocumentSyncAdapter(server.connection, server.capabilities.textDocumentSync, editor =>
        this.shouldSyncForEditor(editor, server.projectPath),
      );
      server.disposable.add(server.docSyncAdapter);
    }

    server.linterPushV2 = new LinterPushV2Adapter(server.connection);
    if (this._linterDelegate != null) {
      server.linterPushV2.attach(this._linterDelegate);
    }
    server.disposable.add(server.linterPushV2);

    if (SignatureHelpAdapter.canAdapt(server.capabilities)) {
      server.signatureHelpAdapter = new SignatureHelpAdapter(server, this.getGrammarScopes());
      if (this._signatureHelpRegistry != null) {
        server.signatureHelpAdapter.attach(this._signatureHelpRegistry);
      }
      server.disposable.add(server.signatureHelpAdapter);
    }
  }

  shouldSyncForEditor(editor: atom$TextEditor, projectPath: string): boolean {
    return this.isFileInProject(editor, projectPath) && this.shouldStartForEditor(editor);
  }

  isFileInProject(editor: atom$TextEditor, projectPath: string): boolean {
    return (editor.getURI() || '').startsWith(projectPath);
  }

  // Autocomplete+ via LS completion---------------------------------------
  provideAutocomplete(): atom$AutocompleteProvider {
    return {
      selector: this.getGrammarScopes()
        .map(g => '.' + g)
        .join(', '),
      inclusionPriority: 1,
      suggestionPriority: 2,
      excludeLowerPriority: false,
      getSuggestions: this.getSuggestions.bind(this),
      onDidInsertSuggestion: this.onDidInsertSuggestion.bind(this),
      getSuggestionDetailsOnSelect: this.getSuggestionDetailsOnSelect.bind(this),
    };
  }

  async getSuggestions(
    request: atom$AutocompleteRequest,
  ): Promise<Array<atom$AutocompleteSuggestion>> {
    const server = await this._serverManager.getServer(request.editor);
    if (server == null || !AutocompleteAdapter.canAdapt(server.capabilities)) {
      return [];
    }

    this.autoComplete = this.autoComplete || new AutocompleteAdapter();
    this._lastAutocompleteRequest = request;
    return this.autoComplete.getSuggestions(server, request, this.onDidConvertAutocomplete);
  }

  async getSuggestionDetailsOnSelect(suggestion: atom$AutocompleteSuggestion): Promise<?atom$AutocompleteSuggestion> {
    const request = this._lastAutocompleteRequest;
    if (request == null) { return null; }
    const server = await this._serverManager.getServer(request.editor);
    if (server == null || !AutocompleteAdapter.canResolve(server.capabilities) || this.autoComplete == null) {
      return null;
    }

    return this.autoComplete.completeSuggestion(server, suggestion, request, this.onDidConvertAutocomplete);
  }

  onDidConvertAutocomplete(
    completionItem: ls.CompletionItem,
    suggestion: atom$AutocompleteSuggestion,
    request: atom$AutocompleteRequest,
  ): void {
  }

  onDidInsertSuggestion(arg: atom$AutocompleteDidInsert): void {}

  // Definitions via LS documentHighlight and gotoDefinition------------
  provideDefinitions(): atomIde$DefinitionProvider {
    return {
      name: this.name,
      priority: 20,
      grammarScopes: this.getGrammarScopes(),
      getDefinition: this.getDefinition.bind(this),
    };
  }

  async getDefinition(editor: TextEditor, point: atom$Point): Promise<?atomIde$DefinitionQueryResult> {
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
  provideOutlines(): atomIde$OutlineProvider {
    return {
      name: this.name,
      grammarScopes: this.getGrammarScopes(),
      priority: 1,
      getOutline: this.getOutline.bind(this),
    };
  }

  async getOutline(editor: atom$TextEditor): Promise<?atomIde$Outline> {
    const server = await this._serverManager.getServer(editor);
    if (server == null || !OutlineViewAdapter.canAdapt(server.capabilities)) {
      return null;
    }

    this.outlineView = this.outlineView || new OutlineViewAdapter();
    return this.outlineView.getOutline(server.connection, editor);
  }

  // Linter push v2 API via LS publishDiagnostics
  consumeLinterV2(registerIndie: ({name: string}) => linter$V2IndieDelegate): void {
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
  provideFindReferences(): atomIde$FindReferencesProvider {
    return {
      isEditorSupported: (editor: atom$TextEditor) => this.getGrammarScopes().includes(editor.getGrammar().scopeName),
      findReferences: this.getReferences.bind(this),
    };
  }

  async getReferences(editor: atom$TextEditor, point: atom$Point): Promise<?atomIde$FindReferencesReturn> {
    const server = await this._serverManager.getServer(editor);
    if (server == null || !FindReferencesAdapter.canAdapt(server.capabilities)) {
      return null;
    }

    this.findReferences = this.findReferences || new FindReferencesAdapter();
    return this.findReferences.getReferences(server.connection, editor, point, server.projectPath);
  }

  // Datatip via LS textDocument/hover----------------------------------
  consumeDatatip(service: atomIde$DatatipService): void {
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

  async getDatatip(editor: atom$TextEditor, point: atom$Point): Promise<?atomIde$Datatip> {
    const server = await this._serverManager.getServer(editor);
    if (server == null || !DatatipAdapter.canAdapt(server.capabilities)) {
      return null;
    }

    this.datatip = this.datatip || new DatatipAdapter();
    return this.datatip.getDatatip(server.connection, editor, point);
  }

  // Code Format via LS formatDocument & formatDocumentRange------------
  provideCodeFormat(): atomIde$RangeCodeFormatProvider {
    return {
      grammarScopes: this.getGrammarScopes(),
      priority: 1,
      formatCode: this.getCodeFormat.bind(this),
    };
  }

  async getCodeFormat(editor: atom$TextEditor, range: atom$Range): Promise<Array<atomIde$TextEdit>> {
    const server = await this._serverManager.getServer(editor);
    if (server == null || !CodeFormatAdapter.canAdapt(server.capabilities)) {
      return [];
    }

    return CodeFormatAdapter.format(server.connection, server.capabilities, editor, range);
  }

  provideCodeHighlight(): atomIde$CodeHighlightProvider {
    return {
      grammarScopes: this.getGrammarScopes(),
      priority: 1,
      highlight: (editor, position) => {
        return this.getCodeHighlight(editor, position);
      },
    };
  }

  async getCodeHighlight(editor: atom$TextEditor, position: atom$Point): Promise<?Array<atom$Range>> {
    const server = await this._serverManager.getServer(editor);
    if (server == null || !CodeHighlightAdapter.canAdapt(server.capabilities)) {
      return null;
    }

    return CodeHighlightAdapter.highlight(server.connection, server.capabilities, editor, position);
  }

  provideCodeActions(): atomIde$CodeActionProvider {
    return {
      grammarScopes: this.getGrammarScopes(),
      priority: 1,
      getCodeActions: (editor, range, diagnostics) => {
        return this.getCodeActions(editor, range, diagnostics);
      },
    };
  }

  async getCodeActions(editor: atom$TextEditor, range: atom$Range, diagnostics: Array<atomIde$Diagnostic>) {
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

  consumeSignatureHelp(registry: atomIde$SignatureHelpRegistry): IDisposable {
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

  consumeBusySignal(service: atomIde$BusySignalService): IDisposable {
    this.busySignalService = service;
    return new Disposable(() => delete this.busySignalService);
  }

  /**
   * `didChangeWatchedFiles` message filtering, override for custom logic.
   * @param filePath path of a file that has changed in the project path
   * @return false => message will not be sent to the language server
   */
  filterChangeWatchedFiles(filePath: string): boolean {
    return true;
  }

  /**
   * Called on language server stderr output.
   * @param stderr a chunk of stderr from a language server instance
   */
  handleServerStderr(stderr: string, projectPath: string) {
    stderr.split('\n').filter(l => l).forEach(line => this.logger.warn(`stderr ${line}`));
  }
}
