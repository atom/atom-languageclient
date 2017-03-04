// @flow

import {LanguageClientV2} from '../protocol/languageclient-v2';
import Convert from '../convert';

export default class NuclideDefinitionBridge {
  _lc: LanguageClientV2;

  constructor(languageClient: LanguageClientV2) {
    this._lc = languageClient;
  }

  async getDefinition(editor: TextEditor, point: atom$Point): Promise<?nuclide$DefinitionQueryResult> {
    const documentPositionParams = {
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      position: Convert.pointToPosition(point)
    };

    const highlights = await this._lc.documentHighlight(documentPositionParams);
    const definition = await this._lc.gotoDefinition(documentPositionParams);
    const definitions = Array.isArray(definition) ? definition : [ definition ];

    return {
      queryRange: highlights.map(h => Convert.lsRangeToAtomRange(h.range)),
      definitions: definitions.map(d => ({
        path: Convert.uriToPath(d.uri),
        position: Convert.positionToPoint(d.range.start),
        range: Convert.lsRangeToAtomRange(d.range),
        language: 'test'
      }))
    };
  }
}
