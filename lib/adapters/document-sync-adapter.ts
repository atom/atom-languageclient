import Convert from '../convert';
import {
  LanguageClientConnection,
  FileChangeType,
  TextDocumentSaveReason,
  TextDocumentSyncKind,
  TextDocumentSyncOptions,
  TextDocumentContentChangeEvent,
  VersionedTextDocumentIdentifier,
  ServerCapabilities,
  DidSaveTextDocumentParams,
} from '../languageclient';
import ApplyEditAdapter from './apply-edit-adapter';
import {
  CompositeDisposable,
  Disposable,
  DidStopChangingEvent,
  TextEditEvent,
  TextEditor,
} from 'atom';
import * as Utils from '../utils';

// Public: Synchronizes the documents between Atom and the language server by notifying
// each end of changes, opening, closing and other events as well as sending and applying
// changes either in whole or in part depending on what the language server supports.
export default class DocumentSyncAdapter {
  private _disposable = new CompositeDisposable();
  public _documentSync: TextDocumentSyncOptions;
  private _editors: WeakMap<TextEditor, TextEditorSyncAdapter> = new WeakMap();
  private _versions: Map<string, number> = new Map();

  // Public: Determine whether this adapter can be used to adapt a language server
  // based on the serverCapabilities matrix textDocumentSync capability either being Full or
  // Incremental.
  //
  // * `serverCapabilities` The {ServerCapabilities} of the language server to consider.
  //
  // Returns a {Boolean} indicating adapter can adapt the server based on the
  // given serverCapabilities.
  public static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return this.canAdaptV2(serverCapabilities) || this.canAdaptV3(serverCapabilities);
  }

  private static canAdaptV2(serverCapabilities: ServerCapabilities): boolean {
    return (
      serverCapabilities.textDocumentSync === TextDocumentSyncKind.Incremental ||
      serverCapabilities.textDocumentSync === TextDocumentSyncKind.Full
    );
  }

  private static canAdaptV3(serverCapabilities: ServerCapabilities): boolean {
    const options = serverCapabilities.textDocumentSync;
    return (
      options !== null &&
      typeof options === 'object' &&
      (options.change === TextDocumentSyncKind.Incremental || options.change === TextDocumentSyncKind.Full)
    );
  }

  // Public: Create a new {DocumentSyncAdapter} for the given language server.
  //
  // * `connection` A {LanguageClientConnection} to the language server to be kept in sync.
  // * `documentSync` The document syncing options.
  // * `editorSelector` A predicate function that takes a {TextEditor} and returns a {boolean}
  //                    indicating whether this adapter should care about the contents of the editor.
  constructor(
    private _connection: LanguageClientConnection,
    private _editorSelector: (editor: TextEditor) => boolean,
    documentSync: TextDocumentSyncOptions | TextDocumentSyncKind | undefined,
    private _reportBusyWhile: Utils.ReportBusyWhile,
  ) {
    if (typeof documentSync === 'object') {
      this._documentSync = documentSync;
    } else {
      this._documentSync = {
        change: documentSync || TextDocumentSyncKind.Full,
      };
    }
    this._disposable.add(atom.textEditors.observe(this.observeTextEditor.bind(this)));
  }

  // Dispose this adapter ensuring any resources are freed and events unhooked.
  public dispose(): void {
    this._disposable.dispose();
  }

  // Examine a {TextEditor} and decide if we wish to observe it. If so ensure that we stop observing it
  // when it is closed or otherwise destroyed.
  //
  // * `editor` A {TextEditor} to consider for observation.
  public observeTextEditor(editor: TextEditor): void {
    const listener = editor.observeGrammar((_grammar) => this._handleGrammarChange(editor));
    this._disposable.add(
      editor.onDidDestroy(() => {
        this._disposable.remove(listener);
        listener.dispose();
      }),
    );
    this._disposable.add(listener);
    if (!this._editors.has(editor) && this._editorSelector(editor)) {
      this._handleNewEditor(editor);
    }
  }

  private _handleGrammarChange(editor: TextEditor): void {
    const sync = this._editors.get(editor);
    if (sync != null && !this._editorSelector(editor)) {
      this._editors.delete(editor);
      this._disposable.remove(sync);
      sync.didClose();
      sync.dispose();
    } else if (sync == null && this._editorSelector(editor)) {
      this._handleNewEditor(editor);
    }
  }

  private _handleNewEditor(editor: TextEditor): void {
    const sync = new TextEditorSyncAdapter(
      editor,
      this._connection,
      this._documentSync,
      this._versions,
      this._reportBusyWhile,
    );
    this._editors.set(editor, sync);
    this._disposable.add(sync);
    this._disposable.add(
      editor.onDidDestroy(() => {
        const destroyedSync = this._editors.get(editor);
        if (destroyedSync) {
          this._editors.delete(editor);
          this._disposable.remove(destroyedSync);
          destroyedSync.dispose();
        }
      }),
    );
  }

  public getEditorSyncAdapter(editor: TextEditor): TextEditorSyncAdapter | undefined {
    return this._editors.get(editor);
  }
}

// Public: Keep a single {TextEditor} in sync with a given language server.
export class TextEditorSyncAdapter {
  private _disposable = new CompositeDisposable();
  private _currentUri: string;
  private _fakeDidChangeWatchedFiles: boolean;

  // Public: Create a {TextEditorSyncAdapter} in sync with a given language server.
  //
  // * `editor` A {TextEditor} to keep in sync.
  // * `connection` A {LanguageClientConnection} to a language server to keep in sync.
  // * `documentSync` The document syncing options.
  constructor(
    private _editor: TextEditor,
    private _connection: LanguageClientConnection,
    private _documentSync: TextDocumentSyncOptions,
    private _versions: Map<string, number>,
    private _reportBusyWhile: Utils.ReportBusyWhile,
  ) {
    this._fakeDidChangeWatchedFiles = atom.project.onDidChangeFiles == null;

    const changeTracking = this.setupChangeTracking(_documentSync);
    if (changeTracking != null) {
      this._disposable.add(changeTracking);
    }

    // These handlers are attached only if server supports them
    if (_documentSync.willSave) {
      this._disposable.add(_editor.getBuffer().onWillSave(this.willSave.bind(this)));
    }
    if (_documentSync.willSaveWaitUntil) {
      this._disposable.add(_editor.getBuffer().onWillSave(this.willSaveWaitUntil.bind(this)));
    }
    // Send close notifications unless it's explicitly disabled
    if (_documentSync.openClose !== false) {
      this._disposable.add(_editor.onDidDestroy(this.didClose.bind(this)));
    }
    this._disposable.add(
      _editor.onDidSave(this.didSave.bind(this)),
      _editor.onDidChangePath(this.didRename.bind(this)),
    );

    this._currentUri = this.getEditorUri();

    if (_documentSync.openClose !== false) {
      this.didOpen();
    }
  }

  // The change tracking disposable listener that will ensure that changes are sent to the
  // language server as appropriate.
  public setupChangeTracking(documentSync: TextDocumentSyncOptions): Disposable | null {
    switch (documentSync.change) {
      case TextDocumentSyncKind.Full:
        return this._editor.onDidChange(this.sendFullChanges.bind(this));
      case TextDocumentSyncKind.Incremental:
        return this._editor.getBuffer().onDidChangeText(this.sendIncrementalChanges.bind(this));
    }
    return null;
  }

  // Dispose this adapter ensuring any resources are freed and events unhooked.
  public dispose(): void {
    this._disposable.dispose();
  }

  // Get the languageId field that will be sent to the language server by simply
  // using the grammar name.
  public getLanguageId(): string {
    return this._editor.getGrammar().name;
  }

  // Public: Create a {VersionedTextDocumentIdentifier} for the document observed by
  // this adapter including both the Uri and the current Version.
  public getVersionedTextDocumentIdentifier(): VersionedTextDocumentIdentifier {
    return {
      uri: this.getEditorUri(),
      version: this._getVersion(this._editor.getPath() || ''),
    };
  }

  // Public: Send the entire document to the language server. This is used when
  // operating in Full (1) sync mode.
  public sendFullChanges(): void {
    if (!this._isPrimaryAdapter()) { return; } // Multiple editors, we are not first

    this._bumpVersion();
    this._connection.didChangeTextDocument({
      textDocument: this.getVersionedTextDocumentIdentifier(),
      contentChanges: [{text: this._editor.getText()}],
    });
  }

  // Public: Send the incremental text changes to the language server. This is used
  // when operating in Incremental (2) sync mode.
  //
  // * `event` The event fired by Atom to indicate the document has stopped changing
  //           including a list of changes since the last time this event fired for this
  //           text editor.
  // Note: The order of changes in the event is guaranteed top to bottom.  Language server
  // expects this in reverse.
  public sendIncrementalChanges(event: DidStopChangingEvent): void {
    if (event.changes.length > 0) {
      if (!this._isPrimaryAdapter()) { return; } // Multiple editors, we are not first

      this._bumpVersion();
      this._connection.didChangeTextDocument({
        textDocument: this.getVersionedTextDocumentIdentifier(),
        contentChanges: event.changes.map(TextEditorSyncAdapter.textEditToContentChange).reverse(),
      });
    }
  }

  // Public: Convert an Atom {TextEditEvent} to a language server {TextDocumentContentChangeEvent}
  // object.
  //
  // * `change` The Atom {TextEditEvent} to convert.
  //
  // Returns a {TextDocumentContentChangeEvent} that represents the converted {TextEditEvent}.
  public static textEditToContentChange(change: TextEditEvent): TextDocumentContentChangeEvent {
    return {
      range: Convert.atomRangeToLSRange(change.oldRange),
      rangeLength: change.oldText.length,
      text: change.newText,
    };
  }

  private _isPrimaryAdapter(): boolean {
    const lowestIdForBuffer = Math.min(
      ...atom.workspace
        .getTextEditors()
        .filter((t) => t.getBuffer() === this._editor.getBuffer())
        .map((t) => t.id),
    );
    return lowestIdForBuffer === this._editor.id;
  }

  private _bumpVersion(): void {
    const filePath = this._editor.getPath();
    if (filePath == null) { return; }
    this._versions.set(filePath, this._getVersion(filePath) + 1);
  }

  // Ensure when the document is opened we send notification to the language server
  // so it can load it in and keep track of diagnostics etc.
  private didOpen(): void {
    const filePath = this._editor.getPath();
    if (filePath == null) { return; } // Not yet saved

    if (!this._isPrimaryAdapter()) { return; } // Multiple editors, we are not first

    this._connection.didOpenTextDocument({
      textDocument: {
        uri: this.getEditorUri(),
        languageId: this.getLanguageId().toLowerCase(),
        version: this._getVersion(filePath),
        text: this._editor.getText(),
      },
    });
  }

  private _getVersion(filePath: string): number {
    return this._versions.get(filePath) || 1;
  }

  // Called when the {TextEditor} is closed and sends the 'didCloseTextDocument' notification to
  // the connected language server.
  public didClose(): void {
    if (this._editor.getPath() == null) { return; } // Not yet saved

    const fileStillOpen = atom.workspace.getTextEditors().find((t) => t.getBuffer() === this._editor.getBuffer());
    if (fileStillOpen) {
      return; // Other windows or editors still have this file open
    }

    this._connection.didCloseTextDocument({textDocument: {uri: this.getEditorUri()}});
  }

  // Called just before the {TextEditor} saves and sends the 'willSaveTextDocument' notification to
  // the connected language server.
  public willSave(): void {
    if (!this._isPrimaryAdapter()) { return; }

    const uri = this.getEditorUri();
    this._connection.willSaveTextDocument({
      textDocument: {uri},
      reason: TextDocumentSaveReason.Manual,
    });
  }

  // Called just before the {TextEditor} saves, sends the 'willSaveWaitUntilTextDocument' request to
  // the connected language server and waits for the response before saving the buffer.
  public async willSaveWaitUntil(): Promise<void> {
    if (!this._isPrimaryAdapter()) { return Promise.resolve(); }

    const buffer = this._editor.getBuffer();
    const uri = this.getEditorUri();
    const title = this._editor.getLongTitle();

    const applyEditsOrTimeout = Utils.promiseWithTimeout(
      2500, // 2.5 seconds timeout
      this._connection.willSaveWaitUntilTextDocument({
        textDocument: {uri},
        reason: TextDocumentSaveReason.Manual,
      }),
    ).then((edits) => {
      const cursor = this._editor.getCursorBufferPosition();
      ApplyEditAdapter.applyEdits(buffer, Convert.convertLsTextEdits(edits));
      this._editor.setCursorBufferPosition(cursor);
    }).catch((err) => {
      atom.notifications.addError('On-save action failed', {
        description: `Failed to apply edits to ${title}`,
        detail: err.message,
      });
      return;
    });

    const withBusySignal =
      this._reportBusyWhile(
        `Applying on-save edits for ${title}`,
        () => applyEditsOrTimeout,
      );
    return withBusySignal || applyEditsOrTimeout;
  }

  // Called when the {TextEditor} saves and sends the 'didSaveTextDocument' notification to
  // the connected language server.
  // Note: Right now this also sends the `didChangeWatchedFiles` notification as well but that
  // will be sent from elsewhere soon.
  public didSave(): void {
    if (!this._isPrimaryAdapter()) { return; }

    const uri = this.getEditorUri();
    const didSaveNotification = {
      textDocument: {uri, version: this._getVersion((uri))},
    } as DidSaveTextDocumentParams;
    if (this._documentSync.save && this._documentSync.save.includeText) {
      didSaveNotification.text = this._editor.getText();
    }
    this._connection.didSaveTextDocument(didSaveNotification);
    if (this._fakeDidChangeWatchedFiles) {
      this._connection.didChangeWatchedFiles({
        changes: [{uri, type: FileChangeType.Changed}],
      });
    }
  }

  public didRename(): void {
    if (!this._isPrimaryAdapter()) { return; }

    const oldUri = this._currentUri;
    this._currentUri = this.getEditorUri();
    if (!oldUri) {
      return; // Didn't previously have a name
    }

    if (this._documentSync.openClose !== false) {
      this._connection.didCloseTextDocument({textDocument: {uri: oldUri}});
    }

    if (this._fakeDidChangeWatchedFiles) {
      this._connection.didChangeWatchedFiles({
        changes: [{uri: oldUri, type: FileChangeType.Deleted}, {uri: this._currentUri, type: FileChangeType.Created}],
      });
    }

    // Send an equivalent open event for this editor, which will now use the new
    // file path.
    if (this._documentSync.openClose !== false) {
      this.didOpen();
    }
  }

  // Public: Obtain the current {TextEditor} path and convert it to a Uri.
  public getEditorUri(): string {
    return Convert.pathToUri(this._editor.getPath() || '');
  }
}
