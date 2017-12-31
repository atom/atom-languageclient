// @flow

import {
  CompletionItemKind,
  LanguageClientConnection,
  type CompletionItem,
  type CompletionList,
  type TextDocumentPositionParams,
  type TextEdit,
  type ServerCapabilities,
} from '../languageclient';
import {CancellationTokenSource} from 'vscode-jsonrpc';
import Convert from '../convert';
import Utils from '../utils';

// Public: Adapts the language server protocol "textDocument/completion" to the Atom
// AutoComplete+ package.
export default class AutocompleteAdapter {
  static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.completionProvider != null;
  }

  static canResolve(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.completionProvider != null && serverCapabilities.completionProvider.resolveProvider === true;
  }

  _lastSuggestions: Map<atom$AutocompleteSuggestion, [CompletionItem, boolean]> = new Map();
  _cancellationTokens: WeakMap<LanguageClientConnection, CancellationTokenSource> = new WeakMap();

  // Public: Obtain suggestion list for AutoComplete+ by querying the language server using
  // the `textDocument/completion` request.
  //
  // * `connection` A {LanguageClientConnection} to the language server to query.
  // * `request` The {atom$AutocompleteRequest} to satisfy.
  // * `onDidConvertCompletionItem` A function that takes a {CompletionItem}, an {atom$AutocompleteSuggestion}
  //   and a {atom$AutocompleteRequest} allowing you to adjust converted items.
  //
  // Returns a {Promise} of an {Array} of {atom$AutocompleteSuggestion}s containing the
  // AutoComplete+ suggestions to display.
  async getSuggestions(
    connection: LanguageClientConnection,
    request: atom$AutocompleteRequest,
    onDidConvertCompletionItem?: (CompletionItem, atom$AutocompleteSuggestion, atom$AutocompleteRequest) => void,
  ): Promise<Array<atom$AutocompleteSuggestion>> {
    const cancellationToken = Utils.cancelAndRefreshCancellationToken(connection, this._cancellationTokens);
    const items = await connection.completion(AutocompleteAdapter.requestToTextDocumentPositionParams(request), cancellationToken);
    this._cancellationTokens.delete(connection);
    this._lastSuggestions = this.completionItemsToSuggestions(items, request, onDidConvertCompletionItem);
    return Array.from(this._lastSuggestions.keys());
  }

  // Public: Obtain a complete version of a suggestion with additional information
  // the language server can provide by way of the `completionItem/resolve` request.
  //
  // * `connection` A {LanguageClientConnection} to the language server to query.
  // * `request` An {Object} with the AutoComplete+ request to satisfy.
  //
  // Returns a {Promise} of an {atom$AutocompleteSuggestion} with the resolved AutoComplete+
  // suggestion.
  async completeSuggestion(
    connection: LanguageClientConnection,
    suggestion: atom$AutocompleteSuggestion,
    request: atom$AutocompleteRequest,
    onDidConvertCompletionItem?: (CompletionItem, atom$AutocompleteSuggestion, atom$AutocompleteRequest) => void,
  ): Promise<atom$AutocompleteSuggestion> {
    const originalCompletionItem = this._lastSuggestions.get(suggestion);
    if (originalCompletionItem != null && originalCompletionItem[1] === false) {
      const resolveCompletionItem = await connection.completionItemResolve(originalCompletionItem[0]);
      if (resolveCompletionItem != null) {
        AutocompleteAdapter.completionItemToSuggestion(resolveCompletionItem, suggestion, request, onDidConvertCompletionItem);
      }
    }

    return suggestion;
  }

  // Public: Create TextDocumentPositionParams to be sent to the language server
  // based on the editor and position from the AutoCompleteRequest.
  //
  // * `request` The {atom$AutocompleteRequest} to satisfy.
  //
  // Returns an {TextDocumentPositionParams} with the keys:
  //  * `textDocument` the language server protocol textDocument identification.
  //  * `position` the position within the text document to display completion request for.
  static requestToTextDocumentPositionParams(request: atom$AutocompleteRequest): TextDocumentPositionParams {
    return {
      textDocument: Convert.editorToTextDocumentIdentifier(request.editor),
      position: Convert.pointToPosition(request.bufferPosition),
    };
  }

  // Public: Convert a language server protocol CompletionItem array or CompletionList to
  // an array of ordered AutoComplete+ suggestions.
  //
  // * `completionItems` An {Array} of {CompletionItem} objects or a {CompletionList} containing completion
  //           items to be converted.
  // * `request` The {atom$AutocompleteRequest} to satisfy.
  // * `onDidConvertCompletionItem` A function that takes a {CompletionItem}, an {atom$AutocompleteSuggestion}
  //   and a {atom$AutocompleteRequest} allowing you to adjust converted items.
  //
  // Returns a {Map} of AutoComplete+ suggestions ordered by the CompletionItems sortText.
  completionItemsToSuggestions(
    completionItems: Array<CompletionItem> | CompletionList,
    request: atom$AutocompleteRequest,
    onDidConvertCompletionItem?: (CompletionItem, atom$AutocompleteSuggestion, atom$AutocompleteRequest) => void,
  ): Map<atom$AutocompleteSuggestion, [CompletionItem, boolean]> {
    return new Map((Array.isArray(completionItems) ? completionItems : completionItems.items || [])
      .sort((a, b) => (a.sortText || a.label).localeCompare(b.sortText || b.label))
      .map(s => [AutocompleteAdapter.completionItemToSuggestion(s, { }, request, onDidConvertCompletionItem), [s, false]]));
  }

  // Public: Convert a language server protocol CompletionItem to an AutoComplete+ suggestion.
  //
  // * `item` An {CompletionItem} containing a completion item to be converted.
  // * `suggestion` A {atom$AutocompleteSuggestion} to have the conversion applied to.
  // * `request` The {atom$AutocompleteRequest} to satisfy.
  // * `onDidConvertCompletionItem` A function that takes a {CompletionItem}, an {atom$AutocompleteSuggestion}
  //   and a {atom$AutocompleteRequest} allowing you to adjust converted items.
  //
  // Returns the {atom$AutocompleteSuggestion} passed in as suggestion with the conversion applied.
  static completionItemToSuggestion(
    item: CompletionItem,
    suggestion: atom$AutocompleteSuggestion,
    request: atom$AutocompleteRequest,
    onDidConvertCompletionItem?: (CompletionItem, atom$AutocompleteSuggestion, atom$AutocompleteRequest) => void,
  ): atom$AutocompleteSuggestion {
    AutocompleteAdapter.applyCompletionItemToSuggestion(item, suggestion);
    AutocompleteAdapter.applyTextEditToSuggestion(item.textEdit, request.editor, suggestion);
    if (onDidConvertCompletionItem != null) {
      onDidConvertCompletionItem(item, suggestion, request);
    }
    return suggestion;
  }

  // Public: Convert the primary parts of a language server protocol CompletionItem to an AutoComplete+ suggestion.
  //
  // * `item` An {CompletionItem} containing the completion items to be merged into.
  // * `suggestion` The {atom$AutocompleteSuggestion} to merge the conversion into.
  //
  // Returns an {atom$AutocompleteSuggestion} created from the {CompletionItem}.
  static applyCompletionItemToSuggestion(item: CompletionItem, suggestion: atom$AutocompleteSuggestion) {
    suggestion.text = item.insertText || item.label;
    suggestion.displayText = item.label;
    suggestion.snippet = item.insertTextFormat === 2 ? item.insertText : undefined;
    suggestion.type = AutocompleteAdapter.completionKindToSuggestionType(item.kind);
    suggestion.rightLabel = item.detail;
    suggestion.description = item.documentation;
    suggestion.descriptionMarkdown = item.documentation;
  }

  // Public: Applies the textEdit part of a language server protocol CompletionItem to an
  // AutoComplete+ Suggestion via the replacementPrefix and text properties.
  //
  // * `textEdit` A {TextEdit} from a CompletionItem to apply.
  // * `editor` An Atom {TextEditor} used to obtain the necessary text replacement.
  // * `suggestion` An {atom$AutocompleteSuggestion} to set the replacementPrefix and text properties of.
  static applyTextEditToSuggestion(
    textEdit: ?TextEdit,
    editor: atom$TextEditor,
    suggestion: atom$AutocompleteSuggestion,
  ): void {
    if (textEdit != null) {
      suggestion.replacementPrefix = editor.getTextInBufferRange(Convert.lsRangeToAtomRange(textEdit.range));
      suggestion.text = textEdit.newText;
    }
  }

  // Public: Obtain the textual suggestion type required by AutoComplete+ that
  // most closely maps to the numeric completion kind supplies by the language server.
  //
  // * `kind` A {Number} that represents the suggestion kind to be converted.
  //
  // Returns a {String} containing the AutoComplete+ suggestion type equivalent
  // to the given completion kind.
  static completionKindToSuggestionType(kind: ?number): string {
    switch (kind) {
      case CompletionItemKind.Constant:
        return 'constant';
      case CompletionItemKind.Method:
        return 'method';
      case CompletionItemKind.Function:
      case CompletionItemKind.Constructor:
        return 'function';
      case CompletionItemKind.Field:
      case CompletionItemKind.Property:
        return 'property';
      case CompletionItemKind.Variable:
        return 'variable';
      case CompletionItemKind.Class:
        return 'class';
      case CompletionItemKind.Struct:
      case CompletionItemKind.TypeParameter:
        return 'type';
      case CompletionItemKind.Operator:
        return 'selector';
      case CompletionItemKind.Interface:
        return 'mixin';
      case CompletionItemKind.Module:
        return 'module';
      case CompletionItemKind.Unit:
        return 'builtin';
      case CompletionItemKind.Enum:
      case CompletionItemKind.EnumMember:
        return 'enum';
      case CompletionItemKind.Keyword:
        return 'keyword';
      case CompletionItemKind.Snippet:
        return 'snippet';
      case CompletionItemKind.File:
      case CompletionItemKind.Folder:
        return 'import';
      case CompletionItemKind.Reference:
        return 'require';
      default:
        return 'value';
    }
  }
}
