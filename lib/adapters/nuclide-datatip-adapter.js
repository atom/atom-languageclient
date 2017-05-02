// @flow

import {
  LanguageClientConnection,
  type MarkedString,
  type ServerCapabilities,
} from '../languageclient';
import Convert from '../convert';
import Utils from '../utils';

export default class NuclideDatatipAdapter {
  static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.hoverProvider === true;
  }

  async getDatatip(
    connection: LanguageClientConnection,
    editor: atom$TextEditor,
    point: atom$Point,
  ): Promise<?nuclide$Datatip> {
    const documentPositionParams = Convert.editorToTextDocumentPositionParams(
      editor,
      point,
    );

    const hover = await connection.hover(documentPositionParams);
    if (
      hover == null ||
      hover.contents == null ||
      // This intentionally covers both empty strings and empty arrays.
      hover.contents.length === 0
    ) {
      return null;
    }

    const range = hover.range == null
      ? Utils.getWordAtPosition(editor, point)
      : Convert.lsRangeToAtomRange(hover.range);

    const markedStrings = (Array.isArray(hover.contents)
      ? hover.contents
      : [hover.contents]).map(str =>
      NuclideDatatipAdapter.convertMarkedString(editor, str),
    );

    return {range, markedStrings};
  }

  static convertMarkedString(
    editor: atom$TextEditor,
    markedString: MarkedString,
  ): nuclide$MarkedString {
    if (typeof markedString === 'object') {
      return {
        type: 'snippet',
        // TODO: find a better mapping from language -> grammar
        grammar: atom.grammars.grammarForScopeName(
          `source.${markedString.language}`,
        ) || editor.getGrammar(),
        value: markedString.value,
      };
    }
    return {type: 'markdown', value: markedString};
  }
}
