// @flow

import * as ls from './languageclient';
import * as rpc from 'vscode-jsonrpc';

import {ConsoleLogger, NullLogger, type Logger} from './logger';

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

  serverCapabilities: ls.ServerCapabilities;

  logger: Logger;
  name: string;

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
    }
  }

  async startServer(): Promise<void> {
    if (this._process != null) {
      return;
    }

    this._process = await this.startServerProcess();
    this._lc = new ls.LanguageClientConnection(this.createServerConnection(), this.logger);
    this.preInitialization();

    const initializeResponse = await this._lc.initialize(this.getInitializeParams());
    this.serverCapabilities = initializeResponse.capabilities;
    this.postInitialization(initializeResponse);
  }

  startServerProcess(): child_process$ChildProcess {
    throw Error('Must override startServerProcess to start language server process when extending AutoLanguageClient');
  }

  createServerConnection(): rpc.Connection {
    if (this._process == null) {
      throw Error('Process must be set before creating RPC connection to server process');
    }

    return rpc.createMessageConnection(
      new rpc.StreamMessageReader(this._process.stdout),
      new rpc.StreamMessageWriter(this._process.stdin),
      {error: m => { this.logger.error(m); }});
  }

  getProjectRoot(): ?string {
    const rootDirs: Array<atom$Directory> = atom.project.getDirectories();
    return rootDirs.length > 0 ? rootDirs[0].path : null
  }

  getInitializeParams(): ls.InitializeParams {
    return {
      processId: process.pid,
      capabilities: { },
      rootPath: this.getProjectRoot(),
    };
  }

  adaptCapabilities(capabilities: ls.ServerCapabilities): void {
    new NotificationsAdapter(this._lc, this.name);

    if (capabilities.textDocumentSync) {
      this._disposable.add(new DocumentSyncAdapter(this._lc, capabilities.textDocumentSync));
    }
    if (capabilities.documentRangeFormattingProvider || capabilities.documentFormattingProvider) {
      this._disposable.add(new FormatCodeAdapter(this._lc, capabilities, this.getGrammarScopes()));
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
      getSuggestions: this.getSuggestions.bind(this),
    };
  }

  getSuggestions(request: any): Promise<Array<atom$AutocompleteSuggestion>> {
    if (this.autoComplete == null) {
      if (this.serverCapabilities.completionProvider) {
        this.autoComplete = new AutocompleteAdapter();
      } else {
        return Promise.resolve([]);
      }
    }

    return this.autoComplete.getSuggestions(this._lc, request);
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

  getDefinition(editor: TextEditor, point: atom$Point): Promise<?nuclide$DefinitionQueryResult> {
    if (this.definitions == null) {
      if (this.serverCapabilities.definitionProvider) {
        this.definitions = new NuclideDefinitionAdapter(this.getLanguageName());
      } else {
        return Promise.resolve(null);
      }
    }

    return this.definitions.getDefinition(this._lc, editor, point);
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

  getOutline(editor: atom$TextEditor): Promise<?nuclide$Outline> {
    if (this.outlineView == null) {
      if (this.serverCapabilities.documentSymbolProvider) {
        this.outlineView = new NuclideOutlineViewAdapter();
      } else {
        return Promise.resolve(null);
      }
    }

    return this.outlineView.getOutline(this._lc, editor);
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

  getLinting(editor: atom$TextEditor): ?Array<linter$Message> | Promise<?Array<linter$Message>> {
    if (this.linter == null) {
      this.linter = new LinterAdapter(this._lc);
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

  getReferences(editor: atom$TextEditor, point: atom$Point): Promise<?nuclide$FindReferencesReturn> {
    if (this.findReferences == null) {
      if (this.serverCapabilities.referencesProvider) {
        this.findReferences = new NuclideFindReferencesAdapter();
      } else {
        return Promise.resolve(null);
      }
    }

    return this.findReferences.getReferences(this._lc, editor, point, this.getProjectRoot());
  }

  // Nuclide Hyperlick via LS gotoDefinition and documentHighlight

  provideHyperclick(): nuclide$HyperclickProvider {
    return {
      priority: 20,
      providerName: this.name,
      getSuggestion: this.getHyperclickSuggestion.bind(this),
    };
  }

  getHyperclickSuggestion(editor: atom$TextEditor, point: atom$Point): Promise<?nuclide$HyperclickSuggestion> {
    if (this.hyperclick == null) {
      if (this.serverCapabilities.definitionProvider) {
        this.hyperclick = new NuclideHyperclickAdapter();
      } else {
        return Promise.resolve(null);
      }
    }

    return this.hyperclick.getSuggestion(this._lc, editor, point);
  }
}
