// @flow

import * as cp from 'child_process';
import * as ls from './languageclient';
import * as rpc from 'vscode-jsonrpc';

import ConsoleLogger from './loggers/console-logger';
import NullLogger from './loggers/null-logger';

import AutocompleteAdapter from './adapters/autocomplete-adapter';
import DocumentSyncAdapter from './adapters/document-sync-adapter';
import FormatCodeAdapter from './adapters/format-code-adapter';
import LinterAdapter from './adapters/linter-adapter';
import NotificationsAdapter from './adapters/notifications-adapter';
import NuclideDefinitionAdapter from './adapters/nuclide-definition-adapter';
import NuclideFindReferencesAdapter from './adapters/nuclide-find-references-adapter';
import NuclideHyperclickAdapter from './adapters/nuclide-hyperclick-adapter';
import NuclideOutlineViewAdapter from './adapters/nuclide-outline-view-adapter';

import {CompositeDisposable} from 'atom';

export default class AutoLanguageClient {
  _disposable = new CompositeDisposable();
  _process: ?child_process$ChildProcess;
  _lc: ls.LanguageClientConnection;

  autoComplete: ?AutocompleteAdapter;
  linter: ?LinterAdapter;

  definitions: ?NuclideDefinitionAdapter;
  findReferences: ?NuclideFindReferencesAdapter;
  hyperclick: ?NuclideHyperclickAdapter;
  outlineView: ?NuclideOutlineViewAdapter;

  logger: ConsoleLogger | NullLogger;
  name: string;

  getGrammarScopes(): Array<string> { throw Error('Must implement getGrammarScopes when extending AutoLanguageClient') };
  getLanguageName(): string { throw Error('Must implement getLanguageName when extending AutoLanguageClient') };
  getServerName(): string { throw Error('Must implement getServerName when extending AutoLanguageClient') };

  activate(): void {
    this.name = `${this.getLanguageName()} (${this.getServerName()})`;
    this.logger = atom.config.get('core.debugLSP') ? new ConsoleLogger(this.name) : new NullLogger();
    this.startServer();
  }

  deactivate(): void {
    this._disposable.dispose();

    if (this._lc) {
      this._lc.shutdown();
    }

    if (this._process != null) {
      this._process.kill();
      this._process = null;
    };
  }

  async startServer(): Promise<void> {
    if (this._process != null) return;

    this._process = await this.startServerProcess();
    this._lc = new ls.LanguageClientConnection(this.createServerConnection(), this.logger);
    this.preInitialization();

    const initializeResponse = await this._lc.initialize(this.getInitializeParams());
    this.adaptCapabilities(initializeResponse.capabilities);
    this.postInitialization(initializeResponse);
  }

  startServerProcess(): child_process$ChildProcess {
    throw Error('Must override startServerProcess to start the language server process when extending AutoLanguageClient');
  }

  createServerConnection(): rpc.Connection {
    if (this._process == null) {
      throw Error('Process must be set before creating RPC connection to server process');
    }

    return rpc.createMessageConnection(
      new rpc.StreamMessageReader(this._process.stdout),
      new rpc.StreamMessageWriter(this._process.stdin),
      { error: (m: Object) => { this.logger.error(m); } });
  }

  getProjectRoot(): ?string {
    const rootDirs: Array<any> = atom.project.getDirectories();
    return rootDirs.length > 0 ? rootDirs[0].path : null
  }

  getInitializeParams(): ls.InitializeParams {
    return {
      processId: process.pid,
      capabilities: { },
      rootPath: this.getProjectRoot()
    };
  }

  adaptCapabilities(capabilities: ls.ServerCapabilities): void {
    this.linter = new LinterAdapter(this._lc);
    if (capabilities.completionProvider) {
      this.autoComplete = new AutocompleteAdapter(this._lc);
    }

    this.adaptToNuclide(capabilities);

    new NotificationsAdapter(this._lc, this.name);

    if (capabilities.textDocumentSync) {
      this._disposable.add(new DocumentSyncAdapter(this._lc, capabilities.textDocumentSync));
    }
    if (capabilities.documentRangeFormattingProvider || capabilities.documentFormattingProvider) {
      this._disposable.add(new FormatCodeAdapter(this._lc, capabilities, this.getGrammarScopes()));
    }
  }

  adaptToNuclide(capabilities: ls.ServerCapabilities): void {
    if (capabilities.definitionProvider) {
      this.definitions = new NuclideDefinitionAdapter(this._lc, this.getLanguageName());
      this.hyperclick = new NuclideHyperclickAdapter(this._lc);
    }
    if (capabilities.documentSymbolProvider) {
      this.outlineView = new NuclideOutlineViewAdapter(this._lc, this.name);
    }
    if (capabilities.referencesProvider) {
      this.findReferences = new NuclideFindReferencesAdapter(this._lc);
    }
  }

  preInitialization(): void {
  }

  postInitialization(InitializationResult: ls.InitializeResult): void {
  }

  // Atom Autocomplete+ via LS completion

  provideAutocomplete(): atom$AutocompleteProvider {
    return {
      selector: '.source',
      excludeLowerPriority: false,
      getSuggestions: this.getSuggestions.bind(this)
    };
  }

  getSuggestions(request: any): Promise<Array<atom$AutocompleteSuggestion>> {
    return this.autoComplete != null ? this.autoComplete.getSuggestions(request) : Promise.resolve([]);
  }

  // Nuclide Definitions via LS documentHighlight and gotoDefinition

  provideDefinitions(): nuclide$DefinitionProvider {
    return {
      name: this.name,
      priority: 20,
      grammarScopes: this.getGrammarScopes(),
      getDefinition: this.getDefinition.bind(this),
      getDefinitionById: this.getDefinitionById.bind(this)
    }
  }

  getDefinition(editor: TextEditor, point: atom$Point): Promise<?nuclide$DefinitionQueryResult> {
    return this.definitions != null ? this.definitions.getDefinition(editor, point) : Promise.resolve(null);
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
      getOutline: this.getOutline.bind(this)
    };
  }

  getOutline(editor: atom$TextEditor): Promise<?nuclide$Outline> {
    return this.outlineView != null ? this.outlineView.getOutline(editor) : Promise.resolve(null);
  }

  // Linter API via LS publishDiagnostics

  provideLinter(): linter$StandardLinter {
    return {
      name: this.name,
      grammarScopes: this.getGrammarScopes(),
      scope: 'project',
      lintOnFly: true,
      lint: this.getLinting.bind(this)
    };
  }

  getLinting(editor: atom$TextEditor): ?Array<linter$Message> | Promise<?Array<linter$Message>> {
    return this.linter != null ? this.linter.provideDiagnostics() : Promise.resolve([]);
  }

  // Nuclide Find References via LS findReferences

  provideFindReferences(): nuclide$FindReferencesProvider {
    return {
      isEditorSupported: (editor: atom$TextEditor) => this.getGrammarScopes().includes(editor.getGrammar().scopeName),
      findReferences: this.getReferences.bind(this)
    }
  }

  getReferences(editor: atom$TextEditor, point: atom$Point): Promise<?nuclide$FindReferencesReturn> {
    return this.findReferences != null ? this.findReferences.getReferences(editor, point, this.getProjectRoot()) : Promise.resolve(null);
  }

  // Nuclide Hyperlick via LS gotoDefinition and documentHighlight

  provideHyperclick(): nuclide$HyperclickProvider {
    return {
      priority: 20,
      providerName: this.name,
      getSuggestion: this.getHyperclickSuggestion.bind(this)
    };
  }

  getHyperclickSuggestion(editor: atom$TextEditor, point: atom$Point): Promise<?nuclide$HyperclickSuggestion> {
    return this.hyperclick != null ? this.hyperclick.getSuggestion(editor, point) : Promise.resolve(null);
  }
}
