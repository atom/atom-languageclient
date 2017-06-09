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
    const icon = NuclideOutlineViewAdapter.symbolKindToEntityKind(symbol.kind)
    return {
      tokenizedText: [ {
        kind: NuclideOutlineViewAdapter.symbolKindToTokenKind(symbol.kind),
        value: symbol.name,
      } ],
      icon: icon != null ? icon : undefined,
      representativeName: symbol.name,
      startPosition: Convert.positionToPoint(symbol.location.range.start),
      endPosition: Convert.positionToPoint(symbol.location.range.end),
      children: [],
    }
  }

  static symbolKindToEntityKind(symbol: number): ?string {
    switch (symbol) {
      case SymbolKind.Array: return 'type-array';
      case SymbolKind.Boolean: return 'type-boolean';
      case SymbolKind.Class: return 'type-class';
      case SymbolKind.Constant: return 'type-constant';
      case SymbolKind.Constructor: return 'type-constructor';
      case SymbolKind.Enum: return 'type-enum';
      case SymbolKind.Field: return 'type-field';
      case SymbolKind.File: return 'type-file';
      case SymbolKind.Function: return 'type-function';
      case SymbolKind.Interface: return 'type-interface';
      case SymbolKind.Method: return 'type-method';
      case SymbolKind.Module: return 'type-module';
      case SymbolKind.Namespace: return 'type-namespace';
      case SymbolKind.Number: return 'type-number';
      case SymbolKind.Package: return 'type-package';
      case SymbolKind.Property: return 'type-property';
      case SymbolKind.String: return 'type-string';
      case SymbolKind.Variable: return 'type-variable';
      default: return null;
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
}
