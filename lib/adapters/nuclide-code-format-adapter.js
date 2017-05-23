// @flow

import {LanguageClientConnection, type DocumentFormattingParams, type DocumentRangeFormattingParams,
  type FormattingOptions, type ServerCapabilities, type TextEdit} from '../languageclient';
import Convert from '../convert';

export default class NuclideCodeFormatAdapter {
  static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.documentRangeFormattingProvider == true || serverCapabilities.documentFormattingProvider == true;
  }

  format(connection: LanguageClientConnection, serverCapabilities: ServerCapabilities, editor: atom$TextEditor, range: atom$Range): Promise<Array<nuclide$TextEdit>> {
    if (serverCapabilities.documentRangeFormattingProvider) {
      return NuclideCodeFormatAdapter.formatRange(connection, editor, range);
    }

    if (serverCapabilities.documentFormattingProvider) {
      return NuclideCodeFormatAdapter.formatDocument(connection, editor);
    }

    throw new Error('Can not format document, language server does not support it');
  }

  static async formatDocument(connection: LanguageClientConnection, editor: atom$TextEditor): Promise<Array<nuclide$TextEdit>> {
    const edits = await connection.documentFormatting(NuclideCodeFormatAdapter.createDocumentFormattingParams(editor));
    return NuclideCodeFormatAdapter.convertLsTextEditsToNuclide(edits);
  }

  static createDocumentFormattingParams(editor: atom$TextEditor): DocumentFormattingParams {
    return {
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      options: NuclideCodeFormatAdapter.getFormatOptions(editor),
    };
  }

  static async formatRange(connection: LanguageClientConnection, editor: atom$TextEditor, range: atom$Range): Promise<Array<nuclide$TextEdit>> {
    const edits = await connection.documentRangeFormatting(NuclideCodeFormatAdapter.createDocumentRangeFormattingParams(editor));
    return NuclideCodeFormatAdapter.convertLsTextEditsToNuclide(edits);
  }

  static createDocumentRangeFormattingParams(editor: atom$TextEditor): DocumentRangeFormattingParams {
    return {
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      range: Convert.atomRangeToLSRange(editor.getSelectedBufferRange()),
      options: NuclideCodeFormatAdapter.getFormatOptions(editor),
    };
  }

  static getFormatOptions(editor: atom$TextEditor): FormattingOptions {
    return {
      tabSize: editor.getTabLength(),
      insertSpaces: editor.getSoftTabs(),
    };
  }

  static convertLsTextEditsToNuclide(edits: Array<TextEdit>): Array<nuclide$TextEdit> {
    return edits.map(NuclideCodeFormatAdapter.convertLsTextEditToNuclide).reverse();
  }

  static convertLsTextEditToNuclide(textEdit: TextEdit): nuclide$TextEdit {
    return {
      oldRange: Convert.lsRangeToAtomRange(textEdit.range),
      newText: textEdit.newText
    }
  }
}
