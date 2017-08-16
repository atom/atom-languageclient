// @flow

import invariant from 'assert';
import {Point, Range} from 'atom';
import {expect} from 'chai';
import sinon from 'sinon';
import * as ls from '../../lib/languageclient';
import CodeHighlightAdapter from '../../lib/adapters/code-highlight-adapter';
import {createSpyConnection, createFakeEditor} from '../helpers.js';

describe('CodeHighlightAdapter', () => {
  let fakeEditor;
  let connection;

  beforeEach(() => {
    connection = new ls.LanguageClientConnection(createSpyConnection());
    fakeEditor = createFakeEditor();
  });

  describe('canAdapt', () => {
    it('returns true if document highlights are supported', () => {
      const result = CodeHighlightAdapter.canAdapt({
        documentHighlightProvider: true,
      });
      expect(result).to.be.true;
    });

    it('returns false it no formatting supported', () => {
      const result = CodeHighlightAdapter.canAdapt({});
      expect(result).to.be.false;
    });
  });

  describe('highlight', () => {
    it('highlights some ranges', async () => {
      const highlightStub = sinon.stub(connection, 'documentHighlight').returns(
        Promise.resolve([
          {
            range: {
              start: {line: 0, character: 1},
              end: {line: 0, character: 2},
            },
          },
        ]),
      );
      const result = await CodeHighlightAdapter.highlight(
        connection,
        {documentHighlightProvider: true},
        fakeEditor,
        new Point(0, 0),
      );
      expect(highlightStub.called).to.be.true;

      invariant(result != null);
      expect(result.length).to.equal(1);
      expect(result[0].isEqual(new Range([0, 1], [0, 2]))).to.be.true;
    });

    it('throws if document highlights are not supported', async () => {
      const result = await CodeHighlightAdapter.highlight(connection, {}, fakeEditor, new Point(0, 0)).catch(
        err => err,
      );
      expect(result).to.be.an.instanceof(Error);
      invariant(result instanceof Error);
      expect(result.message).to.equal('Must have the documentHighlight capability');
    });
  });
});
