// @flow

import LinterV1PullAdapter from '../../lib/adapters/linter-pull-v1-adapter';
import * as ls from '../../lib/languageclient';
import sinon from 'sinon';
import {expect} from 'chai';
import Convert from '../../lib/convert';
import {Point, Range} from 'atom';
import {createSpyConnection} from '../helpers.js';

describe('LinterV1PullAdapter', () => {
  const defaultLanguageClient = new ls.LanguageClientConnection(createSpyConnection());
  const compareLinter = (a: linter$Message, b: linter$Message): number => {
    if (a == null) { return 1; }
    if (b == null) { return -1; }
    if ((a.filePath || '') < (b.filePath || '')) { return -1; }
    if ((a.filePath || '') > (b.filePath || '')) { return 1; }
    if ((a.name || '') < (b.name || '')) { return -1; }
    if ((a.name || '') > (b.name || '')) { return 1; }
    return 0;
  };

  describe('constructor', () => {
    it('subscribes to onPublishDiagnostics', () => {
      const languageClient = new ls.LanguageClientConnection(createSpyConnection());
      sinon.spy(languageClient, 'onPublishDiagnostics');
      new LinterV1PullAdapter(languageClient);
      expect(languageClient.onPublishDiagnostics.called).equals(true);
    });
  });

  describe('captureDiagnostics', () => {
    const diagnostics = [
      {
        range: {start: {line: 1, character: 2}, end: {line: 3, character: 4}},
        severity: ls.DiagnosticSeverity.Error,
        code: 101,
        source: 'Unit Test',
        message: 'Obscure syntax error',
      },
      {
        range: {start: {line: 5, character: 6}, end: {line: 7, character: 8}},
        severity: ls.DiagnosticSeverity.Information,
        code: 202,
        source: 'Unit Test 2',
        message: 'Nice and friendly informational',
      },
    ];

    const makePath = relative => (process.platform === 'win32' ? 'c:' + relative.replace(/\//g, '\\') : relative);

    it('captures diagnostics per path', () => {
      const linterAdapter = new LinterV1PullAdapter(defaultLanguageClient);
      const filePath = makePath('/a/b.txt');
      linterAdapter.captureDiagnostics({uri: Convert.pathToUri(filePath), diagnostics});
      const results = linterAdapter.provideDiagnostics();
      expect(results.length).equals(2);
      results.sort(compareLinter);
      expect(results[0].filePath).equals(filePath);
      expect(results[0].name).equals('Unit Test');
      expect(results[1].severity).equals('info');
    });

    it('clears previous diagnostics for a path given an empty array of diagnostics', () => {
      const linterAdapter = new LinterV1PullAdapter(defaultLanguageClient);
      linterAdapter.captureDiagnostics({uri: Convert.pathToUri(makePath('/a/1.txt')), diagnostics});
      linterAdapter.captureDiagnostics({uri: Convert.pathToUri(makePath('/a/2.txt')), diagnostics});
      const firstResults = linterAdapter.provideDiagnostics();
      expect(firstResults.length).equals(4);
      linterAdapter.captureDiagnostics({uri: Convert.pathToUri(makePath('/a/2.txt')), diagnostics: []});
      const secondResults = linterAdapter.provideDiagnostics();
      expect(secondResults.length).equals(2);
    });

    it('replaces previous diagnostics for a path given an empty array of diagnostics', () => {
      const linterAdapter = new LinterV1PullAdapter(defaultLanguageClient);
      linterAdapter.captureDiagnostics({uri: Convert.pathToUri(makePath('/a/1.txt')), diagnostics});
      linterAdapter.captureDiagnostics({uri: Convert.pathToUri(makePath('/a/2.txt')), diagnostics});
      linterAdapter.captureDiagnostics({uri: Convert.pathToUri(makePath('/a/2.txt')), diagnostics: [
        {
          range: {start: {line: 10, character: 11}, end: {line: 12, character: 13}},
          severity: ls.DiagnosticSeverity.Warning,
          code: 303,
          source: 'Unit Test 3',
          message: 'Danger, Will Robinson',
        },
      ]});
      const results = linterAdapter.provideDiagnostics();
      expect(results.length).equals(3);
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
      const result = LinterV1PullAdapter.diagnosticToMessage(filePath, diagnostic);
      expect(result.type).equals('Information');
      expect(result.text).equals(diagnostic.message);
      expect(result.name).equals(diagnostic.source);
      expect(result.filePath).equals(filePath);
      expect(result.range).deep.equals(new Range(new Point(1, 2), new Point(3, 4)));
      expect(result.severity).equals('info');
    });
  });

  describe('diagnosticSeverityToType', () => {
    it('converts DiagnosticSeverity.Error to "Error"', () => {
      const severity = LinterV1PullAdapter.diagnosticSeverityToType(ls.DiagnosticSeverity.Error);
      expect(severity).equals('Error');
    });

    it('converts DiagnosticSeverity.Warning to "Warning"', () => {
      const severity = LinterV1PullAdapter.diagnosticSeverityToType(ls.DiagnosticSeverity.Warning);
      expect(severity).equals('Warning');
    });

    it('converts DiagnosticSeverity.Information to "Information"', () => {
      const severity = LinterV1PullAdapter.diagnosticSeverityToType(ls.DiagnosticSeverity.Information);
      expect(severity).equals('Information');
    });

    it('converts DiagnosticSeverity.Hint to "Hint"', () => {
      const severity = LinterV1PullAdapter.diagnosticSeverityToType(ls.DiagnosticSeverity.Hint);
      expect(severity).equals('Hint');
    });

    it('converts invalid severity to empty string', () => {
      const severity = LinterV1PullAdapter.diagnosticSeverityToType(-1);
      expect(severity).equals('');
    });
  });

  describe('diagnosticSeverityToSeverity', () => {
    it('converts DiagnosticSeverity.Error to "error"', () => {
      const severity = LinterV1PullAdapter.diagnosticSeverityToSeverity(ls.DiagnosticSeverity.Error);
      expect(severity).equals('error');
    });

    it('converts DiagnosticSeverity.Warning to "warning"', () => {
      const severity = LinterV1PullAdapter.diagnosticSeverityToSeverity(ls.DiagnosticSeverity.Warning);
      expect(severity).equals('warning');
    });

    it('converts DiagnosticSeverity.Information to "info"', () => {
      const severity = LinterV1PullAdapter.diagnosticSeverityToSeverity(ls.DiagnosticSeverity.Information);
      expect(severity).equals('info');
    });

    it('converts DiagnosticSeverity.Hint to "info"', () => {
      const severity = LinterV1PullAdapter.diagnosticSeverityToSeverity(ls.DiagnosticSeverity.Hint);
      expect(severity).equals('info');
    });
  });
});
