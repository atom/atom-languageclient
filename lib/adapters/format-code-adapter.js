// @flow

import {LanguageClientConnection} from '../languageclient';
import type {DocumentFormattingParams, DocumentRangeFormattingParams, FormattingOptions, ServerCapabilities, TextEdit} from '../languageclient';
import Convert from '../convert';
import {CompositeDisposable} from 'atom';

export default class FormatCodeAdapter {
  _disposable: CompositeDisposable;
  _lc: LanguageClientConnection;

  constructor(languageClient: LanguageClientConnection, capabilities: ServerCapabilities, grammarScopes: Array<string>) {
    this._disposable = new CompositeDisposable();
    this._lc = languageClient;
    this.registerCommands(capabilities, Convert.grammarScopesToTextEditorScopes(grammarScopes));
  }

  registerCommands(capabilities: ServerCapabilities, textEditorScopes: string) {
    if (capabilities.documentRangeFormattingProvider === true) {
      this._disposable.add(
        atom.commands.add(textEditorScopes, {'language:format-selection': this.formatSelection.bind(this)}));
    }
    if (capabilities.documentFormattingProvider === true) {
      this._disposable.add(
        atom.commands.add(textEditorScopes, {'language:format-file': this.formatDocument.bind(this)}));
    }
  }

  dispose(): void {
    this._disposable.dispose();
  }

  async formatDocument(): Promise<void> {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor == null) { return; }

    const textEdits = await this._lc.documentFormatting(FormatCodeAdapter.createDocumentFormattingParams(editor));
    textEdits.reverse();
    FormatCodeAdapter.applyTextEditsInTransaction(editor, textEdits);
  }

  static createDocumentFormattingParams(editor: atom$TextEditor): DocumentFormattingParams {
    return {
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      options: FormatCodeAdapter.getFormatOptions(editor),
    };
  }

  async formatSelection(): Promise<void> {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor == null) { return; }

    const textEdits = await this._lc.documentRangeFormatting(FormatCodeAdapter.createDocumentRangeFormattingParams(editor));
    textEdits.reverse();
    FormatCodeAdapter.applyTextEditsInTransaction(editor, textEdits);
  }

  static createDocumentRangeFormattingParams(editor: atom$TextEditor): DocumentRangeFormattingParams {
    return {
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      range: Convert.atomRangeToLSRange(editor.getSelectedBufferRange()),
      options: FormatCodeAdapter.getFormatOptions(editor),
    };
  }

  static applyTextEditsInTransaction(editor: atom$TextEditor, textEdits: Array<TextEdit>): void {
    editor.getBuffer().transact(() => this.applyTextEdits(editor, textEdits));
  }

  static applyTextEdits(editor: atom$TextEditor, textEdits: Array<TextEdit>): void {
    for (const textEdit of textEdits) {
      editor.setTextInBufferRange(Convert.lsRangeToAtomRange(textEdit.range), textEdit.newText);
    }
  }

  static getFormatOptions(editor: atom$TextEditor): FormattingOptions {
    return {
      tabSize: editor.getTabLength(),
      insertSpaces: editor.getSoftTabs(),
    };
  }
}
