import Convert from '../convert';
import * as Utils from '../utils';
import { CancellationTokenSource } from 'vscode-jsonrpc';
import { ActiveServer } from '../server-manager';
import { filter } from 'fuzzaldrin-plus';
import {
  CompletionContext,
  CompletionItem,
  CompletionItemKind,
  CompletionList,
  CompletionParams,
  CompletionTriggerKind,
  InsertTextFormat,
  LanguageClientConnection,
  ServerCapabilities,
  TextEdit,
} from '../languageclient';
import {
  Point,
  TextEditor,
} from 'atom';
import * as ac from 'atom/autocomplete-plus';

interface SuggestionCacheEntry {
  isIncomplete: boolean;
  triggerPoint: Point;
  triggerChar: string;
  triggerPrefix: string;
  suggestionMap: Map<ac.AnySuggestion, PossiblyResolvedCompletionItem>;

  // Original replacement prefixes as returned by the LSP server.
  //
  // If the server used the `textEdit` field, this value will be non-null.
  // Otherwise, it means that the server did not give us an explicit replacement
  // prefix, and therefore this value will be null.
  originalReplacementPrefixMap: Map<ac.AnySuggestion, string | null>;
}

type CompletionItemAdjuster =
  (item: CompletionItem, suggestion: ac.AnySuggestion, request: ac.SuggestionsRequestedEvent) => void;

class PossiblyResolvedCompletionItem {
  constructor(
    public completionItem: CompletionItem,
    public isResolved: boolean,
  ) {
  }
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
    request: ac.SuggestionsRequestedEvent,
    onDidConvertCompletionItem?: CompletionItemAdjuster,
    minimumWordLength?: number,
  ): Promise<ac.AnySuggestion[]> {
    const triggerChars = server.capabilities.completionProvider != null
      ? server.capabilities.completionProvider.triggerCharacters || []
      : [];

    // triggerOnly is true if we have just typed in the trigger character, and is false if we
    // have typed additional characters following the trigger character.
    const [triggerChar, triggerOnly] = AutocompleteAdapter.getTriggerCharacter(request, triggerChars);

    if (!this.shouldTrigger(request, triggerChar, minimumWordLength || 0)) {
      return [];
    }

    // Get the suggestions either from the cache or by calling the language server
    const suggestions = await
      this.getOrBuildSuggestions(server, request, triggerChar, triggerOnly, onDidConvertCompletionItem);

    // Force unwrapping here is okay since this.getOrBuildSuggestions ensured that the following get()
    // would not return undefined.
    const cache = this._suggestionCache.get(server)!;
    // As the user types more characters to refine filter we must replace those characters on acceptance
    const replacementPrefix = (triggerChar !== '' && triggerOnly) ? '' : request.prefix;
    const originalReplacementPrefixMap = cache.originalReplacementPrefixMap;
    for (const suggestion of suggestions) {
      // Force unwrapping here is okay for similar reasons as in the comment above.
      const originalReplacementPrefix = originalReplacementPrefixMap.get(suggestion);
      if (originalReplacementPrefix) {
        // The server gave us a replacement prefix via the `textEdit` field, which we must honor. However,
        // we also need to append the extra bits that the user has typed since we made the initial request.
        const extraReplacementPrefix = replacementPrefix.substr(cache.triggerPrefix.length);
        suggestion.replacementPrefix = originalReplacementPrefix + extraReplacementPrefix;
      } else {
        suggestion.replacementPrefix = replacementPrefix;
      }
    }

    const filtered = !(request.prefix === "" || (triggerChar !== '' && triggerOnly));
    return filtered ? filter(suggestions, request.prefix, { key: 'text' }) : suggestions;
  }

  private shouldTrigger(
    request: ac.SuggestionsRequestedEvent,
    triggerChar: string,
    minWordLength: number,
  ): boolean {
    return request.activatedManually
      || triggerChar !== ''
      || minWordLength <= 0
      || request.prefix.length >= minWordLength;
  }

  private async getOrBuildSuggestions(
    server: ActiveServer,
    request: ac.SuggestionsRequestedEvent,
    triggerChar: string,
    triggerOnly: boolean,
    onDidConvertCompletionItem?: CompletionItemAdjuster,
  ): Promise<ac.AnySuggestion[]> {
    const cache = this._suggestionCache.get(server);

    const triggerColumn = (triggerChar !== '' && triggerOnly)
      ? request.bufferPosition.column - triggerChar.length
      : request.bufferPosition.column - request.prefix.length - triggerChar.length;
    const triggerPoint = new Point(request.bufferPosition.row, triggerColumn);

    // Do we have complete cached suggestions that are still valid for this request?
    if (cache && !cache.isIncomplete && cache.triggerChar === triggerChar
      && cache.triggerPoint.isEqual(triggerPoint)) {
      return Array.from(cache.suggestionMap.keys());
    }

    // Our cached suggestions can't be used so obtain new ones from the language server
    const completions = await Utils.doWithCancellationToken(server.connection, this._cancellationTokens,
      (cancellationToken) => server.connection.completion(
        AutocompleteAdapter.createCompletionParams(request, triggerChar, triggerOnly), cancellationToken),
    );

    // Setup the cache for subsequent filtered results
    const isComplete = completions == null || Array.isArray(completions) || completions.isIncomplete === false;
    const suggestionMap = this.completionItemsToSuggestions(completions, request, onDidConvertCompletionItem);
    const originalReplacementPrefixMap = new Map<ac.AnySuggestion, string>(
      Array.from(suggestionMap.keys()).map<[ac.AnySuggestion, string]>(
        (suggestion) => [suggestion, suggestion.replacementPrefix || ''],
      ),
    );

    this._suggestionCache.set(server, {
      isIncomplete: !isComplete,
      triggerChar,
      triggerPoint,
      triggerPrefix: (triggerChar !== '' && triggerOnly) ? '' : request.prefix,
      suggestionMap,
      originalReplacementPrefixMap,
    });

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
    suggestion: ac.AnySuggestion,
    request: ac.SuggestionsRequestedEvent,
    onDidConvertCompletionItem?: CompletionItemAdjuster,
  ): Promise<ac.AnySuggestion> {
    const cache = this._suggestionCache.get(server);
    if (cache) {
      const possiblyResolvedCompletionItem = cache.suggestionMap.get(suggestion);
      if (possiblyResolvedCompletionItem != null && possiblyResolvedCompletionItem.isResolved === false) {
        const resolvedCompletionItem = await
          server.connection.completionItemResolve(possiblyResolvedCompletionItem.completionItem);
        if (resolvedCompletionItem != null) {
          AutocompleteAdapter.completionItemToSuggestion(
            resolvedCompletionItem, suggestion, request, onDidConvertCompletionItem);
          possiblyResolvedCompletionItem.isResolved = true;
        }
      }
    }
    return suggestion;
  }

  // Public: Get the trigger character that caused the autocomplete (if any).  This is required because
  // AutoComplete-plus does not have trigger characters.  Although the terminology is 'character' we treat
  // them as variable length strings as this will almost certainly change in the future to support '->' etc.
  //
  // * `request` An {Array} of {atom$AutocompleteSuggestion}s to locate the prefix, editor, bufferPosition etc.
  // * `triggerChars` The {Array} of {string}s that can be trigger characters.
  //
  // Returns a [{string}, boolean] where the string is the matching trigger character or an empty string
  // if one was not matched, and the boolean is true if the trigger character is in request.prefix, and false
  // if it is in the word before request.prefix. The boolean return value has no meaning if the string return
  // value is an empty string.
  public static getTriggerCharacter(
    request: ac.SuggestionsRequestedEvent,
    triggerChars: string[],
  ): [string, boolean] {
    // AutoComplete-Plus considers text after a symbol to be a new trigger. So we should look backward
    // from the current cursor position to see if one is there and thus simulate it.
    const buffer = request.editor.getBuffer();
    const cursor = request.bufferPosition;
    const prefixStartColumn = cursor.column - request.prefix.length;
    for (const triggerChar of triggerChars) {
      if (request.prefix.endsWith(triggerChar)) {
        return [triggerChar, true];
      }
      if (prefixStartColumn >= triggerChar.length) { // Far enough along a line to fit the trigger char
        const start = new Point(cursor.row, prefixStartColumn - triggerChar.length);
        const possibleTrigger = buffer.getTextInRange([start, [cursor.row, prefixStartColumn]]);
        if (possibleTrigger === triggerChar) { // The text before our trigger is a trigger char!
          return [triggerChar, false];
        }
      }
    }

    // There was no explicit trigger char
    return ['', false];
  }

  // Public: Create TextDocumentPositionParams to be sent to the language server
  // based on the editor and position from the AutoCompleteRequest.
  //
  // * `request` The {atom$AutocompleteRequest} to obtain the editor from.
  // * `triggerPoint` The {atom$Point} where the trigger started.
  //
  // Returns a {string} containing the prefix including the trigger character.
  public static getPrefixWithTrigger(
    request: ac.SuggestionsRequestedEvent,
    triggerPoint: Point,
  ): string {
    return request.editor
      .getBuffer()
      .getTextInRange([[triggerPoint.row, triggerPoint.column], request.bufferPosition]);
  }

  // Public: Create {CompletionParams} to be sent to the language server
  // based on the editor and position from the Autocomplete request etc.
  //
  // * `request` The {atom$AutocompleteRequest} containing the request details.
  // * `triggerCharacter` The {string} containing the trigger character (empty if none).
  // * `triggerOnly` A {boolean} representing whether this completion is triggered right after a trigger character.
  //
  // Returns an {CompletionParams} with the keys:
  //  * `textDocument` the language server protocol textDocument identification.
  //  * `position` the position within the text document to display completion request for.
  //  * `context` containing the trigger character and kind.
  public static createCompletionParams(
    request: ac.SuggestionsRequestedEvent,
    triggerCharacter: string,
    triggerOnly: boolean,
  ): CompletionParams {
    return {
      textDocument: Convert.editorToTextDocumentIdentifier(request.editor),
      position: Convert.pointToPosition(request.bufferPosition),
      context: AutocompleteAdapter.createCompletionContext(triggerCharacter, triggerOnly),
    };
  }

  // Public: Create {CompletionContext} to be sent to the language server
  // based on the trigger character.
  //
  // * `triggerCharacter` The {string} containing the trigger character or '' if none.
  // * `triggerOnly` A {boolean} representing whether this completion is triggered right after a trigger character.
  //
  // Returns an {CompletionContext} that specifies the triggerKind and the triggerCharacter
  // if there is one.
  public static createCompletionContext(triggerCharacter: string, triggerOnly: boolean): CompletionContext {
    if (triggerCharacter === '') {
      return { triggerKind: CompletionTriggerKind.Invoked };
    } else {
      return triggerOnly
        ? { triggerKind: CompletionTriggerKind.TriggerCharacter, triggerCharacter }
        : { triggerKind: CompletionTriggerKind.TriggerForIncompleteCompletions, triggerCharacter };
    }
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
    completionItems: CompletionItem[] | CompletionList | null,
    request: ac.SuggestionsRequestedEvent,
    onDidConvertCompletionItem?: CompletionItemAdjuster,
  ): Map<ac.AnySuggestion, PossiblyResolvedCompletionItem> {
    return new Map((Array.isArray(completionItems) ? completionItems : (completionItems && completionItems.items || []))
      .sort((a, b) => (a.sortText || a.label).localeCompare(b.sortText || b.label))
      .map<[ac.AnySuggestion, PossiblyResolvedCompletionItem]>(
        (s) => [
          AutocompleteAdapter.completionItemToSuggestion(
            s, {} as ac.AnySuggestion, request, onDidConvertCompletionItem),
          new PossiblyResolvedCompletionItem(s, false)]));
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
    suggestion: ac.AnySuggestion,
    request: ac.SuggestionsRequestedEvent,
    onDidConvertCompletionItem?: CompletionItemAdjuster,
  ): ac.AnySuggestion {
    AutocompleteAdapter.applyCompletionItemToSuggestion(item, suggestion as ac.TextSuggestion);
    AutocompleteAdapter.applyTextEditToSuggestion(item.textEdit, request.editor, suggestion as ac.TextSuggestion);
    AutocompleteAdapter.applySnippetToSuggestion(item, suggestion as ac.SnippetSuggestion);
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
  public static applyCompletionItemToSuggestion(
    item: CompletionItem,
    suggestion: ac.TextSuggestion,
  ) {
    suggestion.text = item.insertText || item.label;
    suggestion.displayText = item.label;
    suggestion.type = AutocompleteAdapter.completionKindToSuggestionType(item.kind);
    suggestion.rightLabel = item.detail;

    // Older format, can't know what it is so assign to both and hope for best
    if (typeof (item.documentation) === 'string') {
      suggestion.descriptionMarkdown = item.documentation;
      suggestion.description = item.documentation;
    }

    if (item.documentation != null && typeof (item.documentation) === 'object') {
      // Newer format specifies the kind of documentation, assign appropriately
      if (item.documentation.kind === 'markdown') {
        suggestion.descriptionMarkdown = item.documentation.value;
      } else {
        suggestion.description = item.documentation.value;
      }
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
    suggestion: ac.TextSuggestion,
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
  public static applySnippetToSuggestion(item: CompletionItem, suggestion: ac.SnippetSuggestion): void {
    if (item.insertTextFormat === InsertTextFormat.Snippet) {
      suggestion.snippet = item.textEdit != null ? item.textEdit.newText : (item.insertText || '');
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
