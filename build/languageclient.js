Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileChangeType = exports.MessageType = exports.SymbolKind = exports.DocumentHighlightKind = exports.CompletionItemKind = exports.TextDocumentSyncKind = exports.DiagnosticSeverity = exports.LanguageClientConnection = undefined;

var _vscodeJsonrpc = require('vscode-jsonrpc');

var rpc = _interopRequireWildcard(_vscodeJsonrpc);

var _consoleLogger = require('./loggers/console-logger');

var _consoleLogger2 = _interopRequireDefault(_consoleLogger);

var _nullLogger = require('./loggers/null-logger');

var _nullLogger2 = _interopRequireDefault(_nullLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// Flow-typed wrapper around JSONRPC to implement Microsoft Language Server Protocol v2
// https://github.com/Microsoft/language-server-protocol/blob/master/versions/protocol-2-x.md
let LanguageClientConnection = exports.LanguageClientConnection = class LanguageClientConnection {

  constructor(connection, logger) {
    this._con = connection;
    this._log = logger;

    connection.onError(error => logger.error(['rpc.onError', error]));
    connection.onUnhandledNotification(notification => {
      if (notification.method != null && notification.params != null) {
        logger.warn(`rpc.onUnhandledNotification ${notification.method}`, notification.params);
      } else {
        logger.warn('rpc.onUnhandledNotification', notification);
      };
    });
    connection.onNotification(() => logger.debug('rpc.onNotification', arguments));

    connection.listen();
  }

  dispose() {
    this._con.dispose();
  }

  initialize(params) {
    var _this = this;

    return _asyncToGenerator(function* () {
      return _this._sendRequest('initialize', params);
    })();
  }

  shutdown() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      return _this2._sendRequest('shutdown');
    })();
  }

  onCustom(method, callback) {
    this._onNotification({ method: method }, callback);
  }

  onExit(callback) {
    this._onNotification({ method: 'exit' }, callback);
  }

  onShowMessage(callback) {
    this._onNotification({ method: 'window/showMessage' }, callback);
  }

  onShowMessageRequest(callback) {
    this._onRequest({ method: 'window/ShowMessageRequest' }, callback);
  }

  onLogMessage(callback) {
    this._onNotification({ method: 'window/logMessage' }, callback);
  }

  onTelemetryEvent(callback) {
    this._onNotification({ method: 'telemetry/event' }, callback);
  }

  didChangeConfiguration(params) {
    this._sendNotification('workspace/didChangeConfiguration', params);
  }

  didOpenTextDocument(params) {
    this._sendNotification('textDocument/didOpen', params);
  }

  didChangeTextDocument(params) {
    this._sendNotification('textDocument/didChange', params);
  }

  didCloseTextDocument(params) {
    this._sendNotification('textDocument/didClose', params);
  }

  didSaveTextDocument(params) {
    this._sendNotification('textDocument/didSave', params);
  }

  didChangeWatchedFiles(params) {
    this._sendNotification('workspace/didChangeWatchedFiles', params);
  }

  onPublishDiagnostics(callback) {
    this._onNotification({ method: 'textDocument/publishDiagnostics' }, callback);
  }

  completion(params) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      return _this3._sendRequest('textDocument/completion', params);
    })();
  }

  completionItemResolve(params) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      return _this4._sendRequest('completionItem/resolve', params);
    })();
  }

  hover(params) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      return _this5._sendRequest('textDocument/hover', params);
    })();
  }

  signatureHelp(params) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      return _this6._sendRequest('textDocument/signatureHelp', params);
    })();
  }

  gotoDefinition(params) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      return _this7._sendRequest('textDocument/definition', params);
    })();
  }

  findReferences(params) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      return _this8._sendRequest('textDocument/references', params);
    })();
  }

  documentHighlight(params) {
    var _this9 = this;

    return _asyncToGenerator(function* () {
      return _this9._sendRequest('textDocument/documentHighlight', params);
    })();
  }

  documentSymbol(params) {
    var _this10 = this;

    return _asyncToGenerator(function* () {
      return _this10._sendRequest('textDocument/documentSymbol', params);
    })();
  }

  workspaceSymbol(params) {
    var _this11 = this;

    return _asyncToGenerator(function* () {
      return _this11._sendRequest('workspace/symbol', params);
    })();
  }

  codeAction(params) {
    var _this12 = this;

    return _asyncToGenerator(function* () {
      return _this12._sendRequest('textDocument/codeAction', params);
    })();
  }

  codeLens(params) {
    var _this13 = this;

    return _asyncToGenerator(function* () {
      return _this13._sendRequest('textDocument/codeLens', params);
    })();
  }

  codeLensResolve(params) {
    var _this14 = this;

    return _asyncToGenerator(function* () {
      return _this14._sendRequest('codeLens/resolve', params);
    })();
  }

  documentLink(params) {
    var _this15 = this;

    return _asyncToGenerator(function* () {
      return _this15._sendRequest('textDocument/documentLink', params);
    })();
  }

  documentLinkResolve(params) {
    var _this16 = this;

    return _asyncToGenerator(function* () {
      return _this16._sendRequest('documentLink/resolve', params);
    })();
  }

  documentFormatting(params) {
    var _this17 = this;

    return _asyncToGenerator(function* () {
      return _this17._sendRequest('textDocument/formatting', params);
    })();
  }

  documentRangeFormatting(params) {
    var _this18 = this;

    return _asyncToGenerator(function* () {
      return _this18._sendRequest('textDocument/rangeFormatting', params);
    })();
  }

  documentOnTypeFormatting(params) {
    var _this19 = this;

    return _asyncToGenerator(function* () {
      return _this19._sendRequest('textDocument/onTypeFormatting', params);
    })();
  }

  rename(params) {
    var _this20 = this;

    return _asyncToGenerator(function* () {
      return _this20._sendRequest('textDocument/rename', params);
    })();
  }

  _onRequest(type, callback) {
    this._con.onRequest(type, value => {
      this._log.debug(`rpc.onRequest ${type.method}`, value);
      return callback(value);
    });
  }

  _onNotification(type, callback) {
    this._con.onNotification(type, value => {
      this._log.debug(`rpc.onNotification ${type.method}`, value);
      callback(value);
    });
  }

  _sendNotification(method, args) {
    this._log.debug(`rpc.sendNotification ${method}`, args);
    this._con.sendNotification(method, args);
  }

  _sendRequest(method, args) {
    var _this21 = this;

    return _asyncToGenerator(function* () {
      _this21._log.debug(`rpc.sendRequest ${method} sending`, args);
      try {
        const start = performance.now();
        const result = yield _this21._con.sendRequest(method, args);
        const took = performance.now() - start;
        _this21._log.debug(`rpc.sendRequest ${method} received (${Math.floor(took)}ms)`, result);
        return result;
      } catch (e) {
        _this21._log.error(`rpc.sendRequest ${method} threw`, e);
        throw e;
      }
    })();
  }
};

// Structures

const DiagnosticSeverity = exports.DiagnosticSeverity = {
  // Reports an error.
  Error: 1,
  // Reports a warning.
  Warning: 2,
  // Reports an information.
  Information: 3,
  // Reports a hint.
  Hint: 4
};

// General

// Defines how the host (editor) should sync document changes to the language server.
const TextDocumentSyncKind = exports.TextDocumentSyncKind = {
  //  Documents should not be synced at all.
  None: 0,
  //  Documents are synced by always sending the full content of the document.
  Full: 1,
  //  Documents are synced by sending the full content on open. After that only incremental
  //  updates to the document are sent.
  Incremental: 2
};

// Completion options.


// Signature help options.


// Code Lens options.


// Format document on type options


// Document

// Represents a collection of [completion items](#CompletionItem) to be presented in the editor.


// The kind of a completion entry.
const CompletionItemKind = exports.CompletionItemKind = {
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
  Reference: 18
};

// The result of a hover request.


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


/**
 * Signature help represents the signature of something
 * callable. There can be multiple signature but only one
 * active and only one active parameter.
 */


/**
 * Represents the signature of something callable. A signature
 * can have a label, like a function-name, a doc-comment, and
 * a set of parameters.
 */


/**
 * Represents a parameter of a callable-signature. A parameter can
 * have a label and a doc-comment.
 */


/**
 * A document highlight is a range inside a text document which deserves
 * special attention. Usually a document highlight is visualized by changing
 * the background color of its range.
 *
 */
const DocumentHighlightKind = exports.DocumentHighlightKind = {
  // A textual occurrance.
  Text: 1,
  // Read-access of a symbol, like reading a variable.
  Read: 2,
  // Write-access of a symbol, like writing to a variable.
  Write: 3
};

/**
 * Represents information about programming constructs like variables, classes,
 * interfaces etc.
 */
const SymbolKind = exports.SymbolKind = {
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
  Array: 18
};

// The parameters of a Workspace Symbol Request.


// Params for the CodeActionRequest


// Contains additional diagnostic information about the context in which a code action is run.


/**
 * A code lens represents a command that should be shown along with
 * source text, like the number of references, a way to run tests, etc.
 *
 * A code lens is _unresolved_ when no command is associated to it. For performance
 * reasons the creation of a code lens and resolving should be done in two stages.
 */


/**
 * A document link is a range in a text document that links to an internal or
* external resource, like another
 * text document or a web site.
 */


// Value-object describing what options formatting should use.


// Window

const MessageType = exports.MessageType = {
  // An error message.
  Error: 1,
  // A warning message.
  Warning: 2,
  // An information message.
  Info: 3,
  // A log message.
  Log: 4
};

// Workspace

// An event describing a change to a text document. If range and rangeLength are omitted
// the new text is considered to be the full content of the document.


// The file event type.
const FileChangeType = exports.FileChangeType = {
  // The file got created.
  Created: 1,
  // The file got changed.
  Changed: 2,
  // The file got deleted.
  Deleted: 3
};

// An event describing a file change.
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9sYW5ndWFnZWNsaWVudC5qcyJdLCJuYW1lcyI6WyJycGMiLCJMYW5ndWFnZUNsaWVudENvbm5lY3Rpb24iLCJjb25zdHJ1Y3RvciIsImNvbm5lY3Rpb24iLCJsb2dnZXIiLCJfY29uIiwiX2xvZyIsIm9uRXJyb3IiLCJlcnJvciIsIm9uVW5oYW5kbGVkTm90aWZpY2F0aW9uIiwibm90aWZpY2F0aW9uIiwibWV0aG9kIiwicGFyYW1zIiwid2FybiIsIm9uTm90aWZpY2F0aW9uIiwiZGVidWciLCJhcmd1bWVudHMiLCJsaXN0ZW4iLCJkaXNwb3NlIiwiaW5pdGlhbGl6ZSIsIl9zZW5kUmVxdWVzdCIsInNodXRkb3duIiwib25DdXN0b20iLCJjYWxsYmFjayIsIl9vbk5vdGlmaWNhdGlvbiIsIm9uRXhpdCIsIm9uU2hvd01lc3NhZ2UiLCJvblNob3dNZXNzYWdlUmVxdWVzdCIsIl9vblJlcXVlc3QiLCJvbkxvZ01lc3NhZ2UiLCJvblRlbGVtZXRyeUV2ZW50IiwiZGlkQ2hhbmdlQ29uZmlndXJhdGlvbiIsIl9zZW5kTm90aWZpY2F0aW9uIiwiZGlkT3BlblRleHREb2N1bWVudCIsImRpZENoYW5nZVRleHREb2N1bWVudCIsImRpZENsb3NlVGV4dERvY3VtZW50IiwiZGlkU2F2ZVRleHREb2N1bWVudCIsImRpZENoYW5nZVdhdGNoZWRGaWxlcyIsIm9uUHVibGlzaERpYWdub3N0aWNzIiwiY29tcGxldGlvbiIsImNvbXBsZXRpb25JdGVtUmVzb2x2ZSIsImhvdmVyIiwic2lnbmF0dXJlSGVscCIsImdvdG9EZWZpbml0aW9uIiwiZmluZFJlZmVyZW5jZXMiLCJkb2N1bWVudEhpZ2hsaWdodCIsImRvY3VtZW50U3ltYm9sIiwid29ya3NwYWNlU3ltYm9sIiwiY29kZUFjdGlvbiIsImNvZGVMZW5zIiwiY29kZUxlbnNSZXNvbHZlIiwiZG9jdW1lbnRMaW5rIiwiZG9jdW1lbnRMaW5rUmVzb2x2ZSIsImRvY3VtZW50Rm9ybWF0dGluZyIsImRvY3VtZW50UmFuZ2VGb3JtYXR0aW5nIiwiZG9jdW1lbnRPblR5cGVGb3JtYXR0aW5nIiwicmVuYW1lIiwidHlwZSIsIm9uUmVxdWVzdCIsInZhbHVlIiwiYXJncyIsInNlbmROb3RpZmljYXRpb24iLCJzdGFydCIsInBlcmZvcm1hbmNlIiwibm93IiwicmVzdWx0Iiwic2VuZFJlcXVlc3QiLCJ0b29rIiwiTWF0aCIsImZsb29yIiwiZSIsIkRpYWdub3N0aWNTZXZlcml0eSIsIkVycm9yIiwiV2FybmluZyIsIkluZm9ybWF0aW9uIiwiSGludCIsIlRleHREb2N1bWVudFN5bmNLaW5kIiwiTm9uZSIsIkZ1bGwiLCJJbmNyZW1lbnRhbCIsIkNvbXBsZXRpb25JdGVtS2luZCIsIlRleHQiLCJNZXRob2QiLCJGdW5jdGlvbiIsIkNvbnN0cnVjdG9yIiwiRmllbGQiLCJWYXJpYWJsZSIsIkNsYXNzIiwiSW50ZXJmYWNlIiwiTW9kdWxlIiwiUHJvcGVydHkiLCJVbml0IiwiVmFsdWUiLCJFbnVtIiwiS2V5d29yZCIsIlNuaXBwZXQiLCJDb2xvciIsIkZpbGUiLCJSZWZlcmVuY2UiLCJEb2N1bWVudEhpZ2hsaWdodEtpbmQiLCJSZWFkIiwiV3JpdGUiLCJTeW1ib2xLaW5kIiwiTmFtZXNwYWNlIiwiUGFja2FnZSIsIkNvbnN0YW50IiwiU3RyaW5nIiwiTnVtYmVyIiwiQm9vbGVhbiIsIkFycmF5IiwiTWVzc2FnZVR5cGUiLCJJbmZvIiwiTG9nIiwiRmlsZUNoYW5nZVR5cGUiLCJDcmVhdGVkIiwiQ2hhbmdlZCIsIkRlbGV0ZWQiXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUE7O0lBQVlBLEc7O0FBQ1o7Ozs7QUFDQTs7Ozs7Ozs7OztBQUVBO0FBQ0E7SUFDYUMsd0IsV0FBQUEsd0IsR0FBTixNQUFNQSx3QkFBTixDQUErQjs7QUFJcENDLGNBQVlDLFVBQVosRUFBd0NDLE1BQXhDLEVBQTRFO0FBQzFFLFNBQUtDLElBQUwsR0FBWUYsVUFBWjtBQUNBLFNBQUtHLElBQUwsR0FBWUYsTUFBWjs7QUFFQUQsZUFBV0ksT0FBWCxDQUFv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QUNBQyxXQUFTO0FBTm1CLENBQXZCOztBQVNQIiwiZmlsZSI6Imxhbmd1YWdlY2xpZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQGZsb3dcblxuaW1wb3J0ICogYXMgcnBjIGZyb20gJ3ZzY29kZS1qc29ucnBjJztcbmltcG9ydCBDb25zb2xlTG9nZ2VyIGZyb20gJy4vbG9nZ2Vycy9jb25zb2xlLWxvZ2dlcic7XG5pbXBvcnQgTnVsbExvZ2dlciBmcm9tICcuL2xvZ2dlcnMvbnVsbC1sb2dnZXInO1xuXG4vLyBGbG93LXR5cGVkIHdyYXBwZXIgYXJvdW5kIEpTT05SUEMgdG8gaW1wbGVtZW50IE1pY3Jvc29mdCBMYW5ndWFnZSBTZXJ2ZXIgUHJvdG9jb2wgdjJcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvbGFuZ3VhZ2Utc2VydmVyLXByb3RvY29sL2Jsb2IvbWFzdGVyL3ZlcnNpb25zL3Byb3RvY29sLTIteC5tZFxuZXhwb3J0IGNsYXNzIExhbmd1YWdlQ2xpZW50Q29ubmVjdGlvbiB7XG4gIF9jb246IHJwYy5jb25uZWN0aW9uO1xuICBfbG9nOiBDb25zb2xlTG9nZ2VyIHwgTnVsbExvZ2dlcjtcblxuICBjb25zdHJ1Y3Rvcihjb25uZWN0aW9uOiBycGMuY29ubmVjdGlvbiwgbG9nZ2VyOiBDb25zb2xlTG9nZ2VyIHwgTnVsbExvZ2dlcikge1xuICAgIHRoaXMuX2NvbiA9IGNvbm5lY3Rpb247XG4gICAgdGhpcy5fbG9nID0gbG9nZ2VyO1xuXG4gICAgY29ubmVjdGlvbi5vbkVycm9yKChlcnJvcikgPT4gbG9nZ2VyLmVycm9yKFsncnBjLm9uRXJyb3InLCBlcnJvcl0pKTtcbiAgICBjb25uZWN0aW9uLm9uVW5oYW5kbGVkTm90aWZpY2F0aW9uKChub3RpZmljYXRpb24pID0+IHtcbiAgICAgIGlmIChub3RpZmljYXRpb24ubWV0aG9kICE9IG51bGwgJiYgbm90aWZpY2F0aW9uLnBhcmFtcyAhPSBudWxsKSB7XG4gICAgICAgIGxvZ2dlci53YXJuKGBycGMub25VbmhhbmRsZWROb3RpZmljYXRpb24gJHtub3RpZmljYXRpb24ubWV0aG9kfWAsIG5vdGlmaWNhdGlvbi5wYXJhbXMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9nZ2VyLndhcm4oJ3JwYy5vblVuaGFuZGxlZE5vdGlmaWNhdGlvbicsIG5vdGlmaWNhdGlvbik7XG4gICAgICB9O1xuICAgIH0pO1xuICAgIGNvbm5lY3Rpb24ub25Ob3RpZmljYXRpb24oKCkgPT4gbG9nZ2VyLmRlYnVnKCdycGMub25Ob3RpZmljYXRpb24nLCBhcmd1bWVudHMpKTtcblxuICAgIGNvbm5lY3Rpb24ubGlzdGVuKCk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX2Nvbi5kaXNwb3NlKCk7XG4gIH1cblxuICBhc3luYyBpbml0aWFsaXplKHBhcmFtczogSW5pdGlhbGl6ZVBhcmFtcyk6IFByb21pc2U8SW5pdGlhbGl6ZVJlc3VsdD4ge1xuICAgIHJldHVybiB0aGlzLl9zZW5kUmVxdWVzdCgnaW5pdGlhbGl6ZScsIHBhcmFtcyk7XG4gIH1cblxuICBhc3luYyBzaHV0ZG93bigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VuZFJlcXVlc3QoJ3NodXRkb3duJyk7XG4gIH1cblxuICBvbkN1c3RvbShtZXRob2Q6IHN0cmluZywgY2FsbGJhY2s6IE9iamVjdCA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fb25Ob3RpZmljYXRpb24oe21ldGhvZDogbWV0aG9kfSwgY2FsbGJhY2spO1xuICB9XG5cbiAgb25FeGl0KGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fb25Ob3RpZmljYXRpb24oe21ldGhvZDonZXhpdCd9LCBjYWxsYmFjayk7XG4gIH1cblxuICBvblNob3dNZXNzYWdlKGNhbGxiYWNrOiBTaG93TWVzc2FnZVBhcmFtcyA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fb25Ob3RpZmljYXRpb24oe21ldGhvZDond2luZG93L3Nob3dNZXNzYWdlJ30sIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uU2hvd01lc3NhZ2VSZXF1ZXN0KGNhbGxiYWNrOiBTaG93TWVzc2FnZVJlcXVlc3RQYXJhbXMgPT4gTWVzc2FnZUFjdGlvbkl0ZW0pOiB2b2lkIHtcbiAgICB0aGlzLl9vblJlcXVlc3Qoe21ldGhvZDond2luZG93L1Nob3dNZXNzYWdlUmVxdWVzdCd9LCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkxvZ01lc3NhZ2UoY2FsbGJhY2s6IExvZ01lc3NhZ2VQYXJhbXMgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX29uTm90aWZpY2F0aW9uKHttZXRob2Q6J3dpbmRvdy9sb2dNZXNzYWdlJ30sIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uVGVsZW1ldHJ5RXZlbnQoY2FsbGJhY2s6IGFueSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fb25Ob3RpZmljYXRpb24oe21ldGhvZDondGVsZW1ldHJ5L2V2ZW50J30sIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGRpZENoYW5nZUNvbmZpZ3VyYXRpb24ocGFyYW1zOiBEaWRDaGFuZ2VDb25maWd1cmF0aW9uUGFyYW1zKTogdm9pZCB7XG4gICAgdGhpcy5fc2VuZE5vdGlmaWNhdGlvbignd29ya3NwYWNlL2RpZENoYW5nZUNvbmZpZ3VyYXRpb24nLCBwYXJhbXMpO1xuICB9XG5cbiAgZGlkT3BlblRleHREb2N1bWVudChwYXJhbXM6IERpZE9wZW5UZXh0RG9jdW1lbnRQYXJhbXMpOiB2b2lkIHtcbiAgICB0aGlzLl9zZW5kTm90aWZpY2F0aW9uKCd0ZXh0RG9jdW1lbnQvZGlkT3BlbicsIHBhcmFtcyk7XG4gIH1cblxuICBkaWRDaGFuZ2VUZXh0RG9jdW1lbnQocGFyYW1zOiBEaWRDaGFuZ2VUZXh0RG9jdW1lbnRQYXJhbXMpOiB2b2lkIHtcbiAgICB0aGlzLl9zZW5kTm90aWZpY2F0aW9uKCd0ZXh0RG9jdW1lbnQvZGlkQ2hhbmdlJywgcGFyYW1zKTtcbiAgfVxuXG4gIGRpZENsb3NlVGV4dERvY3VtZW50KHBhcmFtczogRGlkQ2xvc2VUZXh0RG9jdW1lbnRQYXJhbXMpOiB2b2lkIHtcbiAgICB0aGlzLl9zZW5kTm90aWZpY2F0aW9uKCd0ZXh0RG9jdW1lbnQvZGlkQ2xvc2UnLCBwYXJhbXMpO1xuICB9XG5cbiAgZGlkU2F2ZVRleHREb2N1bWVudChwYXJhbXM6IERpZFNhdmVUZXh0RG9jdW1lbnRQYXJhbXMpOiB2b2lkIHtcbiAgICB0aGlzLl9zZW5kTm90aWZpY2F0aW9uKCd0ZXh0RG9jdW1lbnQvZGlkU2F2ZScsIHBhcmFtcyk7XG4gIH1cblxuICBkaWRDaGFuZ2VXYXRjaGVkRmlsZXMocGFyYW1zOiBEaWRDaGFuZ2VXYXRjaGVkRmlsZXNQYXJhbXMpOiB2b2lkIHtcbiAgICB0aGlzLl9zZW5kTm90aWZpY2F0aW9uKCd3b3Jrc3BhY2UvZGlkQ2hhbmdlV2F0Y2hlZEZpbGVzJywgcGFyYW1zKTtcbiAgfVxuXG4gIG9uUHVibGlzaERpYWdub3N0aWNzKGNhbGxiYWNrOiBQdWJsaXNoRGlhZ25vc3RpY3NQYXJhbXMgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX29uTm90aWZpY2F0aW9uKHttZXRob2Q6J3RleHREb2N1bWVudC9wdWJsaXNoRGlhZ25vc3RpY3MnfSwgY2FsbGJhY2spO1xuICB9XG5cbiAgYXN5bmMgY29tcGxldGlvbihwYXJhbXM6IFRleHREb2N1bWVudFBvc2l0aW9uUGFyYW1zKTogUHJvbWlzZTxBcnJheTxDb21wbGV0aW9uSXRlbT4gfCBDb21wbGV0aW9uTGlzdD4ge1xuICAgIHJldHVybiB0aGlzLl9zZW5kUmVxdWVzdCgndGV4dERvY3VtZW50L2NvbXBsZXRpb24nLCBwYXJhbXMpO1xuICB9XG5cbiAgYXN5bmMgY29tcGxldGlvbkl0ZW1SZXNvbHZlKHBhcmFtczogQ29tcGxldGlvbkl0ZW0pOiBQcm9taXNlPENvbXBsZXRpb25JdGVtPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbmRSZXF1ZXN0KCdjb21wbGV0aW9uSXRlbS9yZXNvbHZlJywgcGFyYW1zKTtcbiAgfVxuXG4gIGFzeW5jIGhvdmVyKHBhcmFtczogVGV4dERvY3VtZW50UG9zaXRpb25QYXJhbXMpOiBQcm9taXNlPEhvdmVyPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbmRSZXF1ZXN0KCd0ZXh0RG9jdW1lbnQvaG92ZXInLCBwYXJhbXMpO1xuICB9XG5cbiAgYXN5bmMgc2lnbmF0dXJlSGVscChwYXJhbXM6IFRleHREb2N1bWVudFBvc2l0aW9uUGFyYW1zKTogUHJvbWlzZTxTaWduYXR1cmVIZWxwPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbmRSZXF1ZXN0KCd0ZXh0RG9jdW1lbnQvc2lnbmF0dXJlSGVscCcsIHBhcmFtcyk7XG4gIH1cblxuICBhc3luYyBnb3RvRGVmaW5pdGlvbihwYXJhbXM6IFRleHREb2N1bWVudFBvc2l0aW9uUGFyYW1zKTogUHJvbWlzZTxMb2NhdGlvbiB8IEFycmF5PExvY2F0aW9uPj4ge1xuICAgIHJldHVybiB0aGlzLl9zZW5kUmVxdWVzdCgndGV4dERvY3VtZW50L2RlZmluaXRpb24nLCBwYXJhbXMpO1xuICB9XG5cbiAgYXN5bmMgZmluZFJlZmVyZW5jZXMocGFyYW1zOiBUZXh0RG9jdW1lbnRQb3NpdGlvblBhcmFtcyk6IFByb21pc2U8QXJyYXk8TG9jYXRpb24+PiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbmRSZXF1ZXN0KCd0ZXh0RG9jdW1lbnQvcmVmZXJlbmNlcycsIHBhcmFtcyk7XG4gIH1cblxuICBhc3luYyBkb2N1bWVudEhpZ2hsaWdodChwYXJhbXM6IFRleHREb2N1bWVudFBvc2l0aW9uUGFyYW1zKTogUHJvbWlzZTxBcnJheTxEb2N1bWVudEhpZ2hsaWdodD4+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VuZFJlcXVlc3QoJ3RleHREb2N1bWVudC9kb2N1bWVudEhpZ2hsaWdodCcsIHBhcmFtcyk7XG4gIH1cblxuICBhc3luYyBkb2N1bWVudFN5bWJvbChwYXJhbXM6IERvY3VtZW50U3ltYm9sUGFyYW1zKTogUHJvbWlzZTxBcnJheTxTeW1ib2xJbmZvcm1hdGlvbj4+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VuZFJlcXVlc3QoJ3RleHREb2N1bWVudC9kb2N1bWVudFN5bWJvbCcsIHBhcmFtcyk7XG4gIH1cblxuICBhc3luYyB3b3Jrc3BhY2VTeW1ib2wocGFyYW1zOiBXb3Jrc3BhY2VTeW1ib2xQYXJhbXMpOiBQcm9taXNlPEFycmF5PFN5bWJvbEluZm9ybWF0aW9uPj4ge1xuICAgIHJldHVybiB0aGlzLl9zZW5kUmVxdWVzdCgnd29ya3NwYWNlL3N5bWJvbCcsIHBhcmFtcyk7XG4gIH1cblxuICBhc3luYyBjb2RlQWN0aW9uKHBhcmFtczogQ29kZUFjdGlvblBhcmFtcyk6IFByb21pc2U8QXJyYXk8Q29tbWFuZD4+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VuZFJlcXVlc3QoJ3RleHREb2N1bWVudC9jb2RlQWN0aW9uJywgcGFyYW1zKTtcbiAgfVxuXG4gIGFzeW5jIGNvZGVMZW5zKHBhcmFtczogQ29kZUxlbnNQYXJhbXMpOiBQcm9taXNlPEFycmF5PENvZGVMZW5zPj4ge1xuICAgIHJldHVybiB0aGlzLl9zZW5kUmVxdWVzdCgndGV4dERvY3VtZW50L2NvZGVMZW5zJywgcGFyYW1zKTtcbiAgfVxuXG4gIGFzeW5jIGNvZGVMZW5zUmVzb2x2ZShwYXJhbXM6IENvZGVMZW5zKTogUHJvbWlzZTxBcnJheTxDb2RlTGVucz4+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VuZFJlcXVlc3QoJ2NvZGVMZW5zL3Jlc29sdmUnLCBwYXJhbXMpO1xuICB9XG5cbiAgYXN5bmMgZG9jdW1lbnRMaW5rKHBhcmFtczogRG9jdW1lbnRMaW5rUGFyYW1zKTogUHJvbWlzZTxBcnJheTxEb2N1bWVudExpbms+PiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbmRSZXF1ZXN0KCd0ZXh0RG9jdW1lbnQvZG9jdW1lbnRMaW5rJywgcGFyYW1zKTtcbiAgfVxuXG4gIGFzeW5jIGRvY3VtZW50TGlua1Jlc29sdmUocGFyYW1zOiBEb2N1bWVudExpbmspOiBQcm9taXNlPERvY3VtZW50TGluaz4ge1xuICAgIHJldHVybiB0aGlzLl9zZW5kUmVxdWVzdCgnZG9jdW1lbnRMaW5rL3Jlc29sdmUnLCBwYXJhbXMpO1xuICB9XG5cbiAgYXN5bmMgZG9jdW1lbnRGb3JtYXR0aW5nKHBhcmFtczogRG9jdW1lbnRGb3JtYXR0aW5nUGFyYW1zKTogUHJvbWlzZTxBcnJheTxUZXh0RWRpdD4+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VuZFJlcXVlc3QoJ3RleHREb2N1bWVudC9mb3JtYXR0aW5nJywgcGFyYW1zKTtcbiAgfVxuXG4gIGFzeW5jIGRvY3VtZW50UmFuZ2VGb3JtYXR0aW5nKHBhcmFtczogRG9jdW1lbnRSYW5nZUZvcm1hdHRpbmdQYXJhbXMpOiBQcm9taXNlPEFycmF5PFRleHRFZGl0Pj4ge1xuICAgIHJldHVybiB0aGlzLl9zZW5kUmVxdWVzdCgndGV4dERvY3VtZW50L3JhbmdlRm9ybWF0dGluZycsIHBhcmFtcyk7XG4gIH1cblxuICBhc3luYyBkb2N1bWVudE9uVHlwZUZvcm1hdHRpbmcocGFyYW1zOiBEb2N1bWVudE9uVHlwZUZvcm1hdHRpbmdQYXJhbXMpOiBQcm9taXNlPEFycmF5PFRleHRFZGl0Pj4ge1xuICAgIHJldHVybiB0aGlzLl9zZW5kUmVxdWVzdCgndGV4dERvY3VtZW50L29uVHlwZUZvcm1hdHRpbmcnLCBwYXJhbXMpO1xuICB9XG5cbiAgYXN5bmMgcmVuYW1lKHBhcmFtczogUmVuYW1lUGFyYW1zKTogUHJvbWlzZTxXb3Jrc3BhY2VFZGl0PiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbmRSZXF1ZXN0KCd0ZXh0RG9jdW1lbnQvcmVuYW1lJywgcGFyYW1zKTtcbiAgfVxuXG4gIF9vblJlcXVlc3QodHlwZToge21ldGhvZDogc3RyaW5nfSwgY2FsbGJhY2s6IE9iamVjdCA9PiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLl9jb24ub25SZXF1ZXN0KHR5cGUsIHZhbHVlID0+IHtcbiAgICAgIHRoaXMuX2xvZy5kZWJ1ZyhgcnBjLm9uUmVxdWVzdCAke3R5cGUubWV0aG9kfWAsIHZhbHVlKTtcbiAgICAgIHJldHVybiBjYWxsYmFjayh2YWx1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBfb25Ob3RpZmljYXRpb24odHlwZToge21ldGhvZDogc3RyaW5nfSwgY2FsbGJhY2s6IE9iamVjdCA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fY29uLm9uTm90aWZpY2F0aW9uKHR5cGUsIHZhbHVlID0+IHtcbiAgICAgIHRoaXMuX2xvZy5kZWJ1ZyhgcnBjLm9uTm90aWZpY2F0aW9uICR7dHlwZS5tZXRob2R9YCwgdmFsdWUpO1xuICAgICAgY2FsbGJhY2sodmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgX3NlbmROb3RpZmljYXRpb24obWV0aG9kOiBzdHJpbmcsIGFyZ3M/OiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLl9sb2cuZGVidWcoYHJwYy5zZW5kTm90aWZpY2F0aW9uICR7bWV0aG9kfWAsIGFyZ3MpO1xuICAgIHRoaXMuX2Nvbi5zZW5kTm90aWZpY2F0aW9uKG1ldGhvZCwgYXJncyk7XG4gIH1cblxuICBhc3luYyBfc2VuZFJlcXVlc3QobWV0aG9kOiBzdHJpbmcsIGFyZ3M/OiBPYmplY3QpOiBQcm9taXNlPGFueT4ge1xuICAgIHRoaXMuX2xvZy5kZWJ1ZyhgcnBjLnNlbmRSZXF1ZXN0ICR7bWV0aG9kfSBzZW5kaW5nYCwgYXJncyk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9jb24uc2VuZFJlcXVlc3QobWV0aG9kLCBhcmdzKTtcbiAgICAgIGNvbnN0IHRvb2sgPSBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0O1xuICAgICAgdGhpcy5fbG9nLmRlYnVnKGBycGMuc2VuZFJlcXVlc3QgJHttZXRob2R9IHJlY2VpdmVkICgke01hdGguZmxvb3IodG9vayl9bXMpYCwgcmVzdWx0KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fbG9nLmVycm9yKGBycGMuc2VuZFJlcXVlc3QgJHttZXRob2R9IHRocmV3YCwgZSk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxufVxuXG4vLyBTdHJ1Y3R1cmVzXG5cbmV4cG9ydCB0eXBlIFBvc2l0aW9uID0ge1xuICAvLyBMaW5lIHBvc2l0aW9uIGluIGEgZG9jdW1lbnQgKHplcm8tYmFzZWQpLlxuICBsaW5lOiBudW1iZXIsXG4gIC8vIENoYXJhY3RlciBvZmZzZXQgb24gYSBsaW5lIGluIGEgZG9jdW1lbnQgKHplcm8tYmFzZWQpLlxuICBjaGFyYWN0ZXI6IG51bWJlcixcbn07XG5cbmV4cG9ydCB0eXBlIFJhbmdlID0ge1xuICAvLyBUaGUgcmFuZ2UncyBzdGFydCBwb3NpdGlvbi5cbiAgc3RhcnQ6IFBvc2l0aW9uLFxuICAvLyBUaGUgcmFuZ2UncyBlbmQgcG9zaXRpb24uXG4gIGVuZDogUG9zaXRpb24sXG59O1xuXG5leHBvcnQgdHlwZSBMb2NhdGlvbiA9IHtcbiAgLy8gVGhlIGxvY2F0aW9uJ3MgVVJJLlxuICB1cmk6IHN0cmluZyxcbiAgLy8gVGhlIHBvc2l0aW9uIHdpdGhpbiB0aGUgVVJJLlxuICByYW5nZTogUmFuZ2UsXG59O1xuXG5leHBvcnQgdHlwZSBEaWFnbm9zdGljID0ge1xuICAvLyBUaGUgcmFuZ2UgYXQgd2hpY2ggdGhlIG1lc3NhZ2UgYXBwbGllcy5cbiAgcmFuZ2U6IFJhbmdlLFxuICAvLyBUaGUgZGlhZ25vc3RpYydzIHNldmVyaXR5LiBDYW4gYmUgb21pdHRlZC4gSWYgb21pdHRlZCBpdCBpcyB1cCB0byB0aGVcbiAgLy8gY2xpZW50IHRvIGludGVycHJldCBkaWFnbm9zdGljcyBhcyBlcnJvciwgd2FybmluZywgaW5mbyBvciBoaW50LlxuICBzZXZlcml0eT86IG51bWJlcixcbiAgLy8gVGhlIGRpYWdub3N0aWMncyBjb2RlLiBDYW4gYmUgb21pdHRlZC5cbiAgY29kZT86IG51bWJlciB8IHN0cmluZyxcbiAgLy8gQSBodW1hbi1yZWFkYWJsZSBzdHJpbmcgZGVzY3JpYmluZyB0aGUgc291cmNlIG9mIHRoaXNcbiAgLy8gZGlhZ25vc3RpYywgZS5nLiAndHlwZXNjcmlwdCcgb3IgJ3N1cGVyIGxpbnQnLlxuICBzb3VyY2U/OiBzdHJpbmcsXG4gIC8vIFRoZSBkaWFnbm9zdGljJ3MgbWVzc2FnZS5cbiAgbWVzc2FnZTogc3RyaW5nLFxufTtcblxuZXhwb3J0IGNvbnN0IERpYWdub3N0aWNTZXZlcml0eSA9IHtcbiAgLy8gUmVwb3J0cyBhbiBlcnJvci5cbiAgRXJyb3I6IDEsXG4gIC8vIFJlcG9ydHMgYSB3YXJuaW5nLlxuICBXYXJuaW5nOiAyLFxuICAvLyBSZXBvcnRzIGFuIGluZm9ybWF0aW9uLlxuICBJbmZvcm1hdGlvbjogMyxcbiAgLy8gUmVwb3J0cyBhIGhpbnQuXG4gIEhpbnQ6IDQsXG59O1xuXG5leHBvcnQgdHlwZSBDb21tYW5kID0ge1xuICAvLyBUaXRsZSBvZiB0aGUgY29tbWFuZCwgbGlrZSBgc2F2ZWAuXG4gIHRpdGxlOiBzdHJpbmcsXG4gIC8vIFRoZSBpZGVudGlmaWVyIG9mIHRoZSBhY3R1YWwgY29tbWFuZCBoYW5kbGVyLlxuICBjb21tYW5kOiBzdHJpbmcsXG4gIC8vIEFyZ3VtZW50cyB0aGF0IHRoZSBjb21tYW5kIGhhbmRsZXIgc2hvdWxkIGJlIGludm9rZWQgd2l0aC5cbiAgYXJndW1lbnRzPzogYW55W10sXG59O1xuXG5leHBvcnQgdHlwZSBUZXh0RWRpdCA9IHtcbiAgLy8gVGhlIHJhbmdlIG9mIHRoZSB0ZXh0IGRvY3VtZW50IHRvIGJlIG1hbmlwdWxhdGVkLiBUbyBpbnNlcnRcbiAgLy8gdGV4dCBpbnRvIGEgZG9jdW1lbnQgY3JlYXRlIGEgcmFuZ2Ugd2hlcmUgc3RhcnQgPT09IGVuZC5cbiAgcmFuZ2U6IFJhbmdlLFxuICAvLyBUaGUgc3RyaW5nIHRvIGJlIGluc2VydGVkLiBGb3IgZGVsZXRlIG9wZXJhdGlvbnMgdXNlIGFuIGVtcHR5IHN0cmluZy5cbiAgbmV3VGV4dDogc3RyaW5nLFxufTtcblxuZXhwb3J0IHR5cGUgV29ya3NwYWNlRWRpdCA9IHtcbiAgLy8gSG9sZHMgY2hhbmdlcyB0byBleGlzdGluZyByZXNvdXJjZXMuXG4gIGNoYW5nZXM6IHsgW3VyaTogc3RyaW5nXTogVGV4dEVkaXRbXSB9LFxufTtcblxuZXhwb3J0IHR5cGUgVGV4dERvY3VtZW50SWRlbnRpZmllciA9IHtcbiAgLy8gVGhlIHRleHQgZG9jdW1lbnQncyBVUkkuXG4gIHVyaTogc3RyaW5nLFxufTtcblxuZXhwb3J0IHR5cGUgVGV4dERvY3VtZW50SXRlbSA9IHtcbiAgLy8gVGhlIHRleHQgZG9jdW1lbnQncyBVUkkuXG4gIHVyaTogc3RyaW5nLFxuICAvLyBUaGUgdGV4dCBkb2N1bWVudCdzIGxhbmd1YWdlIGlkZW50aWZpZXIuXG4gIGxhbmd1YWdlSWQ6IHN0cmluZyxcbiAgLy8gVGhlIHZlcnNpb24gbnVtYmVyIG9mIHRoaXMgZG9jdW1lbnQgKGl0IHdpbGwgc3RyaWN0bHkgaW5jcmVhc2UgYWZ0ZXIgZWFjaFxuICAvLyBjaGFuZ2UsIGluY2x1ZGluZyB1bmRvL3JlZG8pLlxuICB2ZXJzaW9uOiBudW1iZXIsXG4gIC8vIFRoZSBjb250ZW50IG9mIHRoZSBvcGVuZWQgdGV4dCBkb2N1bWVudC5cbiAgdGV4dDogc3RyaW5nLFxufTtcblxuZXhwb3J0IHR5cGUgVmVyc2lvbmVkVGV4dERvY3VtZW50SWRlbnRpZmllciA9IFRleHREb2N1bWVudElkZW50aWZpZXIgJiB7XG4gIC8vIFRoZSB2ZXJzaW9uIG51bWJlciBvZiB0aGlzIGRvY3VtZW50LlxuICB2ZXJzaW9uOiBudW1iZXIsXG59O1xuXG5leHBvcnQgdHlwZSBUZXh0RG9jdW1lbnRQb3NpdGlvblBhcmFtcyA9IHtcbiAgLy8gVGhlIHRleHQgZG9jdW1lbnQuXG4gIHRleHREb2N1bWVudDogVGV4dERvY3VtZW50SWRlbnRpZmllcixcbiAgLy8gVGhlIHBvc2l0aW9uIGluc2lkZSB0aGUgdGV4dCBkb2N1bWVudC5cbiAgcG9zaXRpb246IFBvc2l0aW9uLFxufTtcblxuLy8gR2VuZXJhbFxuXG5leHBvcnQgdHlwZSBJbml0aWFsaXplUGFyYW1zID0ge1xuICAvLyAgVGhlIHByb2Nlc3MgSWQgb2YgdGhlIHBhcmVudCBwcm9jZXNzIHRoYXQgc3RhcnRlZFxuICAvLyAgdGhlIHNlcnZlci4gSXMgbnVsbCBpZiB0aGUgcHJvY2VzcyBoYXMgbm90IGJlZW4gc3RhcnRlZCBieSBhbm90aGVyIHByb2Nlc3MuXG4gIC8vICBJZiB0aGUgcGFyZW50IHByb2Nlc3MgaXMgbm90IGFsaXZlIHRoZW4gdGhlIHNlcnZlciBzaG91bGQgZXhpdFxuICAvLyAoc2VlIGV4aXQgbm90aWZpY2F0aW9uKSBpdHMgcHJvY2Vzcy5cbiAgcHJvY2Vzc0lkPzogP251bWJlcixcbiAgLy8gIFRoZSByb290UGF0aCBvZiB0aGUgd29ya3NwYWNlLiBJcyBudWxsIGlmIG5vIGZvbGRlciBpcyBvcGVuLlxuICByb290UGF0aD86ID9zdHJpbmcsXG4gIC8vICBVc2VyIHByb3ZpZGVkIGluaXRpYWxpemF0aW9uIG9wdGlvbnMuXG4gIGluaXRpYWxpemF0aW9uT3B0aW9ucz86IGFueSxcbiAgLy8gIFRoZSBjYXBhYmlsaXRpZXMgcHJvdmlkZWQgYnkgdGhlIGNsaWVudCAoZWRpdG9yKVxuICBjYXBhYmlsaXRpZXM6IENsaWVudENhcGFiaWxpdGllcyxcbn07XG5cbmV4cG9ydCB0eXBlIENsaWVudENhcGFiaWxpdGllcyA9IHtcbn07XG5cbmV4cG9ydCB0eXBlIEluaXRpYWxpemVSZXN1bHQgPSB7XG4gIC8vICBUaGUgY2FwYWJpbGl0aWVzIHRoZSBsYW5ndWFnZSBzZXJ2ZXIgcHJvdmlkZXMuXG4gIGNhcGFiaWxpdGllczogU2VydmVyQ2FwYWJpbGl0aWVzLFxufTtcblxuZXhwb3J0IHR5cGUgSW5pdGlhbGl6ZUVycm9yID0ge1xuICAvLyAgSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGNsaWVudCBzaG91bGQgcmV0cnkgdG8gc2VuZCB0aGVcbiAgLy8gIGluaXRpbGl6ZSByZXF1ZXN0IGFmdGVyIHNob3dpbmcgdGhlIG1lc3NhZ2UgcHJvdmlkZWRcbiAgLy8gIGluIHRoZSBSZXNwb25zZUVycm9yLlxuICByZXRyeTogYm9vbGVhbixcbn07XG5cbi8vIERlZmluZXMgaG93IHRoZSBob3N0IChlZGl0b3IpIHNob3VsZCBzeW5jIGRvY3VtZW50IGNoYW5nZXMgdG8gdGhlIGxhbmd1YWdlIHNlcnZlci5cbmV4cG9ydCBjb25zdCBUZXh0RG9jdW1lbnRTeW5jS2luZCA9IHtcbiAgLy8gIERvY3VtZW50cyBzaG91bGQgbm90IGJlIHN5bmNlZCBhdCBhbGwuXG4gIE5vbmU6IDAsXG4gIC8vICBEb2N1bWVudHMgYXJlIHN5bmNlZCBieSBhbHdheXMgc2VuZGluZyB0aGUgZnVsbCBjb250ZW50IG9mIHRoZSBkb2N1bWVudC5cbiAgRnVsbDogMSxcbiAgLy8gIERvY3VtZW50cyBhcmUgc3luY2VkIGJ5IHNlbmRpbmcgdGhlIGZ1bGwgY29udGVudCBvbiBvcGVuLiBBZnRlciB0aGF0IG9ubHkgaW5jcmVtZW50YWxcbiAgLy8gIHVwZGF0ZXMgdG8gdGhlIGRvY3VtZW50IGFyZSBzZW50LlxuICBJbmNyZW1lbnRhbDogMixcbn07XG5cbi8vIENvbXBsZXRpb24gb3B0aW9ucy5cbmV4cG9ydCB0eXBlIENvbXBsZXRpb25PcHRpb25zID0ge1xuICAvLyBUaGUgc2VydmVyIHByb3ZpZGVzIHN1cHBvcnQgdG8gcmVzb2x2ZSBhZGRpdGlvbmFsIGluZm9ybWF0aW9uIGZvciBhIGNvbXBsZXRpb24gaXRlbS5cbiAgcmVzb2x2ZVByb3ZpZGVyPzogYm9vbGVhbixcbiAgLy8gVGhlIGNoYXJhY3RlcnMgdGhhdCB0cmlnZ2VyIGNvbXBsZXRpb24gYXV0b21hdGljYWxseS5cbiAgdHJpZ2dlckNoYXJhY3RlcnM/OiBzdHJpbmdbXSxcbn07XG5cbi8vIFNpZ25hdHVyZSBoZWxwIG9wdGlvbnMuXG5leHBvcnQgdHlwZSBTaWduYXR1cmVIZWxwT3B0aW9ucyA9IHtcbiAgLy8gVGhlIGNoYXJhY3RlcnMgdGhhdCB0cmlnZ2VyIHNpZ25hdHVyZSBoZWxwIGF1dG9tYXRpY2FsbHkuXG4gIHRyaWdnZXJDaGFyYWN0ZXJzPzogc3RyaW5nW10sXG59O1xuXG4vLyBDb2RlIExlbnMgb3B0aW9ucy5cbmV4cG9ydCB0eXBlIENvZGVMZW5zT3B0aW9ucyA9IHtcbiAgLy8gQ29kZSBsZW5zIGhhcyBhIHJlc29sdmUgcHJvdmlkZXIgYXMgd2VsbC5cbiAgcmVzb2x2ZVByb3ZpZGVyPzogYm9vbGVhbixcbn07XG5cbi8vIEZvcm1hdCBkb2N1bWVudCBvbiB0eXBlIG9wdGlvbnNcbmV4cG9ydCB0eXBlIERvY3VtZW50T25UeXBlRm9ybWF0dGluZ09wdGlvbnMgPSB7XG4gIC8vIEEgY2hhcmFjdGVyIG9uIHdoaWNoIGZvcm1hdHRpbmcgc2hvdWxkIGJlIHRyaWdnZXJlZCwgbGlrZSBgfTtgLlxuICBmaXJzdFRyaWdnZXJDaGFyYWN0ZXI6IHN0cmluZyxcbiAgLy8gTW9yZSB0cmlnZ2VyIGNoYXJhY3RlcnMuXG4gIG1vcmVUcmlnZ2VyQ2hhcmFjdGVyPzogc3RyaW5nW10sXG59O1xuXG5leHBvcnQgdHlwZSBTZXJ2ZXJDYXBhYmlsaXRpZXMgPSB7XG4gIC8vIERlZmluZXMgaG93IHRleHQgZG9jdW1lbnRzIGFyZSBzeW5jZWQuXG4gIHRleHREb2N1bWVudFN5bmM/OiBudW1iZXIsXG4gIC8vIFRoZSBzZXJ2ZXIgcHJvdmlkZXMgaG92ZXIgc3VwcG9ydC5cbiAgaG92ZXJQcm92aWRlcj86IGJvb2xlYW4sXG4gIC8vIFRoZSBzZXJ2ZXIgcHJvdmlkZXMgY29tcGxldGlvbiBzdXBwb3J0LlxuICBjb21wbGV0aW9uUHJvdmlkZXI/OiBDb21wbGV0aW9uT3B0aW9ucyxcbiAgLy8gVGhlIHNlcnZlciBwcm92aWRlcyBzaWduYXR1cmUgaGVscCBzdXBwb3J0LlxuICBzaWduYXR1cmVIZWxwUHJvdmlkZXI/OiBTaWduYXR1cmVIZWxwT3B0aW9ucyxcbiAgLy8gVGhlIHNlcnZlciBwcm92aWRlcyBnb3RvIGRlZmluaXRpb24gc3VwcG9ydC5cbiAgZGVmaW5pdGlvblByb3ZpZGVyPzogYm9vbGVhbixcbiAgLy8gVGhlIHNlcnZlciBwcm92aWRlcyBmaW5kIHJlZmVyZW5jZXMgc3VwcG9ydC5cbiAgcmVmZXJlbmNlc1Byb3ZpZGVyPzogYm9vbGVhbixcbiAgLy8gVGhlIHNlcnZlciBwcm92aWRlcyBkb2N1bWVudCBoaWdobGlnaHQgc3VwcG9ydC5cbiAgZG9jdW1lbnRIaWdobGlnaHRQcm92aWRlcj86IGJvb2xlYW4sXG4gIC8vIFRoZSBzZXJ2ZXIgcHJvdmlkZXMgZG9jdW1lbnQgc3ltYm9sIHN1cHBvcnQuXG4gIGRvY3VtZW50U3ltYm9sUHJvdmlkZXI/OiBib29sZWFuLFxuICAvLyBUaGUgc2VydmVyIHByb3ZpZGVzIHdvcmtzcGFjZSBzeW1ib2wgc3VwcG9ydC5cbiAgd29ya3NwYWNlU3ltYm9sUHJvdmlkZXI/OiBib29sZWFuLFxuICAvLyBUaGUgc2VydmVyIHByb3ZpZGVzIGNvZGUgYWN0aW9ucy5cbiAgY29kZUFjdGlvblByb3ZpZGVyPzogYm9vbGVhbixcbiAgLy8gVGhlIHNlcnZlciBwcm92aWRlcyBjb2RlIGxlbnMuXG4gIGNvZGVMZW5zUHJvdmlkZXI/OiBDb2RlTGVuc09wdGlvbnMsXG4gIC8vIFRoZSBzZXJ2ZXIgcHJvdmlkZXMgZG9jdW1lbnQgZm9ybWF0dGluZy5cbiAgZG9jdW1lbnRGb3JtYXR0aW5nUHJvdmlkZXI/OiBib29sZWFuLFxuICAvLyBUaGUgc2VydmVyIHByb3ZpZGVzIGRvY3VtZW50IHJhbmdlIGZvcm1hdHRpbmcuXG4gIGRvY3VtZW50UmFuZ2VGb3JtYXR0aW5nUHJvdmlkZXI/OiBib29sZWFuLFxuICAvLyBUaGUgc2VydmVyIHByb3ZpZGVzIGRvY3VtZW50IGZvcm1hdHRpbmcgb24gdHlwaW5nLlxuICBkb2N1bWVudE9uVHlwZUZvcm1hdHRpbmdQcm92aWRlcj86IERvY3VtZW50T25UeXBlRm9ybWF0dGluZ09wdGlvbnMsXG4gIC8vIFRoZSBzZXJ2ZXIgcHJvdmlkZXMgcmVuYW1lIHN1cHBvcnQuXG4gIHJlbmFtZVByb3ZpZGVyPzogYm9vbGVhbixcbn07XG5cbi8vIERvY3VtZW50XG5cbmV4cG9ydCB0eXBlIFB1Ymxpc2hEaWFnbm9zdGljc1BhcmFtcyA9IHtcbiAgLy8gVGhlIFVSSSBmb3Igd2hpY2ggZGlhZ25vc3RpYyBpbmZvcm1hdGlvbiBpcyByZXBvcnRlZC5cbiAgdXJpOiBzdHJpbmcsXG4gICAvLyBBbiBhcnJheSBvZiBkaWFnbm9zdGljIGluZm9ybWF0aW9uIGl0ZW1zLlxuICBkaWFnbm9zdGljczogRGlhZ25vc3RpY1tdLFxufTtcblxuLy8gUmVwcmVzZW50cyBhIGNvbGxlY3Rpb24gb2YgW2NvbXBsZXRpb24gaXRlbXNdKCNDb21wbGV0aW9uSXRlbSkgdG8gYmUgcHJlc2VudGVkIGluIHRoZSBlZGl0b3IuXG5leHBvcnQgdHlwZSBDb21wbGV0aW9uTGlzdCA9IHtcbiAgLy8gVGhpcyBsaXN0IGl0IG5vdCBjb21wbGV0ZS4gRnVydGhlciB0eXBpbmcgc2hvdWxkIHJlc3VsdCBpbiByZWNvbXB1dGluZyB0aGlzIGxpc3QuXG4gIGlzSW5jb21wbGV0ZTogYm9vbGVhbixcbiAgLy8gVGhlIGNvbXBsZXRpb24gaXRlbXMuXG4gIGl0ZW1zOiBDb21wbGV0aW9uSXRlbVtdLFxufTtcblxuZXhwb3J0IHR5cGUgQ29tcGxldGlvbkl0ZW0gPSB7XG4gIC8vICBUaGUgbGFiZWwgb2YgdGhpcyBjb21wbGV0aW9uIGl0ZW0uIEJ5IGRlZmF1bHRcbiAgLy8gIGFsc28gdGhlIHRleHQgdGhhdCBpcyBpbnNlcnRlZCB3aGVuIHNlbGVjdGluZ1xuICAvLyAgdGhpcyBjb21wbGV0aW9uLlxuICBsYWJlbDogc3RyaW5nLFxuICAvLyBUaGUga2luZCBvZiB0aGlzIGNvbXBsZXRpb24gaXRlbS4gQmFzZWQgb2YgdGhlIGtpbmQgYW4gaWNvbiBpcyBjaG9zZW4gYnkgdGhlIGVkaXRvci5cbiAga2luZD86IG51bWJlcixcbiAgLy8gQSBodW1hbi1yZWFkYWJsZSBzdHJpbmcgd2l0aCBhZGRpdGlvbmFsIGluZm9ybWF0aW9uXG4gIC8vIGFib3V0IHRoaXMgaXRlbSwgbGlrZSB0eXBlIG9yIHN5bWJvbCBpbmZvcm1hdGlvbi5cbiAgZGV0YWlsPzogc3RyaW5nLFxuICAvLyBBIGh1bWFuLXJlYWRhYmxlIHN0cmluZyB0aGF0IHJlcHJlc2VudHMgYSBkb2MtY29tbWVudC5cbiAgZG9jdW1lbnRhdGlvbj86IHN0cmluZyxcbiAgLy8gIEEgc3RyaW5nIHRoYXQgc2hvdWQgYmUgdXNlZCB3aGVuIGNvbXBhcmluZyB0aGlzIGl0ZW1cbiAgLy8gIHdpdGggb3RoZXIgaXRlbXMuIFdoZW4gYGZhbHN5YCB0aGUgbGFiZWwgaXMgdXNlZC5cbiAgc29ydFRleHQ/OiBzdHJpbmcsXG4gIC8vICBBIHN0cmluZyB0aGF0IHNob3VsZCBiZSB1c2VkIHdoZW4gZmlsdGVyaW5nIGEgc2V0IG9mXG4gIC8vICBjb21wbGV0aW9uIGl0ZW1zLiBXaGVuIGBmYWxzeWAgdGhlIGxhYmVsIGlzIHVzZWQuXG4gIGZpbHRlclRleHQ/OiBzdHJpbmcsXG4gIC8vICBBIHN0cmluZyB0aGF0IHNob3VsZCBiZSBpbnNlcnRlZCBhIGRvY3VtZW50IHdoZW4gc2VsZWN0aW5nXG4gIC8vICB0aGlzIGNvbXBsZXRpb24uIFdoZW4gYGZhbHN5YCB0aGUgbGFiZWwgaXMgdXNlZC5cbiAgaW5zZXJ0VGV4dD86IHN0cmluZyxcbiAgLy8gIEFuIGVkaXQgd2hpY2ggaXMgYXBwbGllZCB0byBhIGRvY3VtZW50IHdoZW4gc2VsZWN0aW5nXG4gIC8vICB0aGlzIGNvbXBsZXRpb24uIFdoZW4gYW4gZWRpdCBpcyBwcm92aWRlZCB0aGUgdmFsdWUgb2ZcbiAgLy8gIGluc2VydFRleHQgaXMgaWdub3JlZC5cbiAgdGV4dEVkaXQ/OiBUZXh0RWRpdCxcbiAgLy8gIEFuIG9wdGlvbmFsIGFycmF5IG9mIGFkZGl0aW9uYWwgdGV4dCBlZGl0cyB0aGF0IGFyZSBhcHBsaWVkIHdoZW5cbiAgLy8gIHNlbGVjdGluZyB0aGlzIGNvbXBsZXRpb24uIEVkaXRzIG11c3Qgbm90IG92ZXJsYXAgd2l0aCB0aGUgbWFpbiBlZGl0XG4gIC8vICBub3Igd2l0aCB0aGVtc2VsdmVzLlxuICBhZGRpdGlvbmFsVGV4dEVkaXRzPzogVGV4dEVkaXRbXSxcbiAgLy8gIEFuIG9wdGlvbmFsIGNvbW1hbmQgdGhhdCBpcyBleGVjdXRlZCAqYWZ0ZXIqIGluc2VydGluZyB0aGlzIGNvbXBsZXRpb24uICpOb3RlKiB0aGF0XG4gIC8vICBhZGRpdGlvbmFsIG1vZGlmaWNhdGlvbnMgdG8gdGhlIGN1cnJlbnQgZG9jdW1lbnQgc2hvdWxkIGJlIGRlc2NyaWJlZCB3aXRoIHRoZVxuICAvLyAgYWRkaXRpb25hbFRleHRFZGl0cy1wcm9wZXJ0eS5cbiAgY29tbWFuZD86IENvbW1hbmQsXG4gIC8vICBBbiBkYXRhIGVudHJ5IGZpZWxkIHRoYXQgaXMgcHJlc2VydmVkIG9uIGEgY29tcGxldGlvbiBpdGVtIGJldHdlZW5cbiAgLy8gIGEgY29tcGxldGlvbiBhbmQgYSBjb21wbGV0aW9uIHJlc29sdmUgcmVxdWVzdC5cbiAgZGF0YT86IGFueSxcbn07XG5cbi8vIFRoZSBraW5kIG9mIGEgY29tcGxldGlvbiBlbnRyeS5cbmV4cG9ydCBjb25zdCBDb21wbGV0aW9uSXRlbUtpbmQgPSB7XG4gIFRleHQ6IDEsXG4gIE1ldGhvZDogMixcbiAgRnVuY3Rpb246IDMsXG4gIENvbnN0cnVjdG9yOiA0LFxuICBGaWVsZDogNSxcbiAgVmFyaWFibGU6IDYsXG4gIENsYXNzOiA3LFxuICBJbnRlcmZhY2U6IDgsXG4gIE1vZHVsZTogOSxcbiAgUHJvcGVydHk6IDEwLFxuICBVbml0OiAxMSxcbiAgVmFsdWU6IDEyLFxuICBFbnVtOiAxMyxcbiAgS2V5d29yZDogMTQsXG4gIFNuaXBwZXQ6IDE1LFxuICBDb2xvcjogMTYsXG4gIEZpbGU6IDE3LFxuICBSZWZlcmVuY2U6IDE4LFxufTtcblxuLy8gVGhlIHJlc3VsdCBvZiBhIGhvdmVyIHJlcXVlc3QuXG5leHBvcnQgdHlwZSBIb3ZlciA9IHtcbiAgLy8gVGhlIGhvdmVyJ3MgY29udGVudFxuICBjb250ZW50czogTWFya2VkU3RyaW5nIHwgTWFya2VkU3RyaW5nW10sXG4gIC8vIEFuIG9wdGlvbmFsIHJhbmdlIGlzIGEgcmFuZ2UgaW5zaWRlIGEgdGV4dCBkb2N1bWVudFxuICAvLyB0aGF0IGlzIHVzZWQgdG8gdmlzdWFsaXplIGEgaG92ZXIsIGUuZy4gYnkgY2hhbmdpbmcgdGhlIGJhY2tncm91bmQgY29sb3IuXG4gIHJhbmdlPzogUmFuZ2UsXG59O1xuXG4vKipcbiAqIFRoZSBtYXJrZWQgc3RyaW5nIGlzIHJlbmRlcmVkOlxuICogLSBhcyBtYXJrZG93biBpZiBpdCBpcyByZXByZXNlbnRlZCBhcyBhIHN0cmluZ1xuICogLSBhcyBjb2RlIGJsb2NrIG9mIHRoZSBnaXZlbiBsYW5nYXVnZSBpZiBpdCBpcyByZXByZXNlbnRlZCBhcyBhIHBhaXIgb2YgYSBsYW5ndWFnZSBhbmQgYSB2YWx1ZVxuICpcbiAqIFRoZSBwYWlyIG9mIGEgbGFuZ3VhZ2UgYW5kIGEgdmFsdWUgaXMgYW4gZXF1aXZhbGVudCB0byBtYXJrZG93bjpcbiAqIGBgYCR7bGFuZ3VhZ2V9O1xuICogJHt2YWx1ZX07XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHR5cGUgTWFya2VkU3RyaW5nID0gc3RyaW5nIHwgeyBsYW5ndWFnZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIH07XG5cbi8qKlxuICogU2lnbmF0dXJlIGhlbHAgcmVwcmVzZW50cyB0aGUgc2lnbmF0dXJlIG9mIHNvbWV0aGluZ1xuICogY2FsbGFibGUuIFRoZXJlIGNhbiBiZSBtdWx0aXBsZSBzaWduYXR1cmUgYnV0IG9ubHkgb25lXG4gKiBhY3RpdmUgYW5kIG9ubHkgb25lIGFjdGl2ZSBwYXJhbWV0ZXIuXG4gKi9cbmV4cG9ydCB0eXBlIFNpZ25hdHVyZUhlbHAgPSB7XG4gIC8vIE9uZSBvciBtb3JlIHNpZ25hdHVyZXMuXG4gIHNpZ25hdHVyZXM6IFNpZ25hdHVyZUluZm9ybWF0aW9uW10sXG4gIC8vIFRoZSBhY3RpdmUgc2lnbmF0dXJlLlxuICBhY3RpdmVTaWduYXR1cmU/OiBudW1iZXIsXG4gIC8vIFRoZSBhY3RpdmUgcGFyYW1ldGVyIG9mIHRoZSBhY3RpdmUgc2lnbmF0dXJlLlxuICBhY3RpdmVQYXJhbWV0ZXI/OiBudW1iZXIsXG59O1xuXG4vKipcbiAqIFJlcHJlc2VudHMgdGhlIHNpZ25hdHVyZSBvZiBzb21ldGhpbmcgY2FsbGFibGUuIEEgc2lnbmF0dXJlXG4gKiBjYW4gaGF2ZSBhIGxhYmVsLCBsaWtlIGEgZnVuY3Rpb24tbmFtZSwgYSBkb2MtY29tbWVudCwgYW5kXG4gKiBhIHNldCBvZiBwYXJhbWV0ZXJzLlxuICovXG5leHBvcnQgdHlwZSBTaWduYXR1cmVJbmZvcm1hdGlvbiA9IHtcbiAgLy8gVGhlIGxhYmVsIG9mIHRoaXMgc2lnbmF0dXJlLiBXaWxsIGJlIHNob3duIGluIHRoZSBVSS5cbiAgbGFiZWw6IHN0cmluZyxcbiAgLy8gIFRoZSBodW1hbi1yZWFkYWJsZSBkb2MtY29tbWVudCBvZiB0aGlzIHNpZ25hdHVyZS4gV2lsbCBiZSBzaG93biBpbiB0aGUgVUkgYnV0IGNhbiBiZSBvbWl0dGVkLlxuICBkb2N1bWVudGF0aW9uPzogc3RyaW5nLFxuICAvLyBUaGUgcGFyYW1ldGVycyBvZiB0aGlzIHNpZ25hdHVyZS5cbiAgcGFyYW1ldGVycz86IFBhcmFtZXRlckluZm9ybWF0aW9uW10sXG59O1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBwYXJhbWV0ZXIgb2YgYSBjYWxsYWJsZS1zaWduYXR1cmUuIEEgcGFyYW1ldGVyIGNhblxuICogaGF2ZSBhIGxhYmVsIGFuZCBhIGRvYy1jb21tZW50LlxuICovXG5leHBvcnQgdHlwZSBQYXJhbWV0ZXJJbmZvcm1hdGlvbiA9IHtcbiAgLy8gVGhlIGxhYmVsIG9mIHRoaXMgcGFyYW1ldGVyLiBXaWxsIGJlIHNob3duIGluIHRoZSBVSS5cbiAgbGFiZWw6IHN0cmluZyxcbiAgLy8gVGhlIGh1bWFuLXJlYWRhYmxlIGRvYy1jb21tZW50IG9mIHRoaXMgcGFyYW1ldGVyLiBXaWxsIGJlIHNob3duIGluIHRoZSBVSSBidXQgY2FuIGJlIG9taXR0ZWQuXG4gIGRvY3VtZW50YXRpb24/OiBzdHJpbmcsXG59O1xuXG5leHBvcnQgdHlwZSBSZWZlcmVuY2VQYXJhbXMgPSBUZXh0RG9jdW1lbnRQb3NpdGlvblBhcmFtcyAmIHtcbiAgY29udGV4dDogUmVmZXJlbmNlQ29udGV4dCxcbn07XG5cbmV4cG9ydCB0eXBlIFJlZmVyZW5jZUNvbnRleHQgPSB7XG4gIC8vIEluY2x1ZGUgdGhlIGRlY2xhcmF0aW9uIG9mIHRoZSBjdXJyZW50IHN5bWJvbC5cbiAgaW5jbHVkZURlY2xhcmF0aW9uOiBib29sZWFuLFxufTtcblxuLyoqXG4gKiBBIGRvY3VtZW50IGhpZ2hsaWdodCBpcyBhIHJhbmdlIGluc2lkZSBhIHRleHQgZG9jdW1lbnQgd2hpY2ggZGVzZXJ2ZXNcbiAqIHNwZWNpYWwgYXR0ZW50aW9uLiBVc3VhbGx5IGEgZG9jdW1lbnQgaGlnaGxpZ2h0IGlzIHZpc3VhbGl6ZWQgYnkgY2hhbmdpbmdcbiAqIHRoZSBiYWNrZ3JvdW5kIGNvbG9yIG9mIGl0cyByYW5nZS5cbiAqXG4gKi9cbmV4cG9ydCB0eXBlIERvY3VtZW50SGlnaGxpZ2h0ID0ge1xuICAvLyBUaGUgcmFuZ2UgdGhpcyBoaWdobGlnaHQgYXBwbGllcyB0by5cbiAgcmFuZ2U6IFJhbmdlLFxuICAvLyBUaGUgaGlnaGxpZ2h0IGtpbmQsIGRlZmF1bHQgaXMgRG9jdW1lbnRIaWdobGlnaHRLaW5kLlRleHQuXG4gIGtpbmQ/OiBudW1iZXIsXG59O1xuXG5leHBvcnQgY29uc3QgRG9jdW1lbnRIaWdobGlnaHRLaW5kID0ge1xuICAvLyBBIHRleHR1YWwgb2NjdXJyYW5jZS5cbiAgVGV4dDogMSxcbiAgLy8gUmVhZC1hY2Nlc3Mgb2YgYSBzeW1ib2wsIGxpa2UgcmVhZGluZyBhIHZhcmlhYmxlLlxuICBSZWFkOiAyLFxuICAvLyBXcml0ZS1hY2Nlc3Mgb2YgYSBzeW1ib2wsIGxpa2Ugd3JpdGluZyB0byBhIHZhcmlhYmxlLlxuICBXcml0ZTogMyxcbn07XG5cbmV4cG9ydCB0eXBlIERvY3VtZW50U3ltYm9sUGFyYW1zID0ge1xuICAvLyBUaGUgdGV4dCBkb2N1bWVudC5cbiAgdGV4dERvY3VtZW50OiBUZXh0RG9jdW1lbnRJZGVudGlmaWVyLFxufTtcblxuLyoqXG4gKiBSZXByZXNlbnRzIGluZm9ybWF0aW9uIGFib3V0IHByb2dyYW1taW5nIGNvbnN0cnVjdHMgbGlrZSB2YXJpYWJsZXMsIGNsYXNzZXMsXG4gKiBpbnRlcmZhY2VzIGV0Yy5cbiAqL1xuZXhwb3J0IHR5cGUgU3ltYm9sSW5mb3JtYXRpb24gPSB7XG4gIC8vIFRoZSBuYW1lIG9mIHRoaXMgc3ltYm9sLlxuICBuYW1lOiBzdHJpbmcsXG4gIC8vIFRoZSBraW5kIG9mIHRoaXMgc3ltYm9sLlxuICBraW5kOiBudW1iZXIsXG4gIC8vIFRoZSBsb2NhdGlvbiBvZiB0aGlzIHN5bWJvbC5cbiAgbG9jYXRpb246IExvY2F0aW9uLFxuICAvLyBUaGUgbmFtZSBvZiB0aGUgc3ltYm9sIGNvbnRhaW5pbmcgdGhpcyBzeW1ib2wuXG4gIGNvbnRhaW5lck5hbWU/OiBzdHJpbmcsXG59O1xuXG5leHBvcnQgY29uc3QgU3ltYm9sS2luZCA9IHtcbiAgRmlsZTogMSxcbiAgTW9kdWxlOiAyLFxuICBOYW1lc3BhY2U6IDMsXG4gIFBhY2thZ2U6IDQsXG4gIENsYXNzOiA1LFxuICBNZXRob2Q6IDYsXG4gIFByb3BlcnR5OiA3LFxuICBGaWVsZDogOCxcbiAgQ29uc3RydWN0b3I6IDksXG4gIEVudW06IDEwLFxuICBJbnRlcmZhY2U6IDExLFxuICBGdW5jdGlvbjogMTIsXG4gIFZhcmlhYmxlOiAxMyxcbiAgQ29uc3RhbnQ6IDE0LFxuICBTdHJpbmc6IDE1LFxuICBOdW1iZXI6IDE2LFxuICBCb29sZWFuOiAxNyxcbiAgQXJyYXk6IDE4LFxufTtcblxuLy8gVGhlIHBhcmFtZXRlcnMgb2YgYSBXb3Jrc3BhY2UgU3ltYm9sIFJlcXVlc3QuXG5leHBvcnQgdHlwZSBXb3Jrc3BhY2VTeW1ib2xQYXJhbXMgPSB7XG4gIC8vIEEgbm9uLWVtcHR5IHF1ZXJ5IHN0cmluZy5cbiAgcXVlcnk6IHN0cmluZyxcbn07XG5cbi8vIFBhcmFtcyBmb3IgdGhlIENvZGVBY3Rpb25SZXF1ZXN0XG5leHBvcnQgdHlwZSBDb2RlQWN0aW9uUGFyYW1zID0ge1xuICAvLyBUaGUgZG9jdW1lbnQgaW4gd2hpY2ggdGhlIGNvbW1hbmQgd2FzIGludm9rZWQuXG4gIHRleHREb2N1bWVudDogVGV4dERvY3VtZW50SWRlbnRpZmllcixcbiAgLy8gVGhlIHJhbmdlIGZvciB3aGljaCB0aGUgY29tbWFuZCB3YXMgaW52b2tlZC5cbiAgcmFuZ2U6IFJhbmdlLFxuICAvLyBDb250ZXh0IGNhcnJ5aW5nIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gIGNvbnRleHQ6IENvZGVBY3Rpb25Db250ZXh0LFxufTtcblxuLy8gQ29udGFpbnMgYWRkaXRpb25hbCBkaWFnbm9zdGljIGluZm9ybWF0aW9uIGFib3V0IHRoZSBjb250ZXh0IGluIHdoaWNoIGEgY29kZSBhY3Rpb24gaXMgcnVuLlxuZXhwb3J0IHR5cGUgQ29kZUFjdGlvbkNvbnRleHQgPSB7XG4gIC8vIEFuIGFycmF5IG9mIGRpYWdub3N0aWNzLlxuICBkaWFnbm9zdGljczogRGlhZ25vc3RpY1tdLFxufTtcblxuZXhwb3J0IHR5cGUgQ29kZUxlbnNQYXJhbXMgPSB7XG4gIC8vIFRoZSBkb2N1bWVudCB0byByZXF1ZXN0IGNvZGUgbGVucyBmb3IuXG4gIHRleHREb2N1bWVudDogVGV4dERvY3VtZW50SWRlbnRpZmllcixcbn07XG5cbi8qKlxuICogQSBjb2RlIGxlbnMgcmVwcmVzZW50cyBhIGNvbW1hbmQgdGhhdCBzaG91bGQgYmUgc2hvd24gYWxvbmcgd2l0aFxuICogc291cmNlIHRleHQsIGxpa2UgdGhlIG51bWJlciBvZiByZWZlcmVuY2VzLCBhIHdheSB0byBydW4gdGVzdHMsIGV0Yy5cbiAqXG4gKiBBIGNvZGUgbGVucyBpcyBfdW5yZXNvbHZlZF8gd2hlbiBubyBjb21tYW5kIGlzIGFzc29jaWF0ZWQgdG8gaXQuIEZvciBwZXJmb3JtYW5jZVxuICogcmVhc29ucyB0aGUgY3JlYXRpb24gb2YgYSBjb2RlIGxlbnMgYW5kIHJlc29sdmluZyBzaG91bGQgYmUgZG9uZSBpbiB0d28gc3RhZ2VzLlxuICovXG5leHBvcnQgdHlwZSBDb2RlTGVucyA9IHtcbiAgLy8gVGhlIHJhbmdlIGluIHdoaWNoIHRoaXMgY29kZSBsZW5zIGlzIHZhbGlkLiBTaG91bGQgb25seSBzcGFuIGEgc2luZ2xlIGxpbmUuXG4gIHJhbmdlOiBSYW5nZSxcbiAgLy8gVGhlIGNvbW1hbmQgdGhpcyBjb2RlIGxlbnMgcmVwcmVzZW50cy5cbiAgY29tbWFuZD86IENvbW1hbmQsXG4gIC8vIEEgZGF0YSBlbnRyeSBmaWVsZCB0aGF0IGlzIHByZXNlcnZlZCBvbiBhIGNvZGUgbGVucyBpdGVtIGJldHdlZW4gYSBjb2RlIGxlbnNcbiAgLy8gYW5kIGEgY29kZSBsZW5zIHJlc29sdmUgcmVxdWVzdC5cbiAgZGF0YT86IGFueSxcbn07XG5cbmV4cG9ydCB0eXBlIERvY3VtZW50TGlua1BhcmFtcyA9IHtcbiAgLy8gVGhlIGRvY3VtZW50IHRvIHByb3ZpZGUgZG9jdW1lbnQgbGlua3MgZm9yLlxuICB0ZXh0RG9jdW1lbnQ6IFRleHREb2N1bWVudElkZW50aWZpZXIsXG59O1xuXG4vKipcbiAqIEEgZG9jdW1lbnQgbGluayBpcyBhIHJhbmdlIGluIGEgdGV4dCBkb2N1bWVudCB0aGF0IGxpbmtzIHRvIGFuIGludGVybmFsIG9yXG4qIGV4dGVybmFsIHJlc291cmNlLCBsaWtlIGFub3RoZXJcbiAqIHRleHQgZG9jdW1lbnQgb3IgYSB3ZWIgc2l0ZS5cbiAqL1xuZXhwb3J0IHR5cGUgRG9jdW1lbnRMaW5rID0ge1xuICAvLyBUaGUgcmFuZ2UgdGhpcyBsaW5rIGFwcGxpZXMgdG8uXG4gIHJhbmdlOiBSYW5nZSxcbiAgLy8gVGhlIHVyaSB0aGlzIGxpbmsgcG9pbnRzIHRvLlxuICB0YXJnZXQ6IHN0cmluZyxcbn07XG5cbmV4cG9ydCB0eXBlIERvY3VtZW50Rm9ybWF0dGluZ1BhcmFtcyA9IHtcbiAgLy8gVGhlIGRvY3VtZW50IHRvIGZvcm1hdC5cbiAgdGV4dERvY3VtZW50OiBUZXh0RG9jdW1lbnRJZGVudGlmaWVyLFxuICAvLyBUaGUgZm9ybWF0IG9wdGlvbnMuXG4gIG9wdGlvbnM6IEZvcm1hdHRpbmdPcHRpb25zLFxufTtcblxuLy8gVmFsdWUtb2JqZWN0IGRlc2NyaWJpbmcgd2hhdCBvcHRpb25zIGZvcm1hdHRpbmcgc2hvdWxkIHVzZS5cbmV4cG9ydCB0eXBlIEZvcm1hdHRpbmdPcHRpb25zID0ge1xuICAvLyBTaXplIG9mIGEgdGFiIGluIHNwYWNlcy5cbiAgdGFiU2l6ZTogbnVtYmVyLFxuICAvLyBQcmVmZXIgc3BhY2VzIG92ZXIgdGFicy5cbiAgaW5zZXJ0U3BhY2VzOiBib29sZWFuLFxuICAvLyBTaWduYXR1cmUgZm9yIGZ1cnRoZXIgcHJvcGVydGllcy5cbiAgW2tleTogc3RyaW5nXTogYm9vbGVhbiB8IG51bWJlciB8IHN0cmluZyxcbn07XG5cbmV4cG9ydCB0eXBlIERvY3VtZW50UmFuZ2VGb3JtYXR0aW5nUGFyYW1zID0ge1xuICAvLyBUaGUgZG9jdW1lbnQgdG8gZm9ybWF0LlxuICB0ZXh0RG9jdW1lbnQ6IFRleHREb2N1bWVudElkZW50aWZpZXIsXG4gIC8vIFRoZSByYW5nZSB0byBmb3JtYXQuXG4gIHJhbmdlOiBSYW5nZSxcbiAgLy8gVGhlIGZvcm1hdCBvcHRpb25zLlxuICBvcHRpb25zOiBGb3JtYXR0aW5nT3B0aW9ucyxcbn07XG5cbmV4cG9ydCB0eXBlIERvY3VtZW50T25UeXBlRm9ybWF0dGluZ1BhcmFtcyA9IHtcbiAgLy8gVGhlIGRvY3VtZW50IHRvIGZvcm1hdC5cbiAgdGV4dERvY3VtZW50OiBUZXh0RG9jdW1lbnRJZGVudGlmaWVyLFxuICAvLyBUaGUgcG9zaXRpb24gYXQgd2hpY2ggdGhpcyByZXF1ZXN0IHdhcyBzZW50LlxuICBwb3NpdGlvbjogUG9zaXRpb24sXG4gIC8vIFRoZSBjaGFyYWN0ZXIgdGhhdCBoYXMgYmVlbiB0eXBlZC5cbiAgY2g6IHN0cmluZyxcbiAgLy8gVGhlIGZvcm1hdCBvcHRpb25zLlxuICBvcHRpb25zOiBGb3JtYXR0aW5nT3B0aW9ucyxcbn07XG5cbmV4cG9ydCB0eXBlIFJlbmFtZVBhcmFtcyA9IHtcbiAgLy8gVGhlIGRvY3VtZW50IHRvIGZvcm1hdC5cbiAgdGV4dERvY3VtZW50OiBUZXh0RG9jdW1lbnRJZGVudGlmaWVyLFxuICAvLyBUaGUgcG9zaXRpb24gYXQgd2hpY2ggdGhpcyByZXF1ZXN0IHdhcyBzZW50LlxuICBwb3NpdGlvbjogUG9zaXRpb24sXG4gIC8qKlxuICAgKiBUaGUgbmV3IG5hbWUgb2YgdGhlIHN5bWJvbC4gSWYgdGhlIGdpdmVuIG5hbWUgaXMgbm90IHZhbGlkIHRoZVxuICAgKiByZXF1ZXN0IG11c3QgcmV0dXJuIGEgW1Jlc3BvbnNlRXJyb3JdKCNSZXNwb25zZUVycm9yKSB3aXRoIGFuXG4gICAqIGFwcHJvcHJpYXRlIG1lc3NhZ2Ugc2V0LlxuICAgKi9cbiAgbmV3TmFtZTogc3RyaW5nLFxufTtcblxuLy8gV2luZG93XG5cbmV4cG9ydCB0eXBlIFNob3dNZXNzYWdlUGFyYW1zID0ge1xuICAvLyBUaGUgbWVzc2FnZSB0eXBlLiBTZWUge0BsaW5rIE1lc3NhZ2VUeXBlfTsuXG4gIHR5cGU6IG51bWJlcixcbiAgLy8gVGhlIGFjdHVhbCBtZXNzYWdlLlxuICBtZXNzYWdlOiBzdHJpbmcsXG59O1xuXG5leHBvcnQgY29uc3QgTWVzc2FnZVR5cGUgPSB7XG4gIC8vIEFuIGVycm9yIG1lc3NhZ2UuXG4gIEVycm9yOiAxLFxuICAvLyBBIHdhcm5pbmcgbWVzc2FnZS5cbiAgV2FybmluZzogMixcbiAgLy8gQW4gaW5mb3JtYXRpb24gbWVzc2FnZS5cbiAgSW5mbzogMyxcbiAgLy8gQSBsb2cgbWVzc2FnZS5cbiAgTG9nOiA0LFxufTtcblxuZXhwb3J0IHR5cGUgU2hvd01lc3NhZ2VSZXF1ZXN0UGFyYW1zID0ge1xuICAvLyBUaGUgbWVzc2FnZSB0eXBlLiBTZWUge0BsaW5rIE1lc3NhZ2VUeXBlfTtcbiAgdHlwZTogbnVtYmVyLFxuICAvLyBUaGUgYWN0dWFsIG1lc3NhZ2VcbiAgbWVzc2FnZTogc3RyaW5nLFxuICAvLyBUaGUgbWVzc2FnZSBhY3Rpb24gaXRlbXMgdG8gcHJlc2VudC5cbiAgYWN0aW9ucz86IE1lc3NhZ2VBY3Rpb25JdGVtW10sXG59O1xuXG5leHBvcnQgdHlwZSBNZXNzYWdlQWN0aW9uSXRlbSA9IHtcbiAgLy8gQSBzaG9ydCB0aXRsZSBsaWtlICdSZXRyeScsICdPcGVuIExvZycgZXRjLlxuICB0aXRsZTogc3RyaW5nLFxufTtcblxuZXhwb3J0IHR5cGUgTG9nTWVzc2FnZVBhcmFtcyA9IHtcbiAgLy8gVGhlIG1lc3NhZ2UgdHlwZS4gU2VlIHtAbGluayBNZXNzYWdlVHlwZX07XG4gIHR5cGU6IG51bWJlcixcbiAgLy8gVGhlIGFjdHVhbCBtZXNzYWdlXG4gIG1lc3NhZ2U6IHN0cmluZyxcbn07XG5cbi8vIFdvcmtzcGFjZVxuXG5leHBvcnQgdHlwZSBEaWRDaGFuZ2VDb25maWd1cmF0aW9uUGFyYW1zID0ge1xuICAvLyBUaGUgYWN0dWFsIGNoYW5nZWQgc2V0dGluZ3NcbiAgc2V0dGluZ3M6IGFueSxcbn07XG5cbmV4cG9ydCB0eXBlIERpZE9wZW5UZXh0RG9jdW1lbnRQYXJhbXMgPSB7XG4gIC8vIFRoZSBkb2N1bWVudCB0aGF0IHdhcyBvcGVuZWQuXG4gIHRleHREb2N1bWVudDogVGV4dERvY3VtZW50SXRlbSxcbn07XG5cbmV4cG9ydCB0eXBlIERpZENoYW5nZVRleHREb2N1bWVudFBhcmFtcyA9IHtcbiAgLy8gVGhlIGRvY3VtZW50IHRoYXQgZGlkIGNoYW5nZS4gVGhlIHZlcnNpb24gbnVtYmVyIHBvaW50c1xuICAvLyB0byB0aGUgdmVyc2lvbiBhZnRlciBhbGwgcHJvdmlkZWQgY29udGVudCBjaGFuZ2VzIGhhdmVcbiAgLy8gYmVlbiBhcHBsaWVkLlxuICB0ZXh0RG9jdW1lbnQ6IFZlcnNpb25lZFRleHREb2N1bWVudElkZW50aWZpZXIsXG4gIC8vIFRoZSBhY3R1YWwgY29udGVudCBjaGFuZ2VzLlxuICBjb250ZW50Q2hhbmdlczogVGV4dERvY3VtZW50Q29udGVudENoYW5nZUV2ZW50W10sXG59O1xuXG4vLyBBbiBldmVudCBkZXNjcmliaW5nIGEgY2hhbmdlIHRvIGEgdGV4dCBkb2N1bWVudC4gSWYgcmFuZ2UgYW5kIHJhbmdlTGVuZ3RoIGFyZSBvbWl0dGVkXG4vLyB0aGUgbmV3IHRleHQgaXMgY29uc2lkZXJlZCB0byBiZSB0aGUgZnVsbCBjb250ZW50IG9mIHRoZSBkb2N1bWVudC5cbmV4cG9ydCB0eXBlIFRleHREb2N1bWVudENvbnRlbnRDaGFuZ2VFdmVudCA9IHtcbiAgLy8gVGhlIHJhbmdlIG9mIHRoZSBkb2N1bWVudCB0aGF0IGNoYW5nZWQuXG4gIHJhbmdlPzogUmFuZ2UsXG4gIC8vIFRoZSBsZW5ndGggb2YgdGhlIHJhbmdlIHRoYXQgZ290IHJlcGxhY2VkLlxuICByYW5nZUxlbmd0aD86IG51bWJlcixcbiAgLy8gVGhlIG5ldyB0ZXh0IG9mIHRoZSBkb2N1bWVudC5cbiAgdGV4dDogc3RyaW5nLFxufTtcblxuZXhwb3J0IHR5cGUgRGlkQ2xvc2VUZXh0RG9jdW1lbnRQYXJhbXMgPSB7XG4gIC8vIFRoZSBkb2N1bWVudCB0aGF0IHdhcyBjbG9zZWQuXG4gIHRleHREb2N1bWVudDogVGV4dERvY3VtZW50SWRlbnRpZmllcixcbn07XG5cbmV4cG9ydCB0eXBlIERpZFNhdmVUZXh0RG9jdW1lbnRQYXJhbXMgPSB7XG4gIC8vIFRoZSBkb2N1bWVudCB0aGF0IHdhcyBzYXZlZC5cbiAgdGV4dERvY3VtZW50OiBUZXh0RG9jdW1lbnRJZGVudGlmaWVyLFxufTtcblxuZXhwb3J0IHR5cGUgRGlkQ2hhbmdlV2F0Y2hlZEZpbGVzUGFyYW1zID0ge1xuICAvLyBUaGUgYWN0dWFsIGZpbGUgZXZlbnRzLlxuICBjaGFuZ2VzOiBGaWxlRXZlbnRbXSxcbn07XG5cbi8vIFRoZSBmaWxlIGV2ZW50IHR5cGUuXG5leHBvcnQgY29uc3QgRmlsZUNoYW5nZVR5cGUgPSB7XG4gIC8vIFRoZSBmaWxlIGdvdCBjcmVhdGVkLlxuICBDcmVhdGVkOiAxLFxuICAvLyBUaGUgZmlsZSBnb3QgY2hhbmdlZC5cbiAgQ2hhbmdlZDogMixcbiAgLy8gVGhlIGZpbGUgZ290IGRlbGV0ZWQuXG4gIERlbGV0ZWQ6IDMsXG59O1xuXG4vLyBBbiBldmVudCBkZXNjcmliaW5nIGEgZmlsZSBjaGFuZ2UuXG5leHBvcnQgdHlwZSBGaWxlRXZlbnQgPSB7XG4gIC8vIFRoZSBmaWxlJ3MgVVJJLlxuICB1cmk6IHN0cmluZyxcbiAgLy8gVGhlIGNoYW5nZSB0eXBlLlxuICB0eXBlOiBudW1iZXIsXG59O1xuIl19