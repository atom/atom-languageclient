// @flow

import * as ls from '../lib/languageclient';
import NullLogger from '../lib/loggers/null-logger';
import sinon from 'sinon';
import {expect} from 'chai';
import {createSpyConnection} from './helpers.js';

describe('LanguageClientConnection', () => {
  beforeEach(() => { global.sinon = sinon.sandbox.create(); });
  afterEach(() => { global.sinon.restore(); });

  it('listens to the RPC connection it is given', () => {
    const rpc = createSpyConnection();

    new ls.LanguageClientConnection(rpc, new NullLogger());
    expect(rpc.listen.called).equals(true);
  })

  it('disposes of the connection when it is disposed', () => {
    const rpc = createSpyConnection();
    const lc = new ls.LanguageClientConnection(rpc, new NullLogger())
    expect(rpc.dispose.called).equals(false);
    lc.dispose();
    expect(rpc.dispose.called).equals(true);
  });

  describe('send requests', () => {
    const textDocumentPositionParams: ls.TextDocumentPositionParams = {
      textDocument: { uri: 'file:///1/z80.asm' },
      position: { line: 24, character: 32 },
    };
    let lc;

    beforeEach(() => {
      lc = new ls.LanguageClientConnection(createSpyConnection(), new NullLogger());
      sinon.spy(lc, '_sendRequest');
    });

    it('sends a request for initialize', async () => {
      const params: ls.InitializeParams = { capabilities: { } };
      const result = await lc.initialize(params);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('initialize');
      expect(lc._sendRequest.getCall(0).args[1]).equals(params);
    });

    it('sends a request for shutdown', async () => {
      await lc.shutdown();

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('shutdown');
    });

    it('sends a request for completion', async () => {
      const result = await lc.completion(textDocumentPositionParams);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/completion');
      expect(lc._sendRequest.getCall(0).args[1]).equals(textDocumentPositionParams);
    });

    it('sends a request for completionItemResolve', async () => {
      const completionItem: ls.CompletionItem = { label: 'abc' };
      const result = await lc.completionItemResolve(completionItem);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('completionItem/resolve');
      expect(lc._sendRequest.getCall(0).args[1]).equals(completionItem);
    });

    it('sends a request for hover', async () => {
      const result = await lc.hover(textDocumentPositionParams);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/hover');
      expect(lc._sendRequest.getCall(0).args[1]).equals(textDocumentPositionParams);
    })

    it('sends a request for signatureHelp', async () => {
      const result = await lc.signatureHelp(textDocumentPositionParams);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/signatureHelp');
      expect(lc._sendRequest.getCall(0).args[1]).equals(textDocumentPositionParams);
    });

    it('sends a request for gotoDefinition', async () => {
      const result = await lc.gotoDefinition(textDocumentPositionParams);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/definition');
      expect(lc._sendRequest.getCall(0).args[1]).equals(textDocumentPositionParams);
    });

    it('sends a request for findReferences', async () => {
      const result = await lc.findReferences(textDocumentPositionParams);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/references');
      expect(lc._sendRequest.getCall(0).args[1]).equals(textDocumentPositionParams);
    });

    it('sends a request for documentHighlight', async () => {
      const result = await lc.documentHighlight(textDocumentPositionParams);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/documentHighlight');
      expect(lc._sendRequest.getCall(0).args[1]).equals(textDocumentPositionParams);
    });

    it('sends a request for documentSymbol', async () => {
      const result = await lc.documentSymbol(textDocumentPositionParams);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/documentSymbol');
      expect(lc._sendRequest.getCall(0).args[1]).equals(textDocumentPositionParams);
    });

    it('sends a request for workspaceSymbol', async () => {
      const params: ls.WorkspaceSymbolParams = { query: 'something' };
      const result = await lc.workspaceSymbol(params);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('workspace/symbol');
      expect(lc._sendRequest.getCall(0).args[1]).equals(params);
    });

    it('sends a request for codeAction', async () => {
      const params: ls.CodeActionParams = {
        textDocument: textDocumentPositionParams.textDocument,
        range: { start: { line: 1, character: 1}, end: { line: 24, character: 32 } },
        context: { diagnostics: [] }
      };
      const result = await lc.codeAction(params);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/codeAction');
      expect(lc._sendRequest.getCall(0).args[1]).equals(params);
    });

    it('sends a request for codeLens', async () => {
      const params: ls.CodeLensParams = {
        textDocument: textDocumentPositionParams.textDocument
      };
      const result = await lc.codeLens(params);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/codeLens');
      expect(lc._sendRequest.getCall(0).args[1]).equals(params);
    });

    it('sends a request for codeLensResolve', async () => {
      const params: ls.CodeLens = {
        range: { start: { line: 1, character: 1}, end: { line: 24, character: 32 } }
      };
      const result = await lc.codeLensResolve(params);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('codeLens/resolve');
      expect(lc._sendRequest.getCall(0).args[1]).equals(params);
    });

    it('sends a request for documentLink', async () => {
      const params: ls.DocumentLinkParams = {
        textDocument: textDocumentPositionParams.textDocument
      };
      const result = await lc.documentLink(params);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/documentLink');
      expect(lc._sendRequest.getCall(0).args[1]).equals(params);
    });

    it('sends a request for documentLinkResolve', async () => {
      const params: ls.DocumentLink = {
        range: { start: { line: 1, character: 1}, end: { line: 24, character: 32 } },
        target: 'abc.def.ghi'
      };
      const result = await lc.documentLinkResolve(params);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('documentLink/resolve');
      expect(lc._sendRequest.getCall(0).args[1]).equals(params);
    });

    it('sends a request for documentFormatting', async () => {
      const params: ls.DocumentFormattingParams = {
        textDocument: textDocumentPositionParams.textDocument,
        options: { tabSize: 6, insertSpaces: true, someValue: 'optional' }
      };
      const result = await lc.documentFormatting(params);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/formatting');
      expect(lc._sendRequest.getCall(0).args[1]).equals(params);
    });

    it('sends a request for documentRangeFormatting', async () => {
      const params: ls.DocumentRangeFormattingParams = {
        textDocument: textDocumentPositionParams.textDocument,
        range: { start: { line: 1, character: 1 }, end: { line: 24, character: 32 } },
        options: { tabSize: 6, insertSpaces: true, someValue: 'optional' }
      };
      const result = await lc.documentRangeFormatting(params);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/rangeFormatting');
      expect(lc._sendRequest.getCall(0).args[1]).equals(params);
    });

    it('sends a request for documentOnTypeFormatting', async () => {
      const params: ls.DocumentOnTypeFormattingParams = {
        textDocument: textDocumentPositionParams.textDocument,
        position: { line: 1, character: 1 },
        ch: '}',
        options: { tabSize: 6, insertSpaces: true, someValue: 'optional' }
      };
      const result = await lc.documentOnTypeFormatting(params);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/onTypeFormatting');
      expect(lc._sendRequest.getCall(0).args[1]).equals(params);
    });

    it('sends a request for rename', async () => {
      const params: ls.RenameParams = {
        textDocument: { uri: 'file:///a/b.txt'},
        position: { line: 1, character: 2},
        newName: 'abstractConstructorFactory'
      };
      const result = await lc.rename(params);
      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/rename');
      expect(lc._sendRequest.getCall(0).args[1]).equals(params);
    });
  });

  describe('send notifications', () => {
    const textDocumentItem : ls.TextDocumentItem = {
      uri: 'file:///best/bits.js',
      languageId: 'javascript',
      version: 1.0,
      text: 'function a() { return "b"; };'
    };
    const versionedTextDocumentItem : ls.TextDocumentItem = {
      uri: 'file:///best/bits.js',
      languageId: 'javascript',
      version: 1.0,
      text: 'function a() { return "b"; };',
      version: 1
    };

    let lc;

    beforeEach(() => {
      lc = new ls.LanguageClientConnection(createSpyConnection(), new NullLogger());
      sinon.stub(lc, '_sendNotification');
    });

    it('didChangeConfiguration sends notification', async () => {
      const params: ls.DidChangeConfigurationParams = { settings: { a: { b: 'c' } } };
      lc.didChangeConfiguration(params);

      expect(lc._sendNotification.called).equals(true);
      expect(lc._sendNotification.getCall(0).args[0]).equals('workspace/didChangeConfiguration');
      expect(lc._sendNotification.getCall(0).args[1]).equals(params);
    });

    it('didOpenTextDocument sends notification', async () => {
      const params: ls.DidOpenTextDocumentParams = { textDocument: textDocumentItem };
      lc.didOpenTextDocument(params);

      expect(lc._sendNotification.called).equals(true);
      expect(lc._sendNotification.getCall(0).args[0]).equals('textDocument/didOpen');
      expect(lc._sendNotification.getCall(0).args[1]).equals(params);
    });

    it('didChangeTextDocument sends notification', async () => {
      const params: ls.DidChangeTextDocumentParams = {
        textDocument: versionedTextDocumentItem,
        contentChanges: []
      };
      lc.didChangeTextDocument(params);

      expect(lc._sendNotification.called).equals(true);
      expect(lc._sendNotification.getCall(0).args[0]).equals('textDocument/didChange');
      expect(lc._sendNotification.getCall(0).args[1]).equals(params);
    });

    it('didCloseTextDocument sends notification', async () => {
      const params: ls.DidCloseTextDocumentParams = { textDocument: textDocumentItem };
      lc.didCloseTextDocument(params);

      expect(lc._sendNotification.called).equals(true);
      expect(lc._sendNotification.getCall(0).args[0]).equals('textDocument/didClose');
      expect(lc._sendNotification.getCall(0).args[1]).equals(params);
    });

    it('didSaveTextDocument sends notification', async () => {
      const params: ls.DidSaveTextDocumentParams = { textDocument: textDocumentItem };
      lc.didSaveTextDocument(params);

      expect(lc._sendNotification.called).equals(true);
      expect(lc._sendNotification.getCall(0).args[0]).equals('textDocument/didSave');
      expect(lc._sendNotification.getCall(0).args[1]).equals(params);
    });

    it('didChangeWatchedFiles sends notification', async () => {
      const params: ls.DidChangeWatchedFilesParams = { changes: [] };
      lc.didChangeWatchedFiles(params);

      expect(lc._sendNotification.called).equals(true);
      expect(lc._sendNotification.getCall(0).args[0]).equals('workspace/didChangeWatchedFiles');
      expect(lc._sendNotification.getCall(0).args[1]).equals(params);
    });
  });

  describe('notification methods', () => {
    let lc;
    let dummyPayload;
    const eventMap = { };

    beforeEach(() => {
      lc = new ls.LanguageClientConnection(createSpyConnection(), new NullLogger());
      dummyPayload = { 'send': Math.random() };
      sinon.stub(lc, '_onNotification').callsFake((message, callback) => {
        eventMap[message.method] = callback;
      });
    });

    it('onExit calls back on exit', async () => {
      let called = false;
      lc.onExit(() => { called = true; });
      eventMap['exit']();
      expect(called).equals(true);
    });

    it('onShowMessage calls back on window/showMessage', async () => {
      let called = false;
      lc.onShowMessage(() => { called = true; });
      eventMap['window/showMessage']();
      expect(called).equals(true);
    });
  });
});
