// @flow

import AutoLanguageClient from '../lib/auto-languageclient';

/* TODO - Uncomment after uncommenting the getSuggestion reset test.
import AutocompleteAdapter, {type AutocompletionResponse} from '../lib/adapters/autocomplete-adapter';
import {LanguageClientConnection} from '../lib/languageclient';
import {createFakeEditor} from './helpers.js';
import {Point} from 'atom'; */

import {expect} from 'chai';

describe('AutoLanguageClient', () => {
  describe('shouldSyncForEditor', () => {
    class CustomAutoLanguageClient extends AutoLanguageClient {
      getGrammarScopes() {
        return ['Java', 'Python'];
      }
    }

    const client = new CustomAutoLanguageClient();

    function mockEditor(uri, scopeName): any {
      return {
        getURI: () => uri,
        getGrammar: () => {
          return {scopeName};
        },
      };
    }

    it('selects documents in project and in supported language', () => {
      const editor = mockEditor('/path/to/somewhere', client.getGrammarScopes()[0]);
      expect(client.shouldSyncForEditor(editor, '/path/to/somewhere')).equals(true);
    });

    it('does not select documents outside of project', () => {
      const editor = mockEditor('/path/to/elsewhere/file', client.getGrammarScopes()[0]);
      expect(client.shouldSyncForEditor(editor, '/path/to/somewhere')).equals(false);
    });

    it('does not select documents in unsupported language', () => {
      const editor = mockEditor('/path/to/somewhere', client.getGrammarScopes()[0] + '-dummy');
      expect(client.shouldSyncForEditor(editor, '/path/to/somewhere')).equals(false);
    });

    it('does not select documents in unsupported language outside of project', () => {
      const editor = mockEditor('/path/to/elsewhere/file', client.getGrammarScopes()[0] + '-dummy');
      expect(client.shouldSyncForEditor(editor, '/path/to/somewhere')).equals(false);
    });
  });

  /* describe('getSuggestions', () => {
    const expectedSuggestions = [
      {
        text: 'blabla',
        displayText: 'doublebla',
        filterText: 'bla',
        snippet: 'bla',
        type: 'method',
        leftLabel: 'left bla',
        description: 'bla bla of bla',
        descriptionMarkdown: 'markdown',
      },
      {
        text: 'blabla2',
        displayText: 'doublebla2',
        filterText: 'bla2',
        snippet: 'bla2',
        type: 'method',
        leftLabel: 'left bla2',
        description: 'bla bla of bla2',
        descriptionMarkdown: 'markdown',
      },
      {
        text: 'blabla3',
        displayText: 'doublebla',
        filterText: 'bla3',
        snippet: 'bla3',
        type: 'method',
        leftLabel: 'left bla3',
        description: 'bla bla of bla3',
        descriptionMarkdown: 'markdown',
      },
    ];

    class CustomAutoLanguageClient extends AutoLanguageClient {
      autoComplete = new AutocompleteAdapter();

      getGrammarScopes() {
        return ['Java', 'Python'];
      }
      getLanguageName() {
        return 'TypeScript';
      }
      getServerName() {
        return 'SourceGraph';
      }
    }

    class CustomAutocompleteAdapter extends AutocompleteAdapter {
      getSuggestions(
        connection: LanguageClientConnection,
        request: atom$AutocompleteRequest,
      ): Promise<AutocompletionResponse> {
        const response: AutocompletionResponse = {
          isComplete: true,
          completionItems: expectedSuggestions,
        };

        return Promise.resolve(response);
      }
    }

    const client = new CustomAutoLanguageClient();
    client.autoComplete = new CustomAutocompleteAdapter();
    client.activate();

    it('correctly resets current EditorSuggestionInfo', () => {
      const request: atom$AutocompleteRequest = {
        editor: createFakeEditor(),
        bufferPosition: new Point(123, 456),
        prefix: '.',
        scopeDescriptor: 'some.scope',
      };

      const expectedResult = {
        isComplete: true,
        completionItems: expectedSuggestions,
      };

      return client.getSuggestions(request).then(results => {
        expect(client._editorToSuggestions.keys.length).equals('BLA');
        let editorSuggestionInfo = client._editorToSuggestions.get(request.editor);
        if (editorSuggestionInfo) {
          expect(editorSuggestionInfo.isComplete).equals(expectedResult.isComplete);
          expect(false).equals(true);
          expect(results).equals(expectedResult.completionItems);

          request.editor.getBuffer().setText('');

          editorSuggestionInfo = client._editorToSuggestions.get(request.editor);
          if (!editorSuggestionInfo) {
            editorSuggestionInfo = {};
          }

          expect(editorSuggestionInfo.isComplete).equals(false);
          expect(editorSuggestionInfo.currentSuggestions).equals([]);
        }
      });
    });
  }); */
});
