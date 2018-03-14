import * as jsonrpc from 'vscode-jsonrpc';
import * as lsp from 'vscode-languageserver-protocol';
import { EventEmitter } from 'events';
import {
  NullLogger,
  Logger,
} from './logger';

export * from 'vscode-languageserver-protocol';

// TypeScript wrapper around JSONRPC to implement Microsoft Language Server Protocol v3
// https://github.com/Microsoft/language-server-protocol/blob/master/protocol.md
export class LanguageClientConnection extends EventEmitter {
  private _rpc: jsonrpc.MessageConnection;
  private _log: Logger;
  public isConnected: boolean;

  constructor(rpc: jsonrpc.MessageConnection, logger?: Logger) {
    super();
    this._rpc = rpc;
    this._log = logger || new NullLogger();
    this.setupLogging();
    rpc.listen();

    this.isConnected = true;
    this._rpc.onClose(() => {
      this.isConnected = false;
      this._log.warn('rpc.onClose', 'The RPC connection closed unexpectedly');
      this.emit('close');
    });
  }

  private setupLogging(): void {
    this._rpc.onError((error) => this._log.error(['rpc.onError', error]));
    this._rpc.onUnhandledNotification((notification) => {
      if (notification.method != null && notification.params != null) {
        this._log.warn(`rpc.onUnhandledNotification ${notification.method}`, notification.params);
      } else {
        this._log.warn('rpc.onUnhandledNotification', notification);
      }
    });
    this._rpc.onNotification((...args: any[]) => this._log.debug('rpc.onNotification', args));
  }

  public dispose(): void {
    this._rpc.dispose();
  }

  // Public: Initialize the language server with necessary {InitializeParams}.
  //
  // * `params` The {InitializeParams} containing processId, rootPath, options and
  //            server capabilities.
  //
  // Returns a {Promise} containing the {InitializeResult} with details of the server's
  // capabilities.
  public initialize(params: lsp.InitializeParams): Promise<lsp.InitializeResult> {
    return this._sendRequest('initialize', params);
  }

  // Public: Send an `initialized` notification to the language server.
  public initialized(): void {
    this._sendNotification('initialized', {});
  }

  // Public: Send a `shutdown` request to the language server.
  public shutdown(): Promise<void> {
    return this._sendRequest('shutdown');
  }

  // Public: Send an `exit` notification to the language server.
  public exit(): void {
    this._sendNotification('exit');
  }

  // Public: Register a callback for a custom message.
  //
  // * `method`   A string containing the name of the message to listen for.
  // * `callback` The function to be called when the message is received.
  //              The payload from the message is passed to the function.
  public onCustom(method: string, callback: (obj: object) => void): void {
    this._onNotification({method}, callback);
  }

  // Public: Register a callback for the `window/showMessage` message.
  //
  // * `callback` The function to be called when the `window/showMessage` message is
  //              received with {ShowMessageParams} being passed.
  public onShowMessage(callback: (params: lsp.ShowMessageParams) => void): void {
    this._onNotification({method: 'window/showMessage'}, callback);
  }

  // Public: Register a callback for the `window/showMessageRequest` message.
  //
  // * `callback` The function to be called when the `window/showMessageRequest` message is
  //              received with {ShowMessageRequestParam}' being passed.
  // Returns a {Promise} containing the {MessageActionItem}.
  public onShowMessageRequest(callback: (params: lsp.ShowMessageRequestParams)
  => Promise<lsp.MessageActionItem | null>): void {
    this._onRequest({method: 'window/showMessageRequest'}, callback);
  }

  // Public: Register a callback for the `window/logMessage` message.
  //
  // * `callback` The function to be called when the `window/logMessage` message is
  //              received with {LogMessageParams} being passed.
  public onLogMessage(callback: (params: lsp.LogMessageParams) => void): void {
    this._onNotification({method: 'window/logMessage'}, callback);
  }

  // Public: Register a callback for the `telemetry/event` message.
  //
  // * `callback` The function to be called when the `telemetry/event` message is
  //              received with any parameters received being passed on.
  public onTelemetryEvent(callback: (...args: any[]) => void): void {
    this._onNotification({method: 'telemetry/event'}, callback);
  }

  // Public: Register a callback for the `workspace/applyEdit` message.
  //
  // * `callback` The function to be called when the `workspace/applyEdit` message is
  //              received with {ApplyWorkspaceEditParams} being passed.
  // Returns a {Promise} containing the {ApplyWorkspaceEditResponse}.
  public onApplyEdit(callback: (params: lsp.ApplyWorkspaceEditParams) =>
  Promise<lsp.ApplyWorkspaceEditResponse>): void {
    this._onRequest({method: 'workspace/applyEdit'}, callback);
  }

  // Public: Send a `workspace/didChangeConfiguration` notification.
  //
  // * `params` The {DidChangeConfigurationParams} containing the new configuration.
  public didChangeConfiguration(params: lsp.DidChangeConfigurationParams): void {
    this._sendNotification('workspace/didChangeConfiguration', params);
  }

  // Public: Send a `textDocument/didOpen` notification.
  //
  // * `params` The {DidOpenTextDocumentParams} containing the opened text document details.
  public didOpenTextDocument(params: lsp.DidOpenTextDocumentParams): void {
    this._sendNotification('textDocument/didOpen', params);
  }

  // Public: Send a `textDocument/didChange` notification.
  //
  // * `params` The {DidChangeTextDocumentParams} containing the changed text document
  // details including the version number and actual text changes.
  public didChangeTextDocument(params: lsp.DidChangeTextDocumentParams): void {
    this._sendNotification('textDocument/didChange', params);
  }

  // Public: Send a `textDocument/didClose` notification.
  //
  // * `params` The {DidCloseTextDocumentParams} containing the opened text document details.
  public didCloseTextDocument(params: lsp.DidCloseTextDocumentParams): void {
    this._sendNotification('textDocument/didClose', params);
  }

  // Public: Send a `textDocument/willSave` notification.
  //
  // * `params` The {WillSaveTextDocumentParams} containing the to-be-saved text document
  // details and the reason for the save.
  public willSaveTextDocument(params: lsp.WillSaveTextDocumentParams): void {
    this._sendNotification('textDocument/willSave', params);
  }

  // Public: Send a `textDocument/didSave` notification.
  //
  // * `params` The {DidSaveTextDocumentParams} containing the saved text document details.
  public didSaveTextDocument(params: lsp.DidSaveTextDocumentParams): void {
    this._sendNotification('textDocument/didSave', params);
  }

  // Public: Send a `workspace/didChangeWatchedFiles` notification.
  //
  // * `params` The {DidChangeWatchedFilesParams} containing the array of {FileEvent}s that
  // have been observed upon the watched files.
  public didChangeWatchedFiles(params: lsp.DidChangeWatchedFilesParams): void {
    this._sendNotification('workspace/didChangeWatchedFiles', params);
  }

  // Public: Register a callback for the `textDocument/publishDiagnostics` message.
  //
  // * `callback` The function to be called when the `textDocument/publishDiagnostics` message is
  //              received a {PublishDiagnosticsParams} containing new {Diagnostic} messages for a given uri.
  public onPublishDiagnostics(callback: (params: lsp.PublishDiagnosticsParams) => void): void {
    this._onNotification({method: 'textDocument/publishDiagnostics'}, callback);
  }

  // Public: Send a `textDocument/completion` request.
  //
  // * `params`            The {TextDocumentPositionParams} or {CompletionParams} for which
  //                       {CompletionItem}s are desired.
  // * `cancellationToken` The {CancellationToken} that is used to cancel this request if
  //                       necessary.
  // Returns a {Promise} containing either a {CompletionList} or an {Array} of {CompletionItem}s.
  public completion(
    params: lsp.TextDocumentPositionParams | CompletionParams,
    cancellationToken?: jsonrpc.CancellationToken): Promise<lsp.CompletionItem[] | lsp.CompletionList> {
    // Cancel prior request if necessary
    return this._sendRequest('textDocument/completion', params, cancellationToken);
  }

  // Public: Send a `completionItem/resolve` request.
  //
  // * `params` The {CompletionItem} for which a fully resolved {CompletionItem} is desired.
  // Returns a {Promise} containing a fully resolved {CompletionItem}.
  public completionItemResolve(params: lsp.CompletionItem): Promise<lsp.CompletionItem | null> {
    return this._sendRequest('completionItem/resolve', params);
  }

  // Public: Send a `textDocument/hover` request.
  //
  // * `params` The {TextDocumentPositionParams} for which a {Hover} is desired.
  // Returns a {Promise} containing a {Hover}.
  public hover(params: lsp.TextDocumentPositionParams): Promise<lsp.Hover | null> {
    return this._sendRequest('textDocument/hover', params);
  }

  // Public: Send a `textDocument/signatureHelp` request.
  //
  // * `params` The {TextDocumentPositionParams} for which a {SignatureHelp} is desired.
  // Returns a {Promise} containing a {SignatureHelp}.
  public signatureHelp(params: lsp.TextDocumentPositionParams): Promise<lsp.SignatureHelp | null> {
    return this._sendRequest('textDocument/signatureHelp', params);
  }

  // Public: Send a `textDocument/definition` request.
  //
  // * `params` The {TextDocumentPositionParams} of a symbol for which one or more {Location}s
  // that define that symbol are required.
  // Returns a {Promise} containing either a single {Location} or an {Array} of many {Location}s.
  public gotoDefinition(params: lsp.TextDocumentPositionParams): Promise<lsp.Location | lsp.Location[]> {
    return this._sendRequest('textDocument/definition', params);
  }

  // Public: Send a `textDocument/references` request.
  //
  // * `params` The {TextDocumentPositionParams} of a symbol for which all referring {Location}s
  // are desired.
  // Returns a {Promise} containing an {Array} of {Location}s that reference this symbol.
  public findReferences(params: lsp.ReferenceParams): Promise<lsp.Location[]> {
    return this._sendRequest('textDocument/references', params);
  }

  // Public: Send a `textDocument/documentHighlight` request.
  //
  // * `params` The {TextDocumentPositionParams} of a symbol for which all highlights are desired.
  // Returns a {Promise} containing an {Array} of {DocumentHighlight}s that can be used to
  // highlight this symbol.
  public documentHighlight(params: lsp.TextDocumentPositionParams): Promise<lsp.DocumentHighlight[]> {
    return this._sendRequest('textDocument/documentHighlight', params);
  }

  // Public: Send a `textDocument/documentSymbol` request.
  //
  // * `params`            The {DocumentSymbolParams} that identifies the document for which
  //                       symbols are desired.
  // * `cancellationToken` The {CancellationToken} that is used to cancel this request if
  //                       necessary.
  // Returns a {Promise} containing an {Array} of {SymbolInformation}s that can be used to
  // navigate this document.
  public documentSymbol(
    params: lsp.DocumentSymbolParams,
    cancellationToken?: jsonrpc.CancellationToken,
  ): Promise<lsp.SymbolInformation[]> {
    return this._sendRequest('textDocument/documentSymbol', params);
  }

  // Public: Send a `workspace/symbol` request.
  //
  // * `params` The {WorkspaceSymbolParams} containing the query string to search the workspace for.
  // Returns a {Promise} containing an {Array} of {SymbolInformation}s that identify where the query
  // string occurs within the workspace.
  public workspaceSymbol(params: lsp.WorkspaceSymbolParams): Promise<lsp.SymbolInformation[]> {
    return this._sendRequest('workspace/symbol', params);
  }

  // Public: Send a `textDocument/codeAction` request.
  //
  // * `params` The {CodeActionParams} identifying the document, range and context for the code action.
  // Returns a {Promise} containing an {Array} of {Commands}s that can be performed against the given
  // documents range.
  public codeAction(params: lsp.CodeActionParams): Promise<lsp.Command[]> {
    return this._sendRequest('textDocument/codeAction', params);
  }

  // Public: Send a `textDocument/codeLens` request.
  //
  // * `params` The {CodeLensParams} identifying the document for which code lens commands are desired.
  // Returns a {Promise} containing an {Array} of {CodeLens}s that associate commands and data with
  // specified ranges within the document.
  public codeLens(params: lsp.CodeLensParams): Promise<lsp.CodeLens[]> {
    return this._sendRequest('textDocument/codeLens', params);
  }

  // Public: Send a `codeLens/resolve` request.
  //
  // * `params` The {CodeLens} identifying the code lens to be resolved with full detail.
  // Returns a {Promise} containing the {CodeLens} fully resolved.
  public codeLensResolve(params: lsp.CodeLens): Promise<lsp.CodeLens | null> {
    return this._sendRequest('codeLens/resolve', params);
  }

  // Public: Send a `textDocument/documentLink` request.
  //
  // * `params` The {DocumentLinkParams} identifying the document for which links should be identified.
  // Returns a {Promise} containing an {Array} of {DocumentLink}s relating uri's to specific ranges
  // within the document.
  public documentLink(params: lsp.DocumentLinkParams): Promise<lsp.DocumentLink[]> {
    return this._sendRequest('textDocument/documentLink', params);
  }

  // Public: Send a `documentLink/resolve` request.
  //
  // * `params` The {DocumentLink} identifying the document link to be resolved with full detail.
  // Returns a {Promise} containing the {DocumentLink} fully resolved.
  public documentLinkResolve(params: lsp.DocumentLink): Promise<lsp.DocumentLink> {
    return this._sendRequest('documentLink/resolve', params);
  }

  // Public: Send a `textDocument/formatting` request.
  //
  // * `params` The {DocumentFormattingParams} identifying the document to be formatted as well as
  // additional formatting preferences.
  // Returns a {Promise} containing an {Array} of {TextEdit}s to be applied to the document to
  // correctly reformat it.
  public documentFormatting(params: lsp.DocumentFormattingParams): Promise<lsp.TextEdit[]> {
    return this._sendRequest('textDocument/formatting', params);
  }

  // Public: Send a `textDocument/rangeFormatting` request.
  //
  // * `params` The {DocumentRangeFormattingParams} identifying the document and range to be formatted
  // as well as additional formatting preferences.
  // Returns a {Promise} containing an {Array} of {TextEdit}s to be applied to the document to
  // correctly reformat it.
  public documentRangeFormatting(params: lsp.DocumentRangeFormattingParams): Promise<lsp.TextEdit[]> {
    return this._sendRequest('textDocument/rangeFormatting', params);
  }

  // Public: Send a `textDocument/onTypeFormatting` request.
  //
  // * `params` The {DocumentOnTypeFormattingParams} identifying the document to be formatted,
  // the character that was typed and at what position as well as additional formatting preferences.
  // Returns a {Promise} containing an {Array} of {TextEdit}s to be applied to the document to
  // correctly reformat it.
  public documentOnTypeFormatting(params: lsp.DocumentOnTypeFormattingParams): Promise<lsp.TextEdit[]> {
    return this._sendRequest('textDocument/onTypeFormatting', params);
  }

  // Public: Send a `textDocument/rename` request.
  //
  // * `params` The {RenameParams} identifying the document containing the symbol to be renamed,
  // as well as the position and new name.
  // Returns a {Promise} containing an {WorkspaceEdit} that contains a list of {TextEdit}s either
  // on the changes property (keyed by uri) or the documentChanges property containing
  // an {Array} of {TextDocumentEdit}s (preferred).
  public rename(params: lsp.RenameParams): Promise<lsp.WorkspaceEdit> {
    return this._sendRequest('textDocument/rename', params);
  }

  // Public: Send a `workspace/executeCommand` request.
  //
  // * `params` The {ExecuteCommandParams} specifying the command and arguments
  // the language server should execute (these commands are usually from {CodeLens} or {CodeAction}
  // responses).
  // Returns a {Promise} containing anything.
  public executeCommand(params: lsp.ExecuteCommandParams): Promise<any> {
    return this._sendRequest('workspace/executeCommand', params);
  }

  private _onRequest(type: {method: string}, callback: (obj: object) => Promise<any>): void {
    this._rpc.onRequest(type.method, (value) => {
      this._log.debug(`rpc.onRequest ${type.method}`, value);
      return callback(value);
    });
  }

  private _onNotification(type: {method: string}, callback: (obj: object) => void): void {
    this._rpc.onNotification(type.method, (value) => {
      this._log.debug(`rpc.onNotification ${type.method}`, value);
      callback(value);
    });
  }

  private _sendNotification(method: string, args?: object): void {
    this._log.debug(`rpc.sendNotification ${method}`, args);
    this._rpc.sendNotification(method, args);
  }

  private async _sendRequest(
    method: string,
    args?: object,
    cancellationToken?: jsonrpc.CancellationToken,
  ): Promise<any> {
    this._log.debug(`rpc.sendRequest ${method} sending`, args);
    try {
      const start = performance.now();
      let result;
      if (cancellationToken) {
        result = await this._rpc.sendRequest(method, args, cancellationToken);
      } else {
        // If cancellationToken is null or undefined, don't add the third
        // argument otherwise vscode-jsonrpc will send an additional, null
        // message parameter to the request
        result = await this._rpc.sendRequest(method, args);
      }

      const took = performance.now() - start;
      this._log.debug(`rpc.sendRequest ${method} received (${Math.floor(took)}ms)`, result);
      return result;
    } catch (e) {
      const responseError = e as jsonrpc.ResponseError<any>;
      if (cancellationToken && responseError.code === jsonrpc.ErrorCodes.RequestCancelled) {
        this._log.debug(`rpc.sendRequest ${method} was cancelled`);
      }
      else {
        this._log.error(`rpc.sendRequest ${method} threw`, e);
      }

      throw e;
    }
  }
}

export type DiagnosticCode = number | string;

/**
 * Contains additional information about the context in which a completion request is triggered.
 */
export interface CompletionContext {
  /**
   * How the completion was triggered.
   */
  triggerKind: lsp.CompletionTriggerKind;

  /**
   * The trigger character (a single character) that has trigger code complete.
   * Is undefined if `triggerKind !== CompletionTriggerKind.TriggerCharacter`
   */
  triggerCharacter?: string;
}

/**
 * Completion parameters
 */
export interface CompletionParams extends lsp.TextDocumentPositionParams {

  /**
   * The completion context. This is only available it the client specifies
   * to send this using `ClientCapabilities.textDocument.completion.contextSupport === true`
   */
  context?: CompletionContext;
}
