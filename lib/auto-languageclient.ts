import * as ls from './languageclient';
import * as atomIde from 'atom-ide';
import * as linter from 'atom/linter';
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
import { LanguageClientConnection } from './languageclient';
import {
  LanguageServerProcess,
  ActiveServer,
} from './server-manager.js';
import {
  AutocompleteDidInsert,
  AutocompleteProvider,
  AutocompleteRequest,
  AutocompleteSuggestion,
  Disposable,
  Point,
  Range,
  TextEditor,
} from 'atom';
import BaseLanguageClient from './base-languageclient';

export { ActiveServer, LanguageClientConnection, LanguageServerProcess };
export type ConnectionType = 'stdio' | 'socket' | 'ipc';

export interface ServerAdapters {
  linterPushV2: LinterPushV2Adapter;
  loggingConsole: LoggingConsoleAdapter;
  docSyncAdapter?: DocumentSyncAdapter;
  signatureHelpAdapter?: SignatureHelpAdapter;
}

// Public: AutoLanguageClient provides a simple way to have all the supported
// Atom-IDE services wired up entirely for you by just subclassing it and
// implementing startServerProcess/getGrammarScopes/getLanguageName and
// getServerName.
export default class AutoLanguageClient extends BaseLanguageClient {
  private _consoleDelegate?: atomIde.ConsoleService;
  private _linterDelegate?: linter.IndieDelegate;
  private _signatureHelpRegistry?: atomIde.SignatureHelpRegistry;
  private _lastAutocompleteRequest?: AutocompleteRequest;
  private _serverAdapters = new WeakMap<ActiveServer, ServerAdapters>();

  // Available if consumeBusySignal is setup
  protected busySignalService?: atomIde.BusySignalService;

  // Shared adapters that can take the RPC connection as required
  protected autoComplete?: AutocompleteAdapter;
  protected datatip?: DatatipAdapter;
  protected definitions?: DefinitionAdapter;
  protected findReferences?: FindReferencesAdapter;
  protected outlineView?: OutlineViewAdapter;

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
  protected startServerProcess(_projectPath: string): LanguageServerProcess | Promise<LanguageServerProcess> {
    throw Error('Must override startServerProcess to start language server process when extending AutoLanguageClient');
  }

  // Default implementation of the rest of the AutoLanguageClient
  // ---------------------------------------------------------------------------

  // Start adapters that are not shared between servers
  protected startExclusiveAdapters(server: ActiveServer): void {
    ApplyEditAdapter.attach(server.connection);
    NotificationsAdapter.attach(server.connection, this.name, server.projectPath);

    let docSyncAdapter;
    if (DocumentSyncAdapter.canAdapt(server.capabilities)) {
      docSyncAdapter =
        new DocumentSyncAdapter(
          server.connection,
          (editor) => this.shouldSyncForEditor(editor, server.projectPath),
          server.capabilities.textDocumentSync,
          this.reportBusyWhile.bind(this),
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
      loggingConsole.attach(this._consoleDelegate({ id: this.name, name: 'abc' }));
    }
    server.disposable.add(loggingConsole);

    let signatureHelpAdapter;
    if (SignatureHelpAdapter.canAdapt(server.capabilities)) {
      signatureHelpAdapter = new SignatureHelpAdapter(server, this.getGrammarScopes());
      if (this._signatureHelpRegistry != null) {
        signatureHelpAdapter.attach(this._signatureHelpRegistry);
      }
      server.disposable.add(signatureHelpAdapter);
    }

    this._serverAdapters.set(server, {
      docSyncAdapter, linterPushV2, loggingConsole, signatureHelpAdapter,
    });
  }

  protected reportBusyWhile<T>(message: string, promiseGenerator: () => Promise<T>): Promise<T> {
    if (this.busySignalService) {
      return this.busySignalService.reportBusyWhile(message, promiseGenerator);
    } else {
      this.logger.info(message);
      return promiseGenerator();
    }
  }

  protected unsupportedEditorGrammar(server: ActiveServer, editor: TextEditor): void {
    const adapter = this.getServerAdapter(server, 'docSyncAdapter');
    if (adapter) {
      const syncAdapter = adapter.getEditorSyncAdapter(editor);
      if (syncAdapter) {
        // Immitate editor close to disconnect LS from the editor
        syncAdapter.didClose();
      }
    }
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
    _completionItem: ls.CompletionItem,
    _suggestion: AutocompleteSuggestion,
    _request: AutocompleteRequest,
  ): void {
  }

  protected onDidInsertSuggestion(_arg: AutocompleteDidInsert): void {}

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
      const adapter = this.getServerAdapter(server, 'linterPushV2');
      if (adapter) {
        adapter.attach(this._linterDelegate);
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
      const adapter = this.getServerAdapter(server, 'loggingConsole');
      if (adapter) {
        adapter.attach(this._consoleDelegate({ id: this.name, name: 'abc' }));
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
      this.getServerAdapter(server, 'linterPushV2'),
      editor,
      range,
      diagnostics,
    );
  }

  public consumeSignatureHelp(registry: atomIde.SignatureHelpRegistry): Disposable {
    this._signatureHelpRegistry = registry;
    for (const server of this._serverManager.getActiveServers()) {
      const signatureHelpAdapter = this.getServerAdapter(server, 'signatureHelpAdapter');
      if (signatureHelpAdapter) {
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

  private getServerAdapter<T extends keyof ServerAdapters>(
    server: ActiveServer, adapter: T,
  ): ServerAdapters[T] | undefined {
    const adapters = this._serverAdapters.get(server);
    return adapters && adapters[adapter];
  }
}
