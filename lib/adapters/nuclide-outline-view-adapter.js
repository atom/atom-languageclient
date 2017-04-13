// @flow

import {LanguageClientConnection, SymbolKind} from '../languageclient';
import type {SymbolInformation} from '../languageclient';
import Convert from '../convert';

export default class NuclideOutlineViewAdapter {
  async getOutline(connection: LanguageClientConnection, editor: atom$TextEditor): Promise<?nuclide$Outline> {
    const results = await connection.documentSymbol({textDocument: Convert.editorToTextDocumentIdentifier(editor)});
    return {
      outlineTrees: NuclideOutlineViewAdapter.createOutlineTrees(results),
    };
  }

  static createOutlineTrees(symbols: Array<SymbolInformation>): Array<nuclide$OutlineTree> {
    // TODO: Limitation here is that the containerNames do not have any positional information in LSP
    return Array.from(new Set(symbols.map(r => r.containerName))).map(c => ({
      plainText: c,
      startPosition: 0,
      endPosition: 0,
      children: symbols.filter(s => s.containerName === c).map(NuclideOutlineViewAdapter.symbolToOutline),
    }));
  }

  static symbolToOutline(symbol: SymbolInformation): nuclide$OutlineTree {
    return {
      plainText: symbol.name,
      startPosition: Convert.positionToPoint(symbol.location.range.start),
      endPosition: Convert.positionToPoint(symbol.location.range.end),
      children: [],
    };
  }

  static symbolKindToTokenKind(symbol: number): nuclide$TokenKind {
    switch (symbol) {
      case SymbolKind.Class:
        return 'type';
      case SymbolKind.Constructor:
        return 'constructor';
      case SymbolKind.Method:
      case SymbolKind.Function:
        return 'method';
      case SymbolKind.String:
        return 'string';
      default:
        return 'plain';
    }
  }
}
