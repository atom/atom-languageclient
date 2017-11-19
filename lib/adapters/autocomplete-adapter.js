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

type CompletionResponseCache = {
  triggerPosition: atom$PointObject,
  prefixes: Map<string, AutocompletionResponse>,
};

export type AutocompletionResponse = {
  isComplete: boolean,
  completionItems: Array<atom$AutocompleteSuggestion>,
};

// Public: Adapts the language server protocol "textDocument/completion" to the Atom
// AutoComplete+ package.
export default class AutocompleteAdapter {
  _completionCachesByEditor: Map<atom$TextEditor, CompletionResponseCache> = new Map();

  static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.completionProvider != null;
  }

  // Public: Primary entry point for obtaining suggestions for AutoComplete+ by
  // querying the language server.
  //
  // * `connection` A {LanguageClientConnection} to the language server to query.
  // * `request` An {Object} with the AutoComplete+ request to satisfy.
  //
  // Returns a {Promise} of an {AutocompletionResponse} object containing the AutoComplete+
  // suggestions to display and an indication if the list is complete.
  async getSuggestions(
    connection: LanguageClientConnection,
    request: atom$AutocompleteRequest,
    useCache: boolean = false,
    triggerChars?: Array<string>,
  ): Promise<AutocompletionResponse> {
    if (!useCache) {
      return await this.getLSSuggestions(connection, request);
    }

    if (!triggerChars || triggerChars.length === 0) {
      throw Error('Must provide triggerChars to get suggestions with caching');
    }

    let triggerPosition: atom$PointObject;

    // Calculating the potential position of a trigger character.
    // If the current prefix is a trigger character we use it's position, otherwise -
    // we take the position request.prefix.length chars backwards.
    if (triggerChars.includes(request.prefix)) {
      triggerPosition = request.bufferPosition;
    } else {
      triggerPosition = {
        row: request.bufferPosition.row,
        column: request.bufferPosition.column - request.prefix.length,
      };
    }

    // When caching results we'll store the `prefixes` `Map`'s keys with the trigger character.
    // That way if we'll get results for the same `prefix` with different trigger characters.
    // i.e `document.bla` or `document:bla` - same prefix, different trigger.
    const prefixWithTrigger: string = request.editor
      .getBuffer()
      .getTextInRange([[triggerPosition.row, triggerPosition.column - 1], request.bufferPosition]);
    const triggerChar: string = prefixWithTrigger[0];

    if (!triggerChars.includes(triggerChar)) {
      return Promise.resolve({isComplete: true, completionItems: []});
    }

    // Basically, we're going to build a completion cache for each editor in the form of an object
    // that stores the last prefix position from which we fetched results from the LS,
    // and a Map of results for each known prefix in that position.
    // Everytime we hit the LanguageServer for suggestions, we're going to store those results
    // in the cache.
    let completionCache: ?CompletionResponseCache = this._completionCachesByEditor.get(request.editor);
    if (completionCache == null) {
      completionCache = {
        triggerPosition,
        prefixes: new Map(),
      };
    }

    // Checking if the current trigger character is positioned where we stored
    // our cache on the last fetch from the LS.
    if (
      completionCache.triggerPosition.row === triggerPosition.row &&
      completionCache.triggerPosition.column === triggerPosition.column &&
      completionCache.prefixes &&
      completionCache.prefixes.size > 0
    ) {
      let isFilterRequired: boolean;
      let resultsForPrefix: ?AutocompletionResponse;
      let k: number = prefixWithTrigger.length;

      let _resultsForPrefix: ?AutocompletionResponse;
      // We try to get cached results for the longest possible substring of our
      // prefix. Everytime we fail to, we search on a shorter substring (going backwards).
      // If we find cached results, but they are incomplete - we break the loop - we must
      // fetch results from the language server.
      while (!resultsForPrefix && k > 0) {
        _resultsForPrefix = completionCache.prefixes.get(prefixWithTrigger.slice(0, k));

        if (_resultsForPrefix) {
          // If we found results but they are incomplete - there's no point to keep searching -
          // the smaller the query substring is, the more results we're going to get.
          if (_resultsForPrefix.isComplete) {
            resultsForPrefix = _resultsForPrefix;
            isFilterRequired = k !== prefixWithTrigger.length;
          }

          break;
        }

        k--;
      }

      if (resultsForPrefix && resultsForPrefix.completionItems) {
        return new Promise(resolve => {
          const listToFilter = (resultsForPrefix && resultsForPrefix.completionItems) || [];
          const filtered = isFilterRequired
            ? filter(listToFilter, request.prefix, {key: 'text'}).map(s => ({
                ...s,
                ...{replacementPrefix: request.prefix},
              }))
            : listToFilter;
          resolve({
            isComplete: true,
            completionItems: filtered,
          });
        });
      }
    }

    // If the prefix position of the current request is different than the last
    // cached one, we re-instantiate the completion cache with the new position
    // and no results.
    if (
      completionCache.triggerPosition.row !== triggerPosition.row ||
      completionCache.triggerPosition.column !== triggerPosition.column
    ) {
      completionCache = {
        triggerPosition,
        prefixes: new Map(),
      };
    }

    const lsResponse = await this.getLSSuggestions(connection, request);
    if (!completionCache) {
      completionCache = {
        triggerPosition,
        prefixes: new Map(),
      };
    }

    completionCache.prefixes.set(prefixWithTrigger, lsResponse);
    this._completionCachesByEditor.set(request.editor, completionCache);
    return lsResponse;
  }

  // Public: Primary entry point for obtaining suggestions for AutoComplete+ by
  // querying the language server.
  //
  // * `connection` A {LanguageClientConnection} to the language server to query.
  // * `request` An {Object} with the AutoComplete+ request to satisfy.
  //
  // Returns a {Promise} of an {AutocompletionResponse} object containing the AutoComplete+
  // suggestions to display and an indication if the list is complete.
  async getLSSuggestions(
    connection: LanguageClientConnection,
    request: atom$AutocompleteRequest,
  ): Promise<AutocompletionResponse> {
    const completionItems = await connection.completion(
      AutocompleteAdapter.requestToTextDocumentPositionParams(request),
    );
    return AutocompleteAdapter.completionItemsToSuggestions(completionItems, request);
  }

  // Public: Create TextDocumentPositionParams to be sent to the language server
  // based on the editor and position from the AutoCompleteRequest.
  //
  // * `request` An {Object} with the AutoComplete+ request to use.
  //
  // Returns an {Object} containing the TextDocumentPositionParams object with the keys:
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
  // * `request` An {Object} with the AutoComplete+ request to use.
  //
  // Returns an {Array} of AutoComplete+ suggestions.
  // Returns an {AutocompletionResponse} object containing AutoComplete+ suggestions and an
  // indication if the list is complete.
  static completionItemsToSuggestions(
    completionItems: Array<CompletionItem> | CompletionList,
    request: atom$AutocompleteRequest,
  ): AutocompletionResponse {
    let extractedCompletions;
    let isComplete;
    if (Array.isArray(completionItems)) {
      extractedCompletions = completionItems;
      isComplete = true;
    } else {
      extractedCompletions = completionItems.items || [];
      isComplete = !completionItems.isIncomplete;
    }

    return {
      isComplete,
      completionItems: extractedCompletions
      .sort((a, b) => (a.sortText || a.label).localeCompare(b.sortText || b.label))
      .map(s => AutocompleteAdapter.completionItemToSuggestion(s, request)),
    };
  }

  // Public: Convert a language server protocol CompletionItem to an AutoComplete+ suggestion.
  //
  // * `item` An {Array} of {CompletionItem} objects or a {CompletionList} containing completion
  //             items to be converted.
  // * `request` An {Object} with the AutoComplete+ request to use.
  //
  // Returns an AutoComplete+ suggestion.
  static completionItemToSuggestion(
    item: CompletionItem,
    request: atom$AutocompleteRequest,
  ): atom$AutocompleteSuggestion {
    const suggestion = AutocompleteAdapter.basicCompletionItemToSuggestion(item);
    AutocompleteAdapter.applyTextEditToSuggestion(item.textEdit, request.editor, suggestion);
    return suggestion;
  }

  // Public: Convert the primary parts of a language server protocol CompletionItem to an AutoComplete+ suggestion.
  //
  // * `item` An {Array} of {CompletionItem} objects or a {CompletionList} containing completion
  //             items to be converted.
  //
  // Returns an AutoComplete+ suggestion.
  static basicCompletionItemToSuggestion(item: CompletionItem): atom$AutocompleteSuggestion {
    return {
      text: item.insertText || item.label,
      displayText: item.label,
      filterText: item.filterText || item.label,
      snippet: item.insertTextFormat === 2 ? item.insertText : undefined,
      type: AutocompleteAdapter.completionKindToSuggestionType(item.kind),
      rightLabel: item.detail,
      description: item.documentation,
      descriptionMarkdown: item.documentation,
    };
  }

  // Public: Applies the textEdit part of a language server protocol CompletionItem to an
  // AutoComplete+ Suggestion via the replacementPrefix and text properties.
  //
  // * `textEdit` A {TextEdit} from a CompletionItem to apply.
  // * `editor` An Atom {TextEditor} used to obtain the necessary text replacement.
  // * `suggestion` An AutoComplete+ suggestion to set the replacementPrefix and text properties of.
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
