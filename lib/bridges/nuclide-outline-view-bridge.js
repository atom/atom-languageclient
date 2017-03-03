// @flow

import {LanguageClientV2, SymbolKind} from '../protocol/languageclient-v2';
import type {SymbolInformation} from '../protocol/languageclient-v2';
import Convert from '../convert';

export default class NuclideOutlineViewBridge {
  _lc: LanguageClientV2;
  _name: string;

  constructor(languageClient: LanguageClientV2, name: string) {
    this._lc = languageClient;
    this._name = name;
  }

  dispose(): void {
  }

  async getOutline(editor: atom$TextEditor): Promise<?nuclide$Outline> {
    const results = await this._lc.documentSymbol({ textDocument: Convert.editorToTextDocumentIdentifier(editor) });
    return {
      outlineTrees: NuclideOutlineViewBridge.createOutlineTrees(results)
    };
  }

  static createOutlineTrees(symbols: Array<SymbolInformation>): Array<nuclide$OutlineTree> {
    // TODO: Limitation here is that the containerName's do not have any positional information in LSP
    return Array.from(new Set(symbols.map(r => r.containerName))).map(c => ({
      plainText: c,
      startPosition: 0,
      endPosition: 0,
      children: symbols.filter(s => s.containerName == c).map(NuclideOutlineViewBridge.symbolToOutline)
    }));
  }

  static symbolToOutline(symbol: SymbolInformation): nuclide$OutlineTree {
    return {
      plainText: symbol.name,
      startPosition: Convert.positionToPoint(symbol.location.range.start),
      endPosition: Convert.positionToPoint(symbol.location.range.end),
      children: []
    };
  }

  static symbolKindToTokenKind(symbol: number): nuclide$TokenKind {
    switch(symbol) {
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
    };
  }
}
