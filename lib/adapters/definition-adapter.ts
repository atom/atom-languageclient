import * as atomIde from 'atom-ide';
import Convert from '../convert';
import * as Utils from '../utils';
import {
  LanguageClientConnection,
  Location,
  ServerCapabilities,
} from '../languageclient';
import {
  Point,
  TextEditor,
  Range,
} from 'atom';

/**
 * Public: Adapts the language server definition provider to the
 * Atom IDE UI Definitions package for 'Go To Definition' functionality.
 */
export default class DefinitionAdapter {
  /**
   * Public: Determine whether this adapter can be used to adapt a language server
   * based on the serverCapabilities matrix containing a definitionProvider.
   *
   * @param serverCapabilities The {ServerCapabilities} of the language server to consider.
   * @returns A {Boolean} indicating adapter can adapt the server based on the
   *   given serverCapabilities.
   */
  public static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return !!serverCapabilities.definitionProvider;
  }

  /**
   * Public: Get the definitions for a symbol at a given {Point} within a
   * {TextEditor} including optionally highlighting all other references
   * within the document if the langauge server also supports highlighting.
   *
   * @param connection A {LanguageClientConnection} to the language server that will provide definitions and highlights.
   * @param serverCapabilities The {ServerCapabilities} of the language server that will be used.
   * @param languageName The name of the programming language.
   * @param editor The Atom {TextEditor} containing the symbol and potential highlights.
   * @param point The Atom {Point} containing the position of the text that represents the symbol
   *   for which the definition and highlights should be provided.
   * @returns A {Promise} indicating adapter can adapt the server based on the
   *   given serverCapabilities.
   */
  public async getDefinition(
    connection: LanguageClientConnection,
    serverCapabilities: ServerCapabilities,
    languageName: string,
    editor: TextEditor,
    point: Point,
  ): Promise<atomIde.DefinitionQueryResult | null> {
    const documentPositionParams = Convert.editorToTextDocumentPositionParams(editor, point);
    const definitionLocations = DefinitionAdapter.normalizeLocations(
      await connection.gotoDefinition(documentPositionParams),
    );
    if (definitionLocations == null || definitionLocations.length === 0) {
      return null;
    }

    let queryRange;
    if (serverCapabilities.documentHighlightProvider) {
      const highlights = await connection.documentHighlight(documentPositionParams);
      if (highlights != null && highlights.length > 0) {
        queryRange = highlights.map((h) => Convert.lsRangeToAtomRange(h.range));
      }
    }

    return {
      queryRange: queryRange || [Utils.getWordAtPosition(editor, point)],
      definitions: DefinitionAdapter.convertLocationsToDefinitions(definitionLocations, languageName),
    };
  }

  /**
   * Public: Normalize the locations so a single {Location} becomes an {Array} of just
   * one. The language server protocol return either as the protocol evolved between v1 and v2.
   *
   * @param locationResult Either a single {Location} object or an {Array} of {Locations}.
   * @returns An {Array} of {Location}s or {null} if the locationResult was null.
   */
  public static normalizeLocations(locationResult: Location | Location[]): Location[] | null {
    if (locationResult == null) {
      return null;
    }
    return (Array.isArray(locationResult) ? locationResult : [locationResult]).filter((d) => d.range.start != null);
  }

  /**
   * Public: Convert an {Array} of {Location} objects into an Array of {Definition}s.
   *
   * @param locations An {Array} of {Location} objects to be converted.
   * @param languageName The name of the language these objects are written in.
   * @returns An {Array} of {Definition}s that represented the converted {Location}s.
   */
  public static convertLocationsToDefinitions(locations: Location[], languageName: string): atomIde.Definition[] {
    return locations.map((d) => ({
      path: Convert.uriToPath(d.uri),
      position: Convert.positionToPoint(d.range.start),
      range: Range.fromObject(Convert.lsRangeToAtomRange(d.range)),
      language: languageName,
    }));
  }
}
