// @flow

import {LanguageClientConnection} from '../languageclient';
import Convert from '../convert';

export default class NuclideHyperclickAdapter {
  _lc: LanguageClientConnection;

  constructor(languageClient: LanguageClientConnection) {
    this._lc = languageClient;
  }

  async getSuggestion(editor: atom$TextEditor, point: atom$Point): Promise<?nuclide$HyperclickSuggestion> {
    const documentPositionParams = {
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      position: Convert.pointToPosition(point)
    };

    const highlights = await this._lc.documentHighlight(documentPositionParams);
    if (highlights == null || highlights.length === 0) return null;

    const definition = await this._lc.gotoDefinition(documentPositionParams);
    if (definition == null || definition.length === 0) return null;

    const definitions = Array.isArray(definition) ? definition : [ definition ];

    return {
      range: highlights.map(h => Convert.lsRangeToAtomRange(h.range)),
      callback: () => {
        NuclideHyperclickAdapter.goToLocationInFile(Convert.uriToPath(definition[0].uri), Convert.positionToPoint(definition[0].range.start));
      }
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
        searchAllPanes: true
      });
    }
  }
}
