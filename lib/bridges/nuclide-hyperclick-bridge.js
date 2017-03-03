// @flow

import {LanguageClientV2} from '../protocol/languageclient-v2';
import type {Location} from '../protocol/languageclient-v2';
import Convert from '../convert';
import {CompositeDisposable} from 'atom';

export default class NuclideHyperclickBridge {
  _lc: LanguageClientV2;

  constructor(languageClient: LanguageClientV2) {
    this._lc = languageClient;
  }

  dispose(): void {
  }

  async getSuggestion(editor: atom$TextEditor, point: atom$Point): Promise<?nuclide$HyperclickSuggestion> {
    const results = await this._lc.gotoDefinition({
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      position: Convert.pointToPosition(point)
    });
    const result = Array.isArray(results) ? results[0] : results;
    if (result == null) return null;
    debugger;
    return {
      range: Convert.lsRangeToAtomRange(result.range),
      callback: () => { this.goToLocationInFile(Convert.uriToPath(result.uri), Convert.positionToPoint(result.range.start)); }
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
