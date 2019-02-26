import LinterPushV2Adapter from '../../lib/adapters/linter-push-v2-adapter';
import Convert from '../../lib/convert';
import * as ls from '../../lib/languageclient';
import * as path from 'path';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { Point, Range } from 'atom';
import { createSpyConnection, createFakeEditor } from '../helpers.js';

describe('LinterPushV2Adapter', () => {
  describe('constructor', () => {
    it('subscribes to onPublishDiagnostics', () => {
      const languageClient = new ls.LanguageClientConnection(createSpyConnection());
      sinon.spy(languageClient, 'onPublishDiagnostics');
      new LinterPushV2Adapter(languageClient);
      expect((languageClient as any).onPublishDiagnostics.called).equals(true);
    });
  });

  describe('diagnosticToMessage', () => {
    it('converts Diagnostic and path to a linter$Message', () => {
      const filePath = '/a/b/c/d';
      const diagnostic: ls.Diagnostic = {
        message: 'This is a message',
        range: {
          start: { line: 1, character: 2 },
          end: { line: 3, character: 4 },
        },
        source: 'source',
        code: 'code',
        severity: ls.DiagnosticSeverity.Information,
      };

      const connection: any = { onPublishDiagnostics() { } };
      const adapter = new LinterPushV2Adapter(connection);
      const result = adapter.diagnosticToV2Message(filePath, diagnostic);

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

  describe('captureDiagnostics', () => {
    it('stores diagnostic codes and allows their retrival', () => {
      const languageClient = new ls.LanguageClientConnection(createSpyConnection());
      const adapter = new LinterPushV2Adapter(languageClient);
      const testPath = path.join(__dirname, 'test.txt');
      adapter.captureDiagnostics({
        uri: Convert.pathToUri(testPath),
        diagnostics: [
          {
            message: 'Test message',
            range: {
              start: { line: 1, character: 2 },
              end: { line: 3, character: 4 },
            },
            source: 'source',
            code: 'test code',
            severity: ls.DiagnosticSeverity.Information,
          },
        ],
      });

      const mockEditor = createFakeEditor(testPath);
      expect(adapter.getDiagnosticCode(mockEditor, new Range([1, 2], [3, 4]), 'Test message')).to.equal('test code');
      expect(adapter.getDiagnosticCode(mockEditor, new Range([1, 2], [3, 4]), 'Test message2')).to.not.exist;
      expect(adapter.getDiagnosticCode(mockEditor, new Range([1, 2], [3, 5]), 'Test message')).to.not.exist;
    });
  });
});
