// @flow

import * as ls from '../protocol/languageclient-v2';
import Convert from '../convert';
import {CompositeDisposable} from 'atom';

export default class FormatDocumentBridge
{
  _disposable: CompositeDisposable;
  _lc: ls.LanguageClientV2;

  constructor(languageClient: ls.LanguageClientV2) {
    this._disposable = new CompositeDisposable();
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
      options: FormatDocumentBridge._getFormatOptions(editor)
    });

    editor.getBuffer().transact(() => this.applyTextEdits(editor, result.reverse()));
  }

  applyTextEdits(editor: atom$TextEditor, textEdits: Array<ls.TextEdit>): void {
    for (let textEdit of textEdits) {
      const atomRange = Convert.lsRangeToAtomRange(textEdit.range);
      editor.setTextInBufferRange(atomRange, textEdit.newText);
    }
  }

  static _getFormatOptions(editor: atom$TextEditor): ls.FormattingOptions {
    return {
      tabSize: editor.getTabLength(),
      insertSpaces: editor.getSoftTabs()
    }
  }
}
