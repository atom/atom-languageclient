// @flow

import * as ls from '../protocol/languageclient-v2';
import Convert from '../convert';
import {CompositeDisposable} from 'atom';

export default class NuclideOutlineViewBridge
{
  _disposable = new CompositeDisposable();
  _lc: ls.LanguageClientV2;
  _name: string;

  constructor(languageClient: ls.LanguageClientV2, name: string) {
    this._lc = languageClient;
    this._name = name;
  }

  dispose(): void {
    this._disposable.dispose();
  }

  async getOutline(editor: atom$TextEditor): Promise<?nuclide$Outline> {
    const results = await this._lc.documentSymbol({ textDocument: Convert.editorToTextDocumentIdentifier(editor) });

    return {
      outlineTrees: NuclideOutlineViewBridge.createOutlineTrees(results)
    };
  }

  static createOutlineTrees(symbols: Array<ls.SymbolInformation>): Array<nuclide$OutlineTree> {
    return Array.from(new Set(symbols.map(r => r.containerName))).map(c => ({
      plainText: c,
      startPosition: 0,
      endPosition: 0,
      children: symbols.filter(s => s.containerName == c).map(NuclideOutlineViewBridge.symbolToOutline)
    }));
  }

  static symbolToOutline(symbol: ls.SymbolInformation): nuclide$OutlineTree {
    return {
      plainText: symbol.name,
      startPosition: Convert.positionToPoint(symbol.location.range.start),
      endPosition: Convert.positionToPoint(symbol.location.range.end),
      children: []
    };
  }

  static symbolKindToTokenKind(symbol: number): nuclide$TokenKind {
    switch (symbol) {
      case ls.SymbolKind.Class:
        return 'type';
      case ls.SymbolKind.Constructor:
        return 'constructor';
      case ls.SymbolKind.Method:
      case ls.SymbolKind.Function:
        return 'method';
      case ls.SymbolKind.String:
        return 'string';
      default:
        return 'plain';
    };
  }
}
