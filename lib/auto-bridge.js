// @flow

import * as cp from 'child_process';
import * as ls from './protocol/languageclient-v2';
import * as rpc from 'vscode-jsonrpc';

import AutocompleteBridge from './bridges/autocomplete-bridge';
import DocumentSyncBridge from './bridges/document-sync-bridge';
import FormatDocumentBridge from './bridges/format-document-bridge';
import FormatRangeBridge from './bridges/format-range-bridge';
import LinterBridge from './bridges/linter-bridge';
import MessageNotificationsBridge from './bridges/message-notifications-bridge';
import NuclideDefinitionBridge from './bridges/nuclide-definition-bridge';
import NuclideHyperclickBridge from './bridges/nuclide-hyperclick-bridge';
import NuclideOutlineViewBridge from './bridges/nuclide-outline-view-bridge';

import {CompositeDisposable} from 'atom';

export default class AutoBridge {
  _disposable = new CompositeDisposable();
  _process: ?child_process$ChildProcess;
  _lc: ls.LanguageClientV2;

  autoComplete: ?AutocompleteBridge;
  definitions: ?NuclideDefinitionBridge;
  hyperclick: ?NuclideHyperclickBridge;
  linter: ?LinterBridge;
  outline: ?NuclideOutlineViewBridge;

  logger: (m: string | Array<any>) => void;

  getName() { throw "Must set name field when extending AutoBridge" };
  getGrammarScopes() { throw "Must set grammarScopes field when extending AutoBridge" };

  activate(): void {
    if (atom.config.get('core.debugLSP')) this.logger = console.debug;
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
      { error: (m: Object) => { this.log(m); } });

    this._lc = new ls.LanguageClientV2(connection, (...m) => this.log(m));
    this._lc.onLogMessage(m => this.log(['Log', m]));

    const initializeResponse = await this._lc.initialize(this.getInitializeParams());
    this.bridgeCapabilities(initializeResponse.capabilities);
    this.postInitialization(initializeResponse);
  }

  startServerProcess(): child_process$ChildProcess {
    throw "Must override startServerProcess to start the language server process when extending AutoBridge";
  }

  bridgeCapabilities(capabilities: ls.ServerCapabilities): void {
    this.linter = new LinterBridge(this._lc);
    if (capabilities.completionProvider) {
      this.autoComplete = new AutocompleteBridge(this._lc);
    }
    if (capabilities.documentSymbolProvider) {
      this.outline = new NuclideOutlineViewBridge(this._lc, this.getName());
    }
    if (capabilities.definitionProvider) {
      this.definitions = new NuclideDefinitionBridge(this._lc);
      this.hyperclick = new NuclideHyperclickBridge(this._lc);
    }

    this._disposable.add(new MessageNotificationsBridge(this._lc, this.getName()));
    if (capabilities.textDocumentSync) {
      this._disposable.add(new DocumentSyncBridge(this._lc, capabilities.textDocumentSync));
    }
    if (capabilities.documentRangeFormattingProvider) {
      this._disposable.add(new FormatRangeBridge(this._lc));
    }
    if (capabilities.documentFormattingProvider) {
      this._disposable.add(new FormatDocumentBridge(this._lc));
    }
  }

  postInitialization(InitializationResult: ls.InitializeResult): void {
  }

  provideOutlines(): nuclide$OutlineProvider {
    return {
      name: this.getName(),
      grammarScopes: this.getGrammarScopes(),
      priority: 1,
      getOutline: this.getOutline.bind(this)
    };
  }

  getOutline(editor: atom$TextEditor): Promise<?nuclide$Outline> {
    return this.outline != null ? this.outline.getOutline(editor) : Promise.resolve(null);
  }

  provideLinter(): linter$StandardLinter {
    return {
      name: this.getName(),
      grammarScopes: this.getGrammarScopes(),
      scope: 'project',
      lintOnFly: true,
      lint: this.provideLinting.bind(this)
    };
  }

  provideLinting(editor: atom$TextEditor): ?Array<linter$Message> | Promise<?Array<linter$Message>> {
    return this.linter != null ? this.linter.provideDiagnostics() : Promise.resolve([]);
  }

  provideAutocomplete(): atom$AutocompleteProvider {
    return {
      selector: '.source',
      excludeLowerPriority: false,
      getSuggestions: this.provideSuggestions.bind(this)
    };
  }

  provideSuggestions(request: any): Promise<Array<atom$AutocompleteSuggestion>> {
    return this.autoComplete != null ? this.autoComplete.provideSuggestions(request) : Promise.resolve([]);
  }

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
    return Promise.resolve(null);
  }

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

  getInitializeParams(): ls.InitializeParams {
    const rootDirs: Array<any> = atom.project.getDirectories();
    return {
      processId: process.pid,
      capabilities: { },
      rootPath: rootDirs.length > 0 ? rootDirs[0].path : null
    };
  }

  log(args: Object | Array<any>): void {
    if (this.logger == null) return;

    if (typeof args === 'string') {
      this.logger(`${this.getName()} ${args}`);
      return;
    }

    if (Array.isArray(args) && typeof args[0] === 'string') {
      if (args.length === 2) {
        this.logger(`${this.getName()} ${args[0]}`, args[1]);
        return;
      } else {
        this.logger(`${this.getName()} ${args[0]}`, args.slice(1));
        return;
      }
    }

    this.logger(`${this.getName()}`, args);
  }
}
