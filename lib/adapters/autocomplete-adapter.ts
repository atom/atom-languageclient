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
import { Suggestion, TextSuggestion, SnippetSuggestion } from 'atom-ide';

/**
 * Holds a list of suggestions generated from the CompletionItem[]
 * list sent by the server, as well as metadata about the context
 * it was collected in
 */
interface SuggestionCacheEntry {
  /** If `true`, the server will send a list of suggestions to replace this one */
  isIncomplete: boolean;
  /** The point left of the first character in the original prefix sent to the server */
  triggerPoint: Point;
  /** The point right of the last character in the original prefix sent to the server */
  originalBufferPoint: Point;
  /** The trigger string that caused the autocomplete (if any) */
  triggerChar: string;
  suggestionMap: Map<Suggestion, PossiblyResolvedCompletionItem>;
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

/**
 * Public: Adapts the language server protocol "textDocument/completion" to the Atom
 * AutoComplete+ package.
 */
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

  /**
   * Public: Obtain suggestion list for AutoComplete+ by querying the language server using
   * the `textDocument/completion` request.
   *
   * @param server An {ActiveServer} pointing to the language server to query.
   * @param request The {atom$AutocompleteRequest} to satisfy.
   * @param onDidConvertCompletionItem An optional function that takes a {CompletionItem},
   *   an {atom$AutocompleteSuggestion} and a {atom$AutocompleteRequest}
   *   allowing you to adjust converted items.
   * @returns A {Promise} of an {Array} of {atom$AutocompleteSuggestion}s containing the
   *   AutoComplete+ suggestions to display.
   */
  public async getSuggestions(
    server: ActiveServer,
    request: ac.SuggestionsRequestedEvent,
    onDidConvertCompletionItem?: CompletionItemAdjuster,
    minimumWordLength?: number,
  ): Promise<ac.AnySuggestion[]> {
    const triggerChars = server.capabilities.completionProvider != null
      ? server.capabilities.completionProvider.triggerCharacters || []
      : [];

    // triggerOnly is true if we have just typed in a trigger character, and is false if we
    // have typed additional characters following a trigger character.
    const [triggerChar, triggerOnly] = AutocompleteAdapter.getTriggerCharacter(request, triggerChars);

    if (!this.shouldTrigger(request, triggerChar, minimumWordLength || 0)) {
      return [];
    }

    // Get the suggestions either from the cache or by calling the language server
    const suggestions = await
      this.getOrBuildSuggestions(server, request, triggerChar, triggerOnly, onDidConvertCompletionItem);

    // We must update the replacement prefix as characters are added and removed
    const cache = this._suggestionCache.get(server)!;
    const replacementPrefix = request.editor.getTextInBufferRange([cache.triggerPoint, request.bufferPosition]);
    for (const suggestion of suggestions) {
      if (suggestion.customReplacmentPrefix) { // having this property means a custom range was provided
        const len = replacementPrefix.length;
        const preReplacementPrefix = suggestion.customReplacmentPrefix
          + replacementPrefix.substring(len + cache.originalBufferPoint.column - request.bufferPosition.column, len);
        // we cannot replace text after the cursor with the current autocomplete-plus API
        // so we will simply ignore it for now
        suggestion.replacementPrefix = preReplacementPrefix;
      } else {
        suggestion.replacementPrefix = replacementPrefix;
      }
    }

    const filtered = !(request.prefix === "" || (triggerChar !== '' && triggerOnly));
    return filtered ? filter(suggestions, request.prefix, { key: 'filterText' }) : suggestions;
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
  ): Promise<Suggestion[]> {
    const cache = this._suggestionCache.get(server);

    const triggerColumn = (triggerChar !== '' && triggerOnly)
      ? request.bufferPosition.column - triggerChar.length
      : request.bufferPosition.column - request.prefix.length - triggerChar.length;
    const triggerPoint = new Point(request.bufferPosition.row, triggerColumn);

    // Do we have complete cached suggestions that are still valid for this request?
    if (cache && !cache.isIncomplete && cache.triggerChar === triggerChar
      && cache.triggerPoint.isEqual(triggerPoint)
      && cache.originalBufferPoint.isLessThanOrEqual(request.bufferPosition)) {
      return Array.from(cache.suggestionMap.keys());
    }

    // Our cached suggestions can't be used so obtain new ones from the language server
    const completions = await Utils.doWithCancellationToken(server.connection, this._cancellationTokens,
      (cancellationToken) => server.connection.completion(
        AutocompleteAdapter.createCompletionParams(request, triggerChar, triggerOnly), cancellationToken),
    );

    // spec guarantees all edits are on the same line, so we only need to check the columns
    const triggerColumns: [number, number] = [triggerPoint.column, request.bufferPosition.column];

    // Setup the cache for subsequent filtered results
    const isComplete = completions === null || Array.isArray(completions) || completions.isIncomplete === false;
    const suggestionMap =
      this.completionItemsToSuggestions(completions, request, triggerColumns, onDidConvertCompletionItem);
    this._suggestionCache.set(server, {
      isIncomplete: !isComplete,
      triggerChar,
      triggerPoint,
      originalBufferPoint: request.bufferPosition,
      suggestionMap,
    });

    return Array.from(suggestionMap.keys());
  }

  /**
   * Public: Obtain a complete version of a suggestion with additional information
   * the language server can provide by way of the `completionItem/resolve` request.
   *
   * @param server An {ActiveServer} pointing to the language server to query.
   * @param suggestion An {atom$AutocompleteSuggestion} suggestion that should be resolved.
   * @param request An {Object} with the AutoComplete+ request to satisfy.
   * @param onDidConvertCompletionItem An optional function that takes a {CompletionItem}, an
   *   {atom$AutocompleteSuggestion} and a {atom$AutocompleteRequest} allowing you to adjust converted items.
   * @returns A {Promise} of an {atom$AutocompleteSuggestion} with the resolved AutoComplete+ suggestion.
   */
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
          AutocompleteAdapter.resolveSuggestion(
            resolvedCompletionItem, suggestion, request, onDidConvertCompletionItem);
          possiblyResolvedCompletionItem.isResolved = true;
        }
      }
    }
    return suggestion;
  }

  public static resolveSuggestion(
    resolvedCompletionItem: CompletionItem,
    suggestion: ac.AnySuggestion,
    request: ac.SuggestionsRequestedEvent,
    onDidConvertCompletionItem?: CompletionItemAdjuster,
  ): void {
    // only the `documentation` and `detail` properties may change when resolving
    AutocompleteAdapter.applyDetailsToSuggestion(resolvedCompletionItem, suggestion);
    if (onDidConvertCompletionItem != null) {
      onDidConvertCompletionItem(resolvedCompletionItem, suggestion as ac.AnySuggestion, request);
    }
  }

  /**
   * Public: Get the trigger character that caused the autocomplete (if any).  This is required because
   * AutoComplete-plus does not have trigger characters.  Although the terminology is 'character' we treat
   * them as variable length strings as this will almost certainly change in the future to support '->' etc.
   *
   * @param request An {Array} of {atom$AutocompleteSuggestion}s to locate the prefix, editor, bufferPosition etc.
   * @param triggerChars The {Array} of {string}s that can be trigger characters.
   * @returns A [{string}, boolean] where the string is the matching trigger character or an empty string
   *   if one was not matched, and the boolean is true if the trigger character is in request.prefix, and false
   *   if it is in the word before request.prefix. The boolean return value has no meaning if the string return
   *   value is an empty string.
   */
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

  /**
   * Public: Create TextDocumentPositionParams to be sent to the language server
   * based on the editor and position from the AutoCompleteRequest.
   *
   * @param request The {atom$AutocompleteRequest} to obtain the editor from.
   * @param triggerPoint The {atom$Point} where the trigger started.
   * @returns A {string} containing the prefix including the trigger character.
   */
  public static getPrefixWithTrigger(
    request: ac.SuggestionsRequestedEvent,
    triggerPoint: Point,
  ): string {
    return request.editor
      .getBuffer()
      .getTextInRange([[triggerPoint.row, triggerPoint.column], request.bufferPosition]);
  }

  /**
   * Public: Create {CompletionParams} to be sent to the language server
   * based on the editor and position from the Autocomplete request etc.
   *
   * @param request The {atom$AutocompleteRequest} containing the request details.
   * @param triggerCharacter The {string} containing the trigger character (empty if none).
   * @param triggerOnly A {boolean} representing whether this completion is triggered right after a trigger character.
   * @returns A {CompletionParams} with the keys:
   *   * `textDocument` the language server protocol textDocument identification.
   *   * `position` the position within the text document to display completion request for.
   *   * `context` containing the trigger character and kind.
   */
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

  /**
   * Public: Create {CompletionContext} to be sent to the language server
   * based on the trigger character.
   *
   * @param triggerCharacter The {string} containing the trigger character or '' if none.
   * @param triggerOnly A {boolean} representing whether this completion is triggered right after a trigger character.
   * @returns An {CompletionContext} that specifies the triggerKind and the triggerCharacter
   *   if there is one.
   */
  public static createCompletionContext(triggerCharacter: string, triggerOnly: boolean): CompletionContext {
    if (triggerCharacter === '') {
      return { triggerKind: CompletionTriggerKind.Invoked };
    } else {
      return triggerOnly
        ? { triggerKind: CompletionTriggerKind.TriggerCharacter, triggerCharacter }
        : { triggerKind: CompletionTriggerKind.TriggerForIncompleteCompletions, triggerCharacter };
    }
  }

  /**
   * Public: Convert a language server protocol CompletionItem array or CompletionList to
   * an array of ordered AutoComplete+ suggestions.
   *
   * @param completionItems An {Array} of {CompletionItem} objects or a {CompletionList} containing completion
   *   items to be converted.
   * @param request The {atom$AutocompleteRequest} to satisfy.
   * @param onDidConvertCompletionItem A function that takes a {CompletionItem}, an {atom$AutocompleteSuggestion}
   *   and a {atom$AutocompleteRequest} allowing you to adjust converted items.
   * @returns A {Map} of AutoComplete+ suggestions ordered by the CompletionItems sortText.
   */
  public completionItemsToSuggestions(
    completionItems: CompletionItem[] | CompletionList | null,
    request: ac.SuggestionsRequestedEvent,
    triggerColumns: [number, number],
    onDidConvertCompletionItem?: CompletionItemAdjuster,
  ): Map<Suggestion, PossiblyResolvedCompletionItem> {
    const completionsArray = Array.isArray(completionItems)
      ? completionItems
      : (completionItems && completionItems.items) || [];
    return new Map(completionsArray
      .sort((a, b) => (a.sortText || a.label).localeCompare(b.sortText || b.label))
      .map<[Suggestion, PossiblyResolvedCompletionItem]>(
        (s) => [
          AutocompleteAdapter.completionItemToSuggestion(
            s, {} as Suggestion, request, triggerColumns, onDidConvertCompletionItem),
          new PossiblyResolvedCompletionItem(s, false),
        ],
      ),
    );
  }

  /**
   * Public: Convert a language server protocol CompletionItem to an AutoComplete+ suggestion.
   *
   * @param item An {CompletionItem} containing a completion item to be converted.
   * @param suggestion A {atom$AutocompleteSuggestion} to have the conversion applied to.
   * @param request The {atom$AutocompleteRequest} to satisfy.
   * @param onDidConvertCompletionItem A function that takes a {CompletionItem}, an {atom$AutocompleteSuggestion}
   *   and a {atom$AutocompleteRequest} allowing you to adjust converted items.
   * @returns The {atom$AutocompleteSuggestion} passed in as suggestion with the conversion applied.
   */
  public static completionItemToSuggestion(
    item: CompletionItem,
    suggestion: Suggestion,
    request: ac.SuggestionsRequestedEvent,
    triggerColumns: [number, number],
    onDidConvertCompletionItem?: CompletionItemAdjuster,
  ): Suggestion {
    AutocompleteAdapter.applyCompletionItemToSuggestion(item, suggestion as TextSuggestion);
    AutocompleteAdapter.applyTextEditToSuggestion(
      item.textEdit, request.editor, triggerColumns, request.bufferPosition, suggestion as TextSuggestion,
    );
    AutocompleteAdapter.applySnippetToSuggestion(item, suggestion as SnippetSuggestion);
    if (onDidConvertCompletionItem != null) {
      onDidConvertCompletionItem(item, suggestion as ac.AnySuggestion, request);
    }

    return suggestion;
  }

  /**
   * Public: Convert the primary parts of a language server protocol CompletionItem to an AutoComplete+ suggestion.
   *
   * @param item An {CompletionItem} containing the completion items to be merged into.
   * @param suggestion The {Suggestion} to merge the conversion into.
   * @returns The {Suggestion} with details added from the {CompletionItem}.
   */
  public static applyCompletionItemToSuggestion(
    item: CompletionItem,
    suggestion: TextSuggestion,
  ): void {
    suggestion.text = item.insertText || item.label;
    suggestion.filterText = item.filterText || item.label;
    suggestion.displayText = item.label;
    suggestion.type = AutocompleteAdapter.completionKindToSuggestionType(item.kind);
    AutocompleteAdapter.applyDetailsToSuggestion(item, suggestion);
  }

  public static applyDetailsToSuggestion(
    item: CompletionItem,
    suggestion: Suggestion,
  ): void {
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

  /**
   * Public: Applies the textEdit part of a language server protocol CompletionItem to an
   * AutoComplete+ Suggestion via the replacementPrefix and text properties.
   *
   * @param textEdit A {TextEdit} from a CompletionItem to apply.
   * @param editor An Atom {TextEditor} used to obtain the necessary text replacement.
   * @param suggestion An {atom$AutocompleteSuggestion} to set the replacementPrefix and text properties of.
   */
  public static applyTextEditToSuggestion(
    textEdit: TextEdit | undefined,
    editor: TextEditor,
    triggerColumns: [number, number],
    originalBufferPosition: Point,
    suggestion: TextSuggestion,
  ): void {
    if (!textEdit) { return; }
    if (textEdit.range.start.character !== triggerColumns[0]) {
      const range = Convert.lsRangeToAtomRange(textEdit.range);
      suggestion.customReplacmentPrefix = editor.getTextInBufferRange([range.start, originalBufferPosition]);
    }
    suggestion.text = textEdit.newText;
  }

  /**
   * Public: Adds a snippet to the suggestion if the CompletionItem contains
   * snippet-formatted text
   *
   * @param item An {CompletionItem} containing the completion items to be merged into.
   * @param suggestion The {atom$AutocompleteSuggestion} to merge the conversion into.
   */
  public static applySnippetToSuggestion(item: CompletionItem, suggestion: SnippetSuggestion): void {
    if (item.insertTextFormat === InsertTextFormat.Snippet) {
      suggestion.snippet = item.textEdit != null ? item.textEdit.newText : (item.insertText || '');
    }
  }

  /**
   * Public: Obtain the textual suggestion type required by AutoComplete+ that
   * most closely maps to the numeric completion kind supplies by the language server.
   *
   * @param kind A {Number} that represents the suggestion kind to be converted.
   * @returns A {String} containing the AutoComplete+ suggestion type equivalent
   *   to the given completion kind.
   */
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
