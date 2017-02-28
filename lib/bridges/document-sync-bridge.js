// @flow

import * as ls from '../protocol/languageclient-v2';
import Convert from '../convert';
import {CompositeDisposable} from 'atom';

export default class DocumentSyncBridge
{
  _documentSyncKind: number;
  _disposable: CompositeDisposable;
  _lc: ls.LanguageClientV2;
  _editors: WeakMap<atom$TextEditor, TextEditorSyncBridge> = new WeakMap();

  constructor(languageClient: ls.LanguageClientV2, documentSyncKind: number) {
    this._disposable = new CompositeDisposable();
    this._lc = languageClient;
    this._documentSyncKind = documentSyncKind;
    this._disposable.add(atom.textEditors.observe(this._observeTextEditors.bind(this)));
  }

  dispose(): void {
    this._disposable.dispose();
  }

  _observeTextEditors(editor: atom$TextEditor): void {
    if (!this._editors.has(editor)) {
      const sync = new TextEditorSyncBridge(editor, this._lc, this._documentSyncKind);
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

class TextEditorSyncBridge
{
  _disposable: CompositeDisposable = new CompositeDisposable();
  _editor: atom$TextEditor;
  _lc: ls.LanguageClientV2;
  _version: number = 1;

  constructor(editor: atom$TextEditor, languageClient: ls.LanguageClientV2, documentSyncKind: number) {
    this._editor = editor;
    this._lc = languageClient;

    const changeTracking = this._setupChangeTracking(documentSyncKind);
    if (changeTracking != null) {
      this._disposable.add(changeTracking);
    }

    this._disposable.add(
      editor.onDidSave(this._didSave.bind(this)),
      editor.onDidDestroy(this._didDestroy.bind(this)),
    );

    this._didOpen();
  }

  _setupChangeTracking(documentSyncKind: number): ?IDisposable {
    switch(documentSyncKind) {
      case ls.TextDocumentSyncKind.Full:
        return this._editor.onDidChange(this._editorChangeSendFull.bind(this));
      case ls.TextDocumentSyncKind.Incremental:
        return this._editor.getBuffer().onDidChangeText(this._bufferChangeSendIncrement.bind(this));
    }
    return null;
  }

  dispose(): void {
    this._disposable.dispose();
  }

  _getLanguageId(): string {
    return this._editor.getGrammar().name;
  }

  _getVersionedTextDocumentIdentifier(): ls.VersionedTextDocumentIdentifier {
    return {
      uri: this._getEditorUri(),
      version: this._version
    };
  }

  _didOpen(): void {
    this._lc.didOpenTextDocument({
      textDocument: {
        uri: this._getEditorUri(),
        languageId: this._getLanguageId().toLowerCase(),
        version: this._version,
        text: this._editor.getText()
      }
    });
  }

  _editorChangeSendFull(): void {
    this._version++;
    this._lc.didChangeTextDocument({
      textDocument: this._getVersionedTextDocumentIdentifier(),
      contentChanges: [ { text: this._editor.getText() } ]
    });
  }

  _bufferChangeSendIncrement(event: atom$ChangeTextEvent): void {
    this._version++;
    this._lc.didChangeTextDocument({
      textDocument: this._getVersionedTextDocumentIdentifier(),
      contentChanges: event.changes.map(TextEditorSyncBridge._changeTextToContentChange)
    });
  }

  static _changeTextToContentChange(change: atom$ChangeText): ls.TextDocumentContentChangeEvent {
    const start = Convert.pointToPosition(change.start);
    const end = { line: change.start.row + change.oldExtent.row, character: change.start.column + change.oldExtent.column };

    return {
      range: {
        start: start,
        end: end,
      },
      rangeLength: change.oldExtent.column - change.newExtent.column + change.newText.length, // TODO: Only works if row is the same...
      text: change.newText
    };
  }

  _didDestroy(): void {
    this._lc.didCloseTextDocument({
      textDocument: {
        uri: this._getEditorUri()
      }
    });
  }

  _didSave(): void {
    this._lc.didSaveTextDocument({ textDocument: { uri: this._getEditorUri() } });
    this._lc.didChangeWatchedFiles({ changes: [ { uri: this._getEditorUri(), type: ls.FileChangeType.Changed } ]});
  }

  _getEditorUri(): string {
    return Convert.pathToUri(this._editor.getURI() || '');
  }
}
