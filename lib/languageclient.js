// @flow

import * as rpc from 'vscode-jsonrpc';
import {NullLogger, type Logger} from './logger';

// Flow-typed wrapper around JSONRPC to implement Microsoft Language Server Protocol v2
// https://github.com/Microsoft/language-server-protocol/blob/master/versions/protocol-2-x.md
export class LanguageClientConnection {
  _con: rpc.connection;
  _log: Logger;

  constructor(connection: rpc.connection, logger: ?Logger) {
    this._con = connection;
    this._log = logger || new NullLogger();

    connection.onError(error => this._log.error(['rpc.onError', error]));
    connection.onUnhandledNotification(notification => {
      if (notification.method != null && notification.params != null) {
        this._log.warn(`rpc.onUnhandledNotification ${notification.method}`, notification.params);
      } else {
        this._log.warn('rpc.onUnhandledNotification', notification);
      }
    });
    connection.onNotification(() => this._log.debug('rpc.onNotification', arguments));
    this.onLogMessage(m => this._log.log(['Log', m]));

    connection.listen();
  }

  dispose(): void {
    this._con.dispose();
  }

  initialize(params: InitializeParams): Promise<InitializeResult> {
    return this._sendRequest('initialize', params);
  }

  shutdown(): Promise<void> {
    return this._sendRequest('shutdown');
  }

  onCustom(method: string, callback: Object => void): void {
    this._onNotification({method}, callback);
  }

  onExit(callback: () => void): void {
    this._onNotification({method: 'exit'}, callback);
  }

  onShowMessage(callback: ShowMessageParams => void): void {
    this._onNotification({method: 'window/showMessage'}, callback);
  }

  onShowMessageRequest(callback: ShowMessageRequestParams => MessageActionItem): void {
    this._onRequest({method: 'window/ShowMessageRequest'}, callback);
  }

  onLogMessage(callback: LogMessageParams => void): void {
    this._onNotification({method: 'window/logMessage'}, callback);
  }

  onTelemetryEvent(callback: any => void): void {
    this._onNotification({method: 'telemetry/event'}, callback);
  }

  didChangeConfiguration(params: DidChangeConfigurationParams): void {
    this._sendNotification('workspace/didChangeConfiguration', params);
  }

  didOpenTextDocument(params: DidOpenTextDocumentParams): void {
    this._sendNotification('textDocument/didOpen', params);
  }

  didChangeTextDocument(params: DidChangeTextDocumentParams): void {
    this._sendNotification('textDocument/didChange', params);
  }

  didCloseTextDocument(params: DidCloseTextDocumentParams): void {
    this._sendNotification('textDocument/didClose', params);
  }

  didSaveTextDocument(params: DidSaveTextDocumentParams): void {
    this._sendNotification('textDocument/didSave', params);
  }

  didChangeWatchedFiles(params: DidChangeWatchedFilesParams): void {
    this._sendNotification('workspace/didChangeWatchedFiles', params);
  }

  onPublishDiagnostics(callback: PublishDiagnosticsParams => void): void {
    this._onNotification({method: 'textDocument/publishDiagnostics'}, callback);
  }

  completion(params: TextDocumentPositionParams): Promise<Array<CompletionItem> | CompletionList> {
    return this._sendRequest('textDocument/completion', params);
  }

  completionItemResolve(params: CompletionItem): Promise<CompletionItem> {
    return this._sendRequest('completionItem/resolve', params);
  }

  hover(params: TextDocumentPositionParams): Promise<Hover> {
    return this._sendRequest('textDocument/hover', params);
  }

  signatureHelp(params: TextDocumentPositionParams): Promise<SignatureHelp> {
    return this._sendRequest('textDocument/signatureHelp', params);
  }

  gotoDefinition(params: TextDocumentPositionParams): Promise<Location | Array<Location>> {
    return this._sendRequest('textDocument/definition', params);
  }

  findReferences(params: TextDocumentPositionParams): Promise<Array<Location>> {
    return this._sendRequest('textDocument/references', params);
  }

  documentHighlight(params: TextDocumentPositionParams): Promise<Array<DocumentHighlight>> {
    return this._sendRequest('textDocument/documentHighlight', params);
  }

  documentSymbol(params: DocumentSymbolParams): Promise<Array<SymbolInformation>> {
    return this._sendRequest('textDocument/documentSymbol', params);
  }

  workspaceSymbol(params: WorkspaceSymbolParams): Promise<Array<SymbolInformation>> {
    return this._sendRequest('workspace/symbol', params);
  }

  codeAction(params: CodeActionParams): Promise<Array<Command>> {
    return this._sendRequest('textDocument/codeAction', params);
  }

  codeLens(params: CodeLensParams): Promise<Array<CodeLens>> {
    return this._sendRequest('textDocument/codeLens', params);
  }

  codeLensResolve(params: CodeLens): Promise<Array<CodeLens>> {
    return this._sendRequest('codeLens/resolve', params);
  }

  documentLink(params: DocumentLinkParams): Promise<Array<DocumentLink>> {
    return this._sendRequest('textDocument/documentLink', params);
  }

  documentLinkResolve(params: DocumentLink): Promise<DocumentLink> {
    return this._sendRequest('documentLink/resolve', params);
  }

  documentFormatting(params: DocumentFormattingParams): Promise<Array<TextEdit>> {
    return this._sendRequest('textDocument/formatting', params);
  }

  documentRangeFormatting(params: DocumentRangeFormattingParams): Promise<Array<TextEdit>> {
    return this._sendRequest('textDocument/rangeFormatting', params);
  }

  documentOnTypeFormatting(params: DocumentOnTypeFormattingParams): Promise<Array<TextEdit>> {
    return this._sendRequest('textDocument/onTypeFormatting', params);
  }

  rename(params: RenameParams): Promise<WorkspaceEdit> {
    return this._sendRequest('textDocument/rename', params);
  }

  _onRequest(type: {method: string}, callback: Object => Object): void {
    this._con.onRequest(type, value => {
      this._log.debug(`rpc.onRequest ${type.method}`, value);
      return callback(value);
    });
  }

  _onNotification(type: {method: string}, callback: Object => void): void {
    this._con.onNotification(type, value => {
      this._log.debug(`rpc.onNotification ${type.method}`, value);
      callback(value);
    });
  }

  _sendNotification(method: string, args?: Object): void {
    this._log.debug(`rpc.sendNotification ${method}`, args);
    this._con.sendNotification(method, args);
  }

  async _sendRequest(method: string, args?: Object): Promise<any> {
    this._log.debug(`rpc.sendRequest ${method} sending`, args);
    try {
      const start = performance.now();
      const result = await this._con.sendRequest(method, args);
      const took = performance.now() - start;
      this._log.debug(`rpc.sendRequest ${method} received (${Math.floor(took)}ms)`, result);
      return result;
    } catch (e) {
      this._log.error(`rpc.sendRequest ${method} threw`, e);
      throw e;
    }
  }
}

// Structures

export type Position = {
  // Line position in a document (zero-based).
  line: number,
  // Character offset on a line in a document (zero-based).
  character: number,
};

export type Range = {
  // The range's start position.
  start: Position,
  // The range's end position.
  end: Position,
};

export type Location = {
  // The location's URI.
  uri: string,
  // The position within the URI.
  range: Range,
};

export type Diagnostic = {
  // The range at which the message applies.
  range: Range,
  // The diagnostic's severity. Can be omitted. If omitted it is up to the
  // client to interpret diagnostics as error, warning, info or hint.
  severity?: number,
  // The diagnostic's code. Can be omitted.
  code?: number | string,
  // A human-readable string describing the source of this
  // diagnostic, e.g. 'typescript' or 'super lint'.
  source?: string,
  // The diagnostic's message.
  message: string,
};

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

export type Command = {
  // Title of the command, like `save`.
  title: string,
  // The identifier of the actual command handler.
  command: string,
  // Arguments that the command handler should be invoked with.
  arguments?: any[],
};

export type TextEdit = {
  // The range of the text document to be manipulated. To insert
  // text into a document create a range where start === end.
  range: Range,
  // The string to be inserted. For delete operations use an empty string.
  newText: string,
};

export type WorkspaceEdit = {
  // Holds changes to existing resources.
  changes: { [uri: string]: TextEdit[] },
};

export type TextDocumentIdentifier = {
  // The text document's URI.
  uri: string,
};

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

export type VersionedTextDocumentIdentifier = TextDocumentIdentifier & {
  // The version number of this document.
  version: number,
};

export type TextDocumentPositionParams = {
  // The text document.
  textDocument: TextDocumentIdentifier,
  // The position inside the text document.
  position: Position,
};

// General

export type InitializeParams = {
  //  The process Id of the parent process that started
  //  the server. Is null if the process has not been started by another process.
  //  If the parent process is not alive then the server should exit
  // (see exit notification) its process.
  processId?: ?number,
  //  The rootPath of the workspace. Is null if no folder is open.
  rootPath?: ?string,
  //  User provided initialization options.
  initializationOptions?: any,
  //  The capabilities provided by the client (editor)
  capabilities: ClientCapabilities,
};

export type ClientCapabilities = {
};

export type InitializeResult = {
  //  The capabilities the language server provides.
  capabilities: ServerCapabilities,
};

export type InitializeError = {
  //  Indicates whether the client should retry to send the
  //  initilize request after showing the message provided
  //  in the ResponseError.
  retry: boolean,
};

// Defines how the host (editor) should sync document changes to the language server.
export const TextDocumentSyncKind = {
  //  Documents should not be synced at all.
  None: 0,
  //  Documents are synced by always sending the full content of the document.
  Full: 1,
  //  Documents are synced by sending the full content on open. After that only incremental
  //  updates to the document are sent.
  Incremental: 2,
};

// Completion options.
export type CompletionOptions = {
  // The server provides support to resolve additional information for a completion item.
  resolveProvider?: boolean,
  // The characters that trigger completion automatically.
  triggerCharacters?: string[],
};

// Signature help options.
export type SignatureHelpOptions = {
  // The characters that trigger signature help automatically.
  triggerCharacters?: string[],
};

// Code Lens options.
export type CodeLensOptions = {
  // Code lens has a resolve provider as well.
  resolveProvider?: boolean,
};

// Format document on type options
export type DocumentOnTypeFormattingOptions = {
  // A character on which formatting should be triggered, like `};`.
  firstTriggerCharacter: string,
  // More trigger characters.
  moreTriggerCharacter?: string[],
};

export type ServerCapabilities = {
  // Defines how text documents are synced.
  textDocumentSync?: number,
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
};

// Document

export type PublishDiagnosticsParams = {
  // The URI for which diagnostic information is reported.
  uri: string,
   // An array of diagnostic information items.
  diagnostics: Diagnostic[],
};

// Represents a collection of [completion items](#CompletionItem) to be presented in the editor.
export type CompletionList = {
  // This list it not complete. Further typing should result in recomputing this list.
  isIncomplete: boolean,
  // The completion items.
  items: CompletionItem[],
};

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
  //  An edit which is applied to a document when selecting
  //  this completion. When an edit is provided the value of
  //  insertText is ignored.
  textEdit?: TextEdit,
  //  An optional array of additional text edits that are applied when
  //  selecting this completion. Edits must not overlap with the main edit
  //  nor with themselves.
  additionalTextEdits?: TextEdit[],
  //  An optional command that is executed *after* inserting this completion. *Note* that
  //  additional modifications to the current document should be described with the
  //  additionalTextEdits-property.
  command?: Command,
  //  An data entry field that is preserved on a completion item between
  //  a completion and a completion resolve request.
  data?: any,
};

// The kind of a completion entry.
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

// The result of a hover request.
export type Hover = {
  // The hover's content
  contents: MarkedString | MarkedString[],
  // An optional range is a range inside a text document
  // that is used to visualize a hover, e.g. by changing the background color.
  range?: Range,
};

/**
 * The marked string is rendered:
 * - as markdown if it is represented as a string
 * - as code block of the given langauge if it is represented as a pair of a language and a value
 *
 * The pair of a language and a value is an equivalent to markdown:
 * ```${language};
 * ${value};
 * ```
 */
export type MarkedString = string | { language: string, value: string };

/**
 * Signature help represents the signature of something
 * callable. There can be multiple signature but only one
 * active and only one active parameter.
 */
export type SignatureHelp = {
  // One or more signatures.
  signatures: SignatureInformation[],
  // The active signature.
  activeSignature?: number,
  // The active parameter of the active signature.
  activeParameter?: number,
};

/**
 * Represents the signature of something callable. A signature
 * can have a label, like a function-name, a doc-comment, and
 * a set of parameters.
 */
export type SignatureInformation = {
  // The label of this signature. Will be shown in the UI.
  label: string,
  //  The human-readable doc-comment of this signature. Will be shown in the UI but can be omitted.
  documentation?: string,
  // The parameters of this signature.
  parameters?: ParameterInformation[],
};

/**
 * Represents a parameter of a callable-signature. A parameter can
 * have a label and a doc-comment.
 */
export type ParameterInformation = {
  // The label of this parameter. Will be shown in the UI.
  label: string,
  // The human-readable doc-comment of this parameter. Will be shown in the UI but can be omitted.
  documentation?: string,
};

export type ReferenceParams = TextDocumentPositionParams & {
  context: ReferenceContext,
};

export type ReferenceContext = {
  // Include the declaration of the current symbol.
  includeDeclaration: boolean,
};

/**
 * A document highlight is a range inside a text document which deserves
 * special attention. Usually a document highlight is visualized by changing
 * the background color of its range.
 *
 */
export type DocumentHighlight = {
  // The range this highlight applies to.
  range: Range,
  // The highlight kind, default is DocumentHighlightKind.Text.
  kind?: number,
};

export const DocumentHighlightKind = {
  // A textual occurrance.
  Text: 1,
  // Read-access of a symbol, like reading a variable.
  Read: 2,
  // Write-access of a symbol, like writing to a variable.
  Write: 3,
};

export type DocumentSymbolParams = {
  // The text document.
  textDocument: TextDocumentIdentifier,
};

/**
 * Represents information about programming constructs like variables, classes,
 * interfaces etc.
 */
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

// The parameters of a Workspace Symbol Request.
export type WorkspaceSymbolParams = {
  // A non-empty query string.
  query: string,
};

// Params for the CodeActionRequest
export type CodeActionParams = {
  // The document in which the command was invoked.
  textDocument: TextDocumentIdentifier,
  // The range for which the command was invoked.
  range: Range,
  // Context carrying additional information.
  context: CodeActionContext,
};

// Contains additional diagnostic information about the context in which a code action is run.
export type CodeActionContext = {
  // An array of diagnostics.
  diagnostics: Diagnostic[],
};

export type CodeLensParams = {
  // The document to request code lens for.
  textDocument: TextDocumentIdentifier,
};

/**
 * A code lens represents a command that should be shown along with
 * source text, like the number of references, a way to run tests, etc.
 *
 * A code lens is _unresolved_ when no command is associated to it. For performance
 * reasons the creation of a code lens and resolving should be done in two stages.
 */
export type CodeLens = {
  // The range in which this code lens is valid. Should only span a single line.
  range: Range,
  // The command this code lens represents.
  command?: Command,
  // A data entry field that is preserved on a code lens item between a code lens
  // and a code lens resolve request.
  data?: any,
};

export type DocumentLinkParams = {
  // The document to provide document links for.
  textDocument: TextDocumentIdentifier,
};

/**
 * A document link is a range in a text document that links to an internal or
* external resource, like another
 * text document or a web site.
 */
export type DocumentLink = {
  // The range this link applies to.
  range: Range,
  // The uri this link points to.
  target: string,
};

export type DocumentFormattingParams = {
  // The document to format.
  textDocument: TextDocumentIdentifier,
  // The format options.
  options: FormattingOptions,
};

// Value-object describing what options formatting should use.
export type FormattingOptions = {
  // Size of a tab in spaces.
  tabSize: number,
  // Prefer spaces over tabs.
  insertSpaces: boolean,
  // Signature for further properties.
  [key: string]: boolean | number | string,
};

export type DocumentRangeFormattingParams = {
  // The document to format.
  textDocument: TextDocumentIdentifier,
  // The range to format.
  range: Range,
  // The format options.
  options: FormattingOptions,
};

export type DocumentOnTypeFormattingParams = {
  // The document to format.
  textDocument: TextDocumentIdentifier,
  // The position at which this request was sent.
  position: Position,
  // The character that has been typed.
  ch: string,
  // The format options.
  options: FormattingOptions,
};

export type RenameParams = {
  // The document to format.
  textDocument: TextDocumentIdentifier,
  // The position at which this request was sent.
  position: Position,
  /**
   * The new name of the symbol. If the given name is not valid the
   * request must return a [ResponseError](#ResponseError) with an
   * appropriate message set.
   */
  newName: string,
};

// Window

export type ShowMessageParams = {
  // The message type. See {@link MessageType};.
  type: number,
  // The actual message.
  message: string,
};

export const MessageType = {
  // An error message.
  Error: 1,
  // A warning message.
  Warning: 2,
  // An information message.
  Info: 3,
  // A log message.
  Log: 4,
};

export type ShowMessageRequestParams = {
  // The message type. See {@link MessageType};
  type: number,
  // The actual message
  message: string,
  // The message action items to present.
  actions?: MessageActionItem[],
};

export type MessageActionItem = {
  // A short title like 'Retry', 'Open Log' etc.
  title: string,
};

export type LogMessageParams = {
  // The message type. See {@link MessageType};
  type: number,
  // The actual message
  message: string,
};

// Workspace

export type DidChangeConfigurationParams = {
  // The actual changed settings
  settings: any,
};

export type DidOpenTextDocumentParams = {
  // The document that was opened.
  textDocument: TextDocumentItem,
};

export type DidChangeTextDocumentParams = {
  // The document that did change. The version number points
  // to the version after all provided content changes have
  // been applied.
  textDocument: VersionedTextDocumentIdentifier,
  // The actual content changes.
  contentChanges: TextDocumentContentChangeEvent[],
};

// An event describing a change to a text document. If range and rangeLength are omitted
// the new text is considered to be the full content of the document.
export type TextDocumentContentChangeEvent = {
  // The range of the document that changed.
  range?: Range,
  // The length of the range that got replaced.
  rangeLength?: number,
  // The new text of the document.
  text: string,
};

export type DidCloseTextDocumentParams = {
  // The document that was closed.
  textDocument: TextDocumentIdentifier,
};

export type DidSaveTextDocumentParams = {
  // The document that was saved.
  textDocument: TextDocumentIdentifier,
};

export type DidChangeWatchedFilesParams = {
  // The actual file events.
  changes: FileEvent[],
};

// The file event type.
export const FileChangeType = {
  // The file got created.
  Created: 1,
  // The file got changed.
  Changed: 2,
  // The file got deleted.
  Deleted: 3,
};

// An event describing a file change.
export type FileEvent = {
  // The file's URI.
  uri: string,
  // The change type.
  type: number,
};
