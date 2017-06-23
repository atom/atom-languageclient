// @flow

import invariant from 'assert';
import {Point, Range} from 'atom';
import {expect} from 'chai';
import sinon from 'sinon';
import * as ls from '../../lib/languageclient';
import CodeFormatAdapter from '../../lib/adapters/code-format-adapter';
import {createSpyConnection, createFakeEditor} from '../helpers.js';

describe('CodeFormatAdapter', () => {
  let fakeEditor;
  let connection;
  let range;

  beforeEach(() => {
    connection = new ls.LanguageClientConnection(createSpyConnection());
    fakeEditor = createFakeEditor();
    range = new Range([0, 0], [100,100]);
  });

  describe('canAdapt', () => {
    it('returns true if range formatting is supported', () => {
      const result = CodeFormatAdapter.canAdapt({ documentRangeFormattingProvider: true });
      expect(result).to.be.true;
    });

    it('returns true if document formatting is supported', () => {
      const result = CodeFormatAdapter.canAdapt({ documentFormattingProvider: true });
      expect(result).to.be.true;
    });

    it('returns false it no formatting supported', () => {
      const result = CodeFormatAdapter.canAdapt({ });
      expect(result).to.be.false;
    });
  });

  describe('format', () => {
    it('prefers range formatting if available', async () => {
      const rangeStub = sinon.spy(connection, 'documentRangeFormatting');
      const docStub = sinon.spy(connection, 'documentFormatting');
      CodeFormatAdapter.format(connection, { documentRangeFormattingProvider: true, documentFormattingProvider: true }, fakeEditor, range);
      expect(rangeStub.called).to.be.true;
      expect(docStub.called).to.be.false;
    });

    it('falls back to document formatting if range formatting not available', async () => {
      const rangeStub = sinon.spy(connection, 'documentRangeFormatting');
      const docStub = sinon.spy(connection, 'documentFormatting');
      CodeFormatAdapter.format(connection, { documentFormattingProvider: true }, fakeEditor, range);
      expect(rangeStub.called).to.be.false;
      expect(docStub.called).to.be.true;
    });

    it('throws if neither range or document formatting are supported', async () => {
      expect(() => CodeFormatAdapter.format(connection, { }, fakeEditor, range)).to.throw();
    });
  });

  describe('formatDocument', () => {
    it('converts the results from the connection', async () => {
      sinon.stub(connection, 'documentFormatting').resolves([
        {
          range: {
            start: {line: 0, character: 1},
            end: {line: 0, character: 2},
          },
          newText: 'abc'
        },
        {
          range: {
            start: {line: 5, character: 10},
            end: {line: 15, character: 20},
          },
          newText: 'def'
        }
      ]);
      const actual = await CodeFormatAdapter.formatDocument(connection, fakeEditor);
      expect(actual.length).to.equal(2);
      expect(actual[0].newText).to.equal('abc');
      expect(actual[1].oldRange.start.row).to.equal(5);
      expect(actual[1].oldRange.start.column).to.equal(10);
      expect(actual[1].oldRange.end.row).to.equal(15);
      expect(actual[1].oldRange.end.column).to.equal(20);
      expect(actual[1].newText).to.equal('def');
    });
  });

  describe('createDocumentFormattingParams', () => {
    it('returns the tab size from the editor', () => {
      sinon.stub(fakeEditor, 'getPath').returns('/a/b/c/d.txt');
      sinon.stub(fakeEditor, 'getTabLength').returns(1);
      sinon.stub(fakeEditor, 'getSoftTabs').returns(false);

      const actual = CodeFormatAdapter.createDocumentFormattingParams(fakeEditor);

      expect(actual.textDocument).to.eql({ uri: 'file:///a/b/c/d.txt' });
      expect(actual.options.tabSize).to.equal(1);
      expect(actual.options.insertSpaces).to.equal(false);
    });
  });

  describe('formatRange', () => {
    it('converts the results from the connection', async () => {
      sinon.stub(connection, 'documentRangeFormatting').resolves([
        {
          range: {
            start: {line: 0, character: 1},
            end: {line: 0, character: 2},
          },
          newText: 'abc'
        },
        {
          range: {
            start: {line: 5, character: 10},
            end: {line: 15, character: 20},
          },
          newText: 'def'
        }
      ]);
      const actual = await CodeFormatAdapter.formatRange(connection, fakeEditor, new Range([0, 0], [1, 1]));
      expect(actual.length).to.equal(2);
      expect(actual[0].newText).to.equal('abc');
      expect(actual[1].oldRange.start.row).to.equal(5);
      expect(actual[1].oldRange.start.column).to.equal(10);
      expect(actual[1].oldRange.end.row).to.equal(15);
      expect(actual[1].oldRange.end.column).to.equal(20);
      expect(actual[1].newText).to.equal('def');
    });
  });

  describe('createDocumentRangeFormattingParams', () => {
    it('returns the tab size from the editor', () => {
      sinon.stub(fakeEditor, 'getPath').returns('/a/b/c/d.txt');
      sinon.stub(fakeEditor, 'getTabLength').returns(1);
      sinon.stub(fakeEditor, 'getSoftTabs').returns(false);

      const actual = CodeFormatAdapter
        .createDocumentRangeFormattingParams(fakeEditor, new Range([1, 0], [2, 3]));

      expect(actual.textDocument).to.eql({ uri: 'file:///a/b/c/d.txt' });
      expect(actual.range).to.eql({ start: { line: 1, character: 0 },
                                      end: { line: 2, character: 3 }});
      expect(actual.options.tabSize).to.equal(1);
      expect(actual.options.insertSpaces).to.equal(false);
    });
  });

  describe('getFormatOptions', () => {
    it('returns the tab size from the editor', () => {
      sinon.stub(fakeEditor, 'getTabLength').returns(17);
      const options = CodeFormatAdapter.getFormatOptions(fakeEditor);
      expect(options.tabSize).to.equal(17);
    });

    it('returns the tab size from the editor', () => {
      sinon.stub(fakeEditor, 'getSoftTabs').returns(true);
      const options = CodeFormatAdapter.getFormatOptions(fakeEditor);
      expect(options.insertSpaces).to.be.true;
    });
  });

  describe('convertLsTextEdit', () => {
    it('returns oldRange and newText from a textEdit', () => {
      const textEdit = {
        range: {
          start: { line: 1, character: 0 },
          end: { line: 2, character: 3 }
        },
        newText: 'abc-def'
      };
      const actual = CodeFormatAdapter.convertLsTextEdit(textEdit);
      expect(actual.oldRange).to.eql(new Range([1, 0], [2, 3]));
      expect(actual.newText).to.equal('abc-def');
    });
  });
});
