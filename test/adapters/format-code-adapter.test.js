// @flow

import FormatCodeAdapter from '../../lib/adapters/format-code-adapter';
import * as ls from '../../lib/languageclient';
import Convert from '../../lib/convert';
import sinon from 'sinon';
import {expect} from 'chai';
import {Point, Range, TextEditor} from 'atom';
import {createSpyConnection, createFakeEditor} from '../helpers.js';

describe('FormatCodeAdapter', () => {
  let originalAtom = global.atom;
  const defaultLanguageClient = new ls.LanguageClientConnection(createSpyConnection());
  const defaultGrammarScopes = [ 'javascript.source' ];
  const defaultTextEditorScopes = Convert.grammarScopesToTextEditorScopes(defaultGrammarScopes);
  const fakeEditor = createFakeEditor();

  beforeEach(() => {
    global.sinon = sinon.sandbox.create();
    fakeEditor.setTextInBufferRange.reset();
    fakeEditor.getSelectedBufferRange.reset();
  });
  afterEach(() => {
    global.sinon.restore();
    global.atom = originalAtom;
  });

  describe('constructor', () => {
    it('registers no format commands if capabilities not supported',() => {
      const addCommandSpy = sinon.spy();
      global.atom = { commands: { add: addCommandSpy } };
      const formatCodeAdapter = new FormatCodeAdapter(defaultLanguageClient, { }, defaultGrammarScopes);
      expect(addCommandSpy.called).equals(false);
    });

    it('registers "format-selection" command if has documentRangeFormattingProvider capability',() => {
      const addCommandSpy = sinon.stub().returns({ dispose: () => { } });
      global.atom = { commands: { add: addCommandSpy } };
      const formatCodeAdapter = new FormatCodeAdapter(defaultLanguageClient, { documentRangeFormattingProvider: true }, defaultGrammarScopes);
      expect(addCommandSpy.called).equals(true);
      const callArgs = addCommandSpy.getCall(0).args;
      expect(callArgs[0]).deep.equals(defaultTextEditorScopes);
      expect(callArgs[1]).to.have.property('language:format-selection');
    });

    it('registers "format-file" command if has documentFormattingProvider capability',() => {
      const addCommandSpy = sinon.stub().returns({ dispose: () => { } });
      global.atom = { commands: { add: addCommandSpy } };
      const formatCodeAdapter = new FormatCodeAdapter(defaultLanguageClient, { documentFormattingProvider: true }, defaultGrammarScopes);
      expect(addCommandSpy.called).equals(true);
      const callArgs = addCommandSpy.getCall(0).args;
      expect(callArgs[0]).deep.equals(defaultTextEditorScopes);
      expect(callArgs[1]).to.have.property('language:format-file');
    });
  });

  describe('dispose', () => {
    it('disposes of the commands created',() => {
      const disposedAddCommandSpy = sinon.stub();
      const addCommandSpy = sinon.stub().returns({ dispose: disposedAddCommandSpy });
      global.atom = { commands: { add: addCommandSpy } };
      const formatCodeAdapter = new FormatCodeAdapter(defaultLanguageClient, { documentFormattingProvider: true, documentRangeFormattingProvider: true }, defaultGrammarScopes);
      expect(disposedAddCommandSpy.called).equals(false);
      expect(addCommandSpy.callCount).equals(2);
      formatCodeAdapter.dispose();
      expect(disposedAddCommandSpy.called).equals(true);
    });
  });

  describe('formatDocument', () => {
    it('returns immediately when the active editor can not be determined', async () => {
      global.atom = { workspace: { getActiveTextEditor: () => null } };
      const languageClient = new ls.LanguageClientConnection(createSpyConnection());
      const documentFormattingSpy = sinon.spy(languageClient, 'documentFormatting');
      const formatCodeAdapter = new FormatCodeAdapter(languageClient, { }, []);
      await formatCodeAdapter.formatDocument();
      expect(documentFormattingSpy.called).equals(false);
    });

    it('calls the language client with the active editor', async () => {
      const textEditor = new TextEditor();
      textEditor.setTabLength(12);
      textEditor.getBuffer().setPath('/d/g/w/a/s/here.txt');
      atom.workspace.getActivePane().activateItem(textEditor);
      const languageClient = new ls.LanguageClientConnection(createSpyConnection());
      const documentFormattingSpy = sinon.stub(languageClient, 'documentFormatting').returns([]);
      const formatCodeAdapter = new FormatCodeAdapter(languageClient, { }, defaultGrammarScopes);
      await formatCodeAdapter.formatDocument();
      expect(documentFormattingSpy.called).equals(true);
      const arg = documentFormattingSpy.args[0][0];
      expect(arg.options.tabSize).equals(12);
      expect(arg.textDocument.uri).equals('file:///d/g/w/a/s/here.txt');
      atom.workspace.getActivePane().destroyItem(textEditor);
    });
  });

  describe('formatSelection', () => {
    it('returns immediately when the active editor can not be determined', async () => {
      global.atom = { workspace: { getActiveTextEditor: () => null } };
      const languageClient = new ls.LanguageClientConnection(createSpyConnection());
      const documentRangeFormattingSpy = sinon.stub(languageClient, 'documentRangeFormatting').returns([]);
      const formatCodeAdapter = new FormatCodeAdapter(languageClient, { }, []);
      await formatCodeAdapter.formatSelection();
      expect(documentRangeFormattingSpy.called).equals(false);
    });

    it('calls the language client with the active editor', async () => {
      const textEditor = new TextEditor();
      textEditor.setText('one\ntwo\nthree and four');
      textEditor.setSelectedBufferRange(new Range(new Point(1, 1), new Point(2, 4)));
      textEditor.getBuffer().setPath('/d/g/w/a/s/here.txt');
      atom.workspace.getActivePane().activateItem(textEditor);
      const languageClient = new ls.LanguageClientConnection(createSpyConnection());
      const documentRangeFormattingSpy = sinon.stub(languageClient, 'documentRangeFormatting').returns([]);
      const formatCodeAdapter = new FormatCodeAdapter(languageClient, { }, defaultGrammarScopes);
      await formatCodeAdapter.formatSelection();
      expect(documentRangeFormattingSpy.called).equals(true);
      const arg = documentRangeFormattingSpy.args[0][0];
      expect(arg.textDocument.uri).equals('file:///d/g/w/a/s/here.txt');
      expect(arg.range).deep.equals({ start: { line: 1, character: 1 }, end: { line: 2, character: 4 } });
      atom.workspace.getActivePane().destroyItem(textEditor);
    });
  });

  describe('createDocumentFormattingParams', () => {
    it('creates a DocumentFormattingParams from an Atom TextEditor', () => {
      const params = FormatCodeAdapter.createDocumentFormattingParams(fakeEditor);
      expect(params.textDocument).deep.equals({ uri: 'file:///a/b/c/d.js' });
      expect(params.options.insertSpaces).equals(true);
      expect(params.options.tabSize).equals(4);
    });
  });

  describe('createDocumentRangeFormattingParams', () => {
    it('creates a DocumentRangeFormattingParams from an Atom TextEditor', () => {
      const editor = createFakeEditor();
      editor.getSelectedBufferRange.returns(new Range(new Point(1, 2), new Point(3, 4)));
      const params = FormatCodeAdapter.createDocumentRangeFormattingParams(editor);
      expect(params.textDocument).deep.equals({ uri: 'file:///a/b/c/d.js' });
      expect(params.range).deep.equals({ start: { line: 1, character: 2 }, end: { line: 3, character: 4 }});
      expect(params.options.insertSpaces).equals(true);
      expect(params.options.tabSize).equals(4);
    });
  });

  describe('applyTextEdits', () => {
    const textEdits: Array<ls.TextEdit> = [
      { newText: 'first\n', range: { start: { line: 1, character: 0 }, end: { line: 2, character: 12 } } },
      { newText: 'second\n', range: { start: { line: 2, character: 0 }, end: { line: 3, character: 0 } } },
      { newText: 'third', range: { start: { line: 3, character: 0 }, end: { line: 4, character: 0 } } }
    ];

    it('applies sequential TextEdits via setTextInBufferRange', () => {
      FormatCodeAdapter.applyTextEdits(fakeEditor, textEdits);
      expect(fakeEditor.setTextInBufferRange.firstCall.args[0]).deep.equals(new Range(new Point(1, 0), new Point(2, 12)));
      expect(fakeEditor.setTextInBufferRange.firstCall.args[1]).equals('first\n');
      expect(fakeEditor.setTextInBufferRange.secondCall.args[1]).equals('second\n');
      expect(fakeEditor.setTextInBufferRange.thirdCall.args[1]).equals('third');
    });

    it('correctly applies TextEdits to a real Atom TextEditor', () => {
      const textEditor = new TextEditor();
      FormatCodeAdapter.applyTextEdits(textEditor, textEdits);
      expect(textEditor.getText()).equals('first\nsecond\nthird');
    });
  });

  describe('applyTextEditsInTransaction', () => {
    const textEdits: Array<ls.TextEdit> = [
      { newText: 'first\n', range: { start: { line: 1, character: 0 }, end: { line: 2, character: 12 } } },
      { newText: 'second\n', range: { start: { line: 2, character: 0 }, end: { line: 3, character: 0 } } },
      { newText: 'third', range: { start: { line: 3, character: 0 }, end: { line: 4, character: 0 } } }
    ];

    it('correctly applies TextEdits to a real Atom TextEditor in an undoable transaction', () => {
      const textEditor = new TextEditor();
      textEditor.setText('This is a test');
      FormatCodeAdapter.applyTextEditsInTransaction(textEditor, textEdits);
      expect(textEditor.getText()).equals('This is a testfirst\nsecond\nthird');
      textEditor.getBuffer().undo();
      expect(textEditor.getText()).equals('This is a test');
    });
  });

  describe('getFormatOptions', () => {
    it('creates FormattingOptions based on the Atom TextEditor', () => {
      const formatOptions = FormatCodeAdapter.getFormatOptions(fakeEditor);
      expect(formatOptions.insertSpaces).equals(true);
      expect(formatOptions.tabSize).equals(4);
    });
  });
})
