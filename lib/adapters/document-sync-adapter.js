// @flow

import {
  LanguageClientConnection,
  FileChangeType,
  TextDocumentSyncKind,
  TextDocumentSyncOptions,
  type TextDocumentContentChangeEvent,
  type VersionedTextDocumentIdentifier,
  type ServerCapabilities,
} from '../languageclient';
import Convert from '../convert';
import {CompositeDisposable} from 'atom';

// Public: Synchronizes the documents between Atom and the language server by notifying
// each end of changes, opening, closing and other events as well as sending and applying
// changes either in whole or in part depending on what the language server supports.
export default class DocumentSyncAdapter {
  _editorSelector: atom$TextEditor => boolean;
  _disposable = new CompositeDisposable();
  _documentSyncKind: number;
  _editors: WeakMap<atom$TextEditor, TextEditorSyncAdapter> = new WeakMap();
  _connection: LanguageClientConnection;

  // Public: Determine whether this adapter can be used to adapt a language server
  // based on the serverCapabilities matrix textDocumentSync capability either being Full or
  // Incremental.
  //
  // * `serverCapabilities` The {ServerCapabilities} of the language server to consider.
  //
  // Returns a {Boolean} indicating adapter can adapt the server based on the
  // given serverCapabilities.
  static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return this.canAdaptV2(serverCapabilities) || this.canAdaptV3(serverCapabilities);
  }

  static canAdaptV2(serverCapabilities: ServerCapabilities): boolean {
    return (
      serverCapabilities.textDocumentSync === TextDocumentSyncKind.Incremental ||
      serverCapabilities.textDocumentSync === TextDocumentSyncKind.Full
    );
  }

  static canAdaptV3(serverCapabilities: ServerCapabilities): boolean {
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
  // * `documentSyncKind` The type of document syncing supported - Full or Incremental.
  // * `editorSelector` A predicate function that takes a {TextEditor} and returns a {boolean}
  //                    indicating whether this adapter should care about the contents of the editor.
  constructor(
    connection: LanguageClientConnection,
    documentSyncKind: ?(TextDocumentSyncOptions | number),
    editorSelector: atom$TextEditor => boolean,
  ) {
    this._connection = connection;
    if (typeof documentSyncKind === 'number') {
      this._documentSyncKind = documentSyncKind;
    } else if (documentSyncKind != null && documentSyncKind.change != null) {
      this._documentSyncKind = documentSyncKind.change;
    } else {
      this._documentSyncKind = TextDocumentSyncKind.Full;
    }
    this._editorSelector = editorSelector;
    this._disposable.add(atom.textEditors.observe(this.observeTextEditor.bind(this)));
  }

  // Dispose this adapter ensuring any resources are freed and events unhooked.
  dispose(): void {
    this._disposable.dispose();
  }

  // Examine a {TextEditor} and decide if we wish to observe it. If so ensure that we stop observing it
  // when it is closed or otherwise destroyed.
  //
  // * `editor` A {TextEditor} to consider for observation.
  observeTextEditor(editor: atom$TextEditor): void {
    const listener = editor.observeGrammar(grammar => this._handleGrammarChange(editor));
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

  _handleGrammarChange(editor: atom$TextEditor): void {
    const sync = this._editors.get(editor);
    if (sync != null && !this._editorSelector(editor)) {
      this._editors.delete(editor);
      this._disposable.remove(sync);
      sync.dispose();
    } else if (sync == null && this._editorSelector(editor)) {
      this._handleNewEditor(editor);
    }
  }

  _handleNewEditor(editor: atom$TextEditor): void {
    const sync = new TextEditorSyncAdapter(editor, this._connection, this._documentSyncKind);
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

  getEditorSyncAdapter(editor: atom$TextEditor): ?TextEditorSyncAdapter {
    return this._editors.get(editor);
  }
}

// Public: Keep a single {TextEditor} in sync with a given language server.
class TextEditorSyncAdapter {
  _disposable = new CompositeDisposable();
  _editor: atom$TextEditor;
  _lastFileUri: ?string;
  _connection: LanguageClientConnection;
  _version = 1;

  // Public: Create a {TextEditorSyncAdapter} in sync with a given language server.
  //
  // * `editor` A {TextEditor} to keep in sync.
  // * `connection` A {LanguageClientConnection} to a language server to keep in sync.
  // * `documentSyncKind` Whether to use Full (1) or Incremental (2) when sending changes.
  constructor(editor: atom$TextEditor, connection: LanguageClientConnection, documentSyncKind: number) {
    this._editor = editor;
    this._connection = connection;

    const changeTracking = this.setupChangeTracking(documentSyncKind);
    if (changeTracking != null) {
      this._disposable.add(changeTracking);
    }

    this._disposable.add(
      editor.onDidSave(this.didSave.bind(this)),
      editor.onDidDestroy(this.didDestroy.bind(this)),
      editor.onDidChangePath(this.didRename.bind(this)),
    );

    this._lastFileUri = this.getEditorUri();
    this.didOpen();
  }

  // The change tracking disposable listener that will ensure that changes are sent to the
  // language server as appropriate.
  setupChangeTracking(documentSyncKind: number): ?IDisposable {
    switch (documentSyncKind) {
      case TextDocumentSyncKind.Full:
        return this._editor.onDidChange(this.sendFullChanges.bind(this));
      case TextDocumentSyncKind.Incremental:
        return this._editor.getBuffer().onDidChangeText(this.sendIncrementalChanges.bind(this));
    }
    return null;
  }

  // Dispose this adapter ensuring any resources are freed and events unhooked.
  dispose(): void {
    this._disposable.dispose();
  }

  // Get the languageId field that will be sent to the language server by simply
  // using the grammar name.
  getLanguageId(): string {
    return this._editor.getGrammar().name;
  }

  // Public: Create a {VersionedTextDocumentIdentifier} for the document observed by
  // this adapter including both the Uri and the current Version.
  getVersionedTextDocumentIdentifier(): VersionedTextDocumentIdentifier {
    return {
      uri: this.getEditorUri(),
      version: this._version,
    };
  }

  // Ensure when the document is opened we send notification to the language server
  // so it can load it in and keep track of diagnostics etc.
  didOpen(): void {
    if (this._editor.getURI() == null) {
      return;
    } // Not yet saved

    this._connection.didOpenTextDocument({
      textDocument: {
        uri: this.getEditorUri(),
        languageId: this.getLanguageId().toLowerCase(),
        version: this._version,
        text: this._editor.getText(),
      },
    });
  }

  // Public: Send the entire document to the language server. This is used when
  // operating in Full (1) sync mode.
  sendFullChanges(): void {
    this._version++;
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
  sendIncrementalChanges(event: atom$DidStopChangingEvent): void {
    if (event.changes.length > 0) {
      this._version++;
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
  static textEditToContentChange(change: atom$TextEditEvent): TextDocumentContentChangeEvent {
    return {
      range: Convert.atomRangeToLSRange(change.oldRange),
      rangeLength: change.oldText.length,
      text: change.newText,
    };
  }

  // Called when the {TextEditor} is closed and sends the 'didCloseTextDocument' notification to
  // the connected language server.
  didDestroy(): void {
    if (this._editor.getURI() == null) {
      return;
    } // Not yet saved
    this._connection.didCloseTextDocument({
      textDocument: {uri: this.getEditorUri()},
    });
  }

  // Called when the {TextEditor} saves and sends the 'didSaveTextDocument' notification to
  // the connected language server.
  // Note: Right now this also sends the `didChangeWatchedFiles` notification as well but that
  // will be sent from elsewhere soon.
  didSave(): void {
    this._connection.didSaveTextDocument({
      textDocument: {uri: this.getEditorUri()},
    });
    // TODO: Move this to a file watching event once Atom has API support.
    this._connection.didChangeWatchedFiles({
      changes: [{uri: this.getEditorUri(), type: FileChangeType.Changed}],
    }); // Replace with file watch
  }

  didRename() {
    const lastFileUri = this._lastFileUri;
    if (!lastFileUri) {
      this._lastFileUri = this.getEditorUri();
      return;
    }

    this._connection.didCloseTextDocument({
      textDocument: {uri: lastFileUri},
    });
    this._connection.didChangeWatchedFiles({
      changes: [
        {uri: lastFileUri, type: FileChangeType.Deleted},
        {uri: this.getEditorUri(), type: FileChangeType.Created},
      ],
    });
    this._lastFileUri = this.getEditorUri();

    // send an equivalent open event for this editor, which will now use the new
    // file path
    this.didOpen();
  }

  // Public: Obtain the current {TextEditor} path and convert it to a Uri.
  getEditorUri(): string {
    return Convert.pathToUri(this._editor.getPath() || '');
  }
}
