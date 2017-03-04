// @flow

import {LanguageClientV2} from '../protocol/languageclient-v2';
import type {Location} from '../protocol/languageclient-v2';
import Convert from '../convert';

export default class NuclideFindReferencesBridge {
  _lc: LanguageClientV2;

  constructor(languageClient: LanguageClientV2) {
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
    if (currentReference == null) {
      throw "Can't determine current references";
    }

    return {
      type: 'data',
      baseUri: projectRoot || '',
      referencedSymbolName: editor.getBuffer().getTextInRange(currentReference.range),
      references: references
    }
  }
}
