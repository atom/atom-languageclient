import * as jsonrpc from 'vscode-jsonrpc';
import * as lsp from 'vscode-languageserver-protocol';
export * from 'vscode-languageserver-protocol';

import { EventEmitter } from 'events';
import { NullLogger, Logger } from './logger';

// TypeScript wrapper around JSONRPC to implement Microsoft Language Server Protocol v3
// https://github.com/Microsoft/language-server-protocol/blob/master/protocol.md
export class LanguageClientConnection extends EventEmitter {
  _rpc: jsonrpc.MessageConnection;
  _log: Logger;
  isConnected: boolean;

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

  setupLogging(): void {
    this._rpc.onError(error => this._log.error(['rpc.onError', error]));
    this._rpc.onUnhandledNotification(notification => {
      if (notification.method != null && notification.params != null) {
        this._log.warn(`rpc.onUnhandledNotification ${notification.method}`, notification.params);
      } else {
        this._log.warn('rpc.onUnhandledNotification', notification);
      }
    });
    this._rpc.onNotification((...args) => this._log.debug('rpc.onNotification', args));
  }

  dispose(): void {
    this._rpc.dispose();
  }

  // Public: Initialize the language server with necessary {InitializeParams}.
  //
  // * `params` The {InitializeParams} containing processId, rootPath, options and
  //            server capabilities.
  //
  // Returns a {Promise} containing the {InitializeResult} with details of the server's
  // capabilities.
  initialize(params: lsp.InitializeParams): Promise<lsp.InitializeResult> {
    return this._sendRequest('initialize', params);
  }

  // Public: Send an `initialized` notification to the language server.
  initialized(): void {
    this._sendNotification('initialized', {});
  }

  // Public: Send a `shutdown` request to the language server.
  shutdown(): Promise<void> {
    return this._sendRequest('shutdown');
  }

  // Public: Send an `exit` notification to the language server.
  exit(): void {
    this._sendNotification('exit');
  }

  // Public: Register a callback for a custom message.
  //
  // * `method`   A string containing the name of the message to listen for.
  // * `callback` The function to be called when the message is received.
  //              The payload from the message is passed to the function.
  onCustom(method: string, callback: (Object) => void): void {
    this._onNotification({method}, callback);
  }

  // Public: Register a callback for the `window/showMessage` message.
  //
  // * `callback` The function to be called when the `window/showMessage` message is
  //              received with {ShowMessageParams} being passed.
  onShowMessage(callback: (ShowMessageParams) => void): void {
    this._onNotification({method: 'window/showMessage'}, callback);
  }

  // Public: Register a callback for the `window/showMessageRequest` message.
  //
  // * `callback` The function to be called when the `window/showMessageRequest` message is
  //              received with {ShowMessageRequestParam}' being passed.
  // Returns a {Promise} containing the {MessageActionItem}.
  onShowMessageRequest(callback: (ShowMessageRequestParams) => Promise<lsp.MessageActionItem | null>): void {
    this._onRequest({method: 'window/showMessageRequest'}, callback);
  }

  // Public: Register a callback for the `window/logMessage` message.
  //
  // * `callback` The function to be called when the `window/logMessage` message is
  //              received with {LogMessageParams} being passed.
  onLogMessage(callback: (LogMessageParams) => void): void {
    this._onNotification({method: 'window/logMessage'}, callback);
  }

  // Public: Register a callback for the `telemetry/event` message.
  //
  // * `callback` The function to be called when the `telemetry/event` message is
  //              received with any parameters received being passed on.
  onTelemetryEvent(callback: (any) => void): void {
    this._onNotification({method: 'telemetry/event'}, callback);
  }

  // Public: Register a callback for the `workspace/applyEdit` message.
  //
  // * `callback` The function to be called when the `workspace/applyEdit` message is
  //              received with {ApplyWorkspaceEditParams} being passed.
  // Returns a {Promise} containing the {ApplyWorkspaceEditResponse}.
  onApplyEdit(callback: (ApplyWorkspaceEditParams) => Promise<lsp.ApplyWorkspaceEditResponse>): void {
    this._onRequest({method: 'workspace/applyEdit'}, callback);
  }

  // Public: Send a `workspace/didChangeConfiguration` notification.
  //
  // * `params` The {DidChangeConfigurationParams} containing the new configuration.
  didChangeConfiguration(params: lsp.DidChangeConfigurationParams): void {
    this._sendNotification('workspace/didChangeConfiguration', params);
  }

  // Public: Send a `textDocument/didOpen` notification.
  //
  // * `params` The {DidOpenTextDocumentParams} containing the opened text document details.
  didOpenTextDocument(params: lsp .DidOpenTextDocumentParams): void {
    this._sendNotification('textDocument/didOpen', params);
  }

  // Public: Send a `textDocument/didChange` notification.
  //
  // * `params` The {DidChangeTextDocumentParams} containing the changed text document
  // details including the version number and actual text changes.
  didChangeTextDocument(params: lsp.DidChangeTextDocumentParams): void {
    this._sendNotification('textDocument/didChange', params);
  }

  // Public: Send a `textDocument/didClose` notification.
  //
  // * `params` The {DidCloseTextDocumentParams} containing the opened text document details.
  didCloseTextDocument(params: lsp.DidCloseTextDocumentParams): void {
    this._sendNotification('textDocument/didClose', params);
  }

  // Public: Send a `textDocument/willSave` notification.
  //
  // * `params` The {WillSaveTextDocumentParams} containing the to-be-saved text document
  // details and the reason for the save.
  willSaveTextDocument(params: lsp.WillSaveTextDocumentParams): void {
    this._sendNotification('textDocument/willSave', params);
  }

  // Public: Send a `textDocument/didSave` notification.
  //
  // * `params` The {DidSaveTextDocumentParams} containing the saved text document details.
  didSaveTextDocument(params: lsp.DidSaveTextDocumentParams): void {
    this._sendNotification('textDocument/didSave', params);
  }

  // Public: Send a `workspace/didChangeWatchedFiles` notification.
  //
  // * `params` The {DidChangeWatchedFilesParams} containing the array of {FileEvent}s that
  // have been observed upon the watched files.
  didChangeWatchedFiles(params: lsp.DidChangeWatchedFilesParams): void {
    this._sendNotification('workspace/didChangeWatchedFiles', params);
  }

  // Public: Register a callback for the `textDocument/publishDiagnostics` message.
  //
  // * `callback` The function to be called when the `textDocument/publishDiagnostics` message is
  //              received a {PublishDiagnosticsParams} containing new {Diagnostic} messages for a given uri.
  onPublishDiagnostics(callback: (PublishDiagnosticsParams) => void): void {
    this._onNotification({method: 'textDocument/publishDiagnostics'}, callback);
  }

  // Public: Send a `textDocument/completion` request.
  //
  // * `params`            The {TextDocumentPositionParams} or {CompletionParams} for which
  //                       {CompletionItem}s are desired.
  // * `cancellationToken` The {CancellationToken} that is used to cancel this request if
  //                       necessary.
  // Returns a {Promise} containing either a {CompletionList} or an {Array} of {CompletionItem}s.
  completion(
    params: lsp.TextDocumentPositionParams | CompletionParams,
    cancellationToken?: jsonrpc.CancellationToken): Promise<Array<lsp.CompletionItem> | lsp.CompletionList> {
    // Cancel prior request if necessary
    return this._sendRequest('textDocument/completion', params, cancellationToken);
  }

  // Public: Send a `completionItem/resolve` request.
  //
  // * `params` The {CompletionItem} for which a fully resolved {CompletionItem} is desired.
  // Returns a {Promise} containing a fully resolved {CompletionItem}.
  completionItemResolve(params: lsp.CompletionItem): Promise<lsp.CompletionItem | null> {
    return this._sendRequest('completionItem/resolve', params);
  }

  // Public: Send a `textDocument/hover` request.
  //
  // * `params` The {TextDocumentPositionParams} for which a {Hover} is desired.
  // Returns a {Promise} containing a {Hover}.
  hover(params: lsp.TextDocumentPositionParams): Promise<lsp.Hover | null> {
    return this._sendRequest('textDocument/hover', params);
  }

  // Public: Send a `textDocument/signatureHelp` request.
  //
  // * `params` The {TextDocumentPositionParams} for which a {SignatureHelp} is desired.
  // Returns a {Promise} containing a {SignatureHelp}.
  signatureHelp(params: lsp.TextDocumentPositionParams): Promise<lsp.SignatureHelp | null> {
    return this._sendRequest('textDocument/signatureHelp', params);
  }

  // Public: Send a `textDocument/definition` request.
  //
  // * `params` The {TextDocumentPositionParams} of a symbol for which one or more {Location}s
  // that define that symbol are required.
  // Returns a {Promise} containing either a single {Location} or an {Array} of many {Location}s.
  gotoDefinition(params: lsp.TextDocumentPositionParams): Promise<lsp.Location | Array<lsp.Location>> {
    return this._sendRequest('textDocument/definition', params);
  }

  // Public: Send a `textDocument/references` request.
  //
  // * `params` The {TextDocumentPositionParams} of a symbol for which all referring {Location}s
  // are desired.
  // Returns a {Promise} containing an {Array} of {Location}s that reference this symbol.
  findReferences(params: lsp.ReferenceParams): Promise<Array<lsp.Location>> {
    return this._sendRequest('textDocument/references', params);
  }

  // Public: Send a `textDocument/documentHighlight` request.
  //
  // * `params` The {TextDocumentPositionParams} of a symbol for which all highlights are desired.
  // Returns a {Promise} containing an {Array} of {DocumentHighlight}s that can be used to
  // highlight this symbol.
  documentHighlight(params: lsp.TextDocumentPositionParams): Promise<Array<lsp.DocumentHighlight>> {
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
  documentSymbol(params: lsp.DocumentSymbolParams, cancellationToken?: jsonrpc.CancellationToken): Promise<Array<lsp.SymbolInformation>> {
    return this._sendRequest('textDocument/documentSymbol', params);
  }

  // Public: Send a `workspace/symbol` request.
  //
  // * `params` The {WorkspaceSymbolParams} containing the query string to search the workspace for.
  // Returns a {Promise} containing an {Array} of {SymbolInformation}s that identify where the query
  // string occurs within the workspace.
  workspaceSymbol(params: lsp.WorkspaceSymbolParams): Promise<Array<lsp.SymbolInformation>> {
    return this._sendRequest('workspace/symbol', params);
  }

  // Public: Send a `textDocument/codeAction` request.
  //
  // * `params` The {CodeActionParams} identifying the document, range and context for the code action.
  // Returns a {Promise} containing an {Array} of {Commands}s that can be performed against the given
  // documents range.
  codeAction(params: lsp.CodeActionParams): Promise<Array<lsp.Command>> {
    return this._sendRequest('textDocument/codeAction', params);
  }

  // Public: Send a `textDocument/codeLens` request.
  //
  // * `params` The {CodeLensParams} identifying the document for which code lens commands are desired.
  // Returns a {Promise} containing an {Array} of {CodeLens}s that associate commands and data with
  // specified ranges within the document.
  codeLens(params: lsp.CodeLensParams): Promise<Array<lsp.CodeLens>> {
    return this._sendRequest('textDocument/codeLens', params);
  }

  // Public: Send a `codeLens/resolve` request.
  //
  // * `params` The {CodeLens} identifying the code lens to be resolved with full detail.
  // Returns a {Promise} containing the {CodeLens} fully resolved.
  codeLensResolve(params: lsp.CodeLens): Promise<lsp.CodeLens | null> {
    return this._sendRequest('codeLens/resolve', params);
  }

  // Public: Send a `textDocument/documentLink` request.
  //
  // * `params` The {DocumentLinkParams} identifying the document for which links should be identified.
  // Returns a {Promise} containing an {Array} of {DocumentLink}s relating uri's to specific ranges
  // within the document.
  documentLink(params: lsp.DocumentLinkParams): Promise<Array<lsp.DocumentLink>> {
    return this._sendRequest('textDocument/documentLink', params);
  }

  // Public: Send a `documentLink/resolve` request.
  //
  // * `params` The {DocumentLink} identifying the document link to be resolved with full detail.
  // Returns a {Promise} containing the {DocumentLink} fully resolved.
  documentLinkResolve(params: lsp.DocumentLink): Promise<lsp.DocumentLink> {
    return this._sendRequest('documentLink/resolve', params);
  }

  // Public: Send a `textDocument/formatting` request.
  //
  // * `params` The {DocumentFormattingParams} identifying the document to be formatted as well as
  // additional formatting preferences.
  // Returns a {Promise} containing an {Array} of {TextEdit}s to be applied to the document to
  // correctly reformat it.
  documentFormatting(params: lsp.DocumentFormattingParams): Promise<Array<lsp.TextEdit>> {
    return this._sendRequest('textDocument/formatting', params);
  }


  // Public: Send a `textDocument/rangeFormatting` request.
  //
  // * `params` The {DocumentRangeFormattingParams} identifying the document and range to be formatted
  // as well as additional formatting preferences.
  // Returns a {Promise} containing an {Array} of {TextEdit}s to be applied to the document to
  // correctly reformat it.
  documentRangeFormatting(params: lsp.DocumentRangeFormattingParams): Promise<Array<lsp.TextEdit>> {
    return this._sendRequest('textDocument/rangeFormatting', params);
  }

  // Public: Send a `textDocument/onTypeFormatting` request.
  //
  // * `params` The {DocumentOnTypeFormattingParams} identifying the document to be formatted,
  // the character that was typed and at what position as well as additional formatting preferences.
  // Returns a {Promise} containing an {Array} of {TextEdit}s to be applied to the document to
  // correctly reformat it.
  documentOnTypeFormatting(params: lsp.DocumentOnTypeFormattingParams): Promise<Array<lsp.TextEdit>> {
    return this._sendRequest('textDocument/onTypeFormatting', params);
  }

  // Public: Send a `textDocument/rename` request.
  //
  // * `params` The {RenameParams} identifying the document containing the symbol to be renamed,
  // as well as the position and new name.
  // Returns a {Promise} containing an {WorkspaceEdit} that contains a list of {TextEdit}s either
  // on the changes property (keyed by uri) or the documentChanges property containing
  // an {Array} of {TextDocumentEdit}s (preferred).
  rename(params: lsp.RenameParams): Promise<lsp.WorkspaceEdit> {
    return this._sendRequest('textDocument/rename', params);
  }

  // Public: Send a `workspace/executeCommand` request.
  //
  // * `params` The {ExecuteCommandParams} specifying the command and arguments
  // the language server should execute (these commands are usually from {CodeLens} or {CodeAction}
  // responses).
  // Returns a {Promise} containing anything.
  executeCommand(params: lsp.ExecuteCommandParams): Promise<any> {
    return this._sendRequest('workspace/executeCommand', params);
  }

  _onRequest(type: {method: string}, callback: (Object) => Promise<any>): void {
    this._rpc.onRequest(type.method, value => {
      this._log.debug(`rpc.onRequest ${type.method}`, value);
      return callback(value);
    });
  }

  _onNotification(type: {method: string}, callback: (Object) => void): void {
    this._rpc.onNotification(type.method, value => {
      this._log.debug(`rpc.onNotification ${type.method}`, value);
      callback(value);
    });
  }

  _sendNotification(method: string, args?: Object): void {
    this._log.debug(`rpc.sendNotification ${method}`, args);
    this._rpc.sendNotification(method, args);
  }

  async _sendRequest(method: string, args?: Object, cancellationToken?: jsonrpc.CancellationToken): Promise<any> {
    this._log.debug(`rpc.sendRequest ${method} sending`, args);
    try {
      const start = performance.now();
      let result = undefined;
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
      this._log.error(`rpc.sendRequest ${method} threw`, e);
      throw e;
    }
  }
}

/**
 * How a completion was triggered
 */
export namespace CompletionTriggerKind {
	/**
	 * Completion was triggered by typing an identifier (24x7 code
	 * complete), manual invocation (e.g Ctrl+Space) or via API.
	 */
	export const Invoked: 1 = 1;

	/**
	 * Completion was triggered by a trigger character specified by
	 * the `triggerCharacters` properties of the `CompletionRegistrationOptions`.
	 */
	export const TriggerCharacter: 2 = 2;
}
export type CompletionTriggerKind = 1 | 2;

/**
 * Contains additional information about the context in which a completion request is triggered.
 */
export interface CompletionContext {
	/**
	 * How the completion was triggered.
	 */
	triggerKind: CompletionTriggerKind;

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
