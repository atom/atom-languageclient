// @flow

import {LanguageClientV2, FileChangeType, TextDocumentSyncKind} from '../protocol/languageclient-v2';
import type {TextDocumentContentChangeEvent, VersionedTextDocumentIdentifier} from '../protocol/languageclient-v2';
import Convert from '../convert';
import {CompositeDisposable} from 'atom';

export default class DocumentSyncBridge {
  _disposable = new CompositeDisposable();
  _documentSyncKind: number;
  _editors: WeakMap<atom$TextEditor, TextEditorSyncBridge> = new WeakMap();
  _lc: LanguageClientV2;

  constructor(languageClient: LanguageClientV2, documentSyncKind: number) {
    this._lc = languageClient;
    this._documentSyncKind = documentSyncKind;
    this._disposable.add(atom.textEditors.observe(this.observeTextEditors.bind(this)));
  }

  dispose(): void {
    this._disposable.dispose();
  }

  observeTextEditors(editor: atom$TextEditor): void {
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

class TextEditorSyncBridge {
  _disposable = new CompositeDisposable();
  _editor: atom$TextEditor;
  _lc: LanguageClientV2;
  _version = 1;

  constructor(editor: atom$TextEditor, languageClient: LanguageClientV2, documentSyncKind: number) {
    this._editor = editor;
    this._lc = languageClient;

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
        return this._editor.onDidChange(this.editorChangeSendFull.bind(this));
      case TextDocumentSyncKind.Incremental:
        return this._editor.getBuffer().onDidChangeText(this.bufferChangeSendIncrement.bind(this));
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
      version: this._version
    };
  }

  didOpen(): void {
    this._lc.didOpenTextDocument({
      textDocument: {
        uri: this.getEditorUri(),
        languageId: this.getLanguageId().toLowerCase(),
        version: this._version,
        text: this._editor.getText()
      }
    });
  }

  editorChangeSendFull(): void {
    this._version++;
    this._lc.didChangeTextDocument({
      textDocument: this.getVersionedTextDocumentIdentifier(),
      contentChanges: [ { text: this._editor.getText() } ]
    });
  }

  bufferChangeSendIncrement(event: atom$ChangeTextEvent): void {
    this._version++;
    this._lc.didChangeTextDocument({
      textDocument: this.getVersionedTextDocumentIdentifier(),
      contentChanges: event.changes.map(TextEditorSyncBridge.changeTextToContentChange)
    });
  }

  static changeTextToContentChange(change: atom$ChangeText): TextDocumentContentChangeEvent {
    const start = Convert.pointToPosition(change.start);
    const end = { line: change.start.row + change.oldExtent.row, character: change.start.column + change.oldExtent.column };

    return {
      range: { start: start, end: end },
      rangeLength: change.oldExtent.column - change.newExtent.column + change.newText.length, // TODO: Only works if row is the same...
      text: change.newText
    };
  }

  didDestroy(): void {
    this._lc.didCloseTextDocument({ textDocument: { uri: this.getEditorUri() } });
  }

  didSave(): void {
    this._lc.didSaveTextDocument({ textDocument: { uri: this.getEditorUri() } });
    this._lc.didChangeWatchedFiles({ changes: [ { uri: this.getEditorUri(), type: FileChangeType.Changed } ]});
  }

  getEditorUri(): string {
    return Convert.pathToUri(this._editor.getURI() || '');
  }
}
