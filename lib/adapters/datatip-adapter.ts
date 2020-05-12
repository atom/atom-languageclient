import * as atomIde from 'atom-ide';
import Convert from '../convert';
import * as Utils from '../utils';
import {
  Hover,
  LanguageClientConnection,
  MarkupContent,
  MarkedString,
  ServerCapabilities,
} from '../languageclient';
import {
  Point,
  TextEditor,
} from 'atom';

/**
 * Public: Adapts the language server protocol "textDocument/hover" to the
 * Atom IDE UI Datatip package.
 */
export default class DatatipAdapter {
  /**
   * Public: Determine whether this adapter can be used to adapt a language server
   * based on the serverCapabilities matrix containing a hoverProvider.
   *
   * @param serverCapabilities The {ServerCapabilities} of the language server to consider.
   * @returns A {Boolean} indicating adapter can adapt the server based on the
   *   given serverCapabilities.
   */
  public static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return !!serverCapabilities.hoverProvider;
  }

  /**
   * Public: Get the Datatip for this {Point} in a {TextEditor} by querying
   * the language server.
   *
   * @param connection A {LanguageClientConnection} to the language server that will be queried
   *   for the hover text/datatip.
   * @param editor The Atom {TextEditor} containing the text the Datatip should relate to.
   * @param point The Atom {Point} containing the point within the text the Datatip should relate to.
   * @returns A {Promise} containing the {Datatip} to display or {null} if no Datatip is available.
   */
  public async getDatatip(
    connection: LanguageClientConnection,
    editor: TextEditor,
    point: Point,
  ): Promise<atomIde.Datatip | null> {
    const documentPositionParams = Convert.editorToTextDocumentPositionParams(editor, point);

    const hover = await connection.hover(documentPositionParams);
    if (hover == null || DatatipAdapter.isEmptyHover(hover)) {
      return null;
    }

    const range =
      hover.range == null ? Utils.getWordAtPosition(editor, point) : Convert.lsRangeToAtomRange(hover.range);

    const markedStrings = (Array.isArray(hover.contents) ? hover.contents : [hover.contents]).map((str) =>
      DatatipAdapter.convertMarkedString(editor, str),
    );

    return { range, markedStrings };
  }

  private static isEmptyHover(hover: Hover): boolean {
    return hover.contents == null ||
      (typeof hover.contents === 'string' && hover.contents.length === 0) ||
      (Array.isArray(hover.contents) &&
        (hover.contents.length === 0 || hover.contents[0] === ""));
  }

  private static convertMarkedString(
    editor: TextEditor,
    markedString: MarkedString | MarkupContent,
  ): atomIde.MarkedString {
    if (typeof markedString === 'string') {
      return { type: 'markdown', value: markedString };
    }

    if ((markedString as MarkupContent).kind) {
      return {
        type: 'markdown',
        value: markedString.value,
      };
    }

    // Must check as <{language: string}> to disambiguate between
    // string and the more explicit object type because MarkedString
    // is a union of the two types
    if ((markedString as { language: string }).language) {
      return {
        type: 'snippet',
        // TODO: find a better mapping from language -> grammar
        grammar:
          atom.grammars.grammarForScopeName(
            `source.${(markedString as { language: string }).language}`) || editor.getGrammar(),
        value: markedString.value,
      };
    }

    // Catch-all case
    return { type: 'markdown', value: markedString.toString() };
  }
}
