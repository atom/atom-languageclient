// @flow

import {
  CompletionItemKind,
  CompletionTriggerKind,
  InsertTextFormat,
  LanguageClientConnection,
  type CompletionContext,
  type CompletionItem,
  type CompletionList,
  type CompletionParams,
  type ServerCapabilities,
  type TextEdit,
} from '../languageclient';
import {Point} from 'atom';
import {CancellationTokenSource} from 'vscode-jsonrpc';
import {type ActiveServer} from '../server-manager';
import Convert from '../convert';
import {filter} from 'fuzzaldrin-plus';
import Utils from '../utils';

type SuggestionCacheEntry = {
  isIncomplete: boolean,
  triggerPoint: atom$Point,
  suggestionMap: Map<atom$AutocompleteSuggestion, [CompletionItem, boolean]>,
};

// Public: Adapts the language server protocol "textDocument/completion" to the Atom
// AutoComplete+ package.
export default class AutocompleteAdapter {
  static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.completionProvider != null;
  }

  static canResolve(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.completionProvider != null && serverCapabilities.completionProvider.resolveProvider === true;
  }

  _suggestionCache: WeakMap<ActiveServer, SuggestionCacheEntry> = new WeakMap();
  _cancellationTokens: WeakMap<LanguageClientConnection, CancellationTokenSource> = new WeakMap();

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
    const triggerChars = server.capabilities.completionProvider != null ? server.capabilities.completionProvider.triggerCharacters || [] : [];
    const triggerPoint = AutocompleteAdapter.getTriggerPoint(request, triggerChars);
    const prefixWithTrigger = AutocompleteAdapter.getPrefixWithTrigger(request, triggerPoint);

    const cache = this._suggestionCache.get(server);

    // We have cached suggestions and should use them
    if (cache && !cache.isIncomplete && cache.triggerPoint.isEqual(triggerPoint)) {
      const suggestions = Array.from(cache.suggestionMap.keys());
      AutocompleteAdapter.setReplacementPrefixOnSuggestions(suggestions, request.prefix);
      return prefixWithTrigger.length === 1 ? suggestions : filter(suggestions, request.prefix, {key: 'text'});
    }

    // We either don't have suggestions or they are incomplete so request from the language server
    const completions = await Utils.doWithCancellationToken(server.connection, this._cancellationTokens, cancellationToken =>
      server.connection.completion(AutocompleteAdapter.createCompletionParams(request, prefixWithTrigger[0]), cancellationToken),
    );
    const isIncomplete = !Array.isArray(completions) && completions.isIncomplete;
    const suggestionMap = this.completionItemsToSuggestions(completions, request, onDidConvertCompletionItem);
    this._suggestionCache.set(server, {isIncomplete, triggerPoint, suggestionMap});
    return Array.from(suggestionMap.keys());
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
  // Returns a {Promise} of an {atom$AutocompleteSuggestion} with the resolved AutoComplete+ suggestion.
  async completeSuggestion(
    server: ActiveServer,
    suggestion: atom$AutocompleteSuggestion,
    request: atom$AutocompleteRequest,
    onDidConvertCompletionItem?: (CompletionItem, atom$AutocompleteSuggestion, atom$AutocompleteRequest) => void,
  ): Promise<atom$AutocompleteSuggestion> {
    const cache = this._suggestionCache.get(server);
    if (cache) {
      const originalCompletionItem = cache.suggestionMap.get(suggestion);
      if (originalCompletionItem != null && originalCompletionItem[1] === false) {
        const resolvedCompletionItem = await server.connection.completionItemResolve(originalCompletionItem[0]);
        if (resolvedCompletionItem != null) {
          AutocompleteAdapter.completionItemToSuggestion(resolvedCompletionItem, suggestion, request, onDidConvertCompletionItem);
          originalCompletionItem[1] = true;
        }
      }
    }

    return suggestion;
  }

  // Public: Set the replacementPrefix property on all given suggestions to the
  // prefix specified.
  //
  // * `suggestions` An {Array} of {atom$AutocompleteSuggestion}s to set the replacementPrefix on.
  // * `prefix` The {string} containing the prefix that should be set as replacementPrefix on all suggestions.
  static setReplacementPrefixOnSuggestions(suggestions: Array<atom$AutocompleteSuggestion>, prefix: string): void {
    for (const suggestion of suggestions) {
      suggestion.replacementPrefix = prefix;
    }
  }

  // Public: Get the point where the trigger character occurred.
  //
  // * `request` An {Array} of {atom$AutocompleteSuggestion}s to set the replacementPrefix on.
  // * `triggerChars` The {Array} of {string}s that can be trigger characters.
  //
  // Returns the {atom$Point} where the trigger occurred.
  static getTriggerPoint(request: atom$AutocompleteRequest, triggerChars: Array<string>): atom$Point {
    if (triggerChars.includes(request.prefix)) {
      return Point.fromObject(request.bufferPosition, true);
    }

    return new Point(request.bufferPosition.row, request.bufferPosition.column - request.prefix.length);
  }

  // Public: Create TextDocumentPositionParams to be sent to the language server
  // based on the editor and position from the AutoCompleteRequest.
  //
  // * `request` The {atom$AutocompleteRequest} to obtain the trigger and editor from.
  // * `triggerPoint` The {atom$Point} where the trigger started.
  //
  // Returns a {string} containing the prefix including the trigger character.
  static getPrefixWithTrigger(request: atom$AutocompleteRequest, triggerPoint: atom$Point): string {
    return request.editor
      .getBuffer()
      .getTextInRange([[triggerPoint.row, triggerPoint.column - 1], request.bufferPosition]);
  }

  // Public: Create {CompletionParams} to be sent to the language server
  // based on the editor and position from the Autocomplete request etc.
  //
  // * `request` The {atom$AutocompleteRequest} containing the request details.
  // * `triggerCharacter` The nullable {string} containing the trigger character.
  //
  // Returns an {CompletionParams} with the keys:
  //  * `textDocument` the language server protocol textDocument identification.
  //  * `position` the position within the text document to display completion request for.
  //  * `context` containing the trigger character and kind.
  static createCompletionParams(request: atom$AutocompleteRequest, triggerCharacter: ?string): CompletionParams {
    return {
      textDocument: Convert.editorToTextDocumentIdentifier(request.editor),
      position: Convert.pointToPosition(request.bufferPosition),
      context: AutocompleteAdapter.createCompletionContext(triggerCharacter),
    };
  }

  // Public: Create {CompletionContext} to be sent to the language server
  // based on the trigger character.
  //
  // * `triggerCharacter` The nullable {string} containing the trigger character.
  //
  // Returns an {CompletionContext} that specifies the triggerKind and the triggerCharacter
  // if there is one.
  static createCompletionContext(triggerCharacter: ?string): CompletionContext {
    return triggerCharacter == null
      ? {triggerKind: CompletionTriggerKind.Invoked}
      : {triggerKind: CompletionTriggerKind.TriggerCharacter, triggerCharacter};
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
    AutocompleteAdapter.applySnippetToSuggestion(item, suggestion);
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

  // Public: Adds a snippet to the suggestion if the CompletionItem contains
  // snippet-formatted text
  //
  // * `item` An {CompletionItem} containing the completion items to be merged into.
  // * `suggestion` The {atom$AutocompleteSuggestion} to merge the conversion into.
  //
  static applySnippetToSuggestion(item: CompletionItem, suggestion: atom$AutocompleteSuggestion): void {
    if (item.insertTextFormat === InsertTextFormat.Snippet) {
      suggestion.snippet = item.textEdit != null ? item.textEdit.newText : item.insertText;
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
