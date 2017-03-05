// @flow

import * as cp from 'child_process';
import * as ls from './protocol/languageclient-v2';
import * as rpc from 'vscode-jsonrpc';

import ConsoleLogger from './loggers/console-logger';
import NullLogger from './loggers/null-logger';

import AutocompleteBridge from './bridges/autocomplete-bridge';
import DocumentSyncBridge from './bridges/document-sync-bridge';
import FormatCodeBridge from './bridges/format-code-bridge';
import LinterBridge from './bridges/linter-bridge';
import NotificationsBridge from './bridges/notifications-bridge';
import NuclideDefinitionBridge from './bridges/nuclide-definition-bridge';
import NuclideFindReferencesBridge from './bridges/nuclide-find-references-bridge';
import NuclideHyperclickBridge from './bridges/nuclide-hyperclick-bridge';
import NuclideOutlineViewBridge from './bridges/nuclide-outline-view-bridge';

import {CompositeDisposable} from 'atom';

export default class AutoBridge {
  _disposable = new CompositeDisposable();
  _process: ?child_process$ChildProcess;
  _lc: ls.LanguageClientV2;

  autoComplete: ?AutocompleteBridge;
  definitions: ?NuclideDefinitionBridge;
  findReferences: ?NuclideFindReferencesBridge;
  hyperclick: ?NuclideHyperclickBridge;
  linter: ?LinterBridge;
  outlineView: ?NuclideOutlineViewBridge;

  logger: ConsoleLogger | NullLogger;

  getName() { throw "Must set name field when extending AutoBridge" };
  getGrammarScopes() { throw "Must set grammarScopes field when extending AutoBridge" };

  activate(): void {
    this.logger = atom.config.get('core.debugLSP') ? new ConsoleLogger(this.getName()) : new NullLogger();
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

    const connection = rpc.createMessageConnection(
      new rpc.StreamMessageReader(this._process.stdout),
      new rpc.StreamMessageWriter(this._process.stdin),
      { error: (m: Object) => { this.logger.error(m); } });

    this._lc = new ls.LanguageClientV2(connection, this.logger);
    this._lc.onLogMessage(m => this.logger.log(['Log', m]));

    const initializeResponse = await this._lc.initialize(this.getInitializeParams());
    this.bridgeCapabilities(initializeResponse.capabilities);
    this.postInitialization(initializeResponse);
  }

  startServerProcess(): child_process$ChildProcess {
    throw "Must override startServerProcess to start the language server process when extending AutoBridge";
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

  bridgeCapabilities(capabilities: ls.ServerCapabilities): void {
    this.linter = new LinterBridge(this._lc);
    if (capabilities.completionProvider) {
      this.autoComplete = new AutocompleteBridge(this._lc);
    }
    if (capabilities.definitionProvider) {
      this.definitions = new NuclideDefinitionBridge(this._lc);
      this.hyperclick = new NuclideHyperclickBridge(this._lc);
    }
    if (capabilities.documentSymbolProvider) {
      this.outlineView = new NuclideOutlineViewBridge(this._lc, this.getName());
    }
    if (capabilities.referencesProvider) {
      this.findReferences = new NuclideFindReferencesBridge(this._lc);
    }

    new NotificationsBridge(this._lc, this.getName());

    if (capabilities.textDocumentSync) {
      this._disposable.add(new DocumentSyncBridge(this._lc, capabilities.textDocumentSync));
    }
    if (capabilities.documentRangeFormattingProvider || capabilities.documentFormattingProvider) {
      this._disposable.add(new FormatCodeBridge(this._lc, capabilities.documentRangeFormattingProvider === true, capabilities.documentFormattingProvider === true));
    }
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
      name: this.getName(),
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
      name: this.getName(),
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
      name: this.getName(),
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
      isEditorSupported: (editor: atom$TextEditor) => true, // TODO: Grammar-select/extension based?
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
      providerName: this.getName(),
      getSuggestion: this.getHyperclickSuggestion.bind(this)
    };
  }

  getHyperclickSuggestion(editor: atom$TextEditor, point: atom$Point): Promise<?nuclide$HyperclickSuggestion> {
    return this.hyperclick != null ? this.hyperclick.getSuggestion(editor, point) : Promise.resolve(null);
  }
}
