// @flow

import {LanguageClientConnection, CompletionItemKind, type CompletionItem, type CompletionList,
  type TextDocumentPositionParams, type TextEdit, type ServerCapabilities} from '../languageclient';
import Convert from '../convert';

import {filter} from 'fuzzaldrin';

export default class AutocompleteAdapter {
  static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.completionProvider != null;
  }

  async getSuggestions(connection: LanguageClientConnection, request: atom$AutocompleteRequest): Promise<Array<atom$AutocompleteSuggestion>> {
    const completionItems = await connection.completion(AutocompleteAdapter.requestToTextDocumentPositionParams(request));
    return AutocompleteAdapter.completionItemsToSuggestions(completionItems, request);
  }

  static requestToTextDocumentPositionParams(request: atom$AutocompleteRequest): TextDocumentPositionParams {
    return {
      textDocument: Convert.editorToTextDocumentIdentifier(request.editor),
      position: Convert.pointToPosition(request.bufferPosition),
    };
  }

  static completionItemsToSuggestions(completionItems: Array<CompletionItem> | CompletionList, request: atom$AutocompleteRequest): Array<atom$AutocompleteSuggestion> {
    return filter(
      (Array.isArray(completionItems) ? completionItems : completionItems.items || [])
        .map(s => AutocompleteAdapter.completionItemToSuggestion(s, request)),
      request.prefix,
      {key: 'filterText'}
    );
  }

  static completionItemToSuggestion(item: CompletionItem, request: atom$AutocompleteRequest): atom$AutocompleteSuggestion {
    const suggestion = AutocompleteAdapter.basicCompletionItemToSuggestion(item);
    AutocompleteAdapter.applyTextEditToSuggestion(item.textEdit, request.editor, suggestion);
    // TODO: Snippets
    return suggestion;
  }

  static basicCompletionItemToSuggestion(item: CompletionItem): atom$AutocompleteSuggestion {
    return {
      text: item.insertText || item.label,
      displayText: item.label,
      filterText: item.filterText || item.label,
      type: AutocompleteAdapter.completionKindToSuggestionType(item.kind),
      description: item.detail,
      descriptionMoreURL: item.documentation,
    };
  }

  static applyTextEditToSuggestion(textEdit: ?TextEdit, editor: atom$TextEditor, suggestion: atom$AutocompleteSuggestion) {
    if (textEdit != null) {
      suggestion.replacementPrefix = editor.getTextInBufferRange(Convert.lsRangeToAtomRange(textEdit.range));
      suggestion.text = textEdit.newText;
    }
  }

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
