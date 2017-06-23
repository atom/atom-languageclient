// @flow

import {LanguageClientConnection, type DocumentFormattingParams, type DocumentRangeFormattingParams,
  type FormattingOptions, type ServerCapabilities, type TextEdit} from '../languageclient';
import Convert from '../convert';

export default class CodeFormatAdapter {
  static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.documentRangeFormattingProvider == true || serverCapabilities.documentFormattingProvider == true;
  }

  static format(connection: LanguageClientConnection, serverCapabilities: ServerCapabilities, editor: atom$TextEditor, range: atom$Range): Promise<Array<nuclide$TextEdit>> {
    if (serverCapabilities.documentRangeFormattingProvider) {
      return CodeFormatAdapter.formatRange(connection, editor, range);
    }

    if (serverCapabilities.documentFormattingProvider) {
      return CodeFormatAdapter.formatDocument(connection, editor);
    }

    throw new Error('Can not format document, language server does not support it');
  }

  static async formatDocument(connection: LanguageClientConnection, editor: atom$TextEditor): Promise<Array<nuclide$TextEdit>> {
    const edits = await connection.documentFormatting(CodeFormatAdapter.createDocumentFormattingParams(editor));
    return CodeFormatAdapter.convertLsTextEdits(edits);
  }

  static createDocumentFormattingParams(editor: atom$TextEditor): DocumentFormattingParams {
    return {
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      options: CodeFormatAdapter.getFormatOptions(editor),
    };
  }

  static async formatRange(connection: LanguageClientConnection, editor: atom$TextEditor, range: atom$Range): Promise<Array<nuclide$TextEdit>> {
    const edits = await connection.documentRangeFormatting(CodeFormatAdapter.createDocumentRangeFormattingParams(editor, range));
    return CodeFormatAdapter.convertLsTextEdits(edits);
  }

  static createDocumentRangeFormattingParams(editor: atom$TextEditor, range: atom$Range): DocumentRangeFormattingParams {
    return {
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      range: Convert.atomRangeToLSRange(range),
      options: CodeFormatAdapter.getFormatOptions(editor),
    };
  }

  static getFormatOptions(editor: atom$TextEditor): FormattingOptions {
    return {
      tabSize: editor.getTabLength(),
      insertSpaces: editor.getSoftTabs(),
    };
  }

  static convertLsTextEdits(edits: Array<TextEdit>): Array<nuclide$TextEdit> {
    return edits.map(CodeFormatAdapter.convertLsTextEdit);
  }

  static convertLsTextEdit(textEdit: TextEdit): nuclide$TextEdit {
    return {
      oldRange: Convert.lsRangeToAtomRange(textEdit.range),
      newText: textEdit.newText
    }
  }
}
