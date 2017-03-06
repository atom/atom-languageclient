// @flow

import {LanguageClientConnection} from '../languageclient';
import Convert from '../convert';

export default class NuclideDefinitionAdapter {
  _lc: LanguageClientConnection;

  constructor(languageClient: LanguageClientConnection) {
    this._lc = languageClient;
  }

  async getDefinition(editor: TextEditor, point: atom$Point): Promise<?nuclide$DefinitionQueryResult> {
    const documentPositionParams = {
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      position: Convert.pointToPosition(point)
    };

    const highlights = await this._lc.documentHighlight(documentPositionParams);
    if (highlights == null || highlights.length === 0) return null;

    const definition = await this._lc.gotoDefinition(documentPositionParams);
    if (definition == null) return null;

    const definitions = (Array.isArray(definition) ? definition : [ definition ]).filter(d => d.range.start != null);
    if (definitions.length === 0) return null;

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
