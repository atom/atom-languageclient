import * as atomIde from 'atom-ide';
import Convert from '../convert';
import {
  Point,
  TextEditor,
} from 'atom';
import {
  LanguageClientConnection,
  Location,
  ServerCapabilities,
  ReferenceParams,
} from '../languageclient';

// Public: Adapts the language server definition provider to the
// Atom IDE UI Definitions package for 'Go To Definition' functionality.
export default class FindReferencesAdapter {
  // Public: Determine whether this adapter can be used to adapt a language server
  // based on the serverCapabilities matrix containing a referencesProvider.
  //
  // * `serverCapabilities` The {ServerCapabilities} of the language server to consider.
  //
  // Returns a {Boolean} indicating adapter can adapt the server based on the
  // given serverCapabilities.
  public static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.referencesProvider === true;
  }

  // Public: Get the references for a specific symbol within the document as represented by
  // the {TextEditor} and {Point} within it via the language server.
  //
  // * `connection` A {LanguageClientConnection} to the language server that will be queried
  //                for the references.
  // * `editor` The Atom {TextEditor} containing the text the references should relate to.
  // * `point` The Atom {Point} containing the point within the text the references should relate to.
  //
  // Returns a {Promise} containing a {FindReferencesReturn} with all the references the language server
  // could find.
  public async getReferences(
    connection: LanguageClientConnection,
    editor: TextEditor,
    point: Point,
    projectRoot: string | null,
  ): Promise<atomIde.FindReferencesReturn | null> {
    const locations = await connection.findReferences(
      FindReferencesAdapter.createReferenceParams(editor, point),
    );
    if (locations == null) {
      return null;
    }

    const references: atomIde.Reference[] = locations.map(FindReferencesAdapter.locationToReference);
    return {
      type: 'data',
      baseUri: projectRoot || '',
      referencedSymbolName: FindReferencesAdapter.getReferencedSymbolName(editor, point, references),
      references,
    };
  }

  // Public: Create a {ReferenceParams} from a given {TextEditor} for a specific {Point}.
  //
  // * `editor` A {TextEditor} that represents the document.
  // * `point` A {Point} within the document.
  //
  // Returns a {ReferenceParams} built from the given parameters.
  public static createReferenceParams(editor: TextEditor, point: Point): ReferenceParams {
    return {
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      position: Convert.pointToPosition(point),
      context: {includeDeclaration: true},
    };
  }

  // Public: Convert a {Location} into a {Reference}.
  //
  // * `location` A {Location} to convert.
  //
  // Returns a {Reference} equivalent to the given {Location}.
  public static locationToReference(location: Location): atomIde.Reference {
    return {
      uri: Convert.uriToPath(location.uri),
      name: null,
      range: Convert.lsRangeToAtomRange(location.range),
    };
  }

  // Public: Get a symbol name from a {TextEditor} for a specific {Point} in the document.
  public static getReferencedSymbolName(
    editor: TextEditor,
    point: Point,
    references: atomIde.Reference[],
  ): string {
    if (references.length === 0) {
      return '';
    }
    const currentReference = references.find((r) => r.range.containsPoint(point)) || references[0];
    return editor.getBuffer().getTextInRange(currentReference.range);
  }
}
