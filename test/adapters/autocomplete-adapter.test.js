// @flow

import AutoCompleteAdapter from '../../lib/adapters/autocomplete-adapter';
import * as ls from '../../lib/languageclient';
import sinon from 'sinon';
import {Point, Range, TextEditor} from 'atom';
import {expect} from 'chai';
import {createSpyConnection, createFakeEditor} from '../helpers.js';

describe('AutoCompleteAdapter', () => {
  beforeEach(() => { global.sinon = sinon.sandbox.create(); });
  afterEach(() => { global.sinon.restore(); });

  const request: atom$AutocompleteRequest = {
    editor: createFakeEditor(),
    bufferPosition: new Point(123, 456),
    prefix: 'def',
    scopeDescriptor: 'some.scope'
  };

  const completionItems = [
    {
      label: 'label1',
      kind: ls.CompletionItemKind.Keyword,
      detail: 'description1',
      documentation: 'https://atom.io/1'
    },
    {
      label: 'label2',
      kind: ls.CompletionItemKind.Field,
      detail: 'description2',
      documentation: 'https://atom.io/2'
    },
    {
      label: 'label3',
      kind: ls.CompletionItemKind.Variable,
      detail: 'description3',
      documentation: 'https://atom.io/3'
    }
  ];

  describe('getSuggestions', () => {
    const fakeLanguageClient = new ls.LanguageClientConnection(createSpyConnection());
    sinon.stub(fakeLanguageClient, 'completion').resolves(completionItems);

    it('gets AutoComplete suggestions via LSP given an AutoCompleteRequest', async () => {
      const autoCompleteAdapter = new AutoCompleteAdapter(fakeLanguageClient);
      const suggestions = await autoCompleteAdapter.getSuggestions(request);
      expect(suggestions.length).equals(3);
      expect(suggestions[0].text).equals('label1');
      expect(suggestions[1].descriptionMoreURL).equals('https://atom.io/2');
      expect(suggestions[2].type).equals('variable');
    });
  });

  describe('requestToTextDocumentPositionParams', () => {
    it('creates a TextDocumentPositionParams from an AutocompleteRequest', () => {
      const result = AutoCompleteAdapter.requestToTextDocumentPositionParams(request);
      expect(result.textDocument.uri).equals('file:///a/b/c/d.js');
      expect(result.position).deep.equals({ line: 123, character: 456 });
    });
  });

  describe('completionItemsToSuggestions', () => {
    it('converts LSP CompletionItem array to AutoComplete Suggestions array', () => {
      const results = AutoCompleteAdapter.completionItemsToSuggestions(completionItems, request);
      expect(results.length).equals(3);
      expect(results[0].text).equals('label1');
      expect(results[1].descriptionMoreURL).equals('https://atom.io/2');
      expect(results[2].type).equals('variable');
    });

    it('converts LSP CompletionList to AutoComplete Suggestions array', () => {
      const completionList = { items: completionItems, isIncomplete: false };
      const results = AutoCompleteAdapter.completionItemsToSuggestions(completionList, request);
      expect(results.length).equals(3);
      expect(results[0].descriptionMoreURL).equals('https://atom.io/1');
      expect(results[1].text).equals('label2');
    });

    it('converts empty array into an empty AutoComplete Suggestions array', () => {
      const results = AutoCompleteAdapter.completionItemsToSuggestions([], request);
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
        detail: 'description',
        documentation: 'https://atom.io/something-more'
      };
      const result = AutoCompleteAdapter.completionItemToSuggestion(completionItem, request);
      expect(result.text).equals('insert');
      expect(result.displayText).equals('label');
      expect(result.type).equals('keyword');
      expect(result.description).equals('description');
      expect(result.descriptionMoreURL).equals('https://atom.io/something-more');
    });

    it('converts LSP CompletionItem to AutoComplete Suggestion with textEdit', () => {
      const completionItem: ls.CompletionItem = {
        insertText: 'insert',
        label: 'label',
        filterText: 'filter',
        kind: ls.CompletionItemKind.Variable,
        detail: 'description',
        documentation: 'https://atom.io/something-more',
        textEdit: {
          range: { start: { line: 10, character: 20 }, end: { line: 30, character: 40 } },
          newText: 'newText'
        }
      };
      const request: atom$AutocompleteRequest = {
        editor: createFakeEditor(),
        bufferPosition: new Point(123, 456),
        prefix: 'def',
        scopeDescriptor: 'some.scope'
      };
      sinon.stub(request.editor, 'getTextInBufferRange').returns('replacementPrefix');
      const result = AutoCompleteAdapter.completionItemToSuggestion(completionItem, request);
      expect(result.displayText).equals('label');
      expect(result.type).equals('variable');
      expect(result.description).equals('description');
      expect(result.descriptionMoreURL).equals('https://atom.io/something-more');
      expect(result.replacementPrefix).equals('replacementPrefix');
      expect(result.text).equals('newText');
      expect(request.editor.getTextInBufferRange.calledOnce).equals(true);
      expect(request.editor.getTextInBufferRange.getCall(0).args).deep.equals([ new Range(new Point(10, 20), new Point(30, 40)) ]);
    });
  });

  describe('basicCompletionItemToSuggestion', () => {
    it('converts LSP CompletionItem with insertText and filterText to AutoComplete Suggestion', () => {
      const completionItem: ls.CompletionItem = {
        insertText: 'insert',
        label: 'label',
        filterText: 'filter',
        kind: ls.CompletionItemKind.Keyword,
        detail: 'description',
        documentation: 'https://atom.io/something-more'
      };
      const result = AutoCompleteAdapter.basicCompletionItemToSuggestion(completionItem);
      expect(result.text).equals('insert');
      expect(result.displayText).equals('label');
      expect(result.type).equals('keyword');
      expect(result.description).equals('description');
      expect(result.descriptionMoreURL).equals('https://atom.io/something-more');
    });

    it('converts LSP CompletionItem without insertText or filterText to AutoComplete Suggestion', () => {
      const completionItem: ls.CompletionItem = {
        label: 'label',
        kind: ls.CompletionItemKind.Keyword,
        detail: 'description',
        documentation: 'https://atom.io/something-more'
      };
      const result = AutoCompleteAdapter.basicCompletionItemToSuggestion(completionItem);
      expect(result.text).equals('label');
      expect(result.displayText).equals('label');
      expect(result.type).equals('keyword');
      expect(result.description).equals('description');
      expect(result.descriptionMoreURL).equals('https://atom.io/something-more');
    });
  });

  describe('applyTextEditToSuggestion', () => {
    const basicCompletionItem: ls.CompletionItem = {
      label: 'label',
      kind: ls.CompletionItemKind.Keyword,
      detail: 'description',
      documentation: 'https://atom.io/something-more'
    };

    it('does not do anything if there is no textEdit', () => {
      const completionItem = Object.assign({}, basicCompletionItem);
      AutoCompleteAdapter.applyTextEditToSuggestion(null, new TextEditor(), completionItem);
      expect(completionItem).deep.equals(basicCompletionItem);
    });

    it('applies changes from TextEdit to replacementPrefix and text', () => {
      const textEdit = {
        range: { start: { line: 1, character: 2 }, end: { line: 3, character: 4 } },
        newText: 'newText'
      };
      const editor = new TextEditor();
      sinon.stub(editor, 'getTextInBufferRange').returns('replacementPrefix');

      const completionItem = Object.assign({}, basicCompletionItem);
      AutoCompleteAdapter.applyTextEditToSuggestion(textEdit, editor, completionItem);
      expect(completionItem.replacementPrefix).equals('replacementPrefix');
      expect(completionItem.text).equals('newText');
      expect(editor.getTextInBufferRange.calledOnce).equals(true);
      expect(editor.getTextInBufferRange.getCall(0).args).deep.equals([ new Range(new Point(1, 2), new Point(3, 4)) ]);
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
