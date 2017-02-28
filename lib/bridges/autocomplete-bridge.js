// @flow

import * as ls from '../protocol/languageclient-v2';
import Convert from '../convert';

export default class AutocompleteBridge
{
  _lc: ls.LanguageClientV2;

  constructor(languageClient: ls.LanguageClientV2) {
    this._lc = languageClient;
  }

  dispose(): void {
  }

  async provideSuggestions(request: atom$AutocompleteRequest): Promise<Array<atom$AutocompleteSuggestion>> {
    const suggestions = await this._lc.completion({
      textDocument: Convert.editorToTextDocumentIdentifier(request.editor),
      position: Convert.pointToPosition(request.bufferPosition)
    });
    return (Array.isArray(suggestions) ? suggestions : suggestions.items || [])
      .map(s => AutocompleteBridge.completionItemToSuggestion(s, request));
  }

  static completionItemToSuggestion(item: ls.CompletionItem, request: atom$AutocompleteRequest): atom$AutocompleteSuggestion {
    let suggestion: atom$AutocompleteSuggestion = {
      text: item.insertText || item.label,
      displayText: item.label,
      filterText: item.filterText || item.label,
      type: AutocompleteBridge.completionKindToSuggestionType(item.kind),
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
      case ls.CompletionItemKind.Method:
        return 'method';
      case ls.CompletionItemKind.Function:
      case ls.CompletionItemKind.Constructor:
        return 'function';
      case ls.CompletionItemKind.Field:
      case ls.CompletionItemKind.Property:
        return 'property';
      case ls.CompletionItemKind.Variable:
        return 'variable';
      case ls.CompletionItemKind.Class:
        return 'class';
      case ls.CompletionItemKind.Interface:
        return 'interface';
      case ls.CompletionItemKind.Module:
        return 'module';
      case ls.CompletionItemKind.Unit:
        return 'builtin';
      case ls.CompletionItemKind.Enum:
        return 'enum';
      case ls.CompletionItemKind.Keyword:
        return 'keyword';
      case ls.CompletionItemKind.Snippet:
        return 'snippet';
      case ls.CompletionItemKind.File:
        return 'import';
      case ls.CompletionItemKind.Reference:
        return 'require';
      case ls.CompletionItemKind.Color:
      case ls.CompletionItemKind.Text:
      case ls.CompletionItemKind.Value:
      default:
        return 'value';
    }
  }
}
