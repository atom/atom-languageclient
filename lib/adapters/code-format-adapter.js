// @flow

import {
  LanguageClientConnection,
  type DocumentFormattingParams,
  type DocumentRangeFormattingParams,
  type FormattingOptions,
  type ServerCapabilities,
  type TextEdit
} from '../languageclient';
import Convert from '../convert';

// Public: Adapts the language server protocol "textDocument/completion" to the
// Atom IDE UI Code-format package.
export default class CodeFormatAdapter {

  // Public: Determine whether this adapter can be used to adapt a language server
  // based on the serverCapabilities matrix containing either a documentFormattingProvider
  // or a documentRangeFormattingProvider.
  //
  // * `serverCapabilities` The {ServerCapabilities} of the language server to consider.
  //
  // Returns a {Boolean} indicating this adapter can adapt the server based on the
  // given serverCapabilities.
  static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.documentRangeFormattingProvider === true || serverCapabilities.documentFormattingProvider === true;
  }

  // Public: Format text in the editor using the given language server connection and an optional range.
  // If the server does not support range formatting then range will be ignored and the entire document formatted.
  //
  // * `connection` A {LanguageClientConnection} to the language server that will format the text.
  // * `serverCapabilities` The {ServerCapabilities} of the language server that will be used.
  // * `editor` The Atom {TextEditor} containing the text that will be formatted.
  // * `range` The optional Atom {Range} containing the subset of the text to be formatted.
  //
  // Returns a {Promise} of an {Array} of {Object}s containing the AutoComplete+
  // suggestions to display.
  static format(connection: LanguageClientConnection, serverCapabilities: ServerCapabilities, editor: atom$TextEditor, range: atom$Range): Promise<Array<nuclide$TextEdit>> {
    if (serverCapabilities.documentRangeFormattingProvider) {
      return CodeFormatAdapter.formatRange(connection, editor, range);
    }

    if (serverCapabilities.documentFormattingProvider) {
      return CodeFormatAdapter.formatDocument(connection, editor);
    }

    throw new Error('Can not format document, language server does not support it');
  }

  // Public: Format the entire document of an Atom {TextEditor} by using a given language server.
  //
  // * `connection` A {LanguageClientConnection} to the language server that will format the text.
  // * `editor` The Atom {TextEditor} containing the document to be formatted.
  //
  // Returns a {Promise} of an {Array} of {TextEdit} objects that can be applied to the Atom TextEditor
  // to format the document.
  static async formatDocument(connection: LanguageClientConnection, editor: atom$TextEditor): Promise<Array<nuclide$TextEdit>> {
    const edits = await connection.documentFormatting(CodeFormatAdapter.createDocumentFormattingParams(editor));
    return CodeFormatAdapter.convertLsTextEdits(edits);
  }

  // Public: Create {DocumentFormattingParams} to be sent to the language server when requesting an
  // entire document is formatted.
  //
  // * `editor` The Atom {TextEditor} containing the document to be formatted.
  //
  // Returns {DocumentFormattingParams} containing the identity of the text document as well as
  // options to be used in formatting the document such as tab size and tabs vs spaces.
  static createDocumentFormattingParams(editor: atom$TextEditor): DocumentFormattingParams {
    return {
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      options: CodeFormatAdapter.getFormatOptions(editor),
    };
  }

  // Public: Format a range within an Atom {TextEditor} by using a given language server.
  //
  // * `connection` A {LanguageClientConnection} to the language server that will format the text.
  // * `range` The Atom {Range} containing the range of text that should be formatted.
  // * `editor` The Atom {TextEditor} containing the document to be formatted.
  //
  // Returns a {Promise} of an {Array} of {TextEdit} objects that can be applied to the Atom TextEditor
  // to format the document.
  static async formatRange(connection: LanguageClientConnection, editor: atom$TextEditor, range: atom$Range): Promise<Array<nuclide$TextEdit>> {
    const edits = await connection.documentRangeFormatting(CodeFormatAdapter.createDocumentRangeFormattingParams(editor, range));
    return CodeFormatAdapter.convertLsTextEdits(edits);
  }

  // Public: Create {DocumentRangeFormattingParams} to be sent to the language server when requesting an
  // entire document is formatted.
  //
  // * `editor` The Atom {TextEditor} containing the document to be formatted.
  // * `range` The Atom {Range} containing the range of text that should be formatted.
  //
  // Returns {DocumentRangeFormattingParams} containing the identity of the text document, the
  // range of the text to be formatted as well as the options to be used in formatting the
  // document such as tab size and tabs vs spaces.
  static createDocumentRangeFormattingParams(editor: atom$TextEditor, range: atom$Range): DocumentRangeFormattingParams {
    return {
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      range: Convert.atomRangeToLSRange(range),
      options: CodeFormatAdapter.getFormatOptions(editor),
    };
  }

  // Public: Create {DocumentRangeFormattingParams} to be sent to the language server when requesting an
  // entire document is formatted.
  //
  // * `editor` The Atom {TextEditor} containing the document to be formatted.
  // * `range` The Atom {Range} containing the range of document that should be formatted.
  //
  // Returns the {FormattingOptions} to be used containing the keys:
  //  * `tabSize` The number of spaces a tab represents.
  //  * `insertSpaces` {True} if spaces should be used, {False} for tab characters.
  static getFormatOptions(editor: atom$TextEditor): FormattingOptions {
    return {
      tabSize: editor.getTabLength(),
      insertSpaces: editor.getSoftTabs(),
    };
  }

  // Public: Convert an array of language server protocol {TextEdit} objects to an
  // equivalent array of Atom {TextEdit} objects.
  //
  // * `textEdits` The language server protocol {TextEdit} objects to convert.
  //
  // Returns an {Array} of Atom {TextEdit} objects.
  static convertLsTextEdits(textEdits: Array<TextEdit>): Array<nuclide$TextEdit> {
    return textEdits.map(CodeFormatAdapter.convertLsTextEdit);
  }

  // Public: Convert a language server protocol {TextEdit} object to the
  // Atom equivalent {TextEdit}.
  //
  // * `textEdits` The language server protocol {TextEdit} objects to convert.
  //
  // Returns an Atom {TextEdit} object.
  static convertLsTextEdit(textEdit: TextEdit): nuclide$TextEdit {
    return {
      oldRange: Convert.lsRangeToAtomRange(textEdit.range),
      newText: textEdit.newText
    }
  }
}
