// @flow

import {LanguageClientConnection, CompletionItemKind} from '../languageclient';
import type {CompletionItem, CompletionList} from '../languageclient';
import Convert from '../convert';

export default class AutocompleteAdapter {
  _lc: LanguageClientConnection;

  constructor(languageClient: LanguageClientConnection) {
    this._lc = languageClient;
  }

  async getSuggestions(request: atom$AutocompleteRequest): Promise<Array<atom$AutocompleteSuggestion>> {
    const completionItems = await this._lc.completion({
      textDocument: Convert.editorToTextDocumentIdentifier(request.editor),
      position: Convert.pointToPosition(request.bufferPosition)
    });
    return AutocompleteAdapter.completionItemsToSuggestions(completionItems, request);
  }

  static completionItemsToSuggestions(completionItems: Array<CompletionItem> | CompletionList, request: atom$AutocompleteRequest): Array<atom$AutocompleteSuggestion> {
    return (Array.isArray(completionItems) ? completionItems : completionItems.items || [])
      .map(s => AutocompleteAdapter.completionItemToSuggestion(s, request));
  }

  static completionItemToSuggestion(item: CompletionItem, request: atom$AutocompleteRequest): atom$AutocompleteSuggestion {
    let suggestion: atom$AutocompleteSuggestion = {
      text: item.insertText || item.label,
      displayText: item.label,
      filterText: item.filterText || item.label,
      type: AutocompleteAdapter.completionKindToSuggestionType(item.kind),
      description: item.detail,
      descriptionMoreURL: item.documentation,
    };

    if (item.textEdit) {
      const {range, newText} = item.textEdit;
      suggestion.replacementPrefix = request.editor.getTextInBufferRange(Convert.lsRangeToAtomRange(range));
      suggestion.text = newText;
    }

    // TODO: Snippets
    return suggestion;
  }

  static completionKindToSuggestionType(kind: ?number): string {
    switch(kind) {
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
