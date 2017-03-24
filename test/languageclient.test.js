import * as ls from '../lib/languageclient';
import NullLogger from '../lib/loggers/null-logger';
import sinon from 'sinon';

describe('LanguageClientConnection', () => {
  beforeEach(function() {
    global.sinon = sinon.sandbox.create();
  });

  // eslint-disable-next-line jasmine/no-global-setup
  afterEach(function() {
    global.sinon.restore();
  });

  createSpyConnection = () => {
    return {
      listen: sinon.spy(),
      onError: sinon.spy(),
      onUnhandledNotification: sinon.spy(),
      onNotification: sinon.spy(),
      dispose: sinon.spy()
    }
  }

  it('listens to the RPC connection it is given', () => {
    const rpc = createSpyConnection();

    new ls.LanguageClientConnection(rpc, new NullLogger());

    expect(rpc.listen.called).to.be.true;
  })

  it('disposes of the connection when it is disposed', () => {
    const rpc = createSpyConnection();

    const lc = new ls.LanguageClientConnection(rpc, new NullLogger())
    expect(rpc.dispose.called).to.be.false;

    lc.dispose();
    expect(rpc.dispose.called).to.be.true;
  })

  describe('send request', async () => {
    let lc;
    let dummyPayload;

    beforeEach(() => {
      lc = new ls.LanguageClientConnection(createSpyConnection(), new NullLogger());
      dummyPayload = { 'send': Math.random() };
      sinon.stub(lc, '_sendRequest').returns(dummyPayload);
    })

    it('sends a request for initialize', async () => {
      const result = await lc.initialize(dummyPayload);

      expect(lc._sendRequest.called).to.be.true;
      expect(lc._sendRequest.getCall(0).args[0]).to.equal('initialize');
      expect(lc._sendRequest.getCall(0).args[1]).to.equal(dummyPayload);
      expect(result).to.equal(dummyPayload);
    })

    it('sends a request for shutdown', async () => {
      await lc.shutdown();

      expect(lc._sendRequest.called).to.be.true;
      expect(lc._sendRequest.getCall(0).args[0]).to.equal('shutdown');
    })

    it('sends a request for completion', async () => {
      const result = await lc.completion(dummyPayload);

      expect(lc._sendRequest.called).to.be.true;
      expect(lc._sendRequest.getCall(0).args[0]).to.equal('textDocument/completion');
      expect(lc._sendRequest.getCall(0).args[1]).to.equal(dummyPayload);
      expect(result).to.equal(dummyPayload);
    })

    it('sends a request for completionItemResolve', async () => {
      const result = await lc.completionItemResolve(dummyPayload);

      expect(lc._sendRequest.called).to.be.true;
      expect(lc._sendRequest.getCall(0).args[0]).to.equal('completionItem/resolve');
      expect(lc._sendRequest.getCall(0).args[1]).to.equal(dummyPayload);
      expect(result).to.equal(dummyPayload);
    })

    it('sends a request for hover', async () => {
      const result = await lc.hover(dummyPayload);

      expect(lc._sendRequest.called).to.be.true;
      expect(lc._sendRequest.getCall(0).args[0]).to.equal('textDocument/hover');
      expect(lc._sendRequest.getCall(0).args[1]).to.equal(dummyPayload);
      expect(result).to.equal(dummyPayload);
    })

    it('sends a request for signatureHelp', async () => {
      const result = await lc.signatureHelp(dummyPayload);

      expect(lc._sendRequest.called).to.be.true;
      expect(lc._sendRequest.getCall(0).args[0]).to.equal('textDocument/signatureHelp');
      expect(lc._sendRequest.getCall(0).args[1]).to.equal(dummyPayload);
      expect(result).to.equal(dummyPayload);
    })

    it('sends a request for gotoDefinition', async () => {
      const result = await lc.gotoDefinition(dummyPayload);

      expect(lc._sendRequest.called).to.be.true;
      expect(lc._sendRequest.getCall(0).args[0]).to.equal('textDocument/definition');
      expect(lc._sendRequest.getCall(0).args[1]).to.equal(dummyPayload);
      expect(result).to.equal(dummyPayload);
    })

    it('sends a request for findReferences', async () => {
      const result = await lc.findReferences(dummyPayload);

      expect(lc._sendRequest.called).to.be.true;
      expect(lc._sendRequest.getCall(0).args[0]).to.equal('textDocument/references');
      expect(lc._sendRequest.getCall(0).args[1]).to.equal(dummyPayload);
      expect(result).to.equal(dummyPayload);
    })

    it('sends a request for documentHighlight', async () => {
      const result = await lc.documentHighlight(dummyPayload);

      expect(lc._sendRequest.called).to.be.true;
      expect(lc._sendRequest.getCall(0).args[0]).to.equal('textDocument/documentHighlight');
      expect(lc._sendRequest.getCall(0).args[1]).to.equal(dummyPayload);
      expect(result).to.equal(dummyPayload);
    })

    it('sends a request for documentSymbol', async () => {
      const result = await lc.documentSymbol(dummyPayload);

      expect(lc._sendRequest.called).to.be.true;
      expect(lc._sendRequest.getCall(0).args[0]).to.equal('textDocument/documentSymbol');
      expect(lc._sendRequest.getCall(0).args[1]).to.equal(dummyPayload);
      expect(result).to.equal(dummyPayload);
    })

    it('sends a request for workspaceSymbol', async () => {
      const result = await lc.workspaceSymbol(dummyPayload);

      expect(lc._sendRequest.called).to.be.true;
      expect(lc._sendRequest.getCall(0).args[0]).to.equal('workspace/symbol');
      expect(lc._sendRequest.getCall(0).args[1]).to.equal(dummyPayload);
      expect(result).to.equal(dummyPayload);
    })

    it('sends a request for codeLens', async () => {
      const result = await lc.codeLens(dummyPayload);

      expect(lc._sendRequest.called).to.be.true;
      expect(lc._sendRequest.getCall(0).args[0]).to.equal('textDocument/codeLens');
      expect(lc._sendRequest.getCall(0).args[1]).to.equal(dummyPayload);
      expect(result).to.equal(dummyPayload);
    })

    it('sends a request for codeLensResolve', async () => {
      const result = await lc.codeLensResolve(dummyPayload);

      expect(lc._sendRequest.called).to.be.true;
      expect(lc._sendRequest.getCall(0).args[0]).to.equal('codeLens/resolve');
      expect(lc._sendRequest.getCall(0).args[1]).to.equal(dummyPayload);
      expect(result).to.equal(dummyPayload);
    })

    it('sends a request for documentLink', async () => {
      const result = await lc.documentLink(dummyPayload);

      expect(lc._sendRequest.called).to.be.true;
      expect(lc._sendRequest.getCall(0).args[0]).to.equal('textDocument/documentLink');
      expect(lc._sendRequest.getCall(0).args[1]).to.equal(dummyPayload);
      expect(result).to.equal(dummyPayload);
    })

    it('sends a request for documentLinkResolve', async () => {
      const result = await lc.documentLinkResolve(dummyPayload);

      expect(lc._sendRequest.called).to.be.true;
      expect(lc._sendRequest.getCall(0).args[0]).to.equal('documentLink/resolve');
      expect(lc._sendRequest.getCall(0).args[1]).to.equal(dummyPayload);
      expect(result).to.equal(dummyPayload);
    })

    it('sends a request for documentFormatting', async () => {
      const result = await lc.documentFormatting(dummyPayload);

      expect(lc._sendRequest.called).to.be.true;
      expect(lc._sendRequest.getCall(0).args[0]).to.equal('textDocument/formatting');
      expect(lc._sendRequest.getCall(0).args[1]).to.equal(dummyPayload);
      expect(result).to.equal(dummyPayload);
    })

    it('sends a request for documentRangeFormatting', async () => {
      const result = await lc.documentRangeFormatting(dummyPayload);

      expect(lc._sendRequest.called).to.be.true;
      expect(lc._sendRequest.getCall(0).args[0]).to.equal('textDocument/rangeFormatting');
      expect(lc._sendRequest.getCall(0).args[1]).to.equal(dummyPayload);
      expect(result).to.equal(dummyPayload);
    })

    it('sends a request for documentOnTypeFormatting', async () => {
      const result = await lc.documentOnTypeFormatting(dummyPayload);

      expect(lc._sendRequest.called).to.be.true;
      expect(lc._sendRequest.getCall(0).args[0]).to.equal('textDocument/onTypeFormatting');
      expect(lc._sendRequest.getCall(0).args[1]).to.equal(dummyPayload);
      expect(result).to.equal(dummyPayload);
    })

    it('sends a request for rename', async () => {
      const result = await lc.rename(dummyPayload);

      expect(lc._sendRequest.called).to.be.true;
      expect(lc._sendRequest.getCall(0).args[0]).to.equal('textDocument/rename');
      expect(lc._sendRequest.getCall(0).args[1]).to.equal(dummyPayload);
      expect(result).to.equal(dummyPayload);
    })
  })

  describe('send notification', async () => {
    let lc;
    let dummyPayload;

    beforeEach(() => {
      lc = new ls.LanguageClientConnection(createSpyConnection(), new NullLogger());
      dummyPayload = { 'send': Math.random() };
      sinon.stub(lc, '_sendNotification');
    })

    it('didChangeConfiguration sends notification', async () => {
      lc.didChangeConfiguration(dummyPayload);

      expect(lc._sendNotification.called).to.be.true;
      expect(lc._sendNotification.getCall(0).args[0]).to.equal('workspace/didChangeConfiguration');
      expect(lc._sendNotification.getCall(0).args[1]).to.equal(dummyPayload);
    })

    it('didOpenTextDocument sends notification', async () => {
      lc.didOpenTextDocument(dummyPayload);

      expect(lc._sendNotification.called).to.be.true;
      expect(lc._sendNotification.getCall(0).args[0]).to.equal('textDocument/didOpen');
      expect(lc._sendNotification.getCall(0).args[1]).to.equal(dummyPayload);
    })

    it('didChangeTextDocument sends notification', async () => {
      lc.didChangeTextDocument(dummyPayload);

      expect(lc._sendNotification.called).to.be.true;
      expect(lc._sendNotification.getCall(0).args[0]).to.equal('textDocument/didChange');
      expect(lc._sendNotification.getCall(0).args[1]).to.equal(dummyPayload);
    })

    it('didCloseTextDocument sends notification', async () => {
      lc.didCloseTextDocument(dummyPayload);

      expect(lc._sendNotification.called).to.be.true;
      expect(lc._sendNotification.getCall(0).args[0]).to.equal('textDocument/didClose');
      expect(lc._sendNotification.getCall(0).args[1]).to.equal(dummyPayload);
    })

    it('didSaveTextDocument sends notification', async () => {
      lc.didSaveTextDocument(dummyPayload);

      expect(lc._sendNotification.called).to.be.true;
      expect(lc._sendNotification.getCall(0).args[0]).to.equal('textDocument/didSave');
      expect(lc._sendNotification.getCall(0).args[1]).to.equal(dummyPayload);
    })

    it('didChangeWatchedFiles sends notification', async () => {
      lc.didChangeWatchedFiles(dummyPayload);

      expect(lc._sendNotification.called).to.be.true;
      expect(lc._sendNotification.getCall(0).args[0]).to.equal('workspace/didChangeWatchedFiles');
      expect(lc._sendNotification.getCall(0).args[1]).to.equal(dummyPayload);
    })
  })

  describe('notification methods', async () => {
    let lc;
    let dummyPayload;
    const eventMap = { };

    beforeEach(() => {
      lc = new ls.LanguageClientConnection(createSpyConnection(), new NullLogger());
      dummyPayload = { 'send': Math.random() };
      sinon.stub(lc, '_onNotification').callsFake((message, callback) => {
        eventMap[message.method] = callback;
      });
    })

    it('onExit calls back on exit', async () => {
      let called = false;
      lc.onExit(() => { called = true; });
      eventMap['exit']();
      expect(called).to.equal(true);
    })

    it('onShowMessage calls back on window/showMessage', async () => {
      let called = false;
      lc.onShowMessage(() => { called = true; });
      eventMap['window/showMessage']();
      expect(called).to.equal(true);
    })

  })
})
