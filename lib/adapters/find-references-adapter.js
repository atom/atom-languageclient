// @flow

import {
  LanguageClientConnection,
  type Location,
  type ServerCapabilities,
  type TextDocumentPositionParams,
} from '../languageclient';
import Convert from '../convert';

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
  static canAdapt(serverCapabilities: ServerCapabilities): boolean {
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
  async getReferences(
    connection: LanguageClientConnection,
    editor: atom$TextEditor,
    point: atom$Point,
    projectRoot: ?string,
  ): Promise<?atomIde$FindReferencesReturn> {
    const locations = await connection.findReferences(
      FindReferencesAdapter.createTextDocumentPositionParams(editor, point),
    );
    if (locations == null) {
      return null;
    }

    const references = locations.map(FindReferencesAdapter.locationToReference);
    return {
      type: 'data',
      baseUri: projectRoot || '',
      referencedSymbolName: FindReferencesAdapter.getReferencedSymbolName(editor, point, references),
      references,
    };
  }

  // Public: Create a {TextDocumentPositionParams} from a given {TextEditor} for a specific {Point}.
  //
  // * `editor` A {TextEditor} that represents the document.
  // * `point` A {Point} within the document.
  //
  // Returns a {DocumentPositionParams} built from the given parameters.
  static createTextDocumentPositionParams(editor: atom$TextEditor, point: atom$Point): TextDocumentPositionParams {
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
  static locationToReference(location: Location): atomIde$Reference {
    return {
      uri: Convert.uriToPath(location.uri),
      name: null,
      range: Convert.lsRangeToAtomRange(location.range),
    };
  }

  // Public: Get a symbol name from a {TextEditor} for a specific {Point} in the document.
  static getReferencedSymbolName(
    editor: atom$TextEditor,
    point: atom$Point,
    references: Array<atomIde$Reference>,
  ): string {
    if (references.length === 0) {
      return '';
    }
    const currentReference = references.find(r => r.range.containsPoint(point)) || references[0];
    return editor.getBuffer().getTextInRange(currentReference.range);
  }
}
