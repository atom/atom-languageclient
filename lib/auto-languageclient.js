// @flow

import * as net from 'net';
import * as ls from './languageclient';
import * as rpc from 'vscode-jsonrpc';
import {CompositeDisposable} from 'atom';
import {ConsoleLogger, NullLogger, type Logger} from './logger';
import {ServerManager, type ActiveServer} from './server-manager.js';

import AutocompleteAdapter from './adapters/autocomplete-adapter';
import DocumentSyncAdapter from './adapters/document-sync-adapter';
import FormatCodeAdapter from './adapters/format-code-adapter';
import LinterPushV2Adapter from './adapters/linter-push-v2-adapter';
import NotificationsAdapter from './adapters/notifications-adapter';
import NuclideCodeFormatAdapter from './adapters/nuclide-code-format-adapter';
import NuclideDatatipAdapter from './adapters/nuclide-datatip-adapter';
import NuclideDefinitionAdapter from './adapters/nuclide-definition-adapter';
import NuclideFindReferencesAdapter from './adapters/nuclide-find-references-adapter';
import NuclideOutlineViewAdapter from './adapters/nuclide-outline-view-adapter';

type ConnectionType = 'stdio' | 'socket' | 'ipc';

export default class AutoLanguageClient {
  _disposable = new CompositeDisposable();
  _serverManager: ServerManager;
  _linterDelegate: linter$V2IndieDelegate;

  logger: Logger;
  name: string;
  socket: net$Socket;

  // Shared adapters that can take the RPC connection as required
  autoComplete: ?AutocompleteAdapter;
  codeFormat: ?NuclideCodeFormatAdapter;
  datatip: ?NuclideDatatipAdapter;
  definitions: ?NuclideDefinitionAdapter;
  findReferences: ?NuclideFindReferencesAdapter;
  outlineView: ?NuclideOutlineViewAdapter;

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
  startServerProcess(projectPath: string): child_process$ChildProcess {
    throw Error('Must override startServerProcess to start language server process when extending AutoLanguageClient');
  }

  // You might want to override these for different behavior
  // ---------------------------------------------------------------------------

  // Determine whether we should start a server for a given editor if we don't have one yet
  shouldStartForEditor(editor: atom$TextEditor): boolean {
    return this.getGrammars().has(editor.getGrammar());
  }

  // Return the parameters used to initialize a client - you may want to extend capabilities
  getInitializeParams(projectPath: string, process: child_process$ChildProcess): ls.InitializeParams {
    return {
      processId: process.pid,
      capabilities: { },
      rootPath: projectPath,
      rootUri: `file://${projectPath}`,
    };
  }

  // Early wire-up of listeners before initialize method is sent
  preInitialization(connection: ls.LanguageClientConnection): void {
  }

  // Late wire-up of listeners after initialize method has been sent
  postInitialization(InitializationResult: ls.InitializeResult): void {
  }

  // Determine whether to use ipc, stdio or socket to connect to the server
  getConnectionType(): ConnectionType {
    const hasSocket = this.socket != null;
    return hasSocket ? 'socket' : 'stdio';
  }

  // Default implementation of the rest of the AutoLanguageClient
  // ---------------------------------------------------------------------------

  activate(): void {
    this.name = `${this.getLanguageName()} (${this.getServerName()})`;
    this.logger = this.getLogger();
    this._serverManager = new ServerManager(p => this.startServer(p), this.logger, e => this.shouldStartForEditor(e));
  }

  deactivate(): void {
    this._disposable.dispose();
    this._serverManager.dispose();
  }

  getLogger(): Logger {
    return atom.config.get('core.debugLSP') ? new ConsoleLogger(this.name) : new NullLogger();
  }

  // Map the grammar scopes to actual grammars
  getGrammars(): Set<atom$Grammar> {
    const grammars: Set<atom$Grammar> = new Set();
    for (var scope of this.getGrammarScopes()) {
      const grammar = atom.grammars.grammarForScopeName(scope);
      if (grammar != null) {
        grammars.add(grammar);
      }
    }
    return grammars;
  }

  async startServer(projectPath: string): Promise<ActiveServer> {
    const process = await this.startServerProcess(projectPath);
    const connection = new ls.LanguageClientConnection(this.createRpcConnection(process), this.logger);
    this.preInitialization(connection);
    const initializeParams = this.getInitializeParams(projectPath, process);
    const initializeResponse = await connection.initialize(initializeParams);
    const newServer = {
      projectPath,
      process,
      connection,
      capabilities: initializeResponse.capabilities,
      disposable: new CompositeDisposable()
    };
    this.postInitialization(newServer);
    this.startExclusiveAdapters(newServer);
    return newServer;
  }

  createRpcConnection(process: child_process$ChildProcess): rpc.Connection {
    let reader, writer;
    const connectionType = this.getConnectionType();

    if (connectionType === 'ipc') {
      reader = new rpc.IPCMessageReader(process);
      writer = new rpc.IPCMessageWriter(process);
    } else if (connectionType === 'socket') {
      reader = new rpc.SocketMessageReader(this.socket);
      writer = new rpc.SocketMessageWriter(this.socket);
    } else if (connectionType === 'stdio') {
      reader = new rpc.StreamMessageReader(process.stdout);
      writer = new rpc.StreamMessageWriter(process.stdin);
    }
    return rpc.createMessageConnection(reader, writer, {error: m => { this.logger.error(m); }});
  }

  // Start adapters that are not shared between servers
  async startExclusiveAdapters(server: ActiveServer): Promise<void> {
    if (NotificationsAdapter.canAdapt(server.capabilities)) {
      NotificationsAdapter.attach(server.connection, this.name);
    }

    if (server.capabilities.textDocumentSync != null && DocumentSyncAdapter.canAdapt(server.capabilities)) {
      server.disposable.add(
        new DocumentSyncAdapter(server.connection, server.capabilities.textDocumentSync,
          editor => (editor.getURI() || '').startsWith(server.projectPath)));
    }

    if (FormatCodeAdapter.canAdapt(server.capabilities)) {
      server.disposable.add(new FormatCodeAdapter(server.connection, server.capabilities, this.getGrammarScopes()));
    }

    server.linterPushV2 = new LinterPushV2Adapter(server.connection);
    if (this._linterDelegate != null) {
      server.linterPushV2.attach(this._linterDelegate);
    }
  }

  // Atom Autocomplete+ via LS completion---------------------------------------
  provideAutocomplete(): atom$AutocompleteProvider {
    return {
      selector: this.getGrammarScopes().map(g => '.' + g).join(', '),
      excludeLowerPriority: false,
      getSuggestions: this.getSuggestions.bind(this),
    };
  }

  async getSuggestions(request: atom$AutocompleteRequest): Promise<Array<atom$AutocompleteSuggestion>> {
    const server = await this._serverManager.getServer(request.editor);
    if (server == null || !AutocompleteAdapter.canAdapt(server.capabilities) ) { return []; }

    this.autoComplete = this.autoComplete || new AutocompleteAdapter();
    return this.autoComplete.getSuggestions(server.connection, request);
  }

  // Nuclide Definitions via LS documentHighlight and gotoDefinition------------
  provideDefinitions(): nuclide$DefinitionProvider {
    return {
      name: this.name,
      priority: 20,
      grammarScopes: this.getGrammarScopes(),
      getDefinition: this.getDefinition.bind(this),
      getDefinitionById: this.getDefinitionById.bind(this),
    };
  }

  async getDefinition(editor: TextEditor, point: atom$Point): Promise<?nuclide$DefinitionQueryResult> {
    const server = await this._serverManager.getServer(editor);
    if (server == null || !NuclideDefinitionAdapter.canAdapt(server.capabilities)) { return null; }

    this.definitions = this.definitions || new NuclideDefinitionAdapter(this.getLanguageName());
    return this.definitions.getDefinition(server.connection, server.capabilities, editor, point);
  }

  getDefinitionById(filename: NuclideUri, id: string): Promise<?nuclide$Definition> {
    return Promise.resolve(null); // TODO: Is this needed?
  }

  // Nuclide Outline View via LS documentSymbol---------------------------------
  provideOutlines(): nuclide$OutlineProvider {
    return {
      name: this.name,
      grammarScopes: this.getGrammarScopes(),
      priority: 1,
      getOutline: this.getOutline.bind(this),
    };
  }

  async getOutline(editor: atom$TextEditor): Promise<?nuclide$Outline> {
    const server = await this._serverManager.getServer(editor);
    if (server == null || !NuclideOutlineViewAdapter.canAdapt(server.capabilities)) { return null; }

    this.outlineView = this.outlineView || new NuclideOutlineViewAdapter();
    return this.outlineView.getOutline(server.connection, editor);
  }

  // Linter push v2 API via LS publishDiagnostics
  consumeLinterV2(registerIndie: () => linter$V2IndieDelegate): void {
    this._linterDelegate = registerIndie({name: this.name});
    if (this._linterDelegate == null) return;

    for (var server of this._serverManager.getActiveServers()) {
      if (server.linterPushV2 != null) {
        server.linterPushV2.attach(this._linterDelegate);
      }
    }
  }

  // Nuclide Find References via LS findReferences------------------------------
  provideFindReferences(): nuclide$FindReferencesProvider {
    return {
      isEditorSupported: (editor: atom$TextEditor) => this.getGrammarScopes().includes(editor.getGrammar().scopeName),
      findReferences: this.getReferences.bind(this),
    };
  }

  async getReferences(editor: atom$TextEditor, point: atom$Point): Promise<?nuclide$FindReferencesReturn> {
    const server = await this._serverManager.getServer(editor);
    if (server == null || !NuclideFindReferencesAdapter.canAdapt(server.capabilities)) { return null; }

    this.findReferences = this.findReferences || new NuclideFindReferencesAdapter();
    return this.findReferences.getReferences(server.connection, editor, point, server.projectPath);
  }

  // Nuclide Datatip via LS textDocument/hover----------------------------------
  consumeDatatip(service: nuclide$DatatipService): void {
    this._disposable.add(service.addProvider({
      providerName: this.name,
      inclusionPriority: 1,
      validForScope: (scopeName: string) => {
        return this.getGrammarScopes().includes(scopeName);
      },
      datatip: this.getDatatip.bind(this),
    }));
  }

  async getDatatip(editor: atom$TextEditor, point: atom$Point): Promise<?nuclide$Datatip> {
    const server = await this._serverManager.getServer(editor);
    if (server == null || !NuclideDatatipAdapter.canAdapt(server.capabilities)) { return null; }

    this.datatip = this.datatip || new NuclideDatatipAdapter();
    return this.datatip.getDatatip(server.connection, editor, point);
  }

  // Nuclide Code Format via LS formatDocument & formatDocumentRange------------
  provideCodeFormat(): nuclide$CodeFormatProvider {
    return {
      selector: this.getGrammarScopes().join(', '),
      inclusionPriority: 1,
      formatCode: this.getCodeFormat.bind(this),
    }
  }

  async getCodeFormat(editor: atom$TextEditor, range: atom$Range): Promise<Array<nuclide$TextEdit>> {
    const server = await this._serverManager.getServer(editor);
    if (server == null || !NuclideCodeFormatAdapter.canAdapt(server.capabilities)) { return []; }

    this.codeFormat = this.codeFormat || new NuclideCodeFormatAdapter();
    return this.codeFormat.format(server.connection, server.capabilities, editor, range);
  }
}
