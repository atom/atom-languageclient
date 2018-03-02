import * as atomIde from 'atom-ide';
import Convert from '../convert';
import Utils from '../utils';
import { CancellationTokenSource } from 'vscode-jsonrpc';
import {
  LanguageClientConnection,
  SymbolKind,
  ServerCapabilities,
  SymbolInformation,
} from '../languageclient';
import {
  Point,
  TextEditor,
} from 'atom';

// Public: Adapts the documentSymbolProvider of the language server to the Outline View
// supplied by Atom IDE UI.
export default class OutlineViewAdapter {

  private _cancellationTokens: WeakMap<LanguageClientConnection, CancellationTokenSource> = new WeakMap();

  // Public: Determine whether this adapter can be used to adapt a language server
  // based on the serverCapabilities matrix containing a documentSymbolProvider.
  //
  // * `serverCapabilities` The {ServerCapabilities} of the language server to consider.
  //
  // Returns a {Boolean} indicating adapter can adapt the server based on the
  // given serverCapabilities.
  public static canAdapt(serverCapabilities: ServerCapabilities): boolean {
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
  public async getOutline(connection: LanguageClientConnection, editor: TextEditor): Promise<atomIde.Outline | null> {
    const results = await Utils.doWithCancellationToken(connection, this._cancellationTokens, (cancellationToken) =>
      connection.documentSymbol({textDocument: Convert.editorToTextDocumentIdentifier(editor)}, cancellationToken),
    );
    results.sort(
      (a, b) =>
        (a.location.range.start.line === b.location.range.start.line
          ? a.location.range.start.character - b.location.range.start.character
          : a.location.range.start.line - b.location.range.start.line),
    );
    return {
      outlineTrees: OutlineViewAdapter.createOutlineTrees(results),
    };
  }

  // Public: Create an {Array} of {OutlineTree}s from the Array of {SymbolInformation} recieved
  // from the language server. This includes determining the appropriate child and parent
  // relationships for the hierarchy.
  //
  // * `symbols` An {Array} of {SymbolInformation}s received from the language server that
  //             should be converted to an {OutlineTree}.
  //
  // Returns an {OutlineTree} containing the given symbols that the Outline View can display.
  public static createOutlineTrees(symbols: SymbolInformation[]): atomIde.OutlineTree[] {
    // Temporarily keep containerName through the conversion process
    // Also filter out symbols without a name - it's part of the spec but some don't include it
    const allItems = symbols.filter((symbol) => symbol.name).map((symbol) => ({
      containerName: symbol.containerName,
      outline: OutlineViewAdapter.symbolToOutline(symbol),
    }));

    // Create a map of containers by name with all items that have that name
    const containers = allItems.reduce((map, item) => {
      const name = item.outline.representativeName;
      if (name != null) {
        const container = map.get(name);
        if (container == null) {
          map.set(name, [item.outline]);
        } else {
          container.push(item.outline);
        }
      }
      return map;
    }, new Map());

    const roots: atomIde.OutlineTree[] = [];

    // Put each item within its parent and extract out the roots
    for (const item of allItems) {
      const containerName = item.containerName;
      const child = item.outline;
      if (containerName == null || containerName === '') {
        roots.push(item.outline);
      } else {
        const possibleParents = containers.get(containerName);
        let closestParent = OutlineViewAdapter._getClosestParent(possibleParents, child);
        if (closestParent == null) {
          closestParent = {
            plainText: containerName,
            representativeName: containerName,
            startPosition: new Point(0, 0),
            children: [child],
          };
          roots.push(closestParent);
          if (possibleParents == null) {
            containers.set(containerName, [closestParent]);
          } else {
            possibleParents.push(closestParent);
          }
        } else {
          closestParent.children.push(child);
        }
      }
    }

    return roots;
  }

  private static _getClosestParent(
    candidates: atomIde.OutlineTree[] | null,
    child: atomIde.OutlineTree,
  ): atomIde.OutlineTree | null {
    if (candidates == null || candidates.length === 0) {
      return null;
    }

    let parent: atomIde.OutlineTree | undefined;
    for (const candidate of candidates) {
      if (
        candidate !== child &&
        candidate.startPosition.isLessThanOrEqual(child.startPosition) &&
        (candidate.endPosition === undefined ||
          (child.endPosition && candidate.endPosition.isGreaterThanOrEqual(child.endPosition)))
      ) {
        if (
          parent === undefined ||
          (parent.startPosition.isLessThanOrEqual(candidate.startPosition) ||
            (parent.endPosition != null &&
              candidate.endPosition &&
              parent.endPosition.isGreaterThanOrEqual(candidate.endPosition)))
        ) {
          parent = candidate;
        }
      }
    }

    return parent || null;
  }

  // Public: Convert an individual {SymbolInformation} from the language server
  // to an {OutlineTree} for use by the Outline View.
  //
  // * `symbol` The {SymbolInformation} to convert to an {OutlineTree}.
  //
  // Returns the {OutlineTree} equivalent to the given {SymbolInformation}.
  public static symbolToOutline(symbol: SymbolInformation): atomIde.OutlineTree {
    const icon = OutlineViewAdapter.symbolKindToEntityKind(symbol.kind);
    return {
      tokenizedText: [
        {
          kind: OutlineViewAdapter.symbolKindToTokenKind(symbol.kind),
          value: symbol.name,
        },
      ],
      icon: icon != null ? icon : undefined,
      representativeName: symbol.name,
      startPosition: Convert.positionToPoint(symbol.location.range.start),
      endPosition: Convert.positionToPoint(symbol.location.range.end),
      children: [],
    };
  }

  // Public: Convert a symbol kind into an outline entity kind used to determine
  // the styling such as the appropriate icon in the Outline View.
  //
  // * `symbol` The numeric symbol kind received from the language server.
  //
  // Returns a string representing the equivalent OutlineView entity kind.
  public static symbolKindToEntityKind(symbol: number): string | null {
    switch (symbol) {
      case SymbolKind.Array:
        return 'type-array';
      case SymbolKind.Boolean:
        return 'type-boolean';
      case SymbolKind.Class:
        return 'type-class';
      case SymbolKind.Constant:
        return 'type-constant';
      case SymbolKind.Constructor:
        return 'type-constructor';
      case SymbolKind.Enum:
        return 'type-enum';
      case SymbolKind.Field:
        return 'type-field';
      case SymbolKind.File:
        return 'type-file';
      case SymbolKind.Function:
        return 'type-function';
      case SymbolKind.Interface:
        return 'type-interface';
      case SymbolKind.Method:
        return 'type-method';
      case SymbolKind.Module:
        return 'type-module';
      case SymbolKind.Namespace:
        return 'type-namespace';
      case SymbolKind.Number:
        return 'type-number';
      case SymbolKind.Package:
        return 'type-package';
      case SymbolKind.Property:
        return 'type-property';
      case SymbolKind.String:
        return 'type-string';
      case SymbolKind.Variable:
        return 'type-variable';
      default:
        return null;
    }
  }

  // Public: Convert a symbol kind to the appropriate token kind used to syntax
  // highlight the symbol name in the Outline View.
  //
  // * `symbol` The numeric symbol kind received from the language server.
  //
  // Returns a string representing the equivalent syntax token kind.
  public static symbolKindToTokenKind(symbol: number): atomIde.TokenKind {
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
