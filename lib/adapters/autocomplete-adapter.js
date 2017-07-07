// @flow

import {
  CompletionItemKind,
  LanguageClientConnection,
  type CompletionItem,
  type CompletionList,
  type TextDocumentPositionParams,
  type TextEdit,
  type ServerCapabilities
} from '../languageclient';
import Convert from '../convert';

// Public: Adapts the language server protocol "textDocument/completion" to the Atom
// AutoComplete+ package.
export default class AutocompleteAdapter {
  static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.completionProvider != null;
  }

  // Public: Primary entry point for obtaining suggestions for AutoComplete+ by
  // querying the language server.
  //
  // * `connection` A {LanguageClientConnection} to the language server to query.
  // * `request` An {Object} with the AutoComplete+ request to satisfy.
  //
  // Returns a {Promise} of an {Array} of {Object}s containing the AutoComplete+
  // suggestions to display.
  async getSuggestions(connection: LanguageClientConnection, request: atom$AutocompleteRequest): Promise<Array<atom$AutocompleteSuggestion>> {
    const completionItems = await connection.completion(AutocompleteAdapter.requestToTextDocumentPositionParams(request));
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
  // an array of AutoComplete+ suggestions.
  //
  // * `completionItems` An {Array} of {CompletionItem} objects or a {CompletionList} containing completion
  //           items to be converted.
  // * `request` An {Object} with the AutoComplete+ request to use.
  //
  // Returns an {Array} of AutoComplete+ suggestions.
  static completionItemsToSuggestions(completionItems: Array<CompletionItem> | CompletionList, request: atom$AutocompleteRequest): Array<atom$AutocompleteSuggestion> {
    return (Array.isArray(completionItems) ? completionItems : completionItems.items || [])
      .map(s => AutocompleteAdapter.completionItemToSuggestion(s, request));
  }

  // Public: Convert a language server protocol CompletionItem to an AutoComplete+ suggestion.
  //
  // * `item` An {Array} of {CompletionItem} objects or a {CompletionList} containing completion
  //             items to be converted.
  // * `request` An {Object} with the AutoComplete+ request to use.
  //
  // Returns an AutoComplete+ suggestion.
  static completionItemToSuggestion(item: CompletionItem, request: atom$AutocompleteRequest): atom$AutocompleteSuggestion {
    const suggestion = AutocompleteAdapter.basicCompletionItemToSuggestion(item);
    AutocompleteAdapter.applyTextEditToSuggestion(item.textEdit, request.editor, suggestion);
    // TODO: Snippets
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
      type: AutocompleteAdapter.completionKindToSuggestionType(item.kind),
      leftLabel: item.detail,
      description: item.documentation,
    };
  }

  // Public: Applies the textEdit part of a language server protocol CompletionItem to an
  // AutoComplete+ Suggestion via the replacementPrefix and text properties.
  //
  // * `textEdit` A {TextEdit} from a CompletionItem to apply.
  // * `editor` An Atom {TextEditor} used to obtain the necessary text replacement.
  // * `suggestion` An AutoComplete+ suggestion to set the replacementPrefix and text properties of.
  static applyTextEditToSuggestion(textEdit: ?TextEdit, editor: atom$TextEditor, suggestion: atom$AutocompleteSuggestion): void {
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
