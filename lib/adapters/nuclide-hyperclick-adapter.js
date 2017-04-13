// @flow

import {LanguageClientConnection} from '../languageclient';
import Convert from '../convert';

export default class NuclideHyperclickAdapter {
  async getSuggestion(connection: LanguageClientConnection, editor: atom$TextEditor, point: atom$Point): Promise<?nuclide$HyperclickSuggestion> {
    const documentPositionParams = {
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      position: Convert.pointToPosition(point),
    };

    const highlights = await connection.documentHighlight(documentPositionParams);
    if (highlights == null || highlights.length === 0) { return null; }

    const definition = await connection.gotoDefinition(documentPositionParams);
    if (definition == null || definition.length === 0) { return null; }

    const definitions = Array.isArray(definition) ? definition : [definition];

    return {
      range: highlights.map(h => Convert.lsRangeToAtomRange(h.range)),
      callback: () => {
        NuclideHyperclickAdapter.goToLocationInFile(Convert.uriToPath(definitions[0].uri), Convert.positionToPoint(definitions[0].range.start));
      },
    };
  }

  static async goToLocationInFile(path: string, point: atom$PointObject): Promise<void> {
    const currentEditor = atom.workspace.getActiveTextEditor();
    if (currentEditor != null && currentEditor.getPath() === path) {
      currentEditor.setCursorBufferPosition([point.row, point.column]);
    } else {
      await atom.workspace.open(path, {
        initialLine: point.row,
        initialColumn: point.column,
        searchAllPanes: true,
      });
    }
  }
}
