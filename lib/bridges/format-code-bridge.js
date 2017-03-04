// @flow

import {LanguageClientV2} from '../protocol/languageclient-v2';
import type {FormattingOptions, TextEdit} from '../protocol/languageclient-v2';
import Convert from '../convert';
import {CompositeDisposable} from 'atom';

export default class FormatCodeBridge {
  _disposable: CompositeDisposable;
  _lc: LanguageClientV2;

  constructor(languageClient: LanguageClientV2, canFormatSelection: boolean, canFormatFile: boolean) {
    this._disposable = new CompositeDisposable();
    this._lc = languageClient;
    if (canFormatSelection) {
      this._disposable.add(atom.commands.add('atom-text-editor', {'language:format-selection': this.formatSelection.bind(this)}));
    };
    if (canFormatFile) {
      this._disposable.add(atom.commands.add('atom-text-editor', {'language:format-file': this.formatDocument.bind(this)}));
    };
  }

  dispose(): void {
    this._disposable.dispose();
  }

  async formatDocument(): Promise<void> {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor == null) return;

    const result = await this._lc.documentFormatting({
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      options: FormatCodeBridge.getFormatOptions(editor)
    });

    editor.getBuffer().transact(() => FormatCodeBridge.applyTextEdits(editor, result.reverse()));
  }

  async formatSelection(): Promise<void> {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor == null) return;

    const result = await this._lc.documentRangeFormatting({
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      range: Convert.atomRangeToLSRange(editor.getSelectedBufferRange()),
      options: FormatCodeBridge.getFormatOptions(editor)
    });

    editor.getBuffer().transact(() => FormatCodeBridge.applyTextEdits(editor, result.reverse()));
  }

  static applyTextEdits(editor: atom$TextEditor, textEdits: Array<TextEdit>): void {
    for (let textEdit of textEdits) {
      const atomRange = Convert.lsRangeToAtomRange(textEdit.range);
      editor.setTextInBufferRange(atomRange, textEdit.newText);
    }
  }

  static getFormatOptions(editor: atom$TextEditor): FormattingOptions {
    return {
      tabSize: editor.getTabLength(),
      insertSpaces: editor.getSoftTabs()
    }
  }
}
