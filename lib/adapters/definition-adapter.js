// @flow

import {
  LanguageClientConnection,
  type Location,
  type ServerCapabilities,
} from '../languageclient';
import Convert from '../convert';
import Utils from '../utils';
import {Range} from 'atom';

// Public: Adapts the language server definition provider to the
// Atom IDE UI Definitions package for 'Go To Definition' functionality.
export default class DefinitionAdapter {
  // Public: Determine whether this adapter can be used to adapt a language server
  // based on the serverCapabilities matrix containing a definitionProvider.
  //
  // * `serverCapabilities` The {ServerCapabilities} of the language server to consider.
  //
  // Returns a {Boolean} indicating adapter can adapt the server based on the
  // given serverCapabilities.
  static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.definitionProvider === true;
  }

  // Public: Get the definitions for a symbol at a given {Point} within a
  // {TextEditor} including optionally highlighting all other references
  // within the document if the langauge server also supports highlighting.
  //
  // * `connection` A {LanguageClientConnection} to the language server that will provide definitions and highlights.
  // * `serverCapabilities` The {ServerCapabilities} of the language server that will be used.
  // * `languageName` The name of the programming language.
  // * `editor` The Atom {TextEditor} containing the symbol and potential highlights.
  // * `point` The Atom {Point} containing the position of the text that represents the symbol
  //           for which the definition and highlights should be provided.
  //
  // Returns a {Promise} indicating adapter can adapt the server based on the
  // given serverCapabilities.
  async getDefinition(
    connection: LanguageClientConnection,
    serverCapabilities: ServerCapabilities,
    languageName: string,
    editor: TextEditor,
    point: atom$Point,
  ): Promise<?nuclide$DefinitionQueryResult> {
    const documentPositionParams = Convert.editorToTextDocumentPositionParams(editor, point);
    const definitionLocations = DefinitionAdapter.normalizeLocations(
      await connection.gotoDefinition(documentPositionParams),
    );
    if (definitionLocations == null || definitionLocations.length === 0) { return null; }

    let queryRange;
    if (serverCapabilities.documentHighlightProvider) {
      const highlights = await connection.documentHighlight(documentPositionParams);
      if (highlights != null && highlights.length > 0) {
        queryRange = highlights.map(h => Convert.lsRangeToAtomRange(h.range));
      }
    }

    return {
      queryRange: queryRange || [Utils.getWordAtPosition(editor, point)],
      definitions: DefinitionAdapter.convertLocationsToDefinitions(definitionLocations, languageName),
    };
  }

  // Public: Normalize the locations so a single {Location} becomes an {Array} of just
  // one. The language server protocol return either as the protocol evolved between v1 and v2.
  //
  // * `locationResult` either a single {Location} object or an {Array} of {Locations}
  //
  // Returns an {Array} of {Location}s or {null} if the locationResult was null.
  static normalizeLocations(locationResult: Location | Array<Location>): ?Array<Location> {
    if (locationResult == null) { return null; }
    return (Array.isArray(locationResult) ? locationResult : [locationResult]).filter(d => d.range.start != null);
  }

  // Public: Convert an {Array} of {Location} objects into an Array of {Definition}s.
  //
  // * `locations` An {Array} of {Location} objects to be converted.
  // * `languageName` The name of the language these objects are written in.
  //
  // Returns an {Array} of {Definition}s that represented the converted {Location}s.
  static convertLocationsToDefinitions(locations: Array<Location>, languageName: string): Array<nuclide$Definition> {
    return locations.map(d => ({
      path: Convert.uriToPath(d.uri),
      position: Convert.positionToPoint(d.range.start),
      range: Range.fromObject(Convert.lsRangeToAtomRange(d.range)),
      language: languageName,
    }));
  }
}
