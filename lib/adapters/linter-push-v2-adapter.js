// @flow

import {LanguageClientConnection, DiagnosticSeverity,
  type Diagnostic, type PublishDiagnosticsParams, type ServerCapabilities} from '../languageclient';
import Convert from '../convert';

export default class LinterPushV2Adapter {
  _diagnosticMap: Map<string, Array<linter$V2Message>> = new Map();
  _indies: Set<linter$V2IndieDelegate> = new Set();

  static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return true;
  }

  constructor(connection: LanguageClientConnection) {
    connection.onPublishDiagnostics(this.captureDiagnostics.bind(this));
  }

  attach(indie: linter$V2IndieDelegate): void {
    this._indies.add(indie);
    this._diagnosticMap.forEach((value, key) => indie.setMessages(key, value));
    indie.onDidDestroy(() => { this._indies.delete(indie) });
  }

  captureDiagnostics(params: PublishDiagnosticsParams): void {
    const path = Convert.uriToPath(params.uri);
    const messages = params.diagnostics.map(d => LinterPushV2Adapter.diagnosticToV2Message(path, d));
    this._diagnosticMap.set(path, messages);
    this._indies.forEach(i => i.setMessages(path, messages));
  }

  static diagnosticToV2Message(path: string, diagnostic: Diagnostic): linter$V2Message {
    return {
      location: {
        file: path,
        position: Convert.lsRangeToAtomRange(diagnostic.range),
      },
      excerpt: diagnostic.message,
      description: diagnostic.source,
      severity: LinterPushV2Adapter.diagnosticSeverityToSeverity(diagnostic.severity || -1),
    };
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
