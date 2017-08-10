// @flow

import invariant from 'assert';
import {Point} from 'atom';
import {expect} from 'chai';
import sinon from 'sinon';
import * as ls from '../../lib/languageclient';
import DatatipAdapter from '../../lib/adapters/datatip-adapter';
import {createSpyConnection, createFakeEditor} from '../helpers.js';

describe('DatatipAdapter', () => {
  let fakeEditor;
  let connection;

  beforeEach(() => {
    connection = new ls.LanguageClientConnection(createSpyConnection());
    fakeEditor = createFakeEditor();
  });

  describe('canAdapt', () => {
    it('returns true if hoverProvider is supported', () => {
      const result = DatatipAdapter.canAdapt({hoverProvider: true});
      expect(result).to.be.true;
    });

    it('returns false if hoverProvider not supported', () => {
      const result = DatatipAdapter.canAdapt({});
      expect(result).to.be.false;
    });
  });

  describe('getDatatip', () => {
    it('calls LSP document/hover at the given position', async () => {
      sinon.stub(connection, 'hover').resolves({
        range: {
          start: {line: 0, character: 1},
          end: {line: 0, character: 2},
        },
        contents: ['test', {language: 'testlang', value: 'test snippet'}],
      });

      const grammarSpy = sinon.spy(atom.grammars, 'grammarForScopeName');

      const datatipAdapter = new DatatipAdapter();
      const datatip = await datatipAdapter.getDatatip(connection, fakeEditor, new Point(0, 0));
      expect(datatip).to.be.ok;
      invariant(datatip != null);

      expect(datatip.range.start.row).equal(0);
      expect(datatip.range.start.column).equal(1);
      expect(datatip.range.end.row).equal(0);
      expect(datatip.range.end.column).equal(2);

      expect(datatip.markedStrings).to.have.lengthOf(2);
      expect(datatip.markedStrings[0]).eql({type: 'markdown', value: 'test'});

      const snippet = datatip.markedStrings[1];
      expect(snippet.type).equal('snippet');
      invariant(snippet.type === 'snippet');
      expect(snippet.grammar.scopeName).equal('text.plain.null-grammar');
      expect(snippet.value).equal('test snippet');

      expect(grammarSpy.calledWith('source.testlang')).to.be.true;
    });
  });
});
