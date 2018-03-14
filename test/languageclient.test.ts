import * as ls from '../lib/languageclient';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { createSpyConnection } from './helpers.js';
import { NullLogger } from '../lib/logger';

describe('LanguageClientConnection', () => {
  beforeEach(() => {
    (global as any).sinon = sinon.sandbox.create();
  });
  afterEach(() => {
    (global as any).sinon.restore();
  });

  it('listens to the RPC connection it is given', () => {
    const rpc = createSpyConnection();

    new ls.LanguageClientConnection(rpc, new NullLogger());
    expect((rpc as any).listen.called).equals(true);
  });

  it('disposes of the connection when it is disposed', () => {
    const rpc = createSpyConnection();
    const lc = new ls.LanguageClientConnection(rpc, new NullLogger());
    expect((rpc as any).dispose.called).equals(false);
    lc.dispose();
    expect((rpc as any).dispose.called).equals(true);
  });

  describe('send requests', () => {
    const textDocumentPositionParams: ls.TextDocumentPositionParams = {
      textDocument: {uri: 'file:///1/z80.asm'},
      position: {line: 24, character: 32},
    };
    let lc: any;

    beforeEach(() => {
      lc = new ls.LanguageClientConnection(createSpyConnection(), new NullLogger());
      sinon.spy(lc, '_sendRequest');
    });

    it('sends a request for initialize', async () => {
      const params = {capabilities: {}};
      await lc.initialize(params);

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
      await lc.completion(textDocumentPositionParams);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/completion');
      expect(lc._sendRequest.getCall(0).args[1]).equals(textDocumentPositionParams);
    });

    it('sends a request for completionItemResolve', async () => {
      const completionItem: ls.CompletionItem = {label: 'abc'};
      await lc.completionItemResolve(completionItem);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('completionItem/resolve');
      expect(lc._sendRequest.getCall(0).args[1]).equals(completionItem);
    });

    it('sends a request for hover', async () => {
      await lc.hover(textDocumentPositionParams);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/hover');
      expect(lc._sendRequest.getCall(0).args[1]).equals(textDocumentPositionParams);
    });

    it('sends a request for signatureHelp', async () => {
      await lc.signatureHelp(textDocumentPositionParams);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/signatureHelp');
      expect(lc._sendRequest.getCall(0).args[1]).equals(textDocumentPositionParams);
    });

    it('sends a request for gotoDefinition', async () => {
      await lc.gotoDefinition(textDocumentPositionParams);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/definition');
      expect(lc._sendRequest.getCall(0).args[1]).equals(textDocumentPositionParams);
    });

    it('sends a request for findReferences', async () => {
      await lc.findReferences(textDocumentPositionParams);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/references');
      expect(lc._sendRequest.getCall(0).args[1]).equals(textDocumentPositionParams);
    });

    it('sends a request for documentHighlight', async () => {
      await lc.documentHighlight(textDocumentPositionParams);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/documentHighlight');
      expect(lc._sendRequest.getCall(0).args[1]).equals(textDocumentPositionParams);
    });

    it('sends a request for documentSymbol', async () => {
      await lc.documentSymbol(textDocumentPositionParams);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/documentSymbol');
      expect(lc._sendRequest.getCall(0).args[1]).equals(textDocumentPositionParams);
    });

    it('sends a request for workspaceSymbol', async () => {
      const params: ls.WorkspaceSymbolParams = {query: 'something'};
      await lc.workspaceSymbol(params);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('workspace/symbol');
      expect(lc._sendRequest.getCall(0).args[1]).equals(params);
    });

    it('sends a request for codeAction', async () => {
      const params: ls.CodeActionParams = {
        textDocument: textDocumentPositionParams.textDocument,
        range: {
          start: {line: 1, character: 1},
          end: {line: 24, character: 32},
        },
        context: {diagnostics: []},
      };
      await lc.codeAction(params);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/codeAction');
      expect(lc._sendRequest.getCall(0).args[1]).equals(params);
    });

    it('sends a request for codeLens', async () => {
      const params: ls.CodeLensParams = {
        textDocument: textDocumentPositionParams.textDocument,
      };
      await lc.codeLens(params);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/codeLens');
      expect(lc._sendRequest.getCall(0).args[1]).equals(params);
    });

    it('sends a request for codeLensResolve', async () => {
      const params: ls.CodeLens = {
        range: {
          start: {line: 1, character: 1},
          end: {line: 24, character: 32},
        },
      };
      await lc.codeLensResolve(params);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('codeLens/resolve');
      expect(lc._sendRequest.getCall(0).args[1]).equals(params);
    });

    it('sends a request for documentLink', async () => {
      const params: ls.DocumentLinkParams = {
        textDocument: textDocumentPositionParams.textDocument,
      };
      await lc.documentLink(params);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/documentLink');
      expect(lc._sendRequest.getCall(0).args[1]).equals(params);
    });

    it('sends a request for documentLinkResolve', async () => {
      const params: ls.DocumentLink = {
        range: {
          start: {line: 1, character: 1},
          end: {line: 24, character: 32},
        },
        target: 'abc.def.ghi',
      };
      await lc.documentLinkResolve(params);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('documentLink/resolve');
      expect(lc._sendRequest.getCall(0).args[1]).equals(params);
    });

    it('sends a request for documentFormatting', async () => {
      const params: ls.DocumentFormattingParams = {
        textDocument: textDocumentPositionParams.textDocument,
        options: {tabSize: 6, insertSpaces: true, someValue: 'optional'},
      };
      await lc.documentFormatting(params);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/formatting');
      expect(lc._sendRequest.getCall(0).args[1]).equals(params);
    });

    it('sends a request for documentRangeFormatting', async () => {
      const params: ls.DocumentRangeFormattingParams = {
        textDocument: textDocumentPositionParams.textDocument,
        range: {
          start: {line: 1, character: 1},
          end: {line: 24, character: 32},
        },
        options: {tabSize: 6, insertSpaces: true, someValue: 'optional'},
      };
      await lc.documentRangeFormatting(params);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/rangeFormatting');
      expect(lc._sendRequest.getCall(0).args[1]).equals(params);
    });

    it('sends a request for documentOnTypeFormatting', async () => {
      const params: ls.DocumentOnTypeFormattingParams = {
        textDocument: textDocumentPositionParams.textDocument,
        position: {line: 1, character: 1},
        ch: '}',
        options: {tabSize: 6, insertSpaces: true, someValue: 'optional'},
      };
      await lc.documentOnTypeFormatting(params);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/onTypeFormatting');
      expect(lc._sendRequest.getCall(0).args[1]).equals(params);
    });

    it('sends a request for rename', async () => {
      const params: ls.RenameParams = {
        textDocument: {uri: 'file:///a/b.txt'},
        position: {line: 1, character: 2},
        newName: 'abstractConstructorFactory',
      };
      await lc.rename(params);

      expect(lc._sendRequest.called).equals(true);
      expect(lc._sendRequest.getCall(0).args[0]).equals('textDocument/rename');
      expect(lc._sendRequest.getCall(0).args[1]).equals(params);
    });
  });

  describe('send notifications', () => {
    const textDocumentItem: ls.TextDocumentItem = {
      uri: 'file:///best/bits.js',
      languageId: 'javascript',
      text: 'function a() { return "b"; };',
      version: 1,
    };
    const versionedTextDocumentIdentifier: ls.VersionedTextDocumentIdentifier = {
      uri: 'file:///best/bits.js',
      version: 1,
    };

    let lc: any;

    beforeEach(() => {
      lc = new ls.LanguageClientConnection(createSpyConnection(), new NullLogger());
      sinon.stub(lc, '_sendNotification');
    });

    it('exit sends notification', () => {
      lc.exit();

      expect(lc._sendNotification.called).equals(true);
      expect(lc._sendNotification.getCall(0).args[0]).equals('exit');
      expect(lc._sendNotification.getCall(0).args.length).equals(1);
    });

    it('initialized sends notification', () => {
      lc.initialized();

      expect(lc._sendNotification.called).equals(true);
      expect(lc._sendNotification.getCall(0).args[0]).equals('initialized');
      const expected: ls.InitializedParams = {};
      expect(lc._sendNotification.getCall(0).args[1]).to.deep.equal(expected);
    });

    it('didChangeConfiguration sends notification', () => {
      const params: ls.DidChangeConfigurationParams = {
        settings: {a: {b: 'c'}},
      };
      lc.didChangeConfiguration(params);

      expect(lc._sendNotification.called).equals(true);
      expect(lc._sendNotification.getCall(0).args[0]).equals('workspace/didChangeConfiguration');
      expect(lc._sendNotification.getCall(0).args[1]).equals(params);
    });

    it('didOpenTextDocument sends notification', () => {
      const params: ls.DidOpenTextDocumentParams = {
        textDocument: textDocumentItem,
      };
      lc.didOpenTextDocument(params);

      expect(lc._sendNotification.called).equals(true);
      expect(lc._sendNotification.getCall(0).args[0]).equals('textDocument/didOpen');
      expect(lc._sendNotification.getCall(0).args[1]).equals(params);
    });

    it('didChangeTextDocument sends notification', () => {
      const params: ls.DidChangeTextDocumentParams = {
        textDocument: versionedTextDocumentIdentifier,
        contentChanges: [],
      };
      lc.didChangeTextDocument(params);

      expect(lc._sendNotification.called).equals(true);
      expect(lc._sendNotification.getCall(0).args[0]).equals('textDocument/didChange');
      expect(lc._sendNotification.getCall(0).args[1]).equals(params);
    });

    it('didCloseTextDocument sends notification', () => {
      const params: ls.DidCloseTextDocumentParams = {
        textDocument: textDocumentItem,
      };
      lc.didCloseTextDocument(params);

      expect(lc._sendNotification.called).equals(true);
      expect(lc._sendNotification.getCall(0).args[0]).equals('textDocument/didClose');
      expect(lc._sendNotification.getCall(0).args[1]).equals(params);
    });

    it('didSaveTextDocument sends notification', () => {
      const params: ls.DidSaveTextDocumentParams = {
        textDocument: textDocumentItem,
      };
      lc.didSaveTextDocument(params);

      expect(lc._sendNotification.called).equals(true);
      expect(lc._sendNotification.getCall(0).args[0]).equals('textDocument/didSave');
      expect(lc._sendNotification.getCall(0).args[1]).equals(params);
    });

    it('didChangeWatchedFiles sends notification', () => {
      const params: ls.DidChangeWatchedFilesParams = {changes: []};
      lc.didChangeWatchedFiles(params);

      expect(lc._sendNotification.called).equals(true);
      expect(lc._sendNotification.getCall(0).args[0]).equals('workspace/didChangeWatchedFiles');
      expect(lc._sendNotification.getCall(0).args[1]).equals(params);
    });
  });

  describe('notification methods', () => {
    let lc: any;
    const eventMap: { [key: string]: any } = {};

    beforeEach(() => {
      lc = new ls.LanguageClientConnection(createSpyConnection(), new NullLogger());
      sinon.stub(lc, '_onNotification').callsFake((message, callback) => {
        eventMap[message.method] = callback;
      });
    });

    it('onShowMessage calls back on window/showMessage', () => {
      let called = false;
      lc.onShowMessage(() => {
        called = true;
      });
      eventMap['window/showMessage']();
      expect(called).equals(true);
    });
  });
});
