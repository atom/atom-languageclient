// @flow

import {
  DiagnosticSeverity,
  LanguageClientConnection,
  type Diagnostic,
  type PublishDiagnosticsParams,
  type ServerCapabilities
} from '../languageclient';
import Convert from '../convert';

// Public: Listen to diagnostics messages from the language server and publish them
// to the user by way of the Linter Push (Indie) v2 API supported by Atom IDE UI.
export default class LinterPushV2Adapter {
  _diagnosticMap: Map<string, Array<linter$V2Message>> = new Map();
  _indies: Set<linter$V2IndieDelegate> = new Set();

  // Public: Create a new {LinterPushV2Adapter} that will listen for diagnostics
  // via the supplied {LanguageClientConnection}.
  //
  // * `connection` A {LanguageClientConnection} to the language server that will provide diagnostics.
  constructor(connection: LanguageClientConnection) {
    connection.onPublishDiagnostics(this.captureDiagnostics.bind(this));
  }

  // Public: Attach this {LinterPushV2Adapter} to a given {V2IndieDelegate} registry.
  //
  // * `indie` A {V2IndieDelegate} that wants to receive messages.
  attach(indie: linter$V2IndieDelegate): void {
    this._indies.add(indie);
    this._diagnosticMap.forEach((value, key) => indie.setMessages(key, value));
    indie.onDidDestroy(() => { this._indies.delete(indie) });
  }

  // Public: Capture the diagnostics sent from a langguage server, convert them to the
  // Linter V2 format and forward them on to any attached {V2IndieDelegate}s.
  //
  // * `params` The {PublishDiagnosticsParams} received from the language server that should
  //            be captured and forwarded on to any attached {V2IndieDelegate}s.
  captureDiagnostics(params: PublishDiagnosticsParams): void {
    const path = Convert.uriToPath(params.uri);
    const messages = params.diagnostics.map(d => LinterPushV2Adapter.diagnosticToV2Message(path, d));
    this._diagnosticMap.set(path, messages);
    this._indies.forEach(i => i.setMessages(path, messages));
  }

  // Public: Convert a single {Diagnostic} received from a language server into a single
  // {V2Message} expected by the Linter V2 API.
  //
  // * `path` A string representing the path of the file the diagnostic belongs to.
  // * `diagnostics` A {Diagnostic} object received from the language server.
  //
  // Returns a {V2Message} equivalent to the {Diagnostic} object supplied by the language server.
  static diagnosticToV2Message(path: string, diagnostic: Diagnostic): linter$V2Message {
    return {
      location: {
        file: path,
        position: Convert.lsRangeToAtomRange(diagnostic.range),
      },
      excerpt: diagnostic.message,
      linterName: diagnostic.source,
      severity: LinterPushV2Adapter.diagnosticSeverityToSeverity(diagnostic.severity || -1),
    };
  }

  // Public: Convert a diagnostic severity number obtained from the language server into
  // the textual equivalent for a Linter {V2Message}.
  //
  // * `severity` A number representing the severity of the diagnostic.
  //
  // Returns a string of 'error', 'warning' or 'info' depending on the severity.
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
