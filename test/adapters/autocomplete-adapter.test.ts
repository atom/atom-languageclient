import AutoCompleteAdapter from '../../lib/adapters/autocomplete-adapter';
import { ActiveServer } from '../../lib/server-manager.js';
import * as ls from '../../lib/languageclient';
import * as sinon from 'sinon';
import {
  CompositeDisposable,
  Point,
} from 'atom';
import * as ac from 'atom/autocomplete-plus';
import { expect } from 'chai';
import { createSpyConnection, createFakeEditor } from '../helpers.js';
import { TextSuggestion, SnippetSuggestion } from 'atom-ide';
import { CompletionItem, MarkupContent, InsertTextFormat, TextEdit, Command } from '../../lib/languageclient';

function createRequest({
  prefix = "",
  position = new Point(123, 456),
  activatedManually = true,
}): ac.SuggestionsRequestedEvent {
  return {
    editor: createFakeEditor(),
    bufferPosition: position,
    prefix,
    scopeDescriptor: { getScopesArray() { return ['some.scope']; } },
    activatedManually,
  };
}

// Required and optional properties as of LSP 3.14.0
function createCompletionItem(label: string, optional: {
  kind?: number,
  detail?: string,
  documentation?: string | MarkupContent,
  deprecated?: boolean,
  preselect?: boolean,
  sortText?: string,
  filterText?: string,
  insertText?: string,
  insertTextFormat?: InsertTextFormat,
  textEdit?: TextEdit,
  additionalTextEdits?: TextEdit[],
  commitCharacters?: string[]
  command?: Command,
  data?: any,
} = {}): CompletionItem {
  return {
    label,
    ...optional,
  } as CompletionItem;
}

describe('AutoCompleteAdapter', () => {
  function createActiveServerSpy(): ActiveServer {
    return {
      capabilities: { completionProvider: {} },
      connection: new ls.LanguageClientConnection(createSpyConnection()),
      disposable: new CompositeDisposable(),
      process: undefined as any,
      projectPath: '/',
    };
  }

  const completionItems = [
    createCompletionItem('thisHasFiltertext', {
      kind: ls.CompletionItemKind.Keyword,
      detail: 'description1',
      documentation: 'a very exciting keyword',
      filterText: 'labrador',
      sortText: 'z',
    }),
    createCompletionItem('label2', {
      kind: ls.CompletionItemKind.Field,
      detail: 'description2',
      documentation: 'a very exciting field',
      filterText: 'rabbit',
      sortText: 'a',
    }),
    createCompletionItem('label3', {
      kind: ls.CompletionItemKind.Variable,
      detail: 'description3',
      documentation: 'a very exciting variable',
    }),
    createCompletionItem('filteredout', {
      kind: ls.CompletionItemKind.Snippet,
      detail: 'description4',
      documentation: 'should not appear',
      sortText: 'zzz',
    }),
  ];

  const request = createRequest({prefix: 'lab'});

  describe('getSuggestions', () => {
    let server: ActiveServer;
    let autoCompleteAdapter: AutoCompleteAdapter;

    async function getResults(
      items: CompletionItem[],
      requestParams: {prefix?: string, point?: Point},
    ): Promise<ac.AnySuggestion[]> {
      sinon.stub(server.connection, 'completion').resolves(items);
      return autoCompleteAdapter.getSuggestions(server, createRequest(requestParams));
    }

    beforeEach(() => {
      server = createActiveServerSpy();
      autoCompleteAdapter = new AutoCompleteAdapter();
    });

    it('gets AutoComplete suggestions via LSP given an AutoCompleteRequest', async () => {
      const results = await getResults(completionItems, {prefix: ''});
      expect(results.length).equals(completionItems.length);
    });

    it('provides a filtered selection based on the filterKey', async () => {
      const results = await getResults(completionItems, {prefix: 'lab'});
      expect(results.length).equals(2);
      expect(results.some((r) => r.displayText === 'thisHasFiltertext')).to.be.true;
      expect(results.some((r) => r.displayText === 'label3')).to.be.true;
    });

    it('uses the sortText property to arrange completions when there is no prefix', async () => {
      const sortedItems = [
        createCompletionItem('a', {sortText: 'c'}),
        createCompletionItem('b'),
        createCompletionItem('c', {sortText: 'a'}),
      ];
      const results = await getResults(sortedItems, {prefix: ''});

      expect(results.length).equals(sortedItems.length);
      expect(results[0].displayText).equals('c');
      expect(results[1].displayText).equals('b');
      expect(results[2].displayText).equals('a');
    });

    it('uses the filterText property to arrange completions when there is a prefix', async () => {
      const results = await getResults(completionItems, {prefix: 'lab'});
      expect(results.length).equals(2);
      expect(results[0].displayText).equals('label3'); // shorter than 'labrador', so expected to be first
      expect(results[1].displayText).equals('thisHasFiltertext');
    });
  });

  describe('completeSuggestion', () => {
    const partialItems = [
      createCompletionItem('label1'),
      createCompletionItem('label2'),
      createCompletionItem('label3'),
    ];

    const server: ActiveServer = createActiveServerSpy();
    sinon.stub(server.connection, 'completion').resolves(partialItems);
    sinon.stub(server.connection, 'completionItemResolve').resolves(createCompletionItem(
      'label3', {detail: 'description3', documentation: 'a very exciting variable'},
    ));

    it('resolves suggestions via LSP given an AutoCompleteRequest', async () => {
      const autoCompleteAdapter = new AutoCompleteAdapter();
      const results: ac.AnySuggestion[] = await autoCompleteAdapter.getSuggestions(server, request);
      const result = results.find((r) => r.displayText === 'label3')!;
      expect(result).not.to.be.undefined;
      expect(result.description).to.be.undefined;
      const resolvedItem = await autoCompleteAdapter.completeSuggestion(server, result, request);
      expect(resolvedItem && resolvedItem.description).equals('a very exciting variable');
    });
  });

  describe('createCompletionParams', () => {
    it('creates CompletionParams from an AutocompleteRequest with no trigger', () => {
      const result = AutoCompleteAdapter.createCompletionParams(request, '', true);
      expect(result.textDocument.uri).equals('file:///a/b/c/d.js');
      expect(result.position).deep.equals({ line: 123, character: 456 });
      expect(result.context && result.context.triggerKind).equals(ls.CompletionTriggerKind.Invoked);
      expect(result.context && result.context.triggerCharacter).to.be.undefined;
    });

    it('creates CompletionParams from an AutocompleteRequest with a trigger', () => {
      const result = AutoCompleteAdapter.createCompletionParams(request, '.', true);
      expect(result.textDocument.uri).equals('file:///a/b/c/d.js');
      expect(result.position).deep.equals({ line: 123, character: 456 });
      expect(result.context && result.context.triggerKind).equals(ls.CompletionTriggerKind.TriggerCharacter);
      expect(result.context && result.context.triggerCharacter).equals('.');
    });

    it('creates CompletionParams from an AutocompleteRequest for a follow-up request', () => {
      const result = AutoCompleteAdapter.createCompletionParams(request, '.', false);
      expect(result.textDocument.uri).equals('file:///a/b/c/d.js');
      expect(result.position).deep.equals({ line: 123, character: 456 });
      expect(result.context && result.context.triggerKind)
        .equals(ls.CompletionTriggerKind.TriggerForIncompleteCompletions);
      expect(result.context && result.context.triggerCharacter).equals('.');
    });
  });

  describe('conversion of LSP completion to autocomplete+ completion', () => {
    const items = [
      createCompletionItem('align', {
        sortText: 'a',
        kind: ls.CompletionItemKind.Snippet,
        textEdit: {
          range: { start: { line: 0, character: 4 }, end: { line: 0,  character: 10 } },
          newText: 'hello world',
        },
      }),
      createCompletionItem('list', {
        sortText: 'b',
        kind: ls.CompletionItemKind.Constant,
        textEdit: {
          range: { start: { line: 0, character: 8 }, end: { line: 0, character: 13 } },
          newText: 'shifted',
        },
      }),
      createCompletionItem('minimal', {
        sortText: 'c',
      }),
      createCompletionItem('old', {
        sortText: 'd',
        documentation: 'doc string',
        insertText: 'inserted',
        insertTextFormat: ls.InsertTextFormat.Snippet,
      }),
      createCompletionItem('documented', {
        sortText: 'e',
        detail: 'details',
        documentation:  {
          kind: 'markdown',
          value: 'documentation',
        },
      }),
    ];

    let server: ActiveServer;
    let autoCompleteAdapter: AutoCompleteAdapter;

    beforeEach(() => {
      server = createActiveServerSpy();
      autoCompleteAdapter = new AutoCompleteAdapter();
    });

    it('converts LSP CompletionItem array to AutoComplete Suggestions array', async () => {
      const customRequest = createRequest({prefix: '', position: new Point(0, 10)});
      customRequest.editor.setText('foo #align bar');
      sinon.stub(server.connection, 'completion').resolves(items);
      const results = await autoCompleteAdapter.getSuggestions(server, customRequest);

      expect(results.length).equals(items.length);
      expect(results[0].displayText).equals('align');
      expect((results[0] as TextSuggestion).text).equals('hello world');
      expect(results[0].replacementPrefix).equals('#align');
      expect(results[0].type).equals('snippet');

      expect(results[1].displayText).equals('list');
      expect((results[1] as TextSuggestion).text).equals('shifted');
      expect(results[1].replacementPrefix).equals('gn'); // TODO: support post replacement too
      expect(results[1].type).equals('constant');

      expect(results[2].displayText).equals('minimal');
      expect((results[2] as TextSuggestion).text).equals('minimal');
      expect(results[2].replacementPrefix).equals(''); // we sent an empty prefix

      expect(results[3].displayText).equals('old');
      expect((results[3] as SnippetSuggestion).snippet).equals('inserted');
      expect(results[3].description).equals('doc string');
      expect(results[3].descriptionMarkdown).equals('doc string');

      expect(results[4].displayText).equals('documented');
      expect(results[4].description).is.undefined;
      expect(results[4].descriptionMarkdown).equals('documentation');
      expect(results[4].rightLabel).equals('details');
    });

    it('respects onDidConvertCompletionItem', async () => {
      sinon.stub(server.connection, 'completion').resolves([createCompletionItem('label')]);
      const results = await autoCompleteAdapter.getSuggestions(server, createRequest({}), (c, a, r) => {
        (a as ac.TextSuggestion).text = c.label + ' ok';
        a.displayText = r.scopeDescriptor.getScopesArray()[0];
      });

      expect(results.length).equals(1);
      expect(results[0].displayText).equals('some.scope');
      expect((results[0] as ac.TextSuggestion).text).equals('label ok');
    });

    it('converts empty array into an empty AutoComplete Suggestions array', async () => {
      sinon.stub(server.connection, 'completion').resolves([]);
      const results = await autoCompleteAdapter.getSuggestions(server, createRequest({}));
      expect(results.length).equals(0);
    });

    it('converts LSP CompletionItem to AutoComplete Suggestion without textEdit', async () => {
      sinon.stub(server.connection, 'completion').resolves([
        createCompletionItem('label', {
         insertText: 'insert',
         filterText: 'filter',
         kind: ls.CompletionItemKind.Keyword,
         detail: 'keyword',
         documentation: 'a truly useful keyword',
       }),
      ]);
      const result = (await autoCompleteAdapter.getSuggestions(server, createRequest({})))[0];
      expect((result as TextSuggestion).text).equals('insert');
      expect(result.displayText).equals('label');
      expect(result.type).equals('keyword');
      expect(result.rightLabel).equals('keyword');
      expect(result.description).equals('a truly useful keyword');
      expect(result.descriptionMarkdown).equals('a truly useful keyword');
    });

    it('converts LSP CompletionItem to AutoComplete Suggestion with textEdit', async () => {
      const customRequest = createRequest({
        prefix: '',
        position: new Point(0, 10),
        activatedManually: false,
      });
      customRequest.editor.setText('foo #label bar');
      sinon.stub(server.connection, 'completion').resolves([
        createCompletionItem('label', {
          insertText: 'insert',
          filterText: 'filter',
          kind: ls.CompletionItemKind.Variable,
          detail: 'number',
          documentation: 'a truly useful variable',
          textEdit: {
            range: { start: { line: 0, character: 4 }, end: { line: 0,  character: 10 } },
            newText: 'newText',
          },
        }),
      ]);

      const result = (await autoCompleteAdapter.getSuggestions(server, customRequest))[0];
      expect(result.displayText).equals('label');
      expect(result.type).equals('variable');
      expect(result.rightLabel).equals('number');
      expect(result.description).equals('a truly useful variable');
      expect(result.descriptionMarkdown).equals('a truly useful variable');
      expect(result.replacementPrefix).equals('#label');
      expect((result as TextSuggestion).text).equals('newText');
    });

    it('converts LSP CompletionItem with insertText and filterText to AutoComplete Suggestion', async () => {
      sinon.stub(server.connection, 'completion').resolves([
        createCompletionItem('label', {
          insertText: 'insert',
          filterText: 'filter',
          kind: ls.CompletionItemKind.Keyword,
          detail: 'detail',
          documentation: 'a very exciting keyword',
        }),
        createCompletionItem('filteredOut', {
          filterText: 'nop',
        }),
      ]);

      const results = await autoCompleteAdapter.getSuggestions(server, createRequest({prefix: 'fil'}));
      expect(results.length).equals(1);

      const result = results[0];
      expect((result as TextSuggestion).text).equals('insert');
      expect(result.displayText).equals('label');
      expect(result.type).equals('keyword');
      expect(result.rightLabel).equals('detail');
      expect(result.description).equals('a very exciting keyword');
      expect(result.descriptionMarkdown).equals('a very exciting keyword');
    });

    it('converts LSP CompletionItem with missing documentation to AutoComplete Suggestion', async () => {
      sinon.stub(server.connection, 'completion').resolves([
        createCompletionItem('label', {
          detail: 'detail',
        }),
      ]);

      const result = (await autoCompleteAdapter.getSuggestions(server, createRequest({})))[0];
      expect(result.rightLabel).equals('detail');
      expect(result.description).equals(undefined);
      expect(result.descriptionMarkdown).equals(undefined);
    });

    it('converts LSP CompletionItem with markdown documentation to AutoComplete Suggestion', async () => {
      sinon.stub(server.connection, 'completion').resolves([
        createCompletionItem('label', {
          detail: 'detail',
          documentation: { value: 'Some *markdown*', kind: 'markdown' },
        }),
      ]);

      const result = (await autoCompleteAdapter.getSuggestions(server, createRequest({})))[0];
      expect(result.rightLabel).equals('detail');
      expect(result.description).equals(undefined);
      expect(result.descriptionMarkdown).equals('Some *markdown*');
    });

    it('converts LSP CompletionItem with plaintext documentation to AutoComplete Suggestion', async () => {
      sinon.stub(server.connection, 'completion').resolves([
        createCompletionItem('label', {
          detail: 'detail',
          documentation: { value: 'Some plain text', kind: 'plaintext' },
        }),
      ]);

      const result = (await autoCompleteAdapter.getSuggestions(server, createRequest({})))[0];
      expect(result.rightLabel).equals('detail');
      expect(result.description).equals('Some plain text');
      expect(result.descriptionMarkdown).equals(undefined);
    });

    it('converts LSP CompletionItem without insertText or filterText to AutoComplete Suggestion', async () => {
      sinon.stub(server.connection, 'completion').resolves([
        createCompletionItem('label', {
          kind: ls.CompletionItemKind.Keyword,
          detail: 'detail',
          documentation: 'A very useful keyword',
        }),
      ]);

      const result = (await autoCompleteAdapter.getSuggestions(server, createRequest({})))[0];
      expect((result as TextSuggestion).text).equals('label');
      expect(result.displayText).equals('label');
      expect(result.type).equals('keyword');
      expect(result.rightLabel).equals('detail');
      expect(result.description).equals('A very useful keyword');
      expect(result.descriptionMarkdown).equals('A very useful keyword');
    });

    it('does not do anything if there is no textEdit', async () => {
      sinon.stub(server.connection, 'completion').resolves([
        createCompletionItem('', {filterText: 'rep'}),
      ]);

      const result = (await autoCompleteAdapter.getSuggestions(server, createRequest({prefix: 'rep'})))[0];
      expect((result as TextSuggestion).text).equals('');
      expect(result.displayText).equals('');
      expect(result.replacementPrefix).equals('');
    });

    it('applies changes from TextEdit to text', async () => {
      const customRequest = createRequest({prefix: '', position: new Point(0, 10)});
      customRequest.editor.setText('foo #align bar');
      sinon.stub(server.connection, 'completion').resolves([
        createCompletionItem('align', {
          sortText: 'a',
          textEdit: {
            range: { start: { line: 0, character: 4 }, end: { line: 0,  character: 10 } },
            newText: 'hello world',
          },
        }),
      ]);
      const results = await autoCompleteAdapter.getSuggestions(server, customRequest);

      expect(results[0].displayText).equals('align');
      expect((results[0] as TextSuggestion).text).equals('hello world');
      expect(results[0].replacementPrefix).equals('#align');
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
      const result = AutoCompleteAdapter.completionKindToSuggestionType(undefined);
      expect(result).equals('value');
    });
  });
});
