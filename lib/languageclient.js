// @flow

import * as jsonrpc from 'vscode-jsonrpc';
import EventEmitter from 'events';
import {NullLogger, type Logger} from './logger';

// Flow-typed wrapper around JSONRPC to implement Microsoft Language Server Protocol v3
// https://github.com/Microsoft/language-server-protocol/blob/master/protocol.md
export class LanguageClientConnection extends EventEmitter {
  _rpc: jsonrpc.connection;
  _log: Logger;
  isConnected: boolean;

  constructor(rpc: jsonrpc.connection, logger: ?Logger) {
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
  initialize(params: InitializeParams): Promise<InitializeResult> {
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
  onCustom(method: string, callback: Object => void): void {
    this._onNotification({method}, callback);
  }

  // Public: Register a callback for the `window/showMessage` message.
  //
  // * `callback` The function to be called when the `window/showMessage` message is
  //              received with {ShowMessageParams} being passed.
  onShowMessage(callback: ShowMessageParams => void): void {
    this._onNotification({method: 'window/showMessage'}, callback);
  }

  // Public: Register a callback for the `window/showMessageRequest` message.
  //
  // * `callback` The function to be called when the `window/showMessageRequest` message is
  //              received with {ShowMessageRequestParam}' being passed.
  // Returns a {Promise} containing the {MessageActionItem}.
  onShowMessageRequest(callback: ShowMessageRequestParams => Promise<?MessageActionItem>): void {
    this._onRequest({method: 'window/showMessageRequest'}, callback);
  }

  // Public: Register a callback for the `window/logMessage` message.
  //
  // * `callback` The function to be called when the `window/logMessage` message is
  //              received with {LogMessageParams} being passed.
  onLogMessage(callback: LogMessageParams => void): void {
    this._onNotification({method: 'window/logMessage'}, callback);
  }

  // Public: Register a callback for the `telemetry/event` message.
  //
  // * `callback` The function to be called when the `telemetry/event` message is
  //              received with any parameters received being passed on.
  onTelemetryEvent(callback: any => void): void {
    this._onNotification({method: 'telemetry/event'}, callback);
  }

  // Public: Register a callback for the `workspace/applyEdit` message.
  //
  // * `callback` The function to be called when the `workspace/applyEdit` message is
  //              received with {ApplyWorkspaceEditParams} being passed.
  // Returns a {Promise} containing the {ApplyWorkspaceEditResponse}.
  onApplyEdit(callback: ApplyWorkspaceEditParams => Promise<ApplyWorkspaceEditResponse>): void {
    this._onRequest({method: 'workspace/applyEdit'}, callback);
  }

  // Public: Send a `workspace/didChangeConfiguration` notification.
  //
  // * `params` The {DidChangeConfigurationParams} containing the new configuration.
  didChangeConfiguration(params: DidChangeConfigurationParams): void {
    this._sendNotification('workspace/didChangeConfiguration', params);
  }

  // Public: Send a `textDocument/didOpen` notification.
  //
  // * `params` The {DidOpenTextDocumentParams} containing the opened text document details.
  didOpenTextDocument(params: DidOpenTextDocumentParams): void {
    this._sendNotification('textDocument/didOpen', params);
  }

  // Public: Send a `textDocument/didChange` notification.
  //
  // * `params` The {DidChangeTextDocumentParams} containing the changed text document
  // details including the version number and actual text changes.
  didChangeTextDocument(params: DidChangeTextDocumentParams): void {
    this._sendNotification('textDocument/didChange', params);
  }

  // Public: Send a `textDocument/didClose` notification.
  //
  // * `params` The {DidCloseTextDocumentParams} containing the opened text document details.
  didCloseTextDocument(params: DidCloseTextDocumentParams): void {
    this._sendNotification('textDocument/didClose', params);
  }

  // Public: Send a `textDocument/willSave` notification.
  //
  // * `params` The {WillSaveTextDocumentParams} containing the to-be-saved text document
  // details and the reason for the save.
  willSaveTextDocument(params: WillSaveTextDocumentParams): void {
    this._sendNotification('textDocument/willSave', params);
  }

  // Public: Send a `textDocument/didSave` notification.
  //
  // * `params` The {DidSaveTextDocumentParams} containing the saved text document details.
  didSaveTextDocument(params: DidSaveTextDocumentParams): void {
    this._sendNotification('textDocument/didSave', params);
  }

  // Public: Send a `workspace/didChangeWatchedFiles` notification.
  //
  // * `params` The {DidChangeWatchedFilesParams} containing the array of {FileEvent}s that
  // have been observed upon the watched files.
  didChangeWatchedFiles(params: DidChangeWatchedFilesParams): void {
    this._sendNotification('workspace/didChangeWatchedFiles', params);
  }

  // Public: Register a callback for the `textDocument/publishDiagnostics` message.
  //
  // * `callback` The function to be called when the `textDocument/publishDiagnostics` message is
  //              received a {PublishDiagnosticsParams} containing new {Diagnostic} messages for a given uri.
  onPublishDiagnostics(callback: PublishDiagnosticsParams => void): void {
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
    params: TextDocumentPositionParams | CompletionParams,
    cancellationToken?: jsonrpc.CancellationToken): Promise<Array<CompletionItem> | CompletionList> {
    // Cancel prior request if necessary
    return this._sendRequest('textDocument/completion', params, cancellationToken);
  }

  // Public: Send a `completionItem/resolve` request.
  //
  // * `params` The {CompletionItem} for which a fully resolved {CompletionItem} is desired.
  // Returns a {Promise} containing a fully resolved {CompletionItem}.
  completionItemResolve(params: CompletionItem): Promise<?CompletionItem> {
    return this._sendRequest('completionItem/resolve', params);
  }

  // Public: Send a `textDocument/hover` request.
  //
  // * `params` The {TextDocumentPositionParams} for which a {Hover} is desired.
  // Returns a {Promise} containing a {Hover}.
  hover(params: TextDocumentPositionParams): Promise<?Hover> {
    return this._sendRequest('textDocument/hover', params);
  }

  // Public: Send a `textDocument/signatureHelp` request.
  //
  // * `params` The {TextDocumentPositionParams} for which a {SignatureHelp} is desired.
  // Returns a {Promise} containing a {SignatureHelp}.
  signatureHelp(params: TextDocumentPositionParams): Promise<?SignatureHelp> {
    return this._sendRequest('textDocument/signatureHelp', params);
  }

  // Public: Send a `textDocument/definition` request.
  //
  // * `params` The {TextDocumentPositionParams} of a symbol for which one or more {Location}s
  // that define that symbol are required.
  // Returns a {Promise} containing either a single {Location} or an {Array} of many {Location}s.
  gotoDefinition(params: TextDocumentPositionParams): Promise<Location | Array<Location>> {
    return this._sendRequest('textDocument/definition', params);
  }

  // Public: Send a `textDocument/references` request.
  //
  // * `params` The {TextDocumentPositionParams} of a symbol for which all referring {Location}s
  // are desired.
  // Returns a {Promise} containing an {Array} of {Location}s that reference this symbol.
  findReferences(params: TextDocumentPositionParams): Promise<Array<Location>> {
    return this._sendRequest('textDocument/references', params);
  }

  // Public: Send a `textDocument/documentHighlight` request.
  //
  // * `params` The {TextDocumentPositionParams} of a symbol for which all highlights are desired.
  // Returns a {Promise} containing an {Array} of {DocumentHighlight}s that can be used to
  // highlight this symbol.
  documentHighlight(params: TextDocumentPositionParams): Promise<Array<DocumentHighlight>> {
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
  documentSymbol(params: DocumentSymbolParams, cancellationToken?: jsonrpc.CancellationToken): Promise<Array<SymbolInformation>> {
    return this._sendRequest('textDocument/documentSymbol', params);
  }

  // Public: Send a `workspace/symbol` request.
  //
  // * `params` The {WorkspaceSymbolParams} containing the query string to search the workspace for.
  // Returns a {Promise} containing an {Array} of {SymbolInformation}s that identify where the query
  // string occurs within the workspace.
  workspaceSymbol(params: WorkspaceSymbolParams): Promise<Array<SymbolInformation>> {
    return this._sendRequest('workspace/symbol', params);
  }

  // Public: Send a `textDocument/codeAction` request.
  //
  // * `params` The {CodeActionParams} identifying the document, range and context for the code action.
  // Returns a {Promise} containing an {Array} of {Commands}s that can be performed against the given
  // documents range.
  codeAction(params: CodeActionParams): Promise<Array<Command>> {
    return this._sendRequest('textDocument/codeAction', params);
  }

  // Public: Send a `textDocument/codeLens` request.
  //
  // * `params` The {CodeLensParams} identifying the document for which code lens commands are desired.
  // Returns a {Promise} containing an {Array} of {CodeLens}s that associate commands and data with
  // specified ranges within the document.
  codeLens(params: CodeLensParams): Promise<Array<CodeLens>> {
    return this._sendRequest('textDocument/codeLens', params);
  }

  // Public: Send a `codeLens/resolve` request.
  //
  // * `params` The {CodeLens} identifying the code lens to be resolved with full detail.
  // Returns a {Promise} containing the {CodeLens} fully resolved.
  codeLensResolve(params: CodeLens): Promise<?CodeLens> {
    return this._sendRequest('codeLens/resolve', params);
  }

  // Public: Send a `textDocument/documentLink` request.
  //
  // * `params` The {DocumentLinkParams} identifying the document for which links should be identified.
  // Returns a {Promise} containing an {Array} of {DocumentLink}s relating uri's to specific ranges
  // within the document.
  documentLink(params: DocumentLinkParams): Promise<Array<DocumentLink>> {
    return this._sendRequest('textDocument/documentLink', params);
  }

  // Public: Send a `documentLink/resolve` request.
  //
  // * `params` The {DocumentLink} identifying the document link to be resolved with full detail.
  // Returns a {Promise} containing the {DocumentLink} fully resolved.
  documentLinkResolve(params: DocumentLink): Promise<DocumentLink> {
    return this._sendRequest('documentLink/resolve', params);
  }

  // Public: Send a `textDocument/formatting` request.
  //
  // * `params` The {DocumentFormattingParams} identifying the document to be formatted as well as
  // additional formatting preferences.
  // Returns a {Promise} containing an {Array} of {TextEdit}s to be applied to the document to
  // correctly reformat it.
  documentFormatting(params: DocumentFormattingParams): Promise<Array<TextEdit>> {
    return this._sendRequest('textDocument/formatting', params);
  }

  // Public: Send a `textDocument/rangeFormatting` request.
  //
  // * `params` The {DocumentRangeFormattingParams} identifying the document and range to be formatted
  // as well as additional formatting preferences.
  // Returns a {Promise} containing an {Array} of {TextEdit}s to be applied to the document to
  // correctly reformat it.
  documentRangeFormatting(params: DocumentRangeFormattingParams): Promise<Array<TextEdit>> {
    return this._sendRequest('textDocument/rangeFormatting', params);
  }

  // Public: Send a `textDocument/onTypeFormatting` request.
  //
  // * `params` The {DocumentOnTypeFormattingParams} identifying the document to be formatted,
  // the character that was typed and at what position as well as additional formatting preferences.
  // Returns a {Promise} containing an {Array} of {TextEdit}s to be applied to the document to
  // correctly reformat it.
  documentOnTypeFormatting(params: DocumentOnTypeFormattingParams): Promise<Array<TextEdit>> {
    return this._sendRequest('textDocument/onTypeFormatting', params);
  }

  // Public: Send a `textDocument/rename` request.
  //
  // * `params` The {RenameParams} identifying the document containing the symbol to be renamed,
  // as well as the position and new name.
  // Returns a {Promise} containing an {WorkspaceEdit} that contains a list of {TextEdit}s either
  // on the changes property (keyed by uri) or the documentChanges property containing
  // an {Array} of {TextDocumentEdit}s (preferred).
  rename(params: RenameParams): Promise<WorkspaceEdit> {
    return this._sendRequest('textDocument/rename', params);
  }

  // Public: Send a `workspace/executeCommand` request.
  //
  // * `params` The {ExecuteCommandParams} specifying the command and arguments
  // the language server should execute (these commands are usually from {CodeLens} or {CodeAction}
  // responses).
  // Returns a {Promise} containing anything.
  executeCommand(params: ExecuteCommandParams): Promise<any> {
    return this._sendRequest('workspace/executeCommand', params);
  }

  _onRequest(type: {method: string}, callback: Object => Promise<any>): void {
    this._rpc.onRequest(type, value => {
      this._log.debug(`rpc.onRequest ${type.method}`, value);
      return callback(value);
    });
  }

  _onNotification(type: {method: string}, callback: Object => void): void {
    this._rpc.onNotification(type, value => {
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

// Public: Position in a text document expressed as zero-based line and zero-based character offset.
// A position is between two characters like an 'insert' cursor in a editor.
export type Position = {
  // Line position in a document (zero-based).
  line: number,
  // Character offset on a line in a document (zero-based).
  character: number,
};

// Public: A range in a text document expressed as (zero-based) start and end positions.
// A range is comparable to a selection in an editor. Therefore the end position is exclusive.
// If you want to specify a range that contains a line including the line ending character(s)
// then use an end position denoting the start of the next line.
export type Range = {
  // The range's start position.
  start: Position,
  // The range's end position.
  end: Position,
};

// Public: Represents a location inside a resource, such as a line inside a text file.
export type Location = {
  // The location's URI.
  uri: string,
  // The position within the URI.
  range: Range,
};

export type DiagnosticCode = number | string;

// Public: Represents a diagnostic, such as a compiler error or warning. Diagnostic objects are only
// valid in the scope of a resource.
export type Diagnostic = {
  // The range at which the message applies.
  range: Range,
  // The diagnostic's severity. Can be omitted. If omitted it is up to the
  // client to interpret diagnostics as error, warning, info or hint.
  severity?: number,
  // The diagnostic's code. Can be omitted.
  code?: DiagnosticCode,
  // A human-readable string describing the source of this
  // diagnostic, e.g. 'typescript' or 'super lint'.
  source?: string,
  // The diagnostic's message.
  message: string,
};

// Public: Severity of a Diagnostic message.
export const DiagnosticSeverity = {
  // Reports an error.
  Error: 1,
  // Reports a warning.
  Warning: 2,
  // Reports an information.
  Information: 3,
  // Reports a hint.
  Hint: 4,
};

// Public: Represents a reference to a command. Provides a title which will be used
// to represent a command in the UI. Commands are identified by a string identifier.
export type Command = {
  // Title of the command, like `save`.
  title: string,
  // The identifier of the actual command handler.
  command: string,
  // Arguments that the command handler should be invoked with.
  arguments?: any[],
};

// Public: A textual edit applicable to a text document.
export type TextEdit = {
  // The range of the text document to be manipulated. To insert
  // text into a document create a range where start === end.
  range: Range,
  // The string to be inserted. For delete operations use an empty string.
  newText: string,
};

// Public: Describes textual changes on a single text document. The text document is
// referred to as a VersionedTextDocumentIdentifier to allow clients to check the text
// document version before an edit is applied.
export type TextDocumentEdit = {
  // The text document to change.
  textDocument: VersionedTextDocumentIdentifier;
  // The edits to be applied.
  edits: TextEdit[];
};

// Public: A workspace edit represents changes to many resources managed in the workspace.
// The edit should either provide changes or documentChanges. If the client can handle
// versioned document edits and if documentChanges are present, the latter are preferred
// over changes.
export type WorkspaceEdit = {
  // Holds changes to existing resources.
  changes?: {[uri: string]: TextEdit[]};
  // An array of `TextDocumentEdit`s to express changes to n different text documents
  // where each text document edit addresses a specific version of a text document.
  // Whether a client supports versioned document edits is expressed via
  // `WorkspaceClientCapabilities.workspaceEdit.documentChanges`.
  documentChanges?: TextDocumentEdit[];
};

// Public: Text documents are identified using a URI. On the protocol level, URIs are
// passed as strings.
export type TextDocumentIdentifier = {
  // The text document's URI.
  uri: string,
};

// Public: An item to transfer a text document from the client to the server.
export type TextDocumentItem = {
  // The text document's URI.
  uri: string,
  // The text document's language identifier.
  languageId: string,
  // The version number of this document (it will strictly increase after each
  // change, including undo/redo).
  version: number,
  // The content of the opened text document.
  text: string,
};

// Public: An identifier to denote a specific version of a text document.
export type VersionedTextDocumentIdentifier = TextDocumentIdentifier & {
  // The version number of this document.
  version: number,
};

// Public: Was TextDocumentPosition in 1.0 with inlined parameters.
// A parameter literal used in requests to pass a text document and a position inside
// that document.
export type TextDocumentPositionParams = {
  // The text document.
  textDocument: TextDocumentIdentifier,
  // The position inside the text document.
  position: Position,
};

// Public: A document filter denotes a document through properties like language, schema
// or pattern.
export type DocumentFilter = {
  // A language id, like `typescript`.
  language?: string;
  // A Uri [scheme](#Uri.scheme), like `file` or `untitled`.
  scheme?: string;
  // A glob pattern, like `*.{ts,js}`.
  pattern?: string;
};

// Public: A document selector is the combination of one or more document filters.
export type DocumentSelector = DocumentFilter[];

// Public: Parameters required to initialize the language server.
export type InitializeParams = {
  // The process Id of the parent process that started the server.
  // Is null if the process has not been started by another process.
  // If the parent process is not alive then the server should exit
  // (see exit notification) its process.
  processId?: ?number,
  // The rootPath of the workspace. Is null if no folder is open.
  rootPath?: ?string,
  // The rootUri of the workspace. Is null if no folder is open.
  // If both `rootPath` and `rootUri` are set `rootUri` wins.
  rootUri?: ?DocumentUri,
  // User provided initialization options.
  initializationOptions?: any,
  // The capabilities provided by the client (editor)
  capabilities: ClientCapabilities,
  // The initial trace setting. If omitted trace is disabled ('off').
  trace?: 'off' | 'messages' | 'verbose',
};

// Public: Notification parameters sent to the server once after initialize
// & before other requests
export type InitializedParams = {};

// Public: Defines capabilities the editor / tool provides on the workspace.
export type WorkspaceClientCapabilities = {
  // The client supports applying batch edits to the workspace by supporting
  // the request 'workspace/applyEdit'
  applyEdit?: boolean;
  // Capabilities specific to `WorkspaceEdit`s
  workspaceEdit?: {
    // The client supports versioned document changes in `WorkspaceEdit`s
    documentChanges?: boolean;
  };
  // Capabilities specific to the `workspace/didChangeConfiguration` notification.
  didChangeConfiguration?: {
    // Did change configuration notification supports dynamic registration.
    dynamicRegistration?: boolean;
  };
  // Capabilities specific to the `workspace/didChangeWatchedFiles` notification.
  didChangeWatchedFiles?: {
    // Did change watched files notification supports dynamic registration.
    dynamicRegistration?: boolean;
  };
  // Capabilities specific to the `workspace/symbol` request.
  symbol?: {
    // Symbol request supports dynamic registration.
    dynamicRegistration?: boolean;
  };
  // Capabilities specific to the `workspace/executeCommand` request.
  executeCommand?: {
    // Execute command supports dynamic registration.
    dynamicRegistration?: boolean;
  };
};

// Public: Defines capabilities the editor / tool provides on text document.
export type TextDocumentClientCapabilities = {
  synchronization?: {
    // Whether text document synchronization supports dynamic registration.
    dynamicRegistration?: boolean;
    // The client supports sending will save notifications.
    willSave?: boolean;
    // The client supports sending a will save request and
    // waits for a response providing text edits which will
    // be applied to the document before it is saved.
    willSaveWaitUntil?: boolean;
    // The client supports did save notifications.
    didSave?: boolean;
  },
  // Capabilities specific to the `textDocument/completion`
  completion?: {
    // Whether completion supports dynamic registration.
    dynamicRegistration?: boolean;
    // The client supports the following `CompletionItem` specific capabilities.
    completionItem?: {
      // Client supports snippets as insert text.
      // A snippet can define tab stops and placeholders with `$1`, `$2`
      // and `${3:foo}`. `$0` defines the final tab stop, it defaults to
      // the end of the snippet. Placeholders with equal identifiers are linked,
      // that is typing in one will update others too.
      snippetSupport?: boolean;
      // Client supports commit characters on a completion item.
      commitCharactersSupport?: boolean;
    };
    // The client supports to send additional context information for a
    // `textDocument/completion` requestion.
    contextSupport?: boolean;
  };
  // Capabilities specific to the `textDocument/hover`
  hover?: {
    // Whether hover supports dynamic registration.
    dynamicRegistration?: boolean;
  };
  // Capabilities specific to the `textDocument/signatureHelp`
  signatureHelp?: {
    // Whether signature help supports dynamic registration.
    dynamicRegistration?: boolean;
  };
  // Capabilities specific to the `textDocument/references`
  references?: {
    // Whether references supports dynamic registration.
    dynamicRegistration?: boolean;
  };
   // Capabilities specific to the `textDocument/documentHighlight`
  documentHighlight?: {
    // Whether document highlight supports dynamic registration.
    dynamicRegistration?: boolean;
  };
   // Capabilities specific to the `textDocument/documentSymbol`
  documentSymbol?: {
    // Whether document symbol supports dynamic registration.
    dynamicRegistration?: boolean;
  };
   // Capabilities specific to the `textDocument/formatting`
  formatting?: {
   // Whether formatting supports dynamic registration.
   dynamicRegistration?: boolean;
  };
   // Capabilities specific to the `textDocument/rangeFormatting`
  rangeFormatting?: {
    // Whether range formatting supports dynamic registration.
    dynamicRegistration?: boolean;
  };
   // Capabilities specific to the `textDocument/onTypeFormatting`
  onTypeFormatting?: {
    // Whether on type formatting supports dynamic registration.
    dynamicRegistration?: boolean;
  };
   // Capabilities specific to the `textDocument/definition`
  definition?: {
    // Whether definition supports dynamic registration.
    dynamicRegistration?: boolean;
  };
   // Capabilities specific to the `textDocument/codeAction`
  codeAction?: {
    // Whether code action supports dynamic registration.
    dynamicRegistration?: boolean;
  };
   // Capabilities specific to the `textDocument/codeLens`
  codeLens?: {
    // Whether code lens supports dynamic registration.
    dynamicRegistration?: boolean;
  };
  // Capabilities specific to the `textDocument/documentLink`
  documentLink?: {
    // Whether document link supports dynamic registration.
    dynamicRegistration?: boolean;
  };
  // Capabilities specific to the `textDocument/rename`
  rename?: {
    // Whether rename supports dynamic registration.
    dynamicRegistration?: boolean;
  };
};

// Public: ClientCapabilities now define capabilities for dynamic registration,
// workspace and text document features the client supports. The experimental can
// be used to pass experimential capabilities under development.
export type ClientCapabilities = {
  // Workspace specific client capabilities.
  workspace?: WorkspaceClientCapabilities,
  // Text document specific client capabilities.
  textDocument?: TextDocumentClientCapabilities,
  // Experimental client capabilities.
  experimental?: any;
};

// Public: Result recieved from the server in response to the initialization request.
export type InitializeResult = {
  // The capabilities the language server provides.
  capabilities: ServerCapabilities,
};

// Public: Initialization error details.
export type InitializeError = {
  // Indicates whether the client should retry to send the
  // initilize request after showing the message provided
  // in the ResponseError.
  retry: boolean,
};

// Public: Defines how the host (editor) should sync document changes to the language server.
export const TextDocumentSyncKind = {
  // Documents should not be synced at all.
  None: 0,
  // Documents are synced by always sending the full content of the document.
  Full: 1,
  // Documents are synced by sending the full content on open. After that only incremental
  // updates to the document are sent.
  Incremental: 2,
};

// Public: Completion options.
export type CompletionOptions = {
  // The server provides support to resolve additional information for a completion item.
  resolveProvider?: boolean,
  // The characters that trigger completion automatically.
  triggerCharacters?: string[],
};

// Public: Signature Help options.
export type SignatureHelpOptions = {
  // The characters that trigger signature help automatically.
  triggerCharacters?: string[],
};

// Public: Code Lens options.
export type CodeLensOptions = {
  // Code lens has a resolve provider as well.
  resolveProvider?: boolean,
};

// Public: Format Document on type options
export type DocumentOnTypeFormattingOptions = {
  // A character on which formatting should be triggered, like `};`.
  firstTriggerCharacter: string,
  // More trigger characters.
  moreTriggerCharacter?: string[],
};

// Public: Document Link options
export type DocumentLinkOptions = {
  // Document links have a resolve provider as well.
  resolveProvider?: boolean;
};

// Public: Execute Command options.
export type ExecuteCommandOptions = {
  // The commands to be executed on the server
  commands: string[];
};

// Public: Document save options.
export type SaveOptions = {
  // The client is supposed to include the content on save.
  includeText?: boolean;
};

// Public: Text document synchronization options.
export type TextDocumentSyncOptions = {
  // Open and close notifications are sent to the server.
  openClose?: boolean;
  // Change notificatins are sent to the server. See TextDocumentSyncKind.None, TextDocumentSyncKind.Full
  // and TextDocumentSyncKindIncremental.
  change?: number;
  // Will save notifications are sent to the server.
  willSave?: boolean;
  // Will save wait until requests are sent to the server.
  willSaveWaitUntil?: boolean;
  // Save notifications are sent to the server.
  save?: SaveOptions;
};

// Public: Defines capabilities that will be returned by the server.
export type ServerCapabilities = {
  // Defines how text documents are synced.
  textDocumentSync?: TextDocumentSyncOptions | number,
  // The server provides hover support.
  hoverProvider?: boolean,
  // The server provides completion support.
  completionProvider?: CompletionOptions,
  // The server provides signature help support.
  signatureHelpProvider?: SignatureHelpOptions,
  // The server provides goto definition support.
  definitionProvider?: boolean,
  // The server provides find references support.
  referencesProvider?: boolean,
  // The server provides document highlight support.
  documentHighlightProvider?: boolean,
  // The server provides document symbol support.
  documentSymbolProvider?: boolean,
  // The server provides workspace symbol support.
  workspaceSymbolProvider?: boolean,
  // The server provides code actions.
  codeActionProvider?: boolean,
  // The server provides code lens.
  codeLensProvider?: CodeLensOptions,
  // The server provides document formatting.
  documentFormattingProvider?: boolean,
  // The server provides document range formatting.
  documentRangeFormattingProvider?: boolean,
  // The server provides document formatting on typing.
  documentOnTypeFormattingProvider?: DocumentOnTypeFormattingOptions,
  // The server provides rename support.
  renameProvider?: boolean,
  // The server provides document link support.
  documentLinkProvider?: DocumentLinkOptions,
  // The server provides execute command support.
  executeCommandProvider?: ExecuteCommandOptions,
  // Experimental server capabilities.
  experimental?: any;
};

// Public: Details of a message to be shown to the user.
export type ShowMessageParams = {
  // Public: The {MessageType} of this message.
  type: number,
  // Public: The actual text content of this message.
  message: string,
};

// Public: The types of messages available.
export const MessageType = {
  // Public: An error message.
  Error: 1,
  // Public: A warning message.
  Warning: 2,
  // Public: An informational message.
  Info: 3,
  // Public: A log message.
  Log: 4,
};

// Public: Details of a request to show a message with actions to take.
export type ShowMessageRequestParams = {
  // Public: The {MessageType} of this request.
  type: number,
  // Public: The actual text content of this message.
  message: string,
  // Public: The optional {Array} of {MessageActionItem} to be shown to the user
  // of which they can choose one.
  actions?: MessageActionItem[],
};

// Public: Details of an individual action that can be taken in response
// to a {ShowMessageRequest} message.
export type MessageActionItem = {
  // Public: A short title like 'Retry', 'Open Log' etc.
  title: string,
};

// Public: Details of the LogMessage to be handled.
export type LogMessageParams = {
  // Public: The {MessageType} of this log message.
  type: number,
  // Public: The actual text content of this log message.
  message: string,
};

// Public: General parameters to register for a capability.
export type Registration = {
  // The id used to register the request. The id can be used to deregister
  // the request again.
  id: string,
  // The method / capability to register for.
  method: string,
  // Options necessary for the registration.
  registerOptions?: any,
};

// Public: Capability registration parameters.
export type RegistrationParams = {
  registrations: Registration[],
};

// Public: Text document registration options.
export type TextDocumentRegistrationOptions = {
  // A document selector to identify the scope of the registration. If set to null
  // the document selector provided on the client side will be used.
  documentSelector: DocumentSelector | null,
};

// Public: General parameters to unregister a capability.
export type Unregistration = {
   // The id used to unregister the request or notification. Usually an id
   // provided during the register request.
  id: string,
  // The method / capability to unregister for.
  method: string,
};

// Public: General parameters to unregister a capability.
export type UnregistrationParams = {
  unregisterations: Unregistration[],
};

// Public: Details of a configuration change that has occured.
export type DidChangeConfigurationParams = {
  // Public: The complete settings after the change has been applied.
  settings: any,
};

// Public: Details of file activities on files that are being watched.
export type DidChangeWatchedFilesParams = {
  // Public: The {Array} of {FileEvent}s that have occured.
  changes: FileEvent[],
};

// Public: An event describing a file change.
export type FileEvent = {
  // Public: The file's Uri.
  uri: string,
  // Public: The type of change as specified by {FileChangeType}
  type: number,
};

// Public: The type of file changes that may occur.
export const FileChangeType = {
  // Public: The file was created.
  Created: 1,
  // Public: The file was changed.
  Changed: 2,
  // Public: The file was deleted.
  Deleted: 3,
};

// Public: Describe options to be used when registered for text document change events.
export type DidChangeWatchedFilesRegistrationOptions = {
  // The watchers to register.
  watchers: FileSystemWatcher[],
};

// Public: Parameters for a file system watcher.
export type FileSystemWatcher = {
  // The glob pattern to watch
  globPattern: string,
  // The kind of events of interest. If omitted it defaults
  // to WatchKind.Create | WatchKind.Change | WatchKind.Delete
  // which is 7.
  kind?: number,
};

// Public: The kind of file system to event to watch.
export const WatchKind = {
  // Interested in create events.
  Create: 1,
  // Interested in change events
  Change: 2,
  // Interested in delete events
  Delete: 4,
};

// Public: The parameters of a Workspace Symbol Request.
export type WorkspaceSymbolParams = {
  // A non-empty query string.
  query: string,
};

// Public: Parameters to send with a workspace/executeCommand request.
export type ExecuteCommandParams = {
  // The identifier of the actual command handler.
  command: string,
  // Arguments that the command should be invoked with.
  arguments?: Array<any>,
};

// Public: Execute command registration options.
export type ExecuteCommandRegistrationOptions = {
  // The commands to be executed on the server
  commands: string[],
};

// Public: Parameters to receive with a workspace/applyEdit request.
export type ApplyWorkspaceEditParams = {
  // An optional label of the workspace edit. This label is
  // presented in the user interface for example on an undo
  // stack to undo the workspace edit.
  label?: string,
  // The edits to apply.
  edit: WorkspaceEdit,
};

// Public: Parameters to send with a workspace/applyEdit response.
export type ApplyWorkspaceEditResponse = {
  // Indicates whether the edit was applied or not.
  applied: boolean,
};

// Public: Details of a text document that has been opened.
export type DidOpenTextDocumentParams = {
  // Public: The {TextDocumentIdentifier} of the file that was opened.
  textDocument: TextDocumentItem,
};

// Public: Details of a text document that has been changed.
export type DidChangeTextDocumentParams = {
  // Public: The {VersionedTextDocumentIdentifier} that contains
  // both the identity of the document that changed and the unique
  // version number to be used after the changes are applied.
  textDocument: VersionedTextDocumentIdentifier,
  // Public: An {Array} of {TextDocumentContentChangeEvent} containing the
  // actual textual changes to be applied to the document.
  contentChanges: TextDocumentContentChangeEvent[],
};

// Public: An event describing a change to a text document.
// If range and rangeLength are omitted the new text is considered to be
// the full content of the document.
export type TextDocumentContentChangeEvent = {
  // Public: The {Range} of the document that changed.
  range?: Range,
  // Public: The length of the {Range} that was replaced.
  rangeLength?: number,
  // Public: The new text for this range (or document when range unspeciied)
  text: string,
};

// Public: Describe options to be used when registered for text document change events.
export type TextDocumentChangeRegistrationOptions = TextDocumentRegistrationOptions & {
  // How documents are synced to the server. See TextDocumentSyncKind.Full
  // and TextDocumentSyncKindIncremental.
  syncKind: number,
};

// Public: The parameters send in a will save text document notification.
export type WillSaveTextDocumentParams = {
  // The document that will be saved.
  textDocument: TextDocumentIdentifier,
  // The 'TextDocumentSaveReason'.
  reason: number,
};

// Public: Represents reasons why a text document is saved.
export const TextDocumentSaveReason = {
  // Manually triggered, e.g. by the user pressing save, by starting debugging,
  // or by an API call.
  Manual: 1,
  // Automatic after a delay.
  AfterDelay: 2,
  // When the editor lost focus.
  FocusOut: 3,
};

// Public: Details of a text document that has been saved.
export type DidSaveTextDocumentParams = {
  // Public: The {TextDocumentIdentifier} of the file that was saved.
  textDocument: TextDocumentIdentifier,
  // Optional the content when saved. Depends on the includeText value
  // when the save notifcation was requested.
  text?: string,
};

// Public: Registration options for text document save events.
export type TextDocumentSaveRegistrationOptions = TextDocumentRegistrationOptions & {
  // The client is supposed to include the content on save.
  includeText?: boolean,
};

// Public: Details of text documents that has been closed.
export type DidCloseTextDocumentParams = {
  // Public: The {TextDocumentIdentifier} of the file that was closed.
  textDocument: TextDocumentIdentifier,
};

// Public: Parameters for textDocument/publishDiagnostics events.
export type PublishDiagnosticsParams = {
  // The URI for which diagnostic information is reported.
  uri: string,
  // An array of diagnostic information items.
  diagnostics: Diagnostic[],
};

// Public: Parameters for completion requests.
export type CompletionParams = TextDocumentPositionParams & {
  // The completion context. This is only available it the client specifies
  // to send this using `ClientCapabilities.textDocument.completion.contextSupport === true`
  context?: CompletionContext;
};

// Public: How a completion was triggered
export const CompletionTriggerKind = {
  // Completion was triggered by typing an identifier (24x7 code
  // complete), manual invocation (e.g Ctrl+Space) or via API.
  Invoked: 1,
  // Completion was triggered by a trigger character specified by
  // the `triggerCharacters` properties of the `CompletionRegistrationOptions`.
  TriggerCharacter: 2,
};

// Public: Contains additional information about the context in which a completion request is triggered.
export type CompletionContext = {
  // How the completion was triggered.
  triggerKind: number,
  // The trigger character (a single character) that has trigger code complete.
  // Is undefined if `triggerKind !== CompletionTriggerKind.TriggerCharacter`
  triggerCharacter?: string,
};

// Public: Represents a collection of [completion items](#CompletionItem) to be presented in the editor.
export type CompletionList = {
  // This list it not complete. Further typing should result in recomputing this list.
  isIncomplete: boolean,
  // The completion items.
  items: CompletionItem[],
};

// Public: Defines whether the insert text in a completion item should be interpreted as
// plain text or a snippet.
export const InsertTextFormat = {
  // The primary text to be inserted is treated as a plain string.
  PlainText: 1,
  // The primary text to be inserted is treated as a snippet.
  //
  // A snippet can define tab stops and placeholders with `$1`, `$2`
  // and `${3:foo}`. `$0` defines the final tab stop, it defaults to
  // the end of the snippet. Placeholders with equal identifiers are linked,
  // that is typing in one will update others too.
  Snippet: 2,
};

// Public: CompletionItem details.
export type CompletionItem = {
  //  The label of this completion item. By default
  //  also the text that is inserted when selecting
  //  this completion.
  label: string,
  // The kind of this completion item. Based of the kind an icon is chosen by the editor.
  kind?: number,
  // A human-readable string with additional information
  // about this item, like type or symbol information.
  detail?: string,
  // A human-readable string that represents a doc-comment.
  documentation?: string,
  //  A string that shoud be used when comparing this item
  //  with other items. When `falsy` the label is used.
  sortText?: string,
  //  A string that should be used when filtering a set of
  //  completion items. When `falsy` the label is used.
  filterText?: string,
  //  A string that should be inserted a document when selecting
  //  this completion. When `falsy` the label is used.
  insertText?: string,
  // The format of the insert text. The format applies to both the `insertText` property
  // and the `newText` property of a provided `textEdit`.
  insertTextFormat?: number,
  //  An edit which is applied to a document when selecting
  //  this completion. When an edit is provided the value of
  //  insertText is ignored.
  textEdit?: TextEdit,
  //  An optional array of additional text edits that are applied when
  //  selecting this completion. Edits must not overlap with the main edit
  //  nor with themselves.
  additionalTextEdits?: TextEdit[],
  // An optional set of characters that when pressed while this completion is active will accept it first and
  // then type that character. *Note* that all commit characters should have `length=1` and that superfluous
  // characters will be ignored.
  commitCharacters?: string[],
  //  An optional command that is executed *after* inserting this completion. *Note* that
  //  additional modifications to the current document should be described with the
  //  additionalTextEdits-property.
  command?: Command,
  //  An data entry field that is preserved on a completion item between
  //  a completion and a completion resolve request.
  data?: any,
};

// Public: The kind of a completion entry.
export const CompletionItemKind = {
  Text: 1,
  Method: 2,
  Function: 3,
  Constructor: 4,
  Field: 5,
  Variable: 6,
  Class: 7,
  Interface: 8,
  Module: 9,
  Property: 10,
  Unit: 11,
  Value: 12,
  Enum: 13,
  Keyword: 14,
  Snippet: 15,
  Color: 16,
  File: 17,
  Reference: 18,
};

// Public: Registration options for the completions capability.
export type CompletionRegistrationOptions = TextDocumentRegistrationOptions & {
  // Most tools trigger completion request automatically without explicitly requesting
  // it using a keyboard shortcut (e.g. Ctrl+Space). Typically they do so when the user
  // starts to type an identifier. For example if the user types `c` in a JavaScript file
  // code complete will automatically pop up present `console` besides others as a
  // completion item. Characters that make up identifiers don't need to be listed here.
  //
  // If code complete should automatically be trigger on characters not being valid inside
  // an identifier (for example `.` in JavaScript) list them in `triggerCharacters`.
  triggerCharacters?: string[],
  // The server provides support to resolve additional
  // information for a completion item.
  resolveProvider?: boolean,
};

// Public: The result of a hover request.
export type Hover = {
  // The hover's content
  contents: MarkedString | MarkedString[],
  // An optional range is a range inside a text document
  // that is used to visualize a hover, e.g. by changing the background color.
  range?: Range,
};

// Public: The marked string is rendered:
// - as markdown if it is represented as a string
// - as code block of the given langauge if it is represented as a pair of a language and a value
//
// The pair of a language and a value is an equivalent to markdown:
// ```${language};
// ${value};
// ```
export type MarkedString = string | {language: string, value: string};

// Public: Signature help represents the signature of something
// callable. There can be multiple signature but only one
// active and only one active parameter.
export type SignatureHelp = {
  // One or more signatures.
  signatures: SignatureInformation[],
  // The active signature.
  activeSignature?: number,
  // The active parameter of the active signature.
  activeParameter?: number,
};

// Public: Represents the signature of something callable. A signature
// can have a label, like a function-name, a doc-comment, and
// a set of parameters.
export type SignatureInformation = {
  // The label of this signature. Will be shown in the UI.
  label: string,
  //  The human-readable doc-comment of this signature. Will be shown in the UI but can be omitted.
  documentation?: string,
  // The parameters of this signature.
  parameters?: ParameterInformation[],
};

// Public: Represents a parameter of a callable-signature. A parameter can
// have a label and a doc-comment.
export type ParameterInformation = {
  // The label of this parameter. Will be shown in the UI.
  label: string,
  // The human-readable doc-comment of this parameter. Will be shown in the UI but can be omitted.
  documentation?: string,
};

// Public: Registration options for the signature help capability.
export type SignatureHelpRegistrationOptions = TextDocumentRegistrationOptions & {
  // The characters that trigger signature help
  // automatically.
  triggerCharacters?: string[],
};

// Public: Parameters for the references request.
export type ReferenceParams = TextDocumentPositionParams & {
  context: ReferenceContext,
};

// Public: The context of a references request.
export type ReferenceContext = {
  // Include the declaration of the current symbol.
  includeDeclaration: boolean,
};

// Public: A document highlight is a range inside a text document which deserves
// special attention. Usually a document highlight is visualized by changing
// the background color of its range.
export type DocumentHighlight = {
  // The range this highlight applies to.
  range: Range,
  // The highlight kind, default is DocumentHighlightKind.Text.
  kind?: number,
};

// Public: The kind of a {DocumentHighlight}.
export const DocumentHighlightKind = {
  // A textual occurrance.
  Text: 1,
  // Read-access of a symbol, like reading a variable.
  Read: 2,
  // Write-access of a symbol, like writing to a variable.
  Write: 3,
};

// Public: Parameters for a document symbol request.
export type DocumentSymbolParams = {
  // The text document.
  textDocument: TextDocumentIdentifier,
};

// Public: Represents information about programming constructs like variables, classes,
// interfaces etc.
export type SymbolInformation = {
  // The name of this symbol.
  name: string,
  // The kind of this symbol.
  kind: number,
  // The location of this symbol.
  location: Location,
  // The name of the symbol containing this symbol.
  containerName?: string,
};

// Public: The kind of a symbol.
export const SymbolKind = {
  File: 1,
  Module: 2,
  Namespace: 3,
  Package: 4,
  Class: 5,
  Method: 6,
  Property: 7,
  Field: 8,
  Constructor: 9,
  Enum: 10,
  Interface: 11,
  Function: 12,
  Variable: 13,
  Constant: 14,
  String: 15,
  Number: 16,
  Boolean: 17,
  Array: 18,
};

// Public: Params for the CodeActionRequest
export type CodeActionParams = {
  // The document in which the command was invoked.
  textDocument: TextDocumentIdentifier,
  // The range for which the command was invoked.
  range: Range,
  // Context carrying additional information.
  context: CodeActionContext,
};

// Public: Contains additional diagnostic information about the context in which a code action is run.
export type CodeActionContext = {
  // An array of diagnostics.
  diagnostics: Diagnostic[],
};

// Public: Parameters for the CodeLens request.
export type CodeLensParams = {
  // The document to request code lens for.
  textDocument: TextDocumentIdentifier,
};

// Public: A code lens represents a command that should be shown along with
// source text, like the number of references, a way to run tests, etc.
//
// A code lens is _unresolved_ when no command is associated to it. For performance
// reasons the creation of a code lens and resolving should be done in two stages.
export type CodeLens = {
  // The range in which this code lens is valid. Should only span a single line.
  range: Range,
  // The command this code lens represents.
  command?: Command,
  // A data entry field that is preserved on a code lens item between a code lens
  // and a code lens resolve request.
  data?: any,
};

// Public: Registration options for the CodeLens capability.
export type CodeLensRegistrationOptions = TextDocumentRegistrationOptions & {
  // Code lens has a resolve provider as well.
  resolveProvider?: boolean,
};

// Public: Parameters for the DocumentLink request.
export type DocumentLinkParams = {
  // The document to provide document links for.
  textDocument: TextDocumentIdentifier,
};

// Public: A document link is a range in a text document that links to an internal or
// external resource, like another
// text document or a web site.
export type DocumentLink = {
  // The range this link applies to.
  range: Range,
  // The uri this link points to.
  target: string,
};

// Public: Registration options for the DocumentLink capability.
export type DocumentLinkRegistrationOptions = TextDocumentRegistrationOptions & {
  // Document links have a resolve provider as well.
  resolveProvider?: boolean,
};

// Public: Parameters to be send with a DocumentFormatting request.
export type DocumentFormattingParams = {
  // The document to format.
  textDocument: TextDocumentIdentifier,
  // The format options.
  options: FormattingOptions,
};

// Public: Value-object describing what options formatting should use.
export type FormattingOptions = {
  // Size of a tab in spaces.
  tabSize: number,
  // Prefer spaces over tabs.
  insertSpaces: boolean,
  // Signature for further properties.
  [key: string]: boolean | number | string,
};

// Public: Parameters to be send with a DocumentRangeFormatting request.
export type DocumentRangeFormattingParams = {
  // The document to format.
  textDocument: TextDocumentIdentifier,
  // The range to format.
  range: Range,
  // The format options.
  options: FormattingOptions,
};

// Public: Parameters to be send with a DocumentOnTypeFormatting request.
export type DocumentOnTypeFormattingParams = {
  // Public: The {TextDocumentIdentifier} of the document to format.
  textDocument: TextDocumentIdentifier,
  // Public: The {Position} of the text cursor at this point in time.
  position: Position,
  // Public: The character that has been typed.
  ch: string,
  // Public: The {FormattingOptions} relating to this document.
  options: FormattingOptions,
};

// Public: Registration options for the on-type document formatting capability.
export type DocumentOnTypeFormattingRegistrationOptions = TextDocumentRegistrationOptions & {
  // A character on which formatting should be triggered, like `}`.
  firstTriggerCharacter: string,
  // More trigger characters.
  moreTriggerCharacter?: string[],
};

// Public: Parameters to send with a Rename request.
export type RenameParams = {
  // Public: The {TextDocumentIdentifier} containing the item being renamed.
  textDocument: TextDocumentIdentifier,
  // Public: The position at which the symbol being renamed exists within the
  // text document.
  position: Position,
  // Public: The new name of this symbol.  If the given name is not valid the
  // request must return a [ResponseError](#ResponseError) with an
  // appropriate message set.
  newName: string,
};

type DocumentUri = string;
