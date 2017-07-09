// @flow

import {
  LanguageClientConnection,
  SymbolKind,
  type ServerCapabilities,
  type SymbolInformation
} from '../languageclient';
import Convert from '../convert';
import {Point} from 'atom';

type ContainerNamedOutline = {
  containerName: ?string,
  outline: nuclide$OutlineTree
};

// Public: Adapts the documentSymbolProvider of the language server to the Outline View
// supplied by Atom IDE UI.
export default class OutlineViewAdapter {

  // Public: Determine whether this adapter can be used to adapt a language server
  // based on the serverCapabilities matrix containing a documentSymbolProvider.
  //
  // * `serverCapabilities` The {ServerCapabilities} of the language server to consider.
  //
  // Returns a {Boolean} indicating adapter can adapt the server based on the
  // given serverCapabilities.
  static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.documentSymbolProvider === true;
  }

  // Public: Obtain the Outline for document via the {LanguageClientConnection} as identified
  // by the {TextEditor}.
  //
  // * `connection` A {LanguageClientConnection} to the language server that will be queried
  //                for the outline.
  // * `editor` The Atom {TextEditor} containing the text the Outline should represent.
  //
  // Returns a {Promise} containing the {Outline} of this document.
  async getOutline(connection: LanguageClientConnection, editor: atom$TextEditor): Promise<?nuclide$Outline> {
    const results = await connection.documentSymbol({textDocument: Convert.editorToTextDocumentIdentifier(editor)});
    return {
      outlineTrees: OutlineViewAdapter.createOutlineTrees(results),
    }
  }

  // Public: Create an {Array} of {OutlineTree}s from the Array of {SymbolInformation} recieved
  // from the language server. This includes determining the appropriate child and parent
  // relationships for the hierarchy.
  //
  // * `symbols` An {Array} of {SymbolInformation}s received from the language server that
  //             should be converted to an {OutlineTree}.
  //
  // Returns an {OutlineTree} containing the given symbols that the Outline View can display.
  static createOutlineTrees(symbols: Array<SymbolInformation>): Array<nuclide$OutlineTree> {
    const byContainerName = OutlineViewAdapter.createContainerNamedOutline(symbols);
    const roots: Map<string, nuclide$OutlineTree> = new Map();
    byContainerName.forEach((v, k) => {
      const containerName = v.containerName;
      if (containerName == '' || containerName == null || k == containerName) {
        // No container name or contained within itself belong as top-level items
        roots.set(k, v.outline);
      } else {
        const container = byContainerName.get(containerName);
        if (container) {
          // Items with a container we know about get put in that container
          container.outline.children.push(v.outline);
        } else {
          // Items with a container we don't know about we dynamically create one for
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

  // Public: Converts an {Array} of {SymbolInformation} received from a language server into a
  // {Map} of {ContainerNamedOutline} keyed by their symbol names. This allows us to find parents
  // quickly when assembling the tree through containerNames.
  //
  // * `symbols` An {Array} of {SymbolInformation}s to convert into the map.
  //
  // Returns a {Map} of {ContainerNamedOutline}s each converted from a {SymbolInformation}
  // and keyed by its containerName.
  static createContainerNamedOutline(symbols: Array<SymbolInformation>): Map<string, ContainerNamedOutline> {
    return symbols.reduce((map, symbol) => {
      map.set(symbol.name, {
        containerName: symbol.containerName,
        outline: OutlineViewAdapter.symbolToOutline(symbol)
      });
      return map;
    }, new Map());
  }

  // Public: Convert an individual {SymbolInformation} from the language server
  // to an {OutlineTree} for use by the Outline View.
  //
  // * `symbol` The {SymbolInformation} to convert to an {OutlineTree}.
  //
  // Returns the {OutlineTree} equivalent to the given {SymbolInformation}.
  static symbolToOutline(symbol: SymbolInformation): nuclide$OutlineTree {
    const icon = OutlineViewAdapter.symbolKindToEntityKind(symbol.kind)
    return {
      tokenizedText: [ {
        kind: OutlineViewAdapter.symbolKindToTokenKind(symbol.kind),
        value: symbol.name,
      } ],
      icon: icon != null ? icon : undefined,
      representativeName: symbol.name,
      startPosition: Convert.positionToPoint(symbol.location.range.start),
      endPosition: Convert.positionToPoint(symbol.location.range.end),
      children: [],
    }
  }

  // Public: Convert a symbol kind into an outline entity kind used to determine
  // the styling such as the appropriate icon in the Outline View.
  //
  // * `symbol` The numeric symbol kind received from the language server.
  //
  // Returns a string representing the equivalent OutlineView entity kind.
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

  // Public: Convert a symbol kind to the appropriate token kind used to syntax
  // highlight the symbol name in the Outline View.
  //
  // * `symbol` The numeric symbol kind received from the language server.
  //
  // Returns a string representing the equivalent syntax token kind.
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
