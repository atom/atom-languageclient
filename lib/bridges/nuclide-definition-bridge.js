// @flow

import {LanguageClientV2} from '../protocol/languageclient-v2';
import type {Location} from '../protocol/languageclient-v2';
import Convert from '../convert';
import {CompositeDisposable} from 'atom';

export default class NuclideDefinitionBridge {
  _lc: LanguageClientV2;

  constructor(languageClient: LanguageClientV2) {
    this._lc = languageClient;
  }

  dispose(): void {
  }

  async getDefinition(editor: TextEditor, point: atom$Point): Promise<?nuclide$DefinitionQueryResult> {
    let results = await this._lc.gotoDefinition({
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      position: Convert.pointToPosition(point)
    });
    results = Array.isArray(results) ? results : [ results ];

    return {
      queryRange: [ editor.getBuffer().getRange() ],
      definitions: results.map(r => ({
        path: Convert.uriToPath(r.uri),
        position: Convert.positionToPoint(r.range.start),
        range: Convert.lsRangeToAtomRange(r.range),
        language: 'test'
      }))
    };
  }
}
