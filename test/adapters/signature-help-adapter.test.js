// @flow

import {Disposable, Point} from 'atom';
import SignatureHelpAdapter from '../../lib/adapters/signature-help-adapter';
import {createFakeEditor, createSpyConnection} from '../helpers';
import {expect} from 'chai';
import sinon from 'sinon';

describe('SignatureHelpAdapter', () => {
  describe('canAdapt', () => {
    it('checks for signatureHelpProvider', () => {
      expect(SignatureHelpAdapter.canAdapt({})).to.equal(false);
      expect(SignatureHelpAdapter.canAdapt({signatureHelpProvider: {}})).to.equal(true);
    });
  });

  describe('can attach to a server', () => {
    it('subscribes to onPublishDiagnostics', async () => {
      const connection = createSpyConnection();
      connection.signatureHelp = sinon.stub().resolves({signatures: []});

      const adapter = new SignatureHelpAdapter(
        ({
          connection,
          capabilities: {
            signatureHelpProvider: {
              triggerCharacters: ['(', ','],
            },
          },
        }: any),
        ['source.js'],
      );
      const spy = sinon.stub().returns(new Disposable());
      adapter.attach(spy);
      expect(spy.calledOnce).to.be.true;
      const provider = spy.firstCall.args[0];
      expect(provider.priority).to.equal(1);
      expect(provider.grammarScopes).to.deep.equal(['source.js']);
      expect(provider.triggerCharacters).to.deep.equal(new Set(['(', ',']));
      expect(typeof provider.getSignatureHelp).to.equal('function');

      const result = await provider.getSignatureHelp(createFakeEditor('test.txt'), new Point(0, 1));
      expect(connection.signatureHelp.calledOnce).to.be.true;
      const params = connection.signatureHelp.firstCall.args[0];
      expect(params).to.deep.equal({
        textDocument: {uri: 'file:///test.txt'},
        position: {line: 0, character: 1},
      });
      expect(result).to.deep.equal({signatures: []});
    });
  });
});
