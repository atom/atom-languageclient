// @flow

import {Range} from 'atom';
import {expect} from 'chai';
import sinon from 'sinon';
import * as ls from '../../lib/languageclient';
import CodeActionAdapter from '../../lib/adapters/code-action-adapter';
import LinterPushV2Adapter from '../../lib/adapters/linter-push-v2-adapter';
import {createSpyConnection, createFakeEditor} from '../helpers.js';

describe('CodeActionAdapter', () => {
  describe('canAdapt', () => {
    it('returns true if range formatting is supported', () => {
      const result = CodeActionAdapter.canAdapt({
        codeActionProvider: true,
      });
      expect(result).to.be.true;
    });

    it('returns false it no formatting supported', () => {
      const result = CodeActionAdapter.canAdapt({});
      expect(result).to.be.false;
    });
  });

  describe('getCodeActions', () => {
    it('fetches code actions from the connection', async () => {
      const connection = createSpyConnection();
      const languageClient = new ls.LanguageClientConnection(connection);
      const testCommand: ls.Command = {
        command: 'testCommand',
        title: 'Test Command',
        arguments: ['a', 'b'],
      };
      sinon.stub(languageClient, 'codeAction').returns(Promise.resolve([testCommand]));
      sinon.spy(languageClient, 'executeCommand');

      const linterAdapter = new LinterPushV2Adapter(languageClient);
      sinon.stub(linterAdapter, 'getDiagnosticCode').returns('test code');

      const testPath = '/test.txt';
      const actions = await CodeActionAdapter.getCodeActions(
        languageClient,
        {codeActionProvider: true},
        linterAdapter,
        createFakeEditor(testPath),
        new Range([1, 2], [3, 4]),
        [
          {
            filePath: testPath,
            type: 'Error',
            text: 'test message',
            range: new Range([1, 2], [3, 3]),
            providerName: 'test linter',
          },
        ],
      );

      expect(languageClient.codeAction.called).to.be.true;
      const args = languageClient.codeAction.getCalls()[0].args;
      const params: ls.CodeActionParams = args[0];
      expect(params.textDocument.uri).to.equal('file://' + testPath);
      expect(params.range).to.deep.equal({
        start: {line: 1, character: 2},
        end: {line: 3, character: 4},
      });
      expect(params.context.diagnostics).to.deep.equal([
        {
          range: {
            start: {line: 1, character: 2},
            end: {line: 3, character: 3},
          },
          severity: ls.DiagnosticSeverity.Error,
          code: 'test code',
          source: 'test linter',
          message: 'test message',
        },
      ]);

      expect(actions.length).to.equal(1);
      const codeAction = actions[0];
      expect(await codeAction.getTitle()).to.equal('Test Command');
      await codeAction.apply();
      expect(languageClient.executeCommand.called).to.be.true;
      expect(languageClient.executeCommand.getCalls()[0].args).to.deep.equal([
        {
          command: 'testCommand',
          arguments: ['a', 'b'],
        },
      ]);
    });
  });
});
