// @flow

import AutoCompleteAdapter from '../../lib/adapters/autocomplete-adapter';
import * as ls from '../../lib/languageclient';
import sinon from 'sinon';
import {Point, Range, TextEditor} from 'atom';
import {expect} from 'chai';
import {createSpyConnection, createFakeEditor} from '../helpers.js';

describe('AutoCompleteAdapter', () => {
  beforeEach(() => {
    global.sinon = sinon.sandbox.create();
  });
  afterEach(() => {
    global.sinon.restore();
  });

  const request: atom$AutocompleteRequest = {
    editor: createFakeEditor(),
    bufferPosition: new Point(123, 456),
    prefix: 'def',
    scopeDescriptor: 'some.scope',
  };

  const completionItems = [
    {
      label: 'label1',
      kind: ls.CompletionItemKind.Keyword,
      detail: 'description1',
      documentation: 'a very exciting keyword',
      sortText: 'z',
    },
    {
      label: 'label2',
      kind: ls.CompletionItemKind.Field,
      detail: 'description2',
      documentation: 'a very exciting field',
      sortText: 'a',
    },
    {
      label: 'label3',
      kind: ls.CompletionItemKind.Variable,
      detail: 'description3',
      documentation: 'a very exciting variable',
    },
  ];

  const completeResponse = completionItems;

  const incompleteResponse: ls.CompletionList = {
    items: completionItems,
    isIncomplete: true,
  };

  describe('getSuggestionsComplete', () => {
    const fakeLanguageClient = new ls.LanguageClientConnection(createSpyConnection());
    sinon.stub(fakeLanguageClient, 'completion').resolves(completeResponse);

    it('gets Complete AutoComplete suggestions via LSP given an AutoCompleteRequest', async () => {
      const autoCompleteAdapter = new AutoCompleteAdapter();
      const response = await autoCompleteAdapter.getLSSuggestions(fakeLanguageClient, request);
      const suggestions = response.completionItems;
      expect(suggestions.length).equals(3);
      expect(suggestions[0].text).equals('label2');
      expect(suggestions[1].description).equals('a very exciting variable');
      expect(suggestions[2].type).equals('keyword');
      expect(response.isComplete).equals(true);
    });
  });

  describe('getSuggestionsIncomplete', () => {
    const fakeLanguageClient = new ls.LanguageClientConnection(createSpyConnection());
    sinon.stub(fakeLanguageClient, 'completion').resolves(incompleteResponse);

    it('gets Incomplete AutoComplete suggestions via LSP given an AutoCompleteRequest', async () => {
      const autoCompleteAdapter = new AutoCompleteAdapter();
      const response = await autoCompleteAdapter.getLSSuggestions(fakeLanguageClient, request);
      const suggestions = response.completionItems;
      expect(suggestions.length).equals(3);
      expect(suggestions[0].text).equals('label2');
      expect(suggestions[1].description).equals('a very exciting variable');
      expect(suggestions[2].type).equals('keyword');
      expect(response.isComplete).equals(false);
    });
  });

  describe('requestToTextDocumentPositionParams', () => {
    it('creates a TextDocumentPositionParams from an AutocompleteRequest', () => {
      const result = AutoCompleteAdapter.requestToTextDocumentPositionParams(request);
      expect(result.textDocument.uri).equals('file:///a/b/c/d.js');
      expect(result.position).deep.equals({line: 123, character: 456});
    });
  });

  describe('completionItemsToSuggestions', () => {
    it('converts LSP CompletionItem array to AutoComplete Suggestions array', () => {
      const response = AutoCompleteAdapter.completionItemsToSuggestions(completionItems, request);
      const results = response.completionItems;
      expect(results.length).equals(3);
      expect(results[0].text).equals('label2');
      expect(results[1].description).equals('a very exciting variable');
      expect(results[2].type).equals('keyword');
    });

    it('converts LSP CompletionList to AutoComplete Suggestions array', () => {
      const completionList = {items: completionItems, isIncomplete: false};
      const response = AutoCompleteAdapter.completionItemsToSuggestions(completionList, request);
      const results = response.completionItems;
      expect(results.length).equals(3);
      expect(results[0].description).equals('a very exciting field');
      expect(results[1].text).equals('label3');
    });

    it('converts empty array into an empty AutoComplete Suggestions array', () => {
      const response = AutoCompleteAdapter.completionItemsToSuggestions([], request);
      const results = response.completionItems;
      expect(results.length).equals(0);
    });
  });

  describe('completionItemToSuggestion', () => {
    it('converts LSP CompletionItem to AutoComplete Suggestion without textEdit', () => {
      const completionItem = {
        insertText: 'insert',
        label: 'label',
        filterText: 'filter',
        kind: ls.CompletionItemKind.Keyword,
        detail: 'keyword',
        documentation: 'a truly useful keyword',
      };
      const result = AutoCompleteAdapter.completionItemToSuggestion(completionItem, request);
      expect(result.text).equals('insert');
      expect(result.displayText).equals('label');
      expect(result.type).equals('keyword');
      expect(result.rightLabel).equals('keyword');
      expect(result.description).equals('a truly useful keyword');
      expect(result.descriptionMarkdown).equals('a truly useful keyword');
    });

    it('converts LSP CompletionItem to AutoComplete Suggestion with textEdit', () => {
      const completionItem: ls.CompletionItem = {
        insertText: 'insert',
        label: 'label',
        filterText: 'filter',
        kind: ls.CompletionItemKind.Variable,
        detail: 'number',
        documentation: 'a truly useful variable',
        textEdit: {
          range: {
            start: {line: 10, character: 20},
            end: {line: 30, character: 40},
          },
          newText: 'newText',
        },
      };
      const autocompleteRequest: atom$AutocompleteRequest = {
        editor: createFakeEditor(),
        bufferPosition: new Point(123, 456),
        prefix: 'def',
        scopeDescriptor: 'some.scope',
      };
      sinon.stub(autocompleteRequest.editor, 'getTextInBufferRange').returns('replacementPrefix');
      const result = AutoCompleteAdapter.completionItemToSuggestion(completionItem, autocompleteRequest);
      expect(result.displayText).equals('label');
      expect(result.type).equals('variable');
      expect(result.rightLabel).equals('number');
      expect(result.description).equals('a truly useful variable');
      expect(result.descriptionMarkdown).equals('a truly useful variable');
      expect(result.replacementPrefix).equals('replacementPrefix');
      expect(result.text).equals('newText');
      expect(autocompleteRequest.editor.getTextInBufferRange.calledOnce).equals(true);
      expect(autocompleteRequest.editor.getTextInBufferRange.getCall(0).args).deep.equals([
        new Range(new Point(10, 20), new Point(30, 40)),
      ]);
    });
  });

  describe('basicCompletionItemToSuggestion', () => {
    it('converts LSP CompletionItem with insertText and filterText to AutoComplete Suggestion', () => {
      const completionItem: ls.CompletionItem = {
        insertText: 'insert',
        label: 'label',
        filterText: 'filter',
        kind: ls.CompletionItemKind.Keyword,
        detail: 'detail',
        documentation: 'a very exciting keyword',
      };
      const result = AutoCompleteAdapter.basicCompletionItemToSuggestion(completionItem);
      expect(result.text).equals('insert');
      expect(result.displayText).equals('label');
      expect(result.type).equals('keyword');
      expect(result.rightLabel).equals('detail');
      expect(result.description).equals('a very exciting keyword');
      expect(result.descriptionMarkdown).equals('a very exciting keyword');
    });

    it('converts LSP CompletionItem without insertText or filterText to AutoComplete Suggestion', () => {
      const completionItem: ls.CompletionItem = {
        label: 'label',
        kind: ls.CompletionItemKind.Keyword,
        detail: 'detail',
        documentation: 'A very useful keyword',
      };
      const result = AutoCompleteAdapter.basicCompletionItemToSuggestion(completionItem);
      expect(result.text).equals('label');
      expect(result.displayText).equals('label');
      expect(result.type).equals('keyword');
      expect(result.rightLabel).equals('detail');
      expect(result.description).equals('A very useful keyword');
      expect(result.descriptionMarkdown).equals('A very useful keyword');
    });
  });

  describe('applyTextEditToSuggestion', () => {
    const basicCompletionItem: ls.CompletionItem = {
      label: 'label',
      kind: ls.CompletionItemKind.Keyword,
      detail: 'detail',
      documentation: 'An incredible keyword',
    };

    it('does not do anything if there is no textEdit', () => {
      const completionItem = {...basicCompletionItem};
      AutoCompleteAdapter.applyTextEditToSuggestion(null, new TextEditor(), completionItem);
      expect(completionItem).deep.equals(basicCompletionItem);
    });

    it('applies changes from TextEdit to replacementPrefix and text', () => {
      const textEdit = {
        range: {
          start: {line: 1, character: 2},
          end: {line: 3, character: 4},
        },
        newText: 'newText',
      };
      const editor = new TextEditor();
      sinon.stub(editor, 'getTextInBufferRange').returns('replacementPrefix');

      const completionItem = {...basicCompletionItem};
      AutoCompleteAdapter.applyTextEditToSuggestion(textEdit, editor, completionItem);
      expect(completionItem.replacementPrefix).equals('replacementPrefix');
      expect(completionItem.text).equals('newText');
      expect(editor.getTextInBufferRange.calledOnce).equals(true);
      expect(editor.getTextInBufferRange.getCall(0).args).deep.equals([new Range(new Point(1, 2), new Point(3, 4))]);
    });
  });

  describe('completionKindToSuggestionType', () => {
    it('converts LSP CompletionKinds to AutoComplete SuggestionTypes', () => {
      const variable = AutoCompleteAdapter.completionKindToSuggestionType(ls.CompletionItemKind.Variable);
      const constructor = AutoCompleteAdapter.completionKindToSuggestionType(ls.CompletionItemKind.Constructor);
      const module = AutoCompleteAdapter.completionKindToSuggestionType(ls.CompletionItemKind.Module);
      expect(variable).equals('variable');
      expect(constructor).equals('function');
      expect(module).equals('module');
    });

    it('defaults to "value"', () => {
      const result = AutoCompleteAdapter.completionKindToSuggestionType(null);
      expect(result).equals('value');
    });
  });
});
