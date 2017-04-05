// @flow

import {LanguageClientConnection} from '../languageclient';
import type {Location} from '../languageclient';
import Convert from '../convert';

export default class NuclideFindReferencesAdapter {
  _lc: LanguageClientConnection;

  constructor(languageClient: LanguageClientConnection) {
    this._lc = languageClient;
  }

  async getReferences(editor: atom$TextEditor, point: atom$Point, projectRoot: ?string): Promise<?nuclide$FindReferencesReturn> {
    const documentPositionParams = {
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      position: Convert.pointToPosition(point),
      context: {includeDeclaration: true}
    };

    const locations = await this._lc.findReferences(documentPositionParams);
    if (locations == null || locations.length === 0) { return null; }

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
    const currentReference = references.find(r => r.range.containsPoint(point)) || references[0];
    return editor.getBuffer().getTextInRange(currentReference.range);
  }
}
