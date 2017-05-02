// @flow

import {LanguageClientConnection, type DocumentHighlight,
  type Location, type ServerCapabilities} from '../languageclient';
import Convert from '../convert';
import Utils from '../utils';
import {Range} from 'atom';

export default class NuclideDefinitionAdapter {
  _languageName: string;

  static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.definitionProvider === true;
  }

  constructor(languageName: string) {
    this._languageName = languageName;
  }

  async getDefinition(
    connection: LanguageClientConnection,
    serverCapabilities: ServerCapabilities,
    editor: TextEditor,
    point: atom$Point,
  ): Promise<?nuclide$DefinitionQueryResult> {
    const documentPositionParams = Convert.editorToTextDocumentPositionParams(editor, point);

    let highlights;
    // Underline all highlights if they're available.
    // Otherwise, just fall back to highlighting the word at the given position.
    // (Note that VSCode only ever highlights the word).
    if (serverCapabilities.documentHighlightProvider) {
      highlights = await connection.documentHighlight(documentPositionParams);
    }
    const ranges = (highlights == null || highlights.length === 0)
      ? [Utils.getWordAtPosition(editor, point)]
      : highlights.map(h => Range.fromObject(Convert.lsRangeToAtomRange(h.range)));

    const definitions = NuclideDefinitionAdapter.normalizeLocations(await connection.gotoDefinition(documentPositionParams));
    if (definitions == null || definitions.length === 0) { return null; }

    return NuclideDefinitionAdapter.definitionsToQueryResult(ranges, definitions, this._languageName);
  }

  static normalizeLocations(locationResult: Location | Array<Location>): ?Array<Location> {
    if (locationResult == null) { return null; }
    return (Array.isArray(locationResult) ? locationResult : [locationResult]).filter(d => d.range.start != null);
  }

  static definitionsToQueryResult(
    ranges: Array<atom$Range>,
    definitions: Array<Location>,
    languageName: string,
  ): nuclide$DefinitionQueryResult {
    return {
      queryRange: ranges,
      definitions: definitions.map(d => ({
        path: Convert.uriToPath(d.uri),
        position: Convert.positionToPoint(d.range.start),
        range: Range.fromObject(Convert.lsRangeToAtomRange(d.range)),
        language: languageName,
      })),
    };
  }
}
