// @flow

import {LanguageClientConnection, type Location, type ServerCapabilities} from '../languageclient';
import Convert from '../convert';

export default class NuclideFindReferencesAdapter {
  static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.referencesProvider === true;
  }

  async getReferences(connection: LanguageClientConnection, editor: atom$TextEditor, point: atom$Point, projectRoot: ?string): Promise<?nuclide$FindReferencesReturn> {
    const documentPositionParams = {
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      position: Convert.pointToPosition(point),
      context: {includeDeclaration: true}
    };

    const locations = await connection.findReferences(documentPositionParams);
    if (locations == null) { return null; }

    const references = locations.map(NuclideFindReferencesAdapter.locationToReference);

    return {
      type: 'data',
      baseUri: projectRoot || '',
      referencedSymbolName: NuclideFindReferencesAdapter.getReferencedSymbolName(editor, point, references),
      references,
    };
  }

  static locationToReference(location: Location): nuclide$Reference {
    return {
      uri: Convert.uriToPath(location.uri),
      name: null,
      range: Convert.lsRangeToAtomRange(location.range),
    };
  }

  static getReferencedSymbolName(editor: atom$TextEditor, point: atom$Point, references: Array<nuclide$Reference>): string {
    if (references.length === 0) {
      return '';
    }
    const currentReference = references.find(r => r.range.containsPoint(point)) || references[0];
    return editor.getBuffer().getTextInRange(currentReference.range);
  }
}
