// @flow

import {LanguageClientV2} from '../protocol/languageclient-v2';
import type {FormattingOptions, TextEdit} from '../protocol/languageclient-v2';
import Convert from '../convert';
import {CompositeDisposable} from 'atom';

export default class FormatDocumentBridge {
  _disposable = new CompositeDisposable();
  _lc: LanguageClientV2;

  constructor(languageClient: LanguageClientV2) {
    this._lc = languageClient;
    this._disposable.add(
      atom.commands.add('atom-text-editor', {'language:format-document': this.formatDocument.bind(this)})
    );
  }

  dispose(): void {
    this._disposable.dispose();
  }

  async formatDocument(): Promise<void> {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor == null) return;

    const result = await this._lc.documentFormatting({
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      options: FormatDocumentBridge.getFormatOptions(editor)
    });

    editor.getBuffer().transact(() => FormatDocumentBridge.applyTextEdits(editor, result.reverse()));
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
