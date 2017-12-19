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
import Convert from '../convert';
import {filter} from 'fuzzaldrin-plus';

// Public: Adapts the language server protocol "textDocument/completion" to the Atom
// AutoComplete+ package.
export default class AutocompleteAdapter {
  static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.completionProvider != null;
  }

  // Public: Obtain suggestion list for AutoComplete+ by querying the language server using
  // the `textDocument/completion` request.
  //
  // * `server` An {ActiveServer} pointing to the language server to query.
  // * `request` The {atom$AutocompleteRequest} to satisfy.
  // * `onDidConvertCompletionItem` An optional function that takes a {CompletionItem}, an {atom$AutocompleteSuggestion}
  //   and a {atom$AutocompleteRequest} allowing you to adjust converted items.
  //
  // Returns a {Promise} of an {Array} of {atom$AutocompleteSuggestion}s containing the
  // AutoComplete+ suggestions to display.
  async getSuggestions(
    server: ActiveServer,
    request: atom$AutocompleteRequest,
    onDidConvertCompletionItem?: (CompletionItem, atom$AutocompleteSuggestion, atom$AutocompleteRequest) => void,
  ): Promise<Array<atom$AutocompleteSuggestion>> {
    const triggerChars = server.capabilities.completionProvider.triggerCharacters || [];
    const triggerPoint = AutocompleteAdapter.getTriggerPoint(request, triggerChars);
    const prefixWithTrigger = AutocompleteAdapter.getPrefixWithTrigger(request, triggerPoint);
    const autoTrigger = triggerChars.find(t => prefixWithTrigger.startsWith(t));

    if (autoTrigger == null && !request.activatedManually) {
      return server.filterableSuggestions = [];
    }

    if (server.filterableSuggestions && server.filterableSuggestions.length > 0) {
      if (autoTrigger == prefixWithTrigger) { // User backspaced to trigger, represent entire cache
        AutocompleteAdapter.setReplacementPrefixOnSuggestions(server.filterableSuggestions, request.prefix);
        return server.filterableSuggestions;
      }
      if (autoTrigger) { // Still in a triggered autocomplete with cache, fuzzy-filter those results
        AutocompleteAdapter.setReplacementPrefixOnSuggestions(server.filterableSuggestions, request.prefix);
        return filter(server.filterableSuggestions, request.prefix, {key: 'text'});
      }
    }

    // Triggered but do not have a cache or shouldn't use it so request directly from language server
    const params: TextDocumentPositionParams = AutocompleteAdapter.requestToTextDocumentPositionParams(request)
    if (AutocompleteAdapter.hasContextSupport(server.capabilities)) {
      params.context = {
        triggerKind: triggerCharacter ? CompletionTriggerKind.TriggerCharacter : CompletionTriggerKind.Invoked,
        triggerCharacter: triggerCharacter != null ? triggerCharacter : undefined
      };
    }
    const completions = await server.connection.completion(params);
    server.lastSuggestions = this.completionItemsToSuggestions(completions, request, onDidConvertCompletionItem);
    const results = Array.from(server.lastSuggestions.keys());
    server.filterableSuggestions = completions.isIncomplete ? [] : results;
    return results;
  }

  static hasContextSupport(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.textDocument && serverCapabilities.textDocument.completion && serverCapabilities.textDocument.completion.contextSupport === true;
  }

  // Public: Obtain a complete version of a suggestion with additional information
  // the language server can provide by way of the `completionItem/resolve` request.
  //
  // * `server` An {ActiveServer} pointing to the language server to query.
  // * `suggestion` An {atom$AutocompleteSuggestion} suggestion that should be resolved.
  // * `request` An {Object} with the AutoComplete+ request to satisfy.
  // * `onDidConvertCompletionItem` An optional function that takes a {CompletionItem}, an {atom$AutocompleteSuggestion}
  //   and a {atom$AutocompleteRequest} allowing you to adjust converted items.
  //
  // Returns a {Promise} of an {atom$AutocompleteSuggestion} with the resolved AutoComplete+
  // suggestion.
  async completeSuggestion(
    server: getActiveServer,
    suggestion: atom$AutocompleteSuggestion,
    request: atom$AutocompleteRequest,
    onDidConvertCompletionItem?: (CompletionItem, atom$AutocompleteSuggestion, atom$AutocompleteRequest) => void,
  ): Promise<atom$AutocompleteSuggestion> {
    const originalCompletionItem = server.lastSuggestions.get(suggestion);
    if (originalCompletionItem != null && originalCompletionItem[1] === false) {
      const resolveCompletionItem = await server.connection.completionItemResolve(originalCompletionItem[0]);
      if (resolveCompletionItem != null) {
        AutocompleteAdapter.completionItemToSuggestion(resolveCompletionItem, suggestion, request, onDidConvertCompletionItem);
      }
    }

    return suggestion;
  }

  // Public: Set the replacementPrefix property on all given suggestions to the
  // prefix specified.
  //
  // * `suggestions` An {Array} of {atom$AutocompleteSuggestion}s to set the replacementPrefix on.
  // * `prefix` The {atom$PointObject} where the trigger started.
  static setReplacementPrefixOnSuggestions(suggestions: Array<atom$AutocompleteSuggestion>, prefix: string): void {
    for(const suggestion of suggestions) {
      suggestion.replacementPrefix = prefix
    }
  }

  static getTriggerPoint(request, triggerChars) {
    if (triggerChars.includes(request.prefix)) {
      return request.bufferPosition;
    }

    return {
      row: request.bufferPosition.row,
      column: request.bufferPosition.column - request.prefix.length,
    };
  }

  // Public: Create TextDocumentPositionParams to be sent to the language server
  // based on the editor and position from the AutoCompleteRequest.
  //
  // * `request` The {atom$AutocompleteRequest} to obtain the trigger and editor from.
  // * `triggerPoint` The {atom$PointObject} where the trigger started.
  //
  // Returns a {string} containing the prefix including the trigger character.
  static getPrefixWithTrigger(request: atom$AutocompleteRequest, triggerPoint: atom$PointObject): string {
    return request.editor
      .getBuffer()
      .getTextInRange([[triggerPoint.row, triggerPoint.column - 1], request.bufferPosition])
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
      case CompletionItemKind.Interface:
        return 'interface';
      case CompletionItemKind.Module:
        return 'module';
      case CompletionItemKind.Unit:
        return 'builtin';
      case CompletionItemKind.Enum:
        return 'enum';
      case CompletionItemKind.Keyword:
        return 'keyword';
      case CompletionItemKind.Snippet:
        return 'snippet';
      case CompletionItemKind.File:
        return 'import';
      case CompletionItemKind.Reference:
        return 'require';
      default:
        return 'value';
    }
  }
}
