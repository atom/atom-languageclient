// @flow

import {LanguageClientConnection} from '../languageclient';
import type {DocumentHighlight, Location} from '../languageclient';
import Convert from '../convert';
import {Range} from 'atom';

export default class NuclideDefinitionAdapter {
  _lc: LanguageClientConnection;
  _languageName: string;

  constructor(languageClient: LanguageClientConnection, languageName: string) {
    this._lc = languageClient;
    this._languageName = languageName;
  }

  async getDefinition(editor: TextEditor, point: atom$Point): Promise<?nuclide$DefinitionQueryResult> {
    const documentPositionParams = Convert.editorToTextDocumentPositionParams(editor, point);

    const highlights = await this._lc.documentHighlight(documentPositionParams);
    if (highlights == null || highlights.length === 0) { return null; }

    const definitions = NuclideDefinitionAdapter.normalizeLocations(await this._lc.gotoDefinition(documentPositionParams));
    if (definitions == null || definitions.length === 0) { return null; }

    return NuclideDefinitionAdapter.highlightsAndDefinitionsToQueryResult(highlights, definitions, this._languageName);
  }

  static normalizeLocations(locationResult: Location | Array<Location>): ?Array<Location> {
    if (locationResult == null) { return null; }
    return (Array.isArray(locationResult) ? locationResult : [locationResult]).filter(d => d.range.start != null);
  }

  static highlightsAndDefinitionsToQueryResult(highlights: Array<DocumentHighlight>, definitions: Array<Location>, languageName: string): nuclide$DefinitionQueryResult {
    return {
      queryRange: highlights.map(h => Range.fromObject(Convert.lsRangeToAtomRange(h.range))),
      definitions: definitions.map(d => ({
        path: Convert.uriToPath(d.uri),
        position: Convert.positionToPoint(d.range.start),
        range: Range.fromObject(Convert.lsRangeToAtomRange(d.range)),
        language: languageName,
      })),
    };
  }
}
