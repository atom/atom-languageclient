import AutoLanguageClient from '../lib/auto-languageclient';
import { expect } from 'chai';

describe('AutoLanguageClient', () => {
  describe('shouldSyncForEditor', () => {
    class CustomAutoLanguageClient extends AutoLanguageClient {
      public getGrammarScopes() {
        return ['Java', 'Python'];
      }
    }

    const client = new CustomAutoLanguageClient();

    function mockEditor(uri: string, scopeName: string): any {
      return {
        getPath: () => uri,
        getGrammar: () => {
          return { scopeName };
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
});
