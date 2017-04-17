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
import LinterAdapter from './adapters/linter-adapter';
import NotificationsAdapter from './adapters/notifications-adapter';
import NuclideDefinitionAdapter from './adapters/nuclide-definition-adapter';
import NuclideFindReferencesAdapter from './adapters/nuclide-find-references-adapter';
import NuclideHyperclickAdapter from './adapters/nuclide-hyperclick-adapter';
import NuclideOutlineViewAdapter from './adapters/nuclide-outline-view-adapter';

export default class AutoLanguageClient {
  _disposable = new CompositeDisposable();
  _serverManager: ServerManager;

  logger: Logger;
  name: string;

  autoComplete: ?AutocompleteAdapter;
  linter: ?LinterAdapter;
  definitions: ?NuclideDefinitionAdapter;
  findReferences: ?NuclideFindReferencesAdapter;
  hyperclick: ?NuclideHyperclickAdapter;
  outlineView: ?NuclideOutlineViewAdapter;

  getGrammarScopes(): Array<string> {
    throw Error('Must implement getGrammarScopes when extending AutoLanguageClient');
  }
  getLanguageName(): string {
    throw Error('Must implement getLanguageName when extending AutoLanguageClient');
  }
  getServerName(): string {
    throw Error('Must implement getServerName when extending AutoLanguageClient');
  }

  activate(): void {
    this.name = `${this.getLanguageName()} (${this.getServerName()})`;
    this.logger = this.getLogger();
    this._serverManager = new ServerManager(this.startServer, this.logger);
  }

  getLogger(): Logger {
    return atom.config.get('core.debugLSP') ? new ConsoleLogger(this.name) : new NullLogger();
  }

  deactivate(): void {
    this._disposable.dispose();
    this._serverManager.dispose();
  }

  async startServer(projectPath: string): Promise<ActiveServer> {
    const process = await this.startServerProcess();
    // TODO: Socket plumbing, generating free one
    const connection = new ls.LanguageClientConnection(this.createRpcConnection(process), this.logger);
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

  startServerProcess(): child_process$ChildProcess {
    throw Error('Must override startServerProcess to start language server process when extending AutoLanguageClient');
  }

  createRpcConnection(process: child_process$ChildProcess, socket?: net$Socket): rpc.Connection {
    const hasSocket = socket != null;
    const reader = hasSocket ? new rpc.SocketMessageReader(socket) : new rpc.StreamMessageReader(process.stdout);
    const writer = hasSocket ? new rpc.SocketMessageWriter(socket) : new rpc.StreamMessageWriter(process.stdin);
    return rpc.createMessageConnection(reader, writer, {error: m => { this.logger.error(m); }});
  }

  getInitializeParams(projectPath: string, process: child_process$ChildProcess): ls.InitializeParams {
    return {
      processId: process.pid,
      capabilities: { },
      rootPath: projectPath,
    };
  }

  async startExclusiveAdapters(server: ActiveServer): Promise<void> {
    if (NotificationsAdapter.canAdapt(server.capabilities)) {
      NotificationsAdapter.attach(server.connection, this.name);
    }

    if (DocumentSyncAdapter.canAdapt(server.capabilities)) {
      server.disposable.add(new DocumentSyncAdapter(server.connection, server.capabilities.textDocumentSync));
    }

    if (FormatCodeAdapter.canAdapt(server.capabilities)) {
      server.disposable.add(new FormatCodeAdapter(server.connection, server.capabilities, this.getGrammarScopes()));
    }
  }

  postInitialization(InitializationResult: ls.InitializeResult): void {
  }

  // Atom Autocomplete+ via LS completion

  provideAutocomplete(): atom$AutocompleteProvider {
    return {
      selector: '.source',
      excludeLowerPriority: false,
      getSuggestions: this.getSuggestions.bind(this),
    };
  }

  async getSuggestions(request: atom$AutocompleteRequest): Promise<Array<atom$AutocompleteSuggestion>> {
    const server = await this._serverManager.getServer(request.editor);
    if (server == null) { return []; }

    if (this.autoComplete == null) {
      if (AutocompleteAdapter.canAdapt(server.capabilities)) {
        this.autoComplete = new AutocompleteAdapter();
      } else {
        return [];
      }
    }

    return this.autoComplete.getSuggestions(server.connection, request);
  }

  // Nuclide Definitions via LS documentHighlight and gotoDefinition

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
    if (server == null) { return null; }

    if (this.definitions == null) {
      if (NuclideDefinitionAdapter.canAdapt(server.capabilities)) {
        this.definitions = new NuclideDefinitionAdapter(this.getLanguageName());
      } else {
        return null;
      }
    }

    return this.definitions.getDefinition(server.connection, editor, point);
  }

  getDefinitionById(filename: NuclideUri, id: string): Promise<?nuclide$Definition> {
    return Promise.resolve(null); // TODO: Is this needed?
  }

  // Nuclide Outline View via LS documentSymbol

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
    if (server == null) { return null; }

    if (this.outlineView == null) {
      if (NuclideOutlineViewAdapter.canAdapt(server.capabilities)) {
        this.outlineView = new NuclideOutlineViewAdapter();
      } else {
        return null;
      }
    }

    return this.outlineView.getOutline(server.connection, editor);
  }

  // Linter API via LS publishDiagnostics

  provideLinter(): linter$StandardLinter {
    return {
      name: this.name,
      grammarScopes: this.getGrammarScopes(),
      scope: 'project',
      lintOnFly: true,
      lint: this.getLinting.bind(this),
    };
  }

  async getLinting(editor: atom$TextEditor): Promise<?Array<linter$Message>> {
    const server = await this._serverManager.getServer(editor);
    if (server == null) { return null; }

    if (this.linter == null) {
      this.linter = new LinterAdapter(server.connection);
    }

    return this.linter.provideDiagnostics();
  }

  // Nuclide Find References via LS findReferences

  provideFindReferences(): nuclide$FindReferencesProvider {
    return {
      isEditorSupported: (editor: atom$TextEditor) => this.getGrammarScopes().includes(editor.getGrammar().scopeName),
      findReferences: this.getReferences.bind(this),
    };
  }

  async getReferences(editor: atom$TextEditor, point: atom$Point): Promise<?nuclide$FindReferencesReturn> {
    const server = await this._serverManager.getServer(editor);
    if (server == null) { return null; }

    if (this.findReferences == null) {
      if (NuclideFindReferencesAdapter.canAdapt(server.capabilities)) {
        this.findReferences = new NuclideFindReferencesAdapter();
      } else {
        return null;
      }
    }

    return this.findReferences.getReferences(server.connection, editor, point, server.projectPath);
  }

  // Nuclide Hyperlick via LS gotoDefinition and documentHighlight

  provideHyperclick(): nuclide$HyperclickProvider {
    return {
      priority: 20,
      providerName: this.name,
      getSuggestion: this.getHyperclickSuggestion.bind(this),
    };
  }

  async getHyperclickSuggestion(editor: atom$TextEditor, point: atom$Point): Promise<?nuclide$HyperclickSuggestion> {
    const server = await this._serverManager.getServer(editor);
    if (server == null) { return null; }

    if (this.hyperclick == null) {
      if (NuclideHyperclickAdapter.canAdapt(server.capabilities)) {
        this.hyperclick = new NuclideHyperclickAdapter();
      } else {
        return null;
      }
    }

    return this.hyperclick.getSuggestion(server.connection, editor, point);
  }
}
