// @flow

import {Range} from 'atom';
import {LanguageClientConnection, type ServerCapabilities} from '../languageclient';
import Convert from '../convert';
import Utils from '../utils';

export default class NuclideHyperclickAdapter {
  static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.definitionProvider === true;
  }

  async getSuggestion(
    connection: LanguageClientConnection,
    serverCapabilities: ServerCapabilities,
    editor: atom$TextEditor,
    point: atom$Point,
  ): Promise<?nuclide$HyperclickSuggestion> {
    const documentPositionParams = {
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      position: Convert.pointToPosition(point),
    };

    let highlights;
    if (serverCapabilities.documentHighlightProvider) {
      highlights = await connection.documentHighlight(documentPositionParams);
    }
    const ranges = (highlights == null || highlights.length === 0)
      ? [Utils.getWordAtPosition(editor, point)]
      : highlights.map(h => Range.fromObject(Convert.lsRangeToAtomRange(h.range)));

    const definition = await connection.gotoDefinition(documentPositionParams);
    if (definition == null || definition.length === 0) { return null; }

    const definitions = Array.isArray(definition) ? definition : [definition];

    return {
      range: ranges,
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
