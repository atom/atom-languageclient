// @flow

import {LanguageClientV2} from '../protocol/languageclient-v2';
import Convert from '../convert';

export default class NuclideHyperclickBridge {
  _lc: LanguageClientV2;

  constructor(languageClient: LanguageClientV2) {
    this._lc = languageClient;
  }

  dispose(): void {
  }

  async getSuggestion(editor: atom$TextEditor, point: atom$Point): Promise<?nuclide$HyperclickSuggestion> {
    const documentPositionParams = {
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      position: Convert.pointToPosition(point)
    };

    const definition = await this._lc.gotoDefinition(documentPositionParams);
    if (definition == null || definition.length === 0) return null;

    const highlights = await this._lc.documentHighlight(documentPositionParams);

    return {
      range: highlights.map(h => Convert.lsRangeToAtomRange(h.range)),
      callback: () => {
        this.goToLocationInFile(Convert.uriToPath(definition[0].uri), Convert.positionToPoint(definition[0].range.start));
      }
    };
  }

  async goToLocationInFile(path: string, point:atom$Point): Promise<void> {
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
