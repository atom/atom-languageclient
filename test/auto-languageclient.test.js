// @flow

import AutoLanguageClient from '../lib/auto-languageclient';
import path from 'path';
import {expect} from 'chai';

describe('AutoLanguageClient.newEditorSelector', () => {
  class CustomAutoLanguageClient extends AutoLanguageClient {
    getGrammarScopes () {
      return ['Java', 'Python'];
    }
  }

  const client = new CustomAutoLanguageClient();

  function mockEditor(uri, scopeName) {
    return {
       getURI: () => uri,
       getGrammar: () => { return { scopeName: scopeName } }
    };
  }

  it('selects documents in project and in supported language', () => {
    const basepath = "/path/to/somewhere";
    const pathInProject = path.resolve(basepath, "file");
    const pathOutsideProject = "/path/to/elsewhere/file";
    const supportedLanguage = client.getGrammarScopes()[0];
    const unsupportedLanguage = client.getGrammarScopes()[0] + "-dummy";

    const data = [
      { path: pathInProject, lang: supportedLanguage, expected: true },
      { path: pathInProject, lang: unsupportedLanguage, expected: false },
      { path: pathOutsideProject, lang: supportedLanguage, expected: false },
      { path: pathOutsideProject, lang: unsupportedLanguage, expected: false }
    ];

    data.forEach(item => {
      const editor = mockEditor(item.path, item.lang);
      const selector = client.newEditorSelector(editor, basepath);
      expect(selector(editor)).equals(item.expected);
    });
  });
});
