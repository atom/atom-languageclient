// @flow

import * as ls from '../protocol/languageclient-v2';
import Convert from '../convert';

export default class LinterBridge
{
  _lc: ls.LanguageClientV2;
  _diagnosticMap: Map<string, Array<linter$Message>> = new Map();

  constructor(languageClient: ls.LanguageClientV2) {
    this._lc = languageClient;
    languageClient.onPublishDiagnostics(d => this.captureDiagnostics(d));
  }

  dispose(): void {
  }

  captureDiagnostics(params: ls.PublishDiagnosticsParams): void {
    const path: string = Convert.uriToPath(params.uri);
    this._diagnosticMap.set(params.uri, params.diagnostics.map(d => LinterBridge.diagnosticToMessage(path, d)));
  }

  provideDiagnostics(): Array<linter$Message> {
    let allResults: Array<linter$Message> = [];
    for (let fileResults of this._diagnosticMap.values())
      allResults = allResults.concat(fileResults);
    return allResults;
  }

  static diagnosticToMessage(path: string, diagnostic: ls.Diagnostic): linter$Message {
    return {
      filePath: path,
      text: diagnostic.message,
      range: Convert.lsRangeToAtomRange(diagnostic.range),
      name: diagnostic.source,
      code: diagnostic.code,
      severity: LinterBridge.diagnosticSeverityToSeverity(diagnostic.severity || -1),
      type: LinterBridge.diagnosticSeverityToType(diagnostic.severity || -1),
    };
  }

  static diagnosticSeverityToType(severity: number): string {
    switch(severity) {
      case ls.DiagnosticSeverity.Error:
        return 'Error';
      case ls.DiagnosticSeverity.Warning:
        return 'Warning';
      case ls.DiagnosticSeverity.Information:
        return 'Information';
      case ls.DiagnosticSeverity.Hint:
        return 'Hint';
      default:
        return '';
    };
  }

  static diagnosticSeverityToSeverity(severity: number): 'error' | 'warning' | 'info' {
    switch(severity) {
      case ls.DiagnosticSeverity.Error:
        return 'error';
      case ls.DiagnosticSeverity.Warning:
        return 'warning';
      case ls.DiagnosticSeverity.Information:
      case ls.DiagnosticSeverity.Hint:
      default:
        return 'info';
    }
  }
}
