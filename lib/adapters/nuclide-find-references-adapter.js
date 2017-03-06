// @flow

import {LanguageClientConnection} from '../languageclient';
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
      context: { includeDeclaration: true }
    };

    const locations = await this._lc.findReferences(documentPositionParams);
    if (locations == null || locations.length === 0) return null;

    const references = locations.map(r => ({
      uri: Convert.uriToPath(r.uri),
      name: null,
      range: Convert.lsRangeToAtomRange(r.range)
    }));

    const currentReference = references.find(r => r.range.containsPoint(point));
    if (currentReference == null) return null;

    return {
      type: 'data',
      baseUri: projectRoot || '',
      referencedSymbolName: editor.getBuffer().getTextInRange(currentReference.range),
      references: references
    }
  }
}
