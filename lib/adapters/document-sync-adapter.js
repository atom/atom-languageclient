// @flow

import {LanguageClientConnection, FileChangeType, TextDocumentSyncKind,
  type TextDocumentContentChangeEvent, type VersionedTextDocumentIdentifier,
  type ServerCapabilities} from '../languageclient';
import Convert from '../convert';
import {CompositeDisposable} from 'atom';

export default class DocumentSyncAdapter {
  _disposable = new CompositeDisposable();
  _documentSyncKind: number;
  _editors: WeakMap<atom$TextEditor, TextEditorSyncAdapter> = new WeakMap();
  _connection: LanguageClientConnection;

  static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.textDocumentSync === TextDocumentSyncKind.Incremental
        || serverCapabilities.textDocumentSync == TextDocumentSyncKind.Full;
  }

  constructor(connection: LanguageClientConnection, documentSyncKind: number) {
    this._connection = connection;
    this._documentSyncKind = documentSyncKind;
    this._disposable.add(atom.textEditors.observe(this.observeTextEditors.bind(this)));
  }

  dispose(): void {
    this._disposable.dispose();
  }

  observeTextEditors(editor: atom$TextEditor): void {
    if (!this._editors.has(editor)) {
      const sync = new TextEditorSyncAdapter(editor, this._connection, this._documentSyncKind);
      this._editors.set(editor, sync);
      this._disposable.add(sync);
      this._disposable.add(editor.onDidDestroy(() => {
        this._editors.delete(editor);
        this._disposable.remove(sync);
        sync.dispose();
      }));
    }
  }
}

class TextEditorSyncAdapter {
  _disposable = new CompositeDisposable();
  _editor: atom$TextEditor;
  _connection: LanguageClientConnection;
  _version = 1;

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
    );

    this.didOpen();
  }

  setupChangeTracking(documentSyncKind: number): ?IDisposable {
    switch (documentSyncKind) {
      case TextDocumentSyncKind.Full:
        return this._editor.onDidChange(this.sendFullChanges.bind(this));
      case TextDocumentSyncKind.Incremental:
        return this._editor.getBuffer().onDidStopChanging(this.sendIncrementalChanges.bind(this));
    }
    return null;
  }

  dispose(): void {
    this._disposable.dispose();
  }

  getLanguageId(): string {
    return this._editor.getGrammar().name;
  }

  getVersionedTextDocumentIdentifier(): VersionedTextDocumentIdentifier {
    return {
      uri: this.getEditorUri(),
      version: this._version,
    };
  }

  didOpen(): void {
    this._connection.didOpenTextDocument({
      textDocument: {
        uri: this.getEditorUri(),
        languageId: this.getLanguageId().toLowerCase(),
        version: this._version,
        text: this._editor.getText(),
      },
    });
  }

  sendFullChanges(): void {
    this._version++;
    this._connection.didChangeTextDocument({
      textDocument: this.getVersionedTextDocumentIdentifier(),
      contentChanges: [{text: this._editor.getText()}],
    });
  }

  sendIncrementalChanges(event: atom$DidStopChangingEvent): void {
    if (event.changes.length > 0) {
      this._version++;
      this._connection.didChangeTextDocument({
        textDocument: this.getVersionedTextDocumentIdentifier(),
        contentChanges: event.changes.map(TextEditorSyncAdapter.textEditToContentChange),
      });
    }
  }

  static textEditToContentChange(change: atom$TextEditEvent): TextDocumentContentChangeEvent {
    return {
      range: Convert.atomRangeToLSRange(change.oldRange),
      rangeLength: change.oldText.length,
      text: change.newText,
    };
  }

  didDestroy(): void {
    this._connection.didCloseTextDocument({textDocument: {uri: this.getEditorUri()}});
  }

  didSave(): void {
    this._connection.didSaveTextDocument({textDocument: {uri: this.getEditorUri()}});
    this._connection.didChangeWatchedFiles({changes: [{uri: this.getEditorUri(), type: FileChangeType.Changed}]}); // Replace with file watch
  }

  getEditorUri(): string {
    return Convert.pathToUri(this._editor.getPath() || '');
  }
}
