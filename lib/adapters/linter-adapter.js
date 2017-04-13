// @flow

import {LanguageClientConnection, DiagnosticSeverity,
  type Diagnostic, type PublishDiagnosticsParams, type ServerCapabilities} from '../languageclient';
import Convert from '../convert';

export default class LinterAdapter {
  _diagnosticMap: Map<string, Array<linter$Message>> = new Map();

  static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return true;
  }

  constructor(connection: LanguageClientConnection) {
    connection.onPublishDiagnostics(this.captureDiagnostics.bind(this));
  }

  captureDiagnostics(params: PublishDiagnosticsParams): void {
    const path = Convert.uriToPath(params.uri);
    this._diagnosticMap.set(params.uri, params.diagnostics.map(d => LinterAdapter.diagnosticToMessage(path, d)));
  }

  provideDiagnostics(): Array<linter$Message> {
    let allResults: Array<linter$Message> = [];
    for (const fileResults of this._diagnosticMap.values()) {
      allResults = allResults.concat(fileResults);
    }
    return allResults;
  }

  static diagnosticToMessage(path: string, diagnostic: Diagnostic): linter$Message {
    return {
      filePath: path,
      text: diagnostic.message,
      range: Convert.lsRangeToAtomRange(diagnostic.range),
      name: diagnostic.source,
      severity: LinterAdapter.diagnosticSeverityToSeverity(diagnostic.severity || -1),
      type: LinterAdapter.diagnosticSeverityToType(diagnostic.severity || -1),
    };
  }

  static diagnosticSeverityToType(severity: number): string {
    switch (severity) {
      case DiagnosticSeverity.Error:
        return 'Error';
      case DiagnosticSeverity.Warning:
        return 'Warning';
      case DiagnosticSeverity.Information:
        return 'Information';
      case DiagnosticSeverity.Hint:
        return 'Hint';
      default:
        return '';
    }
  }

  static diagnosticSeverityToSeverity(severity: number): 'error' | 'warning' | 'info' {
    switch (severity) {
      case DiagnosticSeverity.Error:
        return 'error';
      case DiagnosticSeverity.Warning:
        return 'warning';
      case DiagnosticSeverity.Information:
      case DiagnosticSeverity.Hint:
      default:
        return 'info';
    }
  }
}
