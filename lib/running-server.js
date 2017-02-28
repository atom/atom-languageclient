// @flow

import * as ls from './protocol/languageclient-v2';
import * as rpc from 'vscode-jsonrpc';

import AutocompleteBridge from './bridges/autocomplete-bridge';
import DocumentSyncBridge from './bridges/document-sync-bridge';
import FormatDocumentBridge from './bridges/format-document-bridge';
import FormatRangeBridge from './bridges/format-range-bridge';
import LinterBridge from './bridges/linter-bridge';
import NuclideOutlineViewBridge from './bridges/nuclide-outline-view-bridge';

import {CompositeDisposable} from 'atom';

export default class RunningServerV2 {
  _disposable = new CompositeDisposable();
  _connection: rpc.MessageConnection;
  _process: child_process$ChildProcess;
  _lc: ls.LanguageClientV2;

  name: string;
  autoComplete: ?AutocompleteBridge;
  linter: ?LinterBridge;
  documentSync: ?DocumentSyncBridge;
  symbolProvider: ?NuclideOutlineViewBridge;

  constructor(name: string, process: child_process$ChildProcess) {
    this.name = name;

    this._process = process;
    this._connection = rpc.createMessageConnection(
      new rpc.StreamMessageReader(this._process.stdout),
      new rpc.StreamMessageWriter(this._process.stdin),
      { error: (m: Object) => console.log(m) });
  }

  async start(initializerParams: ls.InitializeParams): Promise<void> {
    this._lc = new ls.LanguageClientV2(this._connection);
    this._lc.onLogMessage(m => this._logMessage(m));
    this._lc.onTelemetryEvent(e => this._telemetryEvent(e));

    const initializeResponse = await this._lc.initialize(initializerParams);
    this._bridgeCapabilities(initializeResponse.capabilities);
  }

  _bridgeCapabilities(capabilities: ls.ServerCapabilities): void {
    if (capabilities.completionProvider) {
      this.autoComplete = new AutocompleteBridge(this._lc);
    }
    if (capabilities.textDocumentSync) {
      this.documentSync = new DocumentSyncBridge(this._lc, capabilities.textDocumentSync);
    }
    if (capabilities.documentSymbolProvider) {
      this.symbolProvider = new NuclideOutlineViewBridge(this._lc, this.name);
    }

    if (capabilities.documentRangeFormattingProvider) {
      this._disposable.add(new FormatRangeBridge(this._lc));
    }
    if (capabilities.documentFormattingProvider) {
      this._disposable.add(new FormatDocumentBridge(this._lc));
    }

    this.linter = new LinterBridge(this._lc);
  }

  async stop(): Promise<void> {
    if (this.autoComplete != null) {
      this.autoComplete.dispose();
    }
    if (this.linter != null) {
      this.linter.dispose();
    }
    if (this.documentSync != null) {
      this.documentSync.dispose();
    }
    if (this.symbolProvider != null) {
      this.symbolProvider.dispose();
    }

    this._disposable.dispose();

    await this._lc.shutdown();
    this._connection.stop();
    this._process.kill();
  }

  _logMessage(message: ls.LogMessageParams): void {
    if (message.type < ls.MessageType.Info) console.log(`${this.name} Log`, message);
  }

  _telemetryEvent(params: any): void {
    if (params.type != 'error' || params.message != undefined) // OmniSharp spam
      console.log(`${this.name} Telemetry`, params);
  }
}
