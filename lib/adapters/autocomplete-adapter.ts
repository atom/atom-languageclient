import {
  CompletionItemKind,
  CompletionTriggerKind,
  InsertTextFormat,
  LanguageClientConnection,
  CompletionContext,
  CompletionItem,
  CompletionList,
  CompletionParams,
  ServerCapabilities,
  TextEdit,
} from '../languageclient';
import {
  AutocompleteSuggestion,
  AutocompleteRequest,
  Point,
  TextEditor,
} from 'atom';
import { CancellationTokenSource } from 'vscode-jsonrpc';
import { ActiveServer } from '../server-manager';
import Convert from '../convert';
import { filter } from 'fuzzaldrin-plus';
import Utils from '../utils';

interface SuggestionCacheEntry {
  isIncomplete: boolean;
  triggerPoint: Point;
  triggerChar: string | null;
  suggestionMap: Map<AutocompleteSuggestion, [CompletionItem, boolean]>;
}

// Public: Adapts the language server protocol "textDocument/completion" to the Atom
// AutoComplete+ package.
export default class AutocompleteAdapter {
  public static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.completionProvider != null;
  }

  public static canResolve(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.completionProvider != null &&
      serverCapabilities.completionProvider.resolveProvider === true;
  }

  private _suggestionCache: WeakMap<ActiveServer, SuggestionCacheEntry> = new WeakMap();
  private _cancellationTokens: WeakMap<LanguageClientConnection, CancellationTokenSource> = new WeakMap();

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
  public async getSuggestions(
    server: ActiveServer,
    request: AutocompleteRequest,
    onDidConvertCompletionItem?: (item: CompletionItem, suggestion: AutocompleteSuggestion,
                                  request: AutocompleteRequest) => void,
  ): Promise<AutocompleteSuggestion[]> {
    const triggerChars =
      server.capabilities.completionProvider != null ?
        server.capabilities.completionProvider.triggerCharacters || [] : [];
    const triggerChar = AutocompleteAdapter.getTriggerCharacter(request, triggerChars);
    const triggerPoint = AutocompleteAdapter.getTriggerPoint(request, triggerChars);
    const prefixWithTrigger = triggerChar + request.prefix;
    const cache = this._suggestionCache.get(server);

    // Do we have complete cached suggestions that are still valid for this request
    if (cache && !cache.isIncomplete && cache.triggerChar === triggerChar && cache.triggerPoint.isEqual(triggerPoint)) {
      const suggestions = Array.from(cache.suggestionMap.keys());
      AutocompleteAdapter.setReplacementPrefixOnSuggestions(suggestions, request.prefix);
      return prefixWithTrigger.length === 1 ? suggestions : filter(suggestions, request.prefix, {key: 'text'});
    }

    // Our cached suggestions can't be used so obtain new ones from the language server
    const completions =
      await Utils.doWithCancellationToken(
        server.connection,
        this._cancellationTokens,
        (cancellationToken) =>
          server.connection.completion(
            AutocompleteAdapter.createCompletionParams(request, triggerChar), cancellationToken),
    );
    const isIncomplete = !Array.isArray(completions) && completions.isIncomplete;
    const suggestionMap = this.completionItemsToSuggestions(completions, request, onDidConvertCompletionItem);
    this._suggestionCache.set(server, {isIncomplete, triggerChar, triggerPoint, suggestionMap});
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
  public async completeSuggestion(
    server: ActiveServer,
    suggestion: AutocompleteSuggestion,
    request: AutocompleteRequest,
    onDidConvertCompletionItem?: (item: CompletionItem, suggestion: AutocompleteSuggestion,
                                  request: AutocompleteRequest) => void,
  ): Promise<AutocompleteSuggestion> {
    const cache = this._suggestionCache.get(server);
    if (cache) {
      const originalCompletionItem = cache.suggestionMap.get(suggestion);
      if (originalCompletionItem != null && originalCompletionItem[1] === false) {
        const resolvedCompletionItem = await server.connection.completionItemResolve(originalCompletionItem[0]);
        if (resolvedCompletionItem != null) {
          AutocompleteAdapter.completionItemToSuggestion(
            resolvedCompletionItem, suggestion, request, onDidConvertCompletionItem);
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
  public static setReplacementPrefixOnSuggestions(suggestions: AutocompleteSuggestion[], prefix: string): void {
    for (const suggestion of suggestions) {
      suggestion.replacementPrefix = prefix;
    }
  }

  // Public: Get the trigger character that caused the autocomplete (if any).  This is required because
  // AutoComplete-plus does not have trigger characters.  Although the terminology is 'character' we treat
  // them as variable length strings as this will almost certainly change in the future to support '->' etc.
  //
  // * `request` An {Array} of {atom$AutocompleteSuggestion}s to locate the prefix, editor, bufferPosition etc.
  // * `triggerChars` The {Array} of {string}s that can be trigger characters.
  //
  // Returns a {string} containing the matching trigger character or null if one was not matched.
  public static getTriggerCharacter(request: AutocompleteRequest, triggerChars: string[]): string | null {
    // AutoComplete-Plus considers text after a symbol to be a new trigger. So we should look backward
    // from the current cursor position to see if one is there and thus simulate it.
    const buffer = request.editor.getBuffer();
    const cursor = request.bufferPosition;
    const prefixStartColumn = cursor.column - request.prefix.length;
    for (const triggerChar of triggerChars) {
      if (triggerChar === request.prefix) {
        return triggerChar;
      }
      if (prefixStartColumn >= triggerChar.length) { // Far enough along a line to fit the trigger char
        const start = new Point(cursor.row, prefixStartColumn - triggerChar.length);
        const possibleTrigger = buffer.getTextInRange([start, [cursor.row, prefixStartColumn]]);
        if (possibleTrigger === triggerChar) { // The text before our trigger is a trigger char!
          return triggerChar;
        }
      }
    }

    // There was no explicit trigger char
    return null;
  }

  // Public: Get the range of the prefix with any additional matching known trigger character.
  //
  // * `request` An {Array} of {atom$AutocompleteSuggestion}s to locate the prefix, editor, bufferPosition etc.
  // * `triggerChars` The {Array} of {string}s that can be trigger characters.
  //
  // Returns an {atom$Point} where the trigger occurred.
  public static getTriggerPoint(request: AutocompleteRequest, triggerChars: string[]): Point {
    const cursor = request.bufferPosition;

    // Is just the trigger character, no additional prefix
    if (triggerChars.includes(request.prefix)) {
      return new Point(cursor.row, cursor.column - 1);
    }

    // AutoComplete-Plus considers text after a symbol to be a new trigger. So we should look backward
    // from the current text to see if there was a trigger as a previous prefix as LSP cares.
    const buffer = request.editor.getBuffer();
    const prefixStartColumn = cursor.column - request.prefix.length;
    for (const triggerChar of triggerChars) {
      if (prefixStartColumn >= triggerChar.length) {
        const start = new Point(cursor.row, prefixStartColumn - triggerChar.length);
        const possibleTrigger = buffer.getTextInRange([start, [cursor.row, prefixStartColumn]]);
        if (possibleTrigger === triggerChar) {
          return start;
        }
      }
    }

    // There was no explicit trigger character
    return new Point(cursor.row, cursor.column - request.prefix.length);
  }

  // Public: Create TextDocumentPositionParams to be sent to the language server
  // based on the editor and position from the AutoCompleteRequest.
  //
  // * `request` The {atom$AutocompleteRequest} to obtain the editor from.
  // * `triggerPoint` The {atom$Point} where the trigger started.
  //
  // Returns a {string} containing the prefix including the trigger character.
  public static getPrefixWithTrigger(request: AutocompleteRequest, triggerPoint: Point): string {
    return request.editor
      .getBuffer()
      .getTextInRange([[triggerPoint.row, triggerPoint.column], request.bufferPosition]);
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
  public static createCompletionParams(
    request: AutocompleteRequest, triggerCharacter: string | null): CompletionParams {
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
  public static createCompletionContext(triggerCharacter: string | null): CompletionContext {
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
  public completionItemsToSuggestions(
    completionItems: CompletionItem[] | CompletionList,
    request: AutocompleteRequest,
    onDidConvertCompletionItem?: (item: CompletionItem, suggestion: AutocompleteSuggestion,
                                  request: AutocompleteRequest) => void,
  ): Map<AutocompleteSuggestion, [CompletionItem, boolean]> {
    return new Map((Array.isArray(completionItems) ? completionItems : completionItems.items || [])
      .sort((a, b) => (a.sortText || a.label).localeCompare(b.sortText || b.label))
      .map<[AutocompleteSuggestion, [CompletionItem, boolean]]>(
        (s) => [
          AutocompleteAdapter.completionItemToSuggestion(s, { }, request, onDidConvertCompletionItem),
          [s, false]]));
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
  public static completionItemToSuggestion(
    item: CompletionItem,
    suggestion: AutocompleteSuggestion,
    request: AutocompleteRequest,
    onDidConvertCompletionItem?: (item: CompletionItem, suggestion: AutocompleteSuggestion,
                                  request: AutocompleteRequest) => void,
  ): AutocompleteSuggestion {
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
  public static applyCompletionItemToSuggestion(item: CompletionItem, suggestion: AutocompleteSuggestion) {
    suggestion.text = item.insertText || item.label;
    suggestion.displayText = item.label;
    suggestion.type = AutocompleteAdapter.completionKindToSuggestionType(item.kind);
    suggestion.rightLabel = item.detail;

    if (typeof item.documentation === 'object') {
      suggestion.descriptionMarkdown = item.documentation.value;
      suggestion.description = item.documentation.value;
    }
    else {
      suggestion.descriptionMarkdown = item.documentation;
      suggestion.description = item.documentation;
    }
  }

  // Public: Applies the textEdit part of a language server protocol CompletionItem to an
  // AutoComplete+ Suggestion via the replacementPrefix and text properties.
  //
  // * `textEdit` A {TextEdit} from a CompletionItem to apply.
  // * `editor` An Atom {TextEditor} used to obtain the necessary text replacement.
  // * `suggestion` An {atom$AutocompleteSuggestion} to set the replacementPrefix and text properties of.
  public static applyTextEditToSuggestion(
    textEdit: TextEdit | undefined,
    editor: TextEditor,
    suggestion: AutocompleteSuggestion,
  ): void {
    if (textEdit) {
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
  public static applySnippetToSuggestion(item: CompletionItem, suggestion: AutocompleteSuggestion): void {
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
  public static completionKindToSuggestionType(kind: number | undefined): string {
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
