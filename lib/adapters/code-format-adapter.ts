import * as atomIde from 'atom-ide';
import Convert from '../convert';
import {
  LanguageClientConnection,
  DocumentFormattingParams,
  DocumentRangeFormattingParams,
  FormattingOptions,
  ServerCapabilities,
} from '../languageclient';
import {
  TextEditor,
  Range,
} from 'atom';

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
  public static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return (
      serverCapabilities.documentRangeFormattingProvider === true ||
      serverCapabilities.documentFormattingProvider === true
    );
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
  public static format(
    connection: LanguageClientConnection,
    serverCapabilities: ServerCapabilities,
    editor: TextEditor,
    range: Range,
  ): Promise<atomIde.TextEdit[]> {
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
  public static async formatDocument(
    connection: LanguageClientConnection,
    editor: TextEditor,
  ): Promise<atomIde.TextEdit[]> {
    const edits = await connection.documentFormatting(CodeFormatAdapter.createDocumentFormattingParams(editor));
    return Convert.convertLsTextEdits(edits);
  }

  // Public: Create {DocumentFormattingParams} to be sent to the language server when requesting an
  // entire document is formatted.
  //
  // * `editor` The Atom {TextEditor} containing the document to be formatted.
  //
  // Returns {DocumentFormattingParams} containing the identity of the text document as well as
  // options to be used in formatting the document such as tab size and tabs vs spaces.
  public static createDocumentFormattingParams(editor: TextEditor): DocumentFormattingParams {
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
  public static async formatRange(
    connection: LanguageClientConnection,
    editor: TextEditor,
    range: Range,
  ): Promise<atomIde.TextEdit[]> {
    const edits = await connection.documentRangeFormatting(
      CodeFormatAdapter.createDocumentRangeFormattingParams(editor, range),
    );
    return Convert.convertLsTextEdits(edits);
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
  public static createDocumentRangeFormattingParams(
    editor: TextEditor,
    range: Range,
  ): DocumentRangeFormattingParams {
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
  public static getFormatOptions(editor: TextEditor): FormattingOptions {
    return {
      tabSize: editor.getTabLength(),
      insertSpaces: editor.getSoftTabs(),
    };
  }
}
