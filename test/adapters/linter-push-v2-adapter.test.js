// @flow

import LinterPushV2Adapter from '../../lib/adapters/linter-push-v2-adapter';
import * as ls from '../../lib/languageclient';
import sinon from 'sinon';
import {expect} from 'chai';
import Convert from '../../lib/convert';
import {Point, Range} from 'atom';
import {createSpyConnection} from '../helpers.js';

describe('LinterPushV2Adapter', () => {
  beforeEach(() => { global.sinon = sinon.sandbox.create(); });
  afterEach(() => { global.sinon.restore(); });

  const flatMap = (source, lambda) => Array.prototype.concat.apply([], source.map(lambda));
  const defaultLanguageClient = new ls.LanguageClientConnection(createSpyConnection());
  const compareLinter = (a: linter$V2Message, b: linter$V2Message): number => {
    if (a == null) { return 1; }
    if (b == null) { return -1; }
    if ((a.location.file || '') < (b.location.file || '')) { return -1; }
    if ((a.location.file || '') > (b.location.file || '')) { return 1; }
    if ((a.location.position.start || 0) < (b.location.position.start || 0)) { return -1; }
    if ((a.location.position.start || 0) > (b.location.position.start || 0)) { return 1; }
    return 0;
  };

  describe('constructor', () => {
    it('subscribes to onPublishDiagnostics', () => {
      const languageClient = new ls.LanguageClientConnection(createSpyConnection());
      sinon.spy(languageClient, 'onPublishDiagnostics');
      new LinterPushV2Adapter(languageClient);
      expect(languageClient.onPublishDiagnostics.called).equals(true);
    });
  });

  describe('diagnosticToMessage', () => {
    it('converts Diagnostic and path to a linter$Message', () => {
      const filePath = '/a/b/c/d';
      const diagnostic: ls.Diagnostic = {
        message: 'This is a message',
        range: {start: {line: 1, character: 2}, end: {line: 3, character: 4}},
        source: 'source',
        code: 'code',
        severity: ls.DiagnosticSeverity.Information,
        type: ls.DiagnosticSeverity.Information,
      };
      const result = LinterPushV2Adapter.diagnosticToV2Message(filePath, diagnostic);
      expect(result.excerpt).equals(diagnostic.message);
      expect(result.linterName).equals(diagnostic.source);
      expect(result.location.file).equals(filePath);
      expect(result.location.position).deep.equals(new Range(new Point(1, 2), new Point(3, 4)));
      expect(result.severity).equals('info');
    });
  });

  describe('diagnosticSeverityToSeverity', () => {
    it('converts DiagnosticSeverity.Error to "error"', () => {
      const severity = LinterPushV2Adapter.diagnosticSeverityToSeverity(ls.DiagnosticSeverity.Error);
      expect(severity).equals('error');
    });

    it('converts DiagnosticSeverity.Warning to "warning"', () => {
      const severity = LinterPushV2Adapter.diagnosticSeverityToSeverity(ls.DiagnosticSeverity.Warning);
      expect(severity).equals('warning');
    });

    it('converts DiagnosticSeverity.Information to "info"', () => {
      const severity = LinterPushV2Adapter.diagnosticSeverityToSeverity(ls.DiagnosticSeverity.Information);
      expect(severity).equals('info');
    });

    it('converts DiagnosticSeverity.Hint to "info"', () => {
      const severity = LinterPushV2Adapter.diagnosticSeverityToSeverity(ls.DiagnosticSeverity.Hint);
      expect(severity).equals('info');
    });
  });
});
