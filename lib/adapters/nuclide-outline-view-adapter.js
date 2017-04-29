// @flow

import {LanguageClientConnection, SymbolKind,
  type ServerCapabilities, type SymbolInformation} from '../languageclient';
import Convert from '../convert';
import {Point} from 'atom';

type ContainerNamedOutline = {
  containerName: ?string,
  outline: nuclide$OutlineTree
};

export default class NuclideOutlineViewAdapter {
  static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.documentSymbolProvider === true;
  }

  async getOutline(connection: LanguageClientConnection, editor: atom$TextEditor): Promise<?nuclide$Outline> {
    const results = await connection.documentSymbol({textDocument: Convert.editorToTextDocumentIdentifier(editor)});
    return {
      outlineTrees: NuclideOutlineViewAdapter.createOutlineTrees(results),
    }
  }

  static createContainerNamedOutline(symbols: Array<SymbolInformation>): Map<string, ContainerNamedOutline> {
    return symbols.reduce((map, symbol) => {
      map.set(symbol.name, {
        containerName: symbol.containerName,
        outline: NuclideOutlineViewAdapter.symbolToOutline(symbol)
      });
      return map;
    }, new Map());
  }

  static createOutlineTrees(symbols: Array<SymbolInformation>): Array<nuclide$OutlineTree> {
    const byContainerName = NuclideOutlineViewAdapter.createContainerNamedOutline(symbols);
    const roots: Map<string, nuclide$OutlineTree> = new Map();
    byContainerName.forEach((v, k) => {
      const containerName = v.containerName;
      if (containerName == '' || containerName == null || k == containerName) {
        roots.set(k, v.outline);
      } else {
        const container = byContainerName.get(containerName);
        if (container) {
          // Definitely a child
          container.outline.children.push(v.outline);
        } else {
          // Missing container name - happens in some providers - e.g. Eclipse JDT
          let rootContainer = roots.get(containerName);
          if (rootContainer == null) {
            rootContainer = {
              icon: 'book',
              plainText: containerName,
              children: [ ],
              startPosition: new Point(0, 0)
            };
            roots.set(containerName, rootContainer);
          }
          rootContainer.children.push(v.outline);
        }
      }
    });
    return Array.from(roots.values());
  }

  static symbolToOutline(symbol: SymbolInformation): nuclide$OutlineTree {
    return {
      tokenizedText: [ {
        kind: NuclideOutlineViewAdapter.symbolKindToTokenKind(symbol.kind),
        value: symbol.name,
      } ],
      icon: NuclideOutlineViewAdapter.symbolKindToAtomIcon(symbol.kind),
      representativeName: symbol.name,
      startPosition: Convert.positionToPoint(symbol.location.range.start),
      endPosition: Convert.positionToPoint(symbol.location.range.end),
      children: [],
    }
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

  static symbolKindToAtomIcon(kind: number): atom$Octicon {
    switch (kind) {
      case SymbolKind.File: return 'file';
      case SymbolKind.Module: return 'file-submodule';
      case SymbolKind.Namespace: return 'book';
      case SymbolKind.Package: return 'package';
      case SymbolKind.Class: return 'code';
      case SymbolKind.Method: return 'zap';
      case SymbolKind.Property: return 'key';
      case SymbolKind.Field: return 'key';
      case SymbolKind.Constructor: return 'zap';
      case SymbolKind.Enum: return 'file-binary';
      case SymbolKind.Interface: return 'puzzle';
      case SymbolKind.Function: return 'zap';
      case SymbolKind.Variable: return 'pencil';
      case SymbolKind.Constant: return 'quote';
      case SymbolKind.String: return 'quote';
      case SymbolKind.Number: return 'quote';
      case SymbolKind.Boolean: return 'check';
      case SymbolKind.Array: return 'list-ordered';
      default: return 'question';
    }
  }
}
