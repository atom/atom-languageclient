import * as linter from 'atom/linter';
import * as atom from 'atom';
import Convert from '../convert';
import {
  Diagnostic,
  DiagnosticCode,
  DiagnosticSeverity,
  LanguageClientConnection,
  PublishDiagnosticsParams,
} from '../languageclient';

// Public: Listen to diagnostics messages from the language server and publish them
// to the user by way of the Linter Push (Indie) v2 API supported by Atom IDE UI.
export default class LinterPushV2Adapter {
  private _diagnosticMap: Map<string, linter.Message[]> = new Map();
  private _diagnosticCodes: Map<string, Map<string, DiagnosticCode | null>> = new Map();
  private _indies: Set<linter.IndieDelegate> = new Set();

  // Public: Create a new {LinterPushV2Adapter} that will listen for diagnostics
  // via the supplied {LanguageClientConnection}.
  //
  // * `connection` A {LanguageClientConnection} to the language server that will provide diagnostics.
  constructor(connection: LanguageClientConnection) {
    connection.onPublishDiagnostics(this.captureDiagnostics.bind(this));
  }

  // Dispose this adapter ensuring any resources are freed and events unhooked.
  public dispose(): void {
    this.detachAll();
  }

  // Public: Attach this {LinterPushV2Adapter} to a given {V2IndieDelegate} registry.
  //
  // * `indie` A {V2IndieDelegate} that wants to receive messages.
  public attach(indie: linter.IndieDelegate): void {
    this._indies.add(indie);
    this._diagnosticMap.forEach((value, key) => indie.setMessages(key, value));
    indie.onDidDestroy(() => {
      this._indies.delete(indie);
    });
  }

  // Public: Remove all {V2IndieDelegate} registries attached to this adapter and clear them.
  //
  // * `indie` A {V2IndieDelegate} that wants to receive messages.
  public detachAll(): void {
    this._indies.forEach((i) => i.clearMessages());
    this._indies.clear();
  }

  // Public: Capture the diagnostics sent from a langguage server, convert them to the
  // Linter V2 format and forward them on to any attached {V2IndieDelegate}s.
  //
  // * `params` The {PublishDiagnosticsParams} received from the language server that should
  //            be captured and forwarded on to any attached {V2IndieDelegate}s.
  public captureDiagnostics(params: PublishDiagnosticsParams): void {
    const path = Convert.uriToPath(params.uri);
    const codeMap = new Map();
    const messages = params.diagnostics.map((d) => {
      const linterMessage = this.diagnosticToV2Message(path, d);
      codeMap.set(getCodeKey(linterMessage.location.position, d.message), d.code);
      return linterMessage;
    });
    this._diagnosticMap.set(path, messages);
    this._diagnosticCodes.set(path, codeMap);
    this._indies.forEach((i) => i.setMessages(path, messages));
  }

  // Public: Convert a single {Diagnostic} received from a language server into a single
  // {V2Message} expected by the Linter V2 API.
  //
  // * `path` A string representing the path of the file the diagnostic belongs to.
  // * `diagnostics` A {Diagnostic} object received from the language server.
  //
  // Returns a {V2Message} equivalent to the {Diagnostic} object supplied by the language server.
  public diagnosticToV2Message(path: string, diagnostic: Diagnostic): linter.Message {
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
  public static diagnosticSeverityToSeverity(severity: number): 'error' | 'warning' | 'info' {
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

  // Private: Get the recorded diagnostic code for a range/message.
  // Diagnostic codes are tricky because there's no suitable place in the Linter API for them.
  // For now, we'll record the original code for each range/message combination and retrieve it
  // when needed (e.g. for passing back into code actions)
  public getDiagnosticCode(editor: atom.TextEditor, range: atom.Range, text: string): DiagnosticCode | null {
    const path = editor.getPath();
    if (path != null) {
      const diagnosticCodes = this._diagnosticCodes.get(path);
      if (diagnosticCodes != null) {
        return diagnosticCodes.get(getCodeKey(range, text)) || null;
      }
    }
    return null;
  }
}

function getCodeKey(range: atom.Range, text: string): string {
  return ([] as any[]).concat(...range.serialize(), text).join(',');
}
