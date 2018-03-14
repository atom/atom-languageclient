import assert = require('assert');
import Convert from '../convert';
import {
  Point,
  TextEditor,
  Range,
} from 'atom';
import {
  LanguageClientConnection,
  ServerCapabilities,
} from '../languageclient';

export default class CodeHighlightAdapter {
  // Returns a {Boolean} indicating this adapter can adapt the server based on the
  // given serverCapabilities.
  public static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.documentHighlightProvider === true;
  }

  // Public: Creates highlight markers for a given editor position.
  // Throws an error if documentHighlightProvider is not a registered capability.
  //
  // * `connection` A {LanguageClientConnection} to the language server that provides highlights.
  // * `serverCapabilities` The {ServerCapabilities} of the language server that will be used.
  // * `editor` The Atom {TextEditor} containing the text to be highlighted.
  // * `position` The Atom {Point} to fetch highlights for.
  //
  // Returns a {Promise} of an {Array} of {Range}s to be turned into highlights.
  public static async highlight(
    connection: LanguageClientConnection,
    serverCapabilities: ServerCapabilities,
    editor: TextEditor,
    position: Point,
  ): Promise<Range[] | null> {
    assert(serverCapabilities.documentHighlightProvider, 'Must have the documentHighlight capability');
    const highlights = await connection.documentHighlight(Convert.editorToTextDocumentPositionParams(editor, position));
    return highlights.map((highlight) => {
      return Convert.lsRangeToAtomRange(highlight.range);
    });
  }
}
