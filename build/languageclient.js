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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9sYW5ndWFnZWNsaWVudC5qcyJdLCJuYW1lcyI6WyJycGMiLCJMYW5ndWFnZUNsaWVudENvbm5lY3Rpb24iLCJjb25zdHJ1Y3RvciIsImNvbm5lY3Rpb24iLCJsb2dnZXIiLCJfY29uIiwiX2xvZyIsIm9uRXJyb3IiLCJlcnJvciIsIm9uVW5oYW5kbGVkTm90aWZpY2F0aW9uIiwibm90aWZpY2F0aW9uIiwibWV0aG9kIiwicGFyYW1zIiwid2FybiIsIm9uTm90aWZpY2F0aW9uIiwiZGVidWciLCJhcmd1bWVudHMiLCJsaXN0ZW4iLCJkaXNwb3NlIiwiaW5pdGlhbGl6ZSIsIl9zZW5kUmVxdWVzdCIsInNodXRkb3duIiwib25DdXN0b20iLCJjYWxsYmFjayIsIl9vbk5vdGlmaWNhdGlvbiIsIm9uRXhpdCIsIm9uU2hvd01lc3NhZ2UiLCJvblNob3dNZXNzYWdlUmVxdWVzdCIsIl9vblJlcXVlc3QiLCJvbkxvZ01lc3NhZ2UiLCJvblRlbGVtZXRyeUV2ZW50IiwiZGlkQ2hhbmdlQ29uZmlndXJhdGlvbiIsIl9zZW5kTm90aWZpY2F0aW9uIiwiZGlkT3BlblRleHREb2N1bWVudCIsImRpZENoYW5nZVRleHREb2N1bWVudCIsImRpZENsb3NlVGV4dERvY3VtZW50IiwiZGlkU2F2ZVRleHREb2N1bWVudCIsImRpZENoYW5nZVdhdGNoZWRGaWxlcyIsIm9uUHVibGlzaERpYWdub3N0aWNzIiwiY29tcGxldGlvbiIsImNvbXBsZXRpb25JdGVtUmVzb2x2ZSIsImhvdmVyIiwic2lnbmF0dXJlSGVscCIsImdvdG9EZWZpbml0aW9uIiwiZmluZFJlZmVyZW5jZXMiLCJkb2N1bWVudEhpZ2hsaWdodCIsImRvY3VtZW50U3ltYm9sIiwid29ya3NwYWNlU3ltYm9sIiwiY29kZUFjdGlvbiIsImNvZGVMZW5zIiwiY29kZUxlbnNSZXNvbHZlIiwiZG9jdW1lbnRMaW5rIiwiZG9jdW1lbnRMaW5rUmVzb2x2ZSIsImRvY3VtZW50Rm9ybWF0dGluZyIsImRvY3VtZW50UmFuZ2VGb3JtYXR0aW5nIiwiZG9jdW1lbnRPblR5cGVGb3JtYXR0aW5nIiwicmVuYW1lIiwidHlwZSIsIm9uUmVxdWVzdCIsInZhbHVlIiwiYXJncyIsInNlbmROb3RpZmljYXRpb24iLCJzdGFydCIsInBlcmZvcm1hbmNlIiwibm93IiwicmVzdWx0Iiwic2VuZFJlcXVlc3QiLCJ0b29rIiwiTWF0aCIsImZsb29yIiwiZSIsIkRpYWdub3N0aWNTZXZlcml0eSIsIkVycm9yIiwiV2FybmluZyIsIkluZm9ybWF0aW9uIiwiSGludCIsIlRleHREb2N1bWVudFN5bmNLaW5kIiwiTm9uZSIsIkZ1bGwiLCJJbmNyZW1lbnRhbCIsIkNvbXBsZXRpb25JdGVtS2luZCIsIlRleHQiLCJNZXRob2QiLCJGdW5jdGlvbiIsIkNvbnN0cnVjdG9yIiwiRmllbGQiLCJWYXJpYWJsZSIsIkNsYXNzIiwiSW50ZXJmYWNlIiwiTW9kdWxlIiwiUHJvcGVydHkiLCJVbml0IiwiVmFsdWUiLCJFbnVtIiwiS2V5d29yZCIsIlNuaXBwZXQiLCJDb2xvciIsIkZpbGUiLCJSZWZlcmVuY2UiLCJEb2N1bWVudEhpZ2hsaWdodEtpbmQiLCJSZWFkIiwiV3JpdGUiLCJTeW1ib2xLaW5kIiwiTmFtZXNwYWNlIiwiUGFja2FnZSIsIkNvbnN0YW50IiwiU3RyaW5nIiwiTnVtYmVyIiwiQm9vbGVhbiIsIkFycmF5IiwiTWVzc2FnZVR5cGUiLCJJbmZvIiwiTG9nIiwiRmlsZUNoYW5nZVR5cGUiLCJDcmVhdGVkIiwiQ2hhbmdlZCIsIkRlbGV0ZWQiXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUE7O0lBQVlBLEc7O0FBQ1o7Ozs7QUFDQTs7Ozs7Ozs7OztBQUVBO0FBQ0E7SUFDYUMsd0IsV0FBQUEsd0IsR0FBTixNQUFNQSx3QkFBTixDQUErQjs7QUFJcENDLGNBQVlDLFVBQVosRUFBd0NDLE1BQXhDLEVBQTRFO0FBQzFFLFNBQUtDLElBQUwsR0FBWUYsVUFBWjtBQUNBLFNBQUtHLElBQUwsR0FBWUYsTUFBWjs7QUFFQUQsZUFBV0ksT0FBWCxDQUFv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QUNBQyxXQUFTO0FBTm1CLENBQXZCOztBQVNQIiwiZmlsZSI6Imxhbmd1YWdlY2xpZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQGZsb3dcclxuXHJcbmltcG9ydCAqIGFzIHJwYyBmcm9tICd2c2NvZGUtanNvbnJwYyc7XHJcbmltcG9ydCBDb25zb2xlTG9nZ2VyIGZyb20gJy4vbG9nZ2Vycy9jb25zb2xlLWxvZ2dlcic7XHJcbmltcG9ydCBOdWxsTG9nZ2VyIGZyb20gJy4vbG9nZ2Vycy9udWxsLWxvZ2dlcic7XHJcblxyXG4vLyBGbG93LXR5cGVkIHdyYXBwZXIgYXJvdW5kIEpTT05SUEMgdG8gaW1wbGVtZW50IE1pY3Jvc29mdCBMYW5ndWFnZSBTZXJ2ZXIgUHJvdG9jb2wgdjJcclxuLy8gaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9sYW5ndWFnZS1zZXJ2ZXItcHJvdG9jb2wvYmxvYi9tYXN0ZXIvdmVyc2lvbnMvcHJvdG9jb2wtMi14Lm1kXHJcbmV4cG9ydCBjbGFzcyBMYW5ndWFnZUNsaWVudENvbm5lY3Rpb24ge1xyXG4gIF9jb246IHJwYy5jb25uZWN0aW9uO1xyXG4gIF9sb2c6IENvbnNvbGVMb2dnZXIgfCBOdWxsTG9nZ2VyO1xyXG5cclxuICBjb25zdHJ1Y3Rvcihjb25uZWN0aW9uOiBycGMuY29ubmVjdGlvbiwgbG9nZ2VyOiBDb25zb2xlTG9nZ2VyIHwgTnVsbExvZ2dlcikge1xyXG4gICAgdGhpcy5fY29uID0gY29ubmVjdGlvbjtcclxuICAgIHRoaXMuX2xvZyA9IGxvZ2dlcjtcclxuXHJcbiAgICBjb25uZWN0aW9uLm9uRXJyb3IoKGVycm9yKSA9PiBsb2dnZXIuZXJyb3IoWydycGMub25FcnJvcicsIGVycm9yXSkpO1xyXG4gICAgY29ubmVjdGlvbi5vblVuaGFuZGxlZE5vdGlmaWNhdGlvbigobm90aWZpY2F0aW9uKSA9PiB7XHJcbiAgICAgIGlmIChub3RpZmljYXRpb24ubWV0aG9kICE9IG51bGwgJiYgbm90aWZpY2F0aW9uLnBhcmFtcyAhPSBudWxsKSB7XHJcbiAgICAgICAgbG9nZ2VyLndhcm4oYHJwYy5vblVuaGFuZGxlZE5vdGlmaWNhdGlvbiAke25vdGlmaWNhdGlvbi5tZXRob2R9YCwgbm90aWZpY2F0aW9uLnBhcmFtcyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbG9nZ2VyLndhcm4oJ3JwYy5vblVuaGFuZGxlZE5vdGlmaWNhdGlvbicsIG5vdGlmaWNhdGlvbik7XHJcbiAgICAgIH07XHJcbiAgICB9KTtcclxuICAgIGNvbm5lY3Rpb24ub25Ob3RpZmljYXRpb24oKCkgPT4gbG9nZ2VyLmRlYnVnKCdycGMub25Ob3RpZmljYXRpb24nLCBhcmd1bWVudHMpKTtcclxuXHJcbiAgICBjb25uZWN0aW9uLmxpc3RlbigpO1xyXG4gIH1cclxuXHJcbiAgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuX2Nvbi5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBpbml0aWFsaXplKHBhcmFtczogSW5pdGlhbGl6ZVBhcmFtcyk6IFByb21pc2U8SW5pdGlhbGl6ZVJlc3VsdD4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NlbmRSZXF1ZXN0KCdpbml0aWFsaXplJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIHNodXRkb3duKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NlbmRSZXF1ZXN0KCdzaHV0ZG93bicpO1xyXG4gIH1cclxuXHJcbiAgb25DdXN0b20obWV0aG9kOiBzdHJpbmcsIGNhbGxiYWNrOiBPYmplY3QgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgdGhpcy5fb25Ob3RpZmljYXRpb24oe21ldGhvZDogbWV0aG9kfSwgY2FsbGJhY2spO1xyXG4gIH1cclxuXHJcbiAgb25FeGl0KGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICB0aGlzLl9vbk5vdGlmaWNhdGlvbih7bWV0aG9kOidleGl0J30sIGNhbGxiYWNrKTtcclxuICB9XHJcblxyXG4gIG9uU2hvd01lc3NhZ2UoY2FsbGJhY2s6IFNob3dNZXNzYWdlUGFyYW1zID0+IHZvaWQpOiB2b2lkIHtcclxuICAgIHRoaXMuX29uTm90aWZpY2F0aW9uKHttZXRob2Q6J3dpbmRvdy9zaG93TWVzc2FnZSd9LCBjYWxsYmFjayk7XHJcbiAgfVxyXG5cclxuICBvblNob3dNZXNzYWdlUmVxdWVzdChjYWxsYmFjazogU2hvd01lc3NhZ2VSZXF1ZXN0UGFyYW1zID0+IE1lc3NhZ2VBY3Rpb25JdGVtKTogdm9pZCB7XHJcbiAgICB0aGlzLl9vblJlcXVlc3Qoe21ldGhvZDond2luZG93L1Nob3dNZXNzYWdlUmVxdWVzdCd9LCBjYWxsYmFjayk7XHJcbiAgfVxyXG5cclxuICBvbkxvZ01lc3NhZ2UoY2FsbGJhY2s6IExvZ01lc3NhZ2VQYXJhbXMgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgdGhpcy5fb25Ob3RpZmljYXRpb24oe21ldGhvZDond2luZG93L2xvZ01lc3NhZ2UnfSwgY2FsbGJhY2spO1xyXG4gIH1cclxuXHJcbiAgb25UZWxlbWV0cnlFdmVudChjYWxsYmFjazogYW55ID0+IHZvaWQpOiB2b2lkIHtcclxuICAgIHRoaXMuX29uTm90aWZpY2F0aW9uKHttZXRob2Q6J3RlbGVtZXRyeS9ldmVudCd9LCBjYWxsYmFjayk7XHJcbiAgfVxyXG5cclxuICBkaWRDaGFuZ2VDb25maWd1cmF0aW9uKHBhcmFtczogRGlkQ2hhbmdlQ29uZmlndXJhdGlvblBhcmFtcyk6IHZvaWQge1xyXG4gICAgdGhpcy5fc2VuZE5vdGlmaWNhdGlvbignd29ya3NwYWNlL2RpZENoYW5nZUNvbmZpZ3VyYXRpb24nLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgZGlkT3BlblRleHREb2N1bWVudChwYXJhbXM6IERpZE9wZW5UZXh0RG9jdW1lbnRQYXJhbXMpOiB2b2lkIHtcclxuICAgIHRoaXMuX3NlbmROb3RpZmljYXRpb24oJ3RleHREb2N1bWVudC9kaWRPcGVuJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIGRpZENoYW5nZVRleHREb2N1bWVudChwYXJhbXM6IERpZENoYW5nZVRleHREb2N1bWVudFBhcmFtcyk6IHZvaWQge1xyXG4gICAgdGhpcy5fc2VuZE5vdGlmaWNhdGlvbigndGV4dERvY3VtZW50L2RpZENoYW5nZScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICBkaWRDbG9zZVRleHREb2N1bWVudChwYXJhbXM6IERpZENsb3NlVGV4dERvY3VtZW50UGFyYW1zKTogdm9pZCB7XHJcbiAgICB0aGlzLl9zZW5kTm90aWZpY2F0aW9uKCd0ZXh0RG9jdW1lbnQvZGlkQ2xvc2UnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgZGlkU2F2ZVRleHREb2N1bWVudChwYXJhbXM6IERpZFNhdmVUZXh0RG9jdW1lbnRQYXJhbXMpOiB2b2lkIHtcclxuICAgIHRoaXMuX3NlbmROb3RpZmljYXRpb24oJ3RleHREb2N1bWVudC9kaWRTYXZlJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIGRpZENoYW5nZVdhdGNoZWRGaWxlcyhwYXJhbXM6IERpZENoYW5nZVdhdGNoZWRGaWxlc1BhcmFtcyk6IHZvaWQge1xyXG4gICAgdGhpcy5fc2VuZE5vdGlmaWNhdGlvbignd29ya3NwYWNlL2RpZENoYW5nZVdhdGNoZWRGaWxlcycsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICBvblB1Ymxpc2hEaWFnbm9zdGljcyhjYWxsYmFjazogUHVibGlzaERpYWdub3N0aWNzUGFyYW1zID0+IHZvaWQpOiB2b2lkIHtcclxuICAgIHRoaXMuX29uTm90aWZpY2F0aW9uKHttZXRob2Q6J3RleHREb2N1bWVudC9wdWJsaXNoRGlhZ25vc3RpY3MnfSwgY2FsbGJhY2spO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgY29tcGxldGlvbihwYXJhbXM6IFRleHREb2N1bWVudFBvc2l0aW9uUGFyYW1zKTogUHJvbWlzZTxBcnJheTxDb21wbGV0aW9uSXRlbT4gfCBDb21wbGV0aW9uTGlzdD4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NlbmRSZXF1ZXN0KCd0ZXh0RG9jdW1lbnQvY29tcGxldGlvbicsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBjb21wbGV0aW9uSXRlbVJlc29sdmUocGFyYW1zOiBDb21wbGV0aW9uSXRlbSk6IFByb21pc2U8Q29tcGxldGlvbkl0ZW0+IHtcclxuICAgIHJldHVybiB0aGlzLl9zZW5kUmVxdWVzdCgnY29tcGxldGlvbkl0ZW0vcmVzb2x2ZScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBob3ZlcihwYXJhbXM6IFRleHREb2N1bWVudFBvc2l0aW9uUGFyYW1zKTogUHJvbWlzZTxIb3Zlcj4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NlbmRSZXF1ZXN0KCd0ZXh0RG9jdW1lbnQvaG92ZXInLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgc2lnbmF0dXJlSGVscChwYXJhbXM6IFRleHREb2N1bWVudFBvc2l0aW9uUGFyYW1zKTogUHJvbWlzZTxTaWduYXR1cmVIZWxwPiB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2VuZFJlcXVlc3QoJ3RleHREb2N1bWVudC9zaWduYXR1cmVIZWxwJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGdvdG9EZWZpbml0aW9uKHBhcmFtczogVGV4dERvY3VtZW50UG9zaXRpb25QYXJhbXMpOiBQcm9taXNlPExvY2F0aW9uIHwgQXJyYXk8TG9jYXRpb24+PiB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2VuZFJlcXVlc3QoJ3RleHREb2N1bWVudC9kZWZpbml0aW9uJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGZpbmRSZWZlcmVuY2VzKHBhcmFtczogVGV4dERvY3VtZW50UG9zaXRpb25QYXJhbXMpOiBQcm9taXNlPEFycmF5PExvY2F0aW9uPj4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NlbmRSZXF1ZXN0KCd0ZXh0RG9jdW1lbnQvcmVmZXJlbmNlcycsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBkb2N1bWVudEhpZ2hsaWdodChwYXJhbXM6IFRleHREb2N1bWVudFBvc2l0aW9uUGFyYW1zKTogUHJvbWlzZTxBcnJheTxEb2N1bWVudEhpZ2hsaWdodD4+IHtcclxuICAgIHJldHVybiB0aGlzLl9zZW5kUmVxdWVzdCgndGV4dERvY3VtZW50L2RvY3VtZW50SGlnaGxpZ2h0JywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGRvY3VtZW50U3ltYm9sKHBhcmFtczogRG9jdW1lbnRTeW1ib2xQYXJhbXMpOiBQcm9taXNlPEFycmF5PFN5bWJvbEluZm9ybWF0aW9uPj4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NlbmRSZXF1ZXN0KCd0ZXh0RG9jdW1lbnQvZG9jdW1lbnRTeW1ib2wnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgd29ya3NwYWNlU3ltYm9sKHBhcmFtczogV29ya3NwYWNlU3ltYm9sUGFyYW1zKTogUHJvbWlzZTxBcnJheTxTeW1ib2xJbmZvcm1hdGlvbj4+IHtcclxuICAgIHJldHVybiB0aGlzLl9zZW5kUmVxdWVzdCgnd29ya3NwYWNlL3N5bWJvbCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBjb2RlQWN0aW9uKHBhcmFtczogQ29kZUFjdGlvblBhcmFtcyk6IFByb21pc2U8QXJyYXk8Q29tbWFuZD4+IHtcclxuICAgIHJldHVybiB0aGlzLl9zZW5kUmVxdWVzdCgndGV4dERvY3VtZW50L2NvZGVBY3Rpb24nLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgY29kZUxlbnMocGFyYW1zOiBDb2RlTGVuc1BhcmFtcyk6IFByb21pc2U8QXJyYXk8Q29kZUxlbnM+PiB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2VuZFJlcXVlc3QoJ3RleHREb2N1bWVudC9jb2RlTGVucycsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBjb2RlTGVuc1Jlc29sdmUocGFyYW1zOiBDb2RlTGVucyk6IFByb21pc2U8QXJyYXk8Q29kZUxlbnM+PiB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2VuZFJlcXVlc3QoJ2NvZGVMZW5zL3Jlc29sdmUnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZG9jdW1lbnRMaW5rKHBhcmFtczogRG9jdW1lbnRMaW5rUGFyYW1zKTogUHJvbWlzZTxBcnJheTxEb2N1bWVudExpbms+PiB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2VuZFJlcXVlc3QoJ3RleHREb2N1bWVudC9kb2N1bWVudExpbmsnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZG9jdW1lbnRMaW5rUmVzb2x2ZShwYXJhbXM6IERvY3VtZW50TGluayk6IFByb21pc2U8RG9jdW1lbnRMaW5rPiB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2VuZFJlcXVlc3QoJ2RvY3VtZW50TGluay9yZXNvbHZlJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGRvY3VtZW50Rm9ybWF0dGluZyhwYXJhbXM6IERvY3VtZW50Rm9ybWF0dGluZ1BhcmFtcyk6IFByb21pc2U8QXJyYXk8VGV4dEVkaXQ+PiB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2VuZFJlcXVlc3QoJ3RleHREb2N1bWVudC9mb3JtYXR0aW5nJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGRvY3VtZW50UmFuZ2VGb3JtYXR0aW5nKHBhcmFtczogRG9jdW1lbnRSYW5nZUZvcm1hdHRpbmdQYXJhbXMpOiBQcm9taXNlPEFycmF5PFRleHRFZGl0Pj4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NlbmRSZXF1ZXN0KCd0ZXh0RG9jdW1lbnQvcmFuZ2VGb3JtYXR0aW5nJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGRvY3VtZW50T25UeXBlRm9ybWF0dGluZyhwYXJhbXM6IERvY3VtZW50T25UeXBlRm9ybWF0dGluZ1BhcmFtcyk6IFByb21pc2U8QXJyYXk8VGV4dEVkaXQ+PiB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2VuZFJlcXVlc3QoJ3RleHREb2N1bWVudC9vblR5cGVGb3JtYXR0aW5nJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIHJlbmFtZShwYXJhbXM6IFJlbmFtZVBhcmFtcyk6IFByb21pc2U8V29ya3NwYWNlRWRpdD4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NlbmRSZXF1ZXN0KCd0ZXh0RG9jdW1lbnQvcmVuYW1lJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIF9vblJlcXVlc3QodHlwZToge21ldGhvZDogc3RyaW5nfSwgY2FsbGJhY2s6IE9iamVjdCA9PiBPYmplY3QpOiB2b2lkIHtcclxuICAgIHRoaXMuX2Nvbi5vblJlcXVlc3QodHlwZSwgdmFsdWUgPT4ge1xyXG4gICAgICB0aGlzLl9sb2cuZGVidWcoYHJwYy5vblJlcXVlc3QgJHt0eXBlLm1ldGhvZH1gLCB2YWx1ZSk7XHJcbiAgICAgIHJldHVybiBjYWxsYmFjayh2YWx1ZSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIF9vbk5vdGlmaWNhdGlvbih0eXBlOiB7bWV0aG9kOiBzdHJpbmd9LCBjYWxsYmFjazogT2JqZWN0ID0+IHZvaWQpOiB2b2lkIHtcclxuICAgIHRoaXMuX2Nvbi5vbk5vdGlmaWNhdGlvbih0eXBlLCB2YWx1ZSA9PiB7XHJcbiAgICAgIHRoaXMuX2xvZy5kZWJ1ZyhgcnBjLm9uTm90aWZpY2F0aW9uICR7dHlwZS5tZXRob2R9YCwgdmFsdWUpO1xyXG4gICAgICBjYWxsYmFjayh2YWx1ZSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIF9zZW5kTm90aWZpY2F0aW9uKG1ldGhvZDogc3RyaW5nLCBhcmdzPzogT2JqZWN0KTogdm9pZCB7XHJcbiAgICB0aGlzLl9sb2cuZGVidWcoYHJwYy5zZW5kTm90aWZpY2F0aW9uICR7bWV0aG9kfWAsIGFyZ3MpO1xyXG4gICAgdGhpcy5fY29uLnNlbmROb3RpZmljYXRpb24obWV0aG9kLCBhcmdzKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIF9zZW5kUmVxdWVzdChtZXRob2Q6IHN0cmluZywgYXJncz86IE9iamVjdCk6IFByb21pc2U8YW55PiB7XHJcbiAgICB0aGlzLl9sb2cuZGVidWcoYHJwYy5zZW5kUmVxdWVzdCAke21ldGhvZH0gc2VuZGluZ2AsIGFyZ3MpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3Qgc3RhcnQgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fY29uLnNlbmRSZXF1ZXN0KG1ldGhvZCwgYXJncyk7XHJcbiAgICAgIGNvbnN0IHRvb2sgPSBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0O1xyXG4gICAgICB0aGlzLl9sb2cuZGVidWcoYHJwYy5zZW5kUmVxdWVzdCAke21ldGhvZH0gcmVjZWl2ZWQgKCR7TWF0aC5mbG9vcih0b29rKX1tcylgLCByZXN1bHQpO1xyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICB0aGlzLl9sb2cuZXJyb3IoYHJwYy5zZW5kUmVxdWVzdCAke21ldGhvZH0gdGhyZXdgLCBlKTtcclxuICAgICAgdGhyb3cgZTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vIFN0cnVjdHVyZXNcclxuXHJcbmV4cG9ydCB0eXBlIFBvc2l0aW9uID0ge1xyXG4gIC8vIExpbmUgcG9zaXRpb24gaW4gYSBkb2N1bWVudCAoemVyby1iYXNlZCkuXHJcbiAgbGluZTogbnVtYmVyLFxyXG4gIC8vIENoYXJhY3RlciBvZmZzZXQgb24gYSBsaW5lIGluIGEgZG9jdW1lbnQgKHplcm8tYmFzZWQpLlxyXG4gIGNoYXJhY3RlcjogbnVtYmVyLFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgUmFuZ2UgPSB7XHJcbiAgLy8gVGhlIHJhbmdlJ3Mgc3RhcnQgcG9zaXRpb24uXHJcbiAgc3RhcnQ6IFBvc2l0aW9uLFxyXG4gIC8vIFRoZSByYW5nZSdzIGVuZCBwb3NpdGlvbi5cclxuICBlbmQ6IFBvc2l0aW9uLFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgTG9jYXRpb24gPSB7XHJcbiAgLy8gVGhlIGxvY2F0aW9uJ3MgVVJJLlxyXG4gIHVyaTogc3RyaW5nLFxyXG4gIC8vIFRoZSBwb3NpdGlvbiB3aXRoaW4gdGhlIFVSSS5cclxuICByYW5nZTogUmFuZ2UsXHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBEaWFnbm9zdGljID0ge1xyXG4gIC8vIFRoZSByYW5nZSBhdCB3aGljaCB0aGUgbWVzc2FnZSBhcHBsaWVzLlxyXG4gIHJhbmdlOiBSYW5nZSxcclxuICAvLyBUaGUgZGlhZ25vc3RpYydzIHNldmVyaXR5LiBDYW4gYmUgb21pdHRlZC4gSWYgb21pdHRlZCBpdCBpcyB1cCB0byB0aGVcclxuICAvLyBjbGllbnQgdG8gaW50ZXJwcmV0IGRpYWdub3N0aWNzIGFzIGVycm9yLCB3YXJuaW5nLCBpbmZvIG9yIGhpbnQuXHJcbiAgc2V2ZXJpdHk/OiBudW1iZXIsXHJcbiAgLy8gVGhlIGRpYWdub3N0aWMncyBjb2RlLiBDYW4gYmUgb21pdHRlZC5cclxuICBjb2RlPzogbnVtYmVyIHwgc3RyaW5nLFxyXG4gIC8vIEEgaHVtYW4tcmVhZGFibGUgc3RyaW5nIGRlc2NyaWJpbmcgdGhlIHNvdXJjZSBvZiB0aGlzXHJcbiAgLy8gZGlhZ25vc3RpYywgZS5nLiAndHlwZXNjcmlwdCcgb3IgJ3N1cGVyIGxpbnQnLlxyXG4gIHNvdXJjZT86IHN0cmluZyxcclxuICAvLyBUaGUgZGlhZ25vc3RpYydzIG1lc3NhZ2UuXHJcbiAgbWVzc2FnZTogc3RyaW5nLFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IERpYWdub3N0aWNTZXZlcml0eSA9IHtcclxuICAvLyBSZXBvcnRzIGFuIGVycm9yLlxyXG4gIEVycm9yOiAxLFxyXG4gIC8vIFJlcG9ydHMgYSB3YXJuaW5nLlxyXG4gIFdhcm5pbmc6IDIsXHJcbiAgLy8gUmVwb3J0cyBhbiBpbmZvcm1hdGlvbi5cclxuICBJbmZvcm1hdGlvbjogMyxcclxuICAvLyBSZXBvcnRzIGEgaGludC5cclxuICBIaW50OiA0LFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgQ29tbWFuZCA9IHtcclxuICAvLyBUaXRsZSBvZiB0aGUgY29tbWFuZCwgbGlrZSBgc2F2ZWAuXHJcbiAgdGl0bGU6IHN0cmluZyxcclxuICAvLyBUaGUgaWRlbnRpZmllciBvZiB0aGUgYWN0dWFsIGNvbW1hbmQgaGFuZGxlci5cclxuICBjb21tYW5kOiBzdHJpbmcsXHJcbiAgLy8gQXJndW1lbnRzIHRoYXQgdGhlIGNvbW1hbmQgaGFuZGxlciBzaG91bGQgYmUgaW52b2tlZCB3aXRoLlxyXG4gIGFyZ3VtZW50cz86IGFueVtdLFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgVGV4dEVkaXQgPSB7XHJcbiAgLy8gVGhlIHJhbmdlIG9mIHRoZSB0ZXh0IGRvY3VtZW50IHRvIGJlIG1hbmlwdWxhdGVkLiBUbyBpbnNlcnRcclxuICAvLyB0ZXh0IGludG8gYSBkb2N1bWVudCBjcmVhdGUgYSByYW5nZSB3aGVyZSBzdGFydCA9PT0gZW5kLlxyXG4gIHJhbmdlOiBSYW5nZSxcclxuICAvLyBUaGUgc3RyaW5nIHRvIGJlIGluc2VydGVkLiBGb3IgZGVsZXRlIG9wZXJhdGlvbnMgdXNlIGFuIGVtcHR5IHN0cmluZy5cclxuICBuZXdUZXh0OiBzdHJpbmcsXHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBXb3Jrc3BhY2VFZGl0ID0ge1xyXG4gIC8vIEhvbGRzIGNoYW5nZXMgdG8gZXhpc3RpbmcgcmVzb3VyY2VzLlxyXG4gIGNoYW5nZXM6IHsgW3VyaTogc3RyaW5nXTogVGV4dEVkaXRbXSB9LFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgVGV4dERvY3VtZW50SWRlbnRpZmllciA9IHtcclxuICAvLyBUaGUgdGV4dCBkb2N1bWVudCdzIFVSSS5cclxuICB1cmk6IHN0cmluZyxcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFRleHREb2N1bWVudEl0ZW0gPSB7XHJcbiAgLy8gVGhlIHRleHQgZG9jdW1lbnQncyBVUkkuXHJcbiAgdXJpOiBzdHJpbmcsXHJcbiAgLy8gVGhlIHRleHQgZG9jdW1lbnQncyBsYW5ndWFnZSBpZGVudGlmaWVyLlxyXG4gIGxhbmd1YWdlSWQ6IHN0cmluZyxcclxuICAvLyBUaGUgdmVyc2lvbiBudW1iZXIgb2YgdGhpcyBkb2N1bWVudCAoaXQgd2lsbCBzdHJpY3RseSBpbmNyZWFzZSBhZnRlciBlYWNoXHJcbiAgLy8gY2hhbmdlLCBpbmNsdWRpbmcgdW5kby9yZWRvKS5cclxuICB2ZXJzaW9uOiBudW1iZXIsXHJcbiAgLy8gVGhlIGNvbnRlbnQgb2YgdGhlIG9wZW5lZCB0ZXh0IGRvY3VtZW50LlxyXG4gIHRleHQ6IHN0cmluZyxcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFZlcnNpb25lZFRleHREb2N1bWVudElkZW50aWZpZXIgPSBUZXh0RG9jdW1lbnRJZGVudGlmaWVyICYge1xyXG4gIC8vIFRoZSB2ZXJzaW9uIG51bWJlciBvZiB0aGlzIGRvY3VtZW50LlxyXG4gIHZlcnNpb246IG51bWJlcixcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFRleHREb2N1bWVudFBvc2l0aW9uUGFyYW1zID0ge1xyXG4gIC8vIFRoZSB0ZXh0IGRvY3VtZW50LlxyXG4gIHRleHREb2N1bWVudDogVGV4dERvY3VtZW50SWRlbnRpZmllcixcclxuICAvLyBUaGUgcG9zaXRpb24gaW5zaWRlIHRoZSB0ZXh0IGRvY3VtZW50LlxyXG4gIHBvc2l0aW9uOiBQb3NpdGlvbixcclxufTtcclxuXHJcbi8vIEdlbmVyYWxcclxuXHJcbmV4cG9ydCB0eXBlIEluaXRpYWxpemVQYXJhbXMgPSB7XHJcbiAgLy8gIFRoZSBwcm9jZXNzIElkIG9mIHRoZSBwYXJlbnQgcHJvY2VzcyB0aGF0IHN0YXJ0ZWRcclxuICAvLyAgdGhlIHNlcnZlci4gSXMgbnVsbCBpZiB0aGUgcHJvY2VzcyBoYXMgbm90IGJlZW4gc3RhcnRlZCBieSBhbm90aGVyIHByb2Nlc3MuXHJcbiAgLy8gIElmIHRoZSBwYXJlbnQgcHJvY2VzcyBpcyBub3QgYWxpdmUgdGhlbiB0aGUgc2VydmVyIHNob3VsZCBleGl0XHJcbiAgLy8gKHNlZSBleGl0IG5vdGlmaWNhdGlvbikgaXRzIHByb2Nlc3MuXHJcbiAgcHJvY2Vzc0lkPzogP251bWJlcixcclxuICAvLyAgVGhlIHJvb3RQYXRoIG9mIHRoZSB3b3Jrc3BhY2UuIElzIG51bGwgaWYgbm8gZm9sZGVyIGlzIG9wZW4uXHJcbiAgcm9vdFBhdGg/OiA/c3RyaW5nLFxyXG4gIC8vICBVc2VyIHByb3ZpZGVkIGluaXRpYWxpemF0aW9uIG9wdGlvbnMuXHJcbiAgaW5pdGlhbGl6YXRpb25PcHRpb25zPzogYW55LFxyXG4gIC8vICBUaGUgY2FwYWJpbGl0aWVzIHByb3ZpZGVkIGJ5IHRoZSBjbGllbnQgKGVkaXRvcilcclxuICBjYXBhYmlsaXRpZXM6IENsaWVudENhcGFiaWxpdGllcyxcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIENsaWVudENhcGFiaWxpdGllcyA9IHtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIEluaXRpYWxpemVSZXN1bHQgPSB7XHJcbiAgLy8gIFRoZSBjYXBhYmlsaXRpZXMgdGhlIGxhbmd1YWdlIHNlcnZlciBwcm92aWRlcy5cclxuICBjYXBhYmlsaXRpZXM6IFNlcnZlckNhcGFiaWxpdGllcyxcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIEluaXRpYWxpemVFcnJvciA9IHtcclxuICAvLyAgSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGNsaWVudCBzaG91bGQgcmV0cnkgdG8gc2VuZCB0aGVcclxuICAvLyAgaW5pdGlsaXplIHJlcXVlc3QgYWZ0ZXIgc2hvd2luZyB0aGUgbWVzc2FnZSBwcm92aWRlZFxyXG4gIC8vICBpbiB0aGUgUmVzcG9uc2VFcnJvci5cclxuICByZXRyeTogYm9vbGVhbixcclxufTtcclxuXHJcbi8vIERlZmluZXMgaG93IHRoZSBob3N0IChlZGl0b3IpIHNob3VsZCBzeW5jIGRvY3VtZW50IGNoYW5nZXMgdG8gdGhlIGxhbmd1YWdlIHNlcnZlci5cclxuZXhwb3J0IGNvbnN0IFRleHREb2N1bWVudFN5bmNLaW5kID0ge1xyXG4gIC8vICBEb2N1bWVudHMgc2hvdWxkIG5vdCBiZSBzeW5jZWQgYXQgYWxsLlxyXG4gIE5vbmU6IDAsXHJcbiAgLy8gIERvY3VtZW50cyBhcmUgc3luY2VkIGJ5IGFsd2F5cyBzZW5kaW5nIHRoZSBmdWxsIGNvbnRlbnQgb2YgdGhlIGRvY3VtZW50LlxyXG4gIEZ1bGw6IDEsXHJcbiAgLy8gIERvY3VtZW50cyBhcmUgc3luY2VkIGJ5IHNlbmRpbmcgdGhlIGZ1bGwgY29udGVudCBvbiBvcGVuLiBBZnRlciB0aGF0IG9ubHkgaW5jcmVtZW50YWxcclxuICAvLyAgdXBkYXRlcyB0byB0aGUgZG9jdW1lbnQgYXJlIHNlbnQuXHJcbiAgSW5jcmVtZW50YWw6IDIsXHJcbn07XHJcblxyXG4vLyBDb21wbGV0aW9uIG9wdGlvbnMuXHJcbmV4cG9ydCB0eXBlIENvbXBsZXRpb25PcHRpb25zID0ge1xyXG4gIC8vIFRoZSBzZXJ2ZXIgcHJvdmlkZXMgc3VwcG9ydCB0byByZXNvbHZlIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gZm9yIGEgY29tcGxldGlvbiBpdGVtLlxyXG4gIHJlc29sdmVQcm92aWRlcj86IGJvb2xlYW4sXHJcbiAgLy8gVGhlIGNoYXJhY3RlcnMgdGhhdCB0cmlnZ2VyIGNvbXBsZXRpb24gYXV0b21hdGljYWxseS5cclxuICB0cmlnZ2VyQ2hhcmFjdGVycz86IHN0cmluZ1tdLFxyXG59O1xyXG5cclxuLy8gU2lnbmF0dXJlIGhlbHAgb3B0aW9ucy5cclxuZXhwb3J0IHR5cGUgU2lnbmF0dXJlSGVscE9wdGlvbnMgPSB7XHJcbiAgLy8gVGhlIGNoYXJhY3RlcnMgdGhhdCB0cmlnZ2VyIHNpZ25hdHVyZSBoZWxwIGF1dG9tYXRpY2FsbHkuXHJcbiAgdHJpZ2dlckNoYXJhY3RlcnM/OiBzdHJpbmdbXSxcclxufTtcclxuXHJcbi8vIENvZGUgTGVucyBvcHRpb25zLlxyXG5leHBvcnQgdHlwZSBDb2RlTGVuc09wdGlvbnMgPSB7XHJcbiAgLy8gQ29kZSBsZW5zIGhhcyBhIHJlc29sdmUgcHJvdmlkZXIgYXMgd2VsbC5cclxuICByZXNvbHZlUHJvdmlkZXI/OiBib29sZWFuLFxyXG59O1xyXG5cclxuLy8gRm9ybWF0IGRvY3VtZW50IG9uIHR5cGUgb3B0aW9uc1xyXG5leHBvcnQgdHlwZSBEb2N1bWVudE9uVHlwZUZvcm1hdHRpbmdPcHRpb25zID0ge1xyXG4gIC8vIEEgY2hhcmFjdGVyIG9uIHdoaWNoIGZvcm1hdHRpbmcgc2hvdWxkIGJlIHRyaWdnZXJlZCwgbGlrZSBgfTtgLlxyXG4gIGZpcnN0VHJpZ2dlckNoYXJhY3Rlcjogc3RyaW5nLFxyXG4gIC8vIE1vcmUgdHJpZ2dlciBjaGFyYWN0ZXJzLlxyXG4gIG1vcmVUcmlnZ2VyQ2hhcmFjdGVyPzogc3RyaW5nW10sXHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBTZXJ2ZXJDYXBhYmlsaXRpZXMgPSB7XHJcbiAgLy8gRGVmaW5lcyBob3cgdGV4dCBkb2N1bWVudHMgYXJlIHN5bmNlZC5cclxuICB0ZXh0RG9jdW1lbnRTeW5jPzogbnVtYmVyLFxyXG4gIC8vIFRoZSBzZXJ2ZXIgcHJvdmlkZXMgaG92ZXIgc3VwcG9ydC5cclxuICBob3ZlclByb3ZpZGVyPzogYm9vbGVhbixcclxuICAvLyBUaGUgc2VydmVyIHByb3ZpZGVzIGNvbXBsZXRpb24gc3VwcG9ydC5cclxuICBjb21wbGV0aW9uUHJvdmlkZXI/OiBDb21wbGV0aW9uT3B0aW9ucyxcclxuICAvLyBUaGUgc2VydmVyIHByb3ZpZGVzIHNpZ25hdHVyZSBoZWxwIHN1cHBvcnQuXHJcbiAgc2lnbmF0dXJlSGVscFByb3ZpZGVyPzogU2lnbmF0dXJlSGVscE9wdGlvbnMsXHJcbiAgLy8gVGhlIHNlcnZlciBwcm92aWRlcyBnb3RvIGRlZmluaXRpb24gc3VwcG9ydC5cclxuICBkZWZpbml0aW9uUHJvdmlkZXI/OiBib29sZWFuLFxyXG4gIC8vIFRoZSBzZXJ2ZXIgcHJvdmlkZXMgZmluZCByZWZlcmVuY2VzIHN1cHBvcnQuXHJcbiAgcmVmZXJlbmNlc1Byb3ZpZGVyPzogYm9vbGVhbixcclxuICAvLyBUaGUgc2VydmVyIHByb3ZpZGVzIGRvY3VtZW50IGhpZ2hsaWdodCBzdXBwb3J0LlxyXG4gIGRvY3VtZW50SGlnaGxpZ2h0UHJvdmlkZXI/OiBib29sZWFuLFxyXG4gIC8vIFRoZSBzZXJ2ZXIgcHJvdmlkZXMgZG9jdW1lbnQgc3ltYm9sIHN1cHBvcnQuXHJcbiAgZG9jdW1lbnRTeW1ib2xQcm92aWRlcj86IGJvb2xlYW4sXHJcbiAgLy8gVGhlIHNlcnZlciBwcm92aWRlcyB3b3Jrc3BhY2Ugc3ltYm9sIHN1cHBvcnQuXHJcbiAgd29ya3NwYWNlU3ltYm9sUHJvdmlkZXI/OiBib29sZWFuLFxyXG4gIC8vIFRoZSBzZXJ2ZXIgcHJvdmlkZXMgY29kZSBhY3Rpb25zLlxyXG4gIGNvZGVBY3Rpb25Qcm92aWRlcj86IGJvb2xlYW4sXHJcbiAgLy8gVGhlIHNlcnZlciBwcm92aWRlcyBjb2RlIGxlbnMuXHJcbiAgY29kZUxlbnNQcm92aWRlcj86IENvZGVMZW5zT3B0aW9ucyxcclxuICAvLyBUaGUgc2VydmVyIHByb3ZpZGVzIGRvY3VtZW50IGZvcm1hdHRpbmcuXHJcbiAgZG9jdW1lbnRGb3JtYXR0aW5nUHJvdmlkZXI/OiBib29sZWFuLFxyXG4gIC8vIFRoZSBzZXJ2ZXIgcHJvdmlkZXMgZG9jdW1lbnQgcmFuZ2UgZm9ybWF0dGluZy5cclxuICBkb2N1bWVudFJhbmdlRm9ybWF0dGluZ1Byb3ZpZGVyPzogYm9vbGVhbixcclxuICAvLyBUaGUgc2VydmVyIHByb3ZpZGVzIGRvY3VtZW50IGZvcm1hdHRpbmcgb24gdHlwaW5nLlxyXG4gIGRvY3VtZW50T25UeXBlRm9ybWF0dGluZ1Byb3ZpZGVyPzogRG9jdW1lbnRPblR5cGVGb3JtYXR0aW5nT3B0aW9ucyxcclxuICAvLyBUaGUgc2VydmVyIHByb3ZpZGVzIHJlbmFtZSBzdXBwb3J0LlxyXG4gIHJlbmFtZVByb3ZpZGVyPzogYm9vbGVhbixcclxufTtcclxuXHJcbi8vIERvY3VtZW50XHJcblxyXG5leHBvcnQgdHlwZSBQdWJsaXNoRGlhZ25vc3RpY3NQYXJhbXMgPSB7XHJcbiAgLy8gVGhlIFVSSSBmb3Igd2hpY2ggZGlhZ25vc3RpYyBpbmZvcm1hdGlvbiBpcyByZXBvcnRlZC5cclxuICB1cmk6IHN0cmluZyxcclxuICAgLy8gQW4gYXJyYXkgb2YgZGlhZ25vc3RpYyBpbmZvcm1hdGlvbiBpdGVtcy5cclxuICBkaWFnbm9zdGljczogRGlhZ25vc3RpY1tdLFxyXG59O1xyXG5cclxuLy8gUmVwcmVzZW50cyBhIGNvbGxlY3Rpb24gb2YgW2NvbXBsZXRpb24gaXRlbXNdKCNDb21wbGV0aW9uSXRlbSkgdG8gYmUgcHJlc2VudGVkIGluIHRoZSBlZGl0b3IuXHJcbmV4cG9ydCB0eXBlIENvbXBsZXRpb25MaXN0ID0ge1xyXG4gIC8vIFRoaXMgbGlzdCBpdCBub3QgY29tcGxldGUuIEZ1cnRoZXIgdHlwaW5nIHNob3VsZCByZXN1bHQgaW4gcmVjb21wdXRpbmcgdGhpcyBsaXN0LlxyXG4gIGlzSW5jb21wbGV0ZTogYm9vbGVhbixcclxuICAvLyBUaGUgY29tcGxldGlvbiBpdGVtcy5cclxuICBpdGVtczogQ29tcGxldGlvbkl0ZW1bXSxcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIENvbXBsZXRpb25JdGVtID0ge1xyXG4gIC8vICBUaGUgbGFiZWwgb2YgdGhpcyBjb21wbGV0aW9uIGl0ZW0uIEJ5IGRlZmF1bHRcclxuICAvLyAgYWxzbyB0aGUgdGV4dCB0aGF0IGlzIGluc2VydGVkIHdoZW4gc2VsZWN0aW5nXHJcbiAgLy8gIHRoaXMgY29tcGxldGlvbi5cclxuICBsYWJlbDogc3RyaW5nLFxyXG4gIC8vIFRoZSBraW5kIG9mIHRoaXMgY29tcGxldGlvbiBpdGVtLiBCYXNlZCBvZiB0aGUga2luZCBhbiBpY29uIGlzIGNob3NlbiBieSB0aGUgZWRpdG9yLlxyXG4gIGtpbmQ/OiBudW1iZXIsXHJcbiAgLy8gQSBodW1hbi1yZWFkYWJsZSBzdHJpbmcgd2l0aCBhZGRpdGlvbmFsIGluZm9ybWF0aW9uXHJcbiAgLy8gYWJvdXQgdGhpcyBpdGVtLCBsaWtlIHR5cGUgb3Igc3ltYm9sIGluZm9ybWF0aW9uLlxyXG4gIGRldGFpbD86IHN0cmluZyxcclxuICAvLyBBIGh1bWFuLXJlYWRhYmxlIHN0cmluZyB0aGF0IHJlcHJlc2VudHMgYSBkb2MtY29tbWVudC5cclxuICBkb2N1bWVudGF0aW9uPzogc3RyaW5nLFxyXG4gIC8vICBBIHN0cmluZyB0aGF0IHNob3VkIGJlIHVzZWQgd2hlbiBjb21wYXJpbmcgdGhpcyBpdGVtXHJcbiAgLy8gIHdpdGggb3RoZXIgaXRlbXMuIFdoZW4gYGZhbHN5YCB0aGUgbGFiZWwgaXMgdXNlZC5cclxuICBzb3J0VGV4dD86IHN0cmluZyxcclxuICAvLyAgQSBzdHJpbmcgdGhhdCBzaG91bGQgYmUgdXNlZCB3aGVuIGZpbHRlcmluZyBhIHNldCBvZlxyXG4gIC8vICBjb21wbGV0aW9uIGl0ZW1zLiBXaGVuIGBmYWxzeWAgdGhlIGxhYmVsIGlzIHVzZWQuXHJcbiAgZmlsdGVyVGV4dD86IHN0cmluZyxcclxuICAvLyAgQSBzdHJpbmcgdGhhdCBzaG91bGQgYmUgaW5zZXJ0ZWQgYSBkb2N1bWVudCB3aGVuIHNlbGVjdGluZ1xyXG4gIC8vICB0aGlzIGNvbXBsZXRpb24uIFdoZW4gYGZhbHN5YCB0aGUgbGFiZWwgaXMgdXNlZC5cclxuICBpbnNlcnRUZXh0Pzogc3RyaW5nLFxyXG4gIC8vICBBbiBlZGl0IHdoaWNoIGlzIGFwcGxpZWQgdG8gYSBkb2N1bWVudCB3aGVuIHNlbGVjdGluZ1xyXG4gIC8vICB0aGlzIGNvbXBsZXRpb24uIFdoZW4gYW4gZWRpdCBpcyBwcm92aWRlZCB0aGUgdmFsdWUgb2ZcclxuICAvLyAgaW5zZXJ0VGV4dCBpcyBpZ25vcmVkLlxyXG4gIHRleHRFZGl0PzogVGV4dEVkaXQsXHJcbiAgLy8gIEFuIG9wdGlvbmFsIGFycmF5IG9mIGFkZGl0aW9uYWwgdGV4dCBlZGl0cyB0aGF0IGFyZSBhcHBsaWVkIHdoZW5cclxuICAvLyAgc2VsZWN0aW5nIHRoaXMgY29tcGxldGlvbi4gRWRpdHMgbXVzdCBub3Qgb3ZlcmxhcCB3aXRoIHRoZSBtYWluIGVkaXRcclxuICAvLyAgbm9yIHdpdGggdGhlbXNlbHZlcy5cclxuICBhZGRpdGlvbmFsVGV4dEVkaXRzPzogVGV4dEVkaXRbXSxcclxuICAvLyAgQW4gb3B0aW9uYWwgY29tbWFuZCB0aGF0IGlzIGV4ZWN1dGVkICphZnRlciogaW5zZXJ0aW5nIHRoaXMgY29tcGxldGlvbi4gKk5vdGUqIHRoYXRcclxuICAvLyAgYWRkaXRpb25hbCBtb2RpZmljYXRpb25zIHRvIHRoZSBjdXJyZW50IGRvY3VtZW50IHNob3VsZCBiZSBkZXNjcmliZWQgd2l0aCB0aGVcclxuICAvLyAgYWRkaXRpb25hbFRleHRFZGl0cy1wcm9wZXJ0eS5cclxuICBjb21tYW5kPzogQ29tbWFuZCxcclxuICAvLyAgQW4gZGF0YSBlbnRyeSBmaWVsZCB0aGF0IGlzIHByZXNlcnZlZCBvbiBhIGNvbXBsZXRpb24gaXRlbSBiZXR3ZWVuXHJcbiAgLy8gIGEgY29tcGxldGlvbiBhbmQgYSBjb21wbGV0aW9uIHJlc29sdmUgcmVxdWVzdC5cclxuICBkYXRhPzogYW55LFxyXG59O1xyXG5cclxuLy8gVGhlIGtpbmQgb2YgYSBjb21wbGV0aW9uIGVudHJ5LlxyXG5leHBvcnQgY29uc3QgQ29tcGxldGlvbkl0ZW1LaW5kID0ge1xyXG4gIFRleHQ6IDEsXHJcbiAgTWV0aG9kOiAyLFxyXG4gIEZ1bmN0aW9uOiAzLFxyXG4gIENvbnN0cnVjdG9yOiA0LFxyXG4gIEZpZWxkOiA1LFxyXG4gIFZhcmlhYmxlOiA2LFxyXG4gIENsYXNzOiA3LFxyXG4gIEludGVyZmFjZTogOCxcclxuICBNb2R1bGU6IDksXHJcbiAgUHJvcGVydHk6IDEwLFxyXG4gIFVuaXQ6IDExLFxyXG4gIFZhbHVlOiAxMixcclxuICBFbnVtOiAxMyxcclxuICBLZXl3b3JkOiAxNCxcclxuICBTbmlwcGV0OiAxNSxcclxuICBDb2xvcjogMTYsXHJcbiAgRmlsZTogMTcsXHJcbiAgUmVmZXJlbmNlOiAxOCxcclxufTtcclxuXHJcbi8vIFRoZSByZXN1bHQgb2YgYSBob3ZlciByZXF1ZXN0LlxyXG5leHBvcnQgdHlwZSBIb3ZlciA9IHtcclxuICAvLyBUaGUgaG92ZXIncyBjb250ZW50XHJcbiAgY29udGVudHM6IE1hcmtlZFN0cmluZyB8IE1hcmtlZFN0cmluZ1tdLFxyXG4gIC8vIEFuIG9wdGlvbmFsIHJhbmdlIGlzIGEgcmFuZ2UgaW5zaWRlIGEgdGV4dCBkb2N1bWVudFxyXG4gIC8vIHRoYXQgaXMgdXNlZCB0byB2aXN1YWxpemUgYSBob3ZlciwgZS5nLiBieSBjaGFuZ2luZyB0aGUgYmFja2dyb3VuZCBjb2xvci5cclxuICByYW5nZT86IFJhbmdlLFxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRoZSBtYXJrZWQgc3RyaW5nIGlzIHJlbmRlcmVkOlxyXG4gKiAtIGFzIG1hcmtkb3duIGlmIGl0IGlzIHJlcHJlc2VudGVkIGFzIGEgc3RyaW5nXHJcbiAqIC0gYXMgY29kZSBibG9jayBvZiB0aGUgZ2l2ZW4gbGFuZ2F1Z2UgaWYgaXQgaXMgcmVwcmVzZW50ZWQgYXMgYSBwYWlyIG9mIGEgbGFuZ3VhZ2UgYW5kIGEgdmFsdWVcclxuICpcclxuICogVGhlIHBhaXIgb2YgYSBsYW5ndWFnZSBhbmQgYSB2YWx1ZSBpcyBhbiBlcXVpdmFsZW50IHRvIG1hcmtkb3duOlxyXG4gKiBgYGAke2xhbmd1YWdlfTtcclxuICogJHt2YWx1ZX07XHJcbiAqIGBgYFxyXG4gKi9cclxuZXhwb3J0IHR5cGUgTWFya2VkU3RyaW5nID0gc3RyaW5nIHwgeyBsYW5ndWFnZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIH07XHJcblxyXG4vKipcclxuICogU2lnbmF0dXJlIGhlbHAgcmVwcmVzZW50cyB0aGUgc2lnbmF0dXJlIG9mIHNvbWV0aGluZ1xyXG4gKiBjYWxsYWJsZS4gVGhlcmUgY2FuIGJlIG11bHRpcGxlIHNpZ25hdHVyZSBidXQgb25seSBvbmVcclxuICogYWN0aXZlIGFuZCBvbmx5IG9uZSBhY3RpdmUgcGFyYW1ldGVyLlxyXG4gKi9cclxuZXhwb3J0IHR5cGUgU2lnbmF0dXJlSGVscCA9IHtcclxuICAvLyBPbmUgb3IgbW9yZSBzaWduYXR1cmVzLlxyXG4gIHNpZ25hdHVyZXM6IFNpZ25hdHVyZUluZm9ybWF0aW9uW10sXHJcbiAgLy8gVGhlIGFjdGl2ZSBzaWduYXR1cmUuXHJcbiAgYWN0aXZlU2lnbmF0dXJlPzogbnVtYmVyLFxyXG4gIC8vIFRoZSBhY3RpdmUgcGFyYW1ldGVyIG9mIHRoZSBhY3RpdmUgc2lnbmF0dXJlLlxyXG4gIGFjdGl2ZVBhcmFtZXRlcj86IG51bWJlcixcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIHRoZSBzaWduYXR1cmUgb2Ygc29tZXRoaW5nIGNhbGxhYmxlLiBBIHNpZ25hdHVyZVxyXG4gKiBjYW4gaGF2ZSBhIGxhYmVsLCBsaWtlIGEgZnVuY3Rpb24tbmFtZSwgYSBkb2MtY29tbWVudCwgYW5kXHJcbiAqIGEgc2V0IG9mIHBhcmFtZXRlcnMuXHJcbiAqL1xyXG5leHBvcnQgdHlwZSBTaWduYXR1cmVJbmZvcm1hdGlvbiA9IHtcclxuICAvLyBUaGUgbGFiZWwgb2YgdGhpcyBzaWduYXR1cmUuIFdpbGwgYmUgc2hvd24gaW4gdGhlIFVJLlxyXG4gIGxhYmVsOiBzdHJpbmcsXHJcbiAgLy8gIFRoZSBodW1hbi1yZWFkYWJsZSBkb2MtY29tbWVudCBvZiB0aGlzIHNpZ25hdHVyZS4gV2lsbCBiZSBzaG93biBpbiB0aGUgVUkgYnV0IGNhbiBiZSBvbWl0dGVkLlxyXG4gIGRvY3VtZW50YXRpb24/OiBzdHJpbmcsXHJcbiAgLy8gVGhlIHBhcmFtZXRlcnMgb2YgdGhpcyBzaWduYXR1cmUuXHJcbiAgcGFyYW1ldGVycz86IFBhcmFtZXRlckluZm9ybWF0aW9uW10sXHJcbn07XHJcblxyXG4vKipcclxuICogUmVwcmVzZW50cyBhIHBhcmFtZXRlciBvZiBhIGNhbGxhYmxlLXNpZ25hdHVyZS4gQSBwYXJhbWV0ZXIgY2FuXHJcbiAqIGhhdmUgYSBsYWJlbCBhbmQgYSBkb2MtY29tbWVudC5cclxuICovXHJcbmV4cG9ydCB0eXBlIFBhcmFtZXRlckluZm9ybWF0aW9uID0ge1xyXG4gIC8vIFRoZSBsYWJlbCBvZiB0aGlzIHBhcmFtZXRlci4gV2lsbCBiZSBzaG93biBpbiB0aGUgVUkuXHJcbiAgbGFiZWw6IHN0cmluZyxcclxuICAvLyBUaGUgaHVtYW4tcmVhZGFibGUgZG9jLWNvbW1lbnQgb2YgdGhpcyBwYXJhbWV0ZXIuIFdpbGwgYmUgc2hvd24gaW4gdGhlIFVJIGJ1dCBjYW4gYmUgb21pdHRlZC5cclxuICBkb2N1bWVudGF0aW9uPzogc3RyaW5nLFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgUmVmZXJlbmNlUGFyYW1zID0gVGV4dERvY3VtZW50UG9zaXRpb25QYXJhbXMgJiB7XHJcbiAgY29udGV4dDogUmVmZXJlbmNlQ29udGV4dCxcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFJlZmVyZW5jZUNvbnRleHQgPSB7XHJcbiAgLy8gSW5jbHVkZSB0aGUgZGVjbGFyYXRpb24gb2YgdGhlIGN1cnJlbnQgc3ltYm9sLlxyXG4gIGluY2x1ZGVEZWNsYXJhdGlvbjogYm9vbGVhbixcclxufTtcclxuXHJcbi8qKlxyXG4gKiBBIGRvY3VtZW50IGhpZ2hsaWdodCBpcyBhIHJhbmdlIGluc2lkZSBhIHRleHQgZG9jdW1lbnQgd2hpY2ggZGVzZXJ2ZXNcclxuICogc3BlY2lhbCBhdHRlbnRpb24uIFVzdWFsbHkgYSBkb2N1bWVudCBoaWdobGlnaHQgaXMgdmlzdWFsaXplZCBieSBjaGFuZ2luZ1xyXG4gKiB0aGUgYmFja2dyb3VuZCBjb2xvciBvZiBpdHMgcmFuZ2UuXHJcbiAqXHJcbiAqL1xyXG5leHBvcnQgdHlwZSBEb2N1bWVudEhpZ2hsaWdodCA9IHtcclxuICAvLyBUaGUgcmFuZ2UgdGhpcyBoaWdobGlnaHQgYXBwbGllcyB0by5cclxuICByYW5nZTogUmFuZ2UsXHJcbiAgLy8gVGhlIGhpZ2hsaWdodCBraW5kLCBkZWZhdWx0IGlzIERvY3VtZW50SGlnaGxpZ2h0S2luZC5UZXh0LlxyXG4gIGtpbmQ/OiBudW1iZXIsXHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgRG9jdW1lbnRIaWdobGlnaHRLaW5kID0ge1xyXG4gIC8vIEEgdGV4dHVhbCBvY2N1cnJhbmNlLlxyXG4gIFRleHQ6IDEsXHJcbiAgLy8gUmVhZC1hY2Nlc3Mgb2YgYSBzeW1ib2wsIGxpa2UgcmVhZGluZyBhIHZhcmlhYmxlLlxyXG4gIFJlYWQ6IDIsXHJcbiAgLy8gV3JpdGUtYWNjZXNzIG9mIGEgc3ltYm9sLCBsaWtlIHdyaXRpbmcgdG8gYSB2YXJpYWJsZS5cclxuICBXcml0ZTogMyxcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIERvY3VtZW50U3ltYm9sUGFyYW1zID0ge1xyXG4gIC8vIFRoZSB0ZXh0IGRvY3VtZW50LlxyXG4gIHRleHREb2N1bWVudDogVGV4dERvY3VtZW50SWRlbnRpZmllcixcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIGluZm9ybWF0aW9uIGFib3V0IHByb2dyYW1taW5nIGNvbnN0cnVjdHMgbGlrZSB2YXJpYWJsZXMsIGNsYXNzZXMsXHJcbiAqIGludGVyZmFjZXMgZXRjLlxyXG4gKi9cclxuZXhwb3J0IHR5cGUgU3ltYm9sSW5mb3JtYXRpb24gPSB7XHJcbiAgLy8gVGhlIG5hbWUgb2YgdGhpcyBzeW1ib2wuXHJcbiAgbmFtZTogc3RyaW5nLFxyXG4gIC8vIFRoZSBraW5kIG9mIHRoaXMgc3ltYm9sLlxyXG4gIGtpbmQ6IG51bWJlcixcclxuICAvLyBUaGUgbG9jYXRpb24gb2YgdGhpcyBzeW1ib2wuXHJcbiAgbG9jYXRpb246IExvY2F0aW9uLFxyXG4gIC8vIFRoZSBuYW1lIG9mIHRoZSBzeW1ib2wgY29udGFpbmluZyB0aGlzIHN5bWJvbC5cclxuICBjb250YWluZXJOYW1lPzogc3RyaW5nLFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IFN5bWJvbEtpbmQgPSB7XHJcbiAgRmlsZTogMSxcclxuICBNb2R1bGU6IDIsXHJcbiAgTmFtZXNwYWNlOiAzLFxyXG4gIFBhY2thZ2U6IDQsXHJcbiAgQ2xhc3M6IDUsXHJcbiAgTWV0aG9kOiA2LFxyXG4gIFByb3BlcnR5OiA3LFxyXG4gIEZpZWxkOiA4LFxyXG4gIENvbnN0cnVjdG9yOiA5LFxyXG4gIEVudW06IDEwLFxyXG4gIEludGVyZmFjZTogMTEsXHJcbiAgRnVuY3Rpb246IDEyLFxyXG4gIFZhcmlhYmxlOiAxMyxcclxuICBDb25zdGFudDogMTQsXHJcbiAgU3RyaW5nOiAxNSxcclxuICBOdW1iZXI6IDE2LFxyXG4gIEJvb2xlYW46IDE3LFxyXG4gIEFycmF5OiAxOCxcclxufTtcclxuXHJcbi8vIFRoZSBwYXJhbWV0ZXJzIG9mIGEgV29ya3NwYWNlIFN5bWJvbCBSZXF1ZXN0LlxyXG5leHBvcnQgdHlwZSBXb3Jrc3BhY2VTeW1ib2xQYXJhbXMgPSB7XHJcbiAgLy8gQSBub24tZW1wdHkgcXVlcnkgc3RyaW5nLlxyXG4gIHF1ZXJ5OiBzdHJpbmcsXHJcbn07XHJcblxyXG4vLyBQYXJhbXMgZm9yIHRoZSBDb2RlQWN0aW9uUmVxdWVzdFxyXG5leHBvcnQgdHlwZSBDb2RlQWN0aW9uUGFyYW1zID0ge1xyXG4gIC8vIFRoZSBkb2N1bWVudCBpbiB3aGljaCB0aGUgY29tbWFuZCB3YXMgaW52b2tlZC5cclxuICB0ZXh0RG9jdW1lbnQ6IFRleHREb2N1bWVudElkZW50aWZpZXIsXHJcbiAgLy8gVGhlIHJhbmdlIGZvciB3aGljaCB0aGUgY29tbWFuZCB3YXMgaW52b2tlZC5cclxuICByYW5nZTogUmFuZ2UsXHJcbiAgLy8gQ29udGV4dCBjYXJyeWluZyBhZGRpdGlvbmFsIGluZm9ybWF0aW9uLlxyXG4gIGNvbnRleHQ6IENvZGVBY3Rpb25Db250ZXh0LFxyXG59O1xyXG5cclxuLy8gQ29udGFpbnMgYWRkaXRpb25hbCBkaWFnbm9zdGljIGluZm9ybWF0aW9uIGFib3V0IHRoZSBjb250ZXh0IGluIHdoaWNoIGEgY29kZSBhY3Rpb24gaXMgcnVuLlxyXG5leHBvcnQgdHlwZSBDb2RlQWN0aW9uQ29udGV4dCA9IHtcclxuICAvLyBBbiBhcnJheSBvZiBkaWFnbm9zdGljcy5cclxuICBkaWFnbm9zdGljczogRGlhZ25vc3RpY1tdLFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgQ29kZUxlbnNQYXJhbXMgPSB7XHJcbiAgLy8gVGhlIGRvY3VtZW50IHRvIHJlcXVlc3QgY29kZSBsZW5zIGZvci5cclxuICB0ZXh0RG9jdW1lbnQ6IFRleHREb2N1bWVudElkZW50aWZpZXIsXHJcbn07XHJcblxyXG4vKipcclxuICogQSBjb2RlIGxlbnMgcmVwcmVzZW50cyBhIGNvbW1hbmQgdGhhdCBzaG91bGQgYmUgc2hvd24gYWxvbmcgd2l0aFxyXG4gKiBzb3VyY2UgdGV4dCwgbGlrZSB0aGUgbnVtYmVyIG9mIHJlZmVyZW5jZXMsIGEgd2F5IHRvIHJ1biB0ZXN0cywgZXRjLlxyXG4gKlxyXG4gKiBBIGNvZGUgbGVucyBpcyBfdW5yZXNvbHZlZF8gd2hlbiBubyBjb21tYW5kIGlzIGFzc29jaWF0ZWQgdG8gaXQuIEZvciBwZXJmb3JtYW5jZVxyXG4gKiByZWFzb25zIHRoZSBjcmVhdGlvbiBvZiBhIGNvZGUgbGVucyBhbmQgcmVzb2x2aW5nIHNob3VsZCBiZSBkb25lIGluIHR3byBzdGFnZXMuXHJcbiAqL1xyXG5leHBvcnQgdHlwZSBDb2RlTGVucyA9IHtcclxuICAvLyBUaGUgcmFuZ2UgaW4gd2hpY2ggdGhpcyBjb2RlIGxlbnMgaXMgdmFsaWQuIFNob3VsZCBvbmx5IHNwYW4gYSBzaW5nbGUgbGluZS5cclxuICByYW5nZTogUmFuZ2UsXHJcbiAgLy8gVGhlIGNvbW1hbmQgdGhpcyBjb2RlIGxlbnMgcmVwcmVzZW50cy5cclxuICBjb21tYW5kPzogQ29tbWFuZCxcclxuICAvLyBBIGRhdGEgZW50cnkgZmllbGQgdGhhdCBpcyBwcmVzZXJ2ZWQgb24gYSBjb2RlIGxlbnMgaXRlbSBiZXR3ZWVuIGEgY29kZSBsZW5zXHJcbiAgLy8gYW5kIGEgY29kZSBsZW5zIHJlc29sdmUgcmVxdWVzdC5cclxuICBkYXRhPzogYW55LFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgRG9jdW1lbnRMaW5rUGFyYW1zID0ge1xyXG4gIC8vIFRoZSBkb2N1bWVudCB0byBwcm92aWRlIGRvY3VtZW50IGxpbmtzIGZvci5cclxuICB0ZXh0RG9jdW1lbnQ6IFRleHREb2N1bWVudElkZW50aWZpZXIsXHJcbn07XHJcblxyXG4vKipcclxuICogQSBkb2N1bWVudCBsaW5rIGlzIGEgcmFuZ2UgaW4gYSB0ZXh0IGRvY3VtZW50IHRoYXQgbGlua3MgdG8gYW4gaW50ZXJuYWwgb3JcclxuKiBleHRlcm5hbCByZXNvdXJjZSwgbGlrZSBhbm90aGVyXHJcbiAqIHRleHQgZG9jdW1lbnQgb3IgYSB3ZWIgc2l0ZS5cclxuICovXHJcbmV4cG9ydCB0eXBlIERvY3VtZW50TGluayA9IHtcclxuICAvLyBUaGUgcmFuZ2UgdGhpcyBsaW5rIGFwcGxpZXMgdG8uXHJcbiAgcmFuZ2U6IFJhbmdlLFxyXG4gIC8vIFRoZSB1cmkgdGhpcyBsaW5rIHBvaW50cyB0by5cclxuICB0YXJnZXQ6IHN0cmluZyxcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIERvY3VtZW50Rm9ybWF0dGluZ1BhcmFtcyA9IHtcclxuICAvLyBUaGUgZG9jdW1lbnQgdG8gZm9ybWF0LlxyXG4gIHRleHREb2N1bWVudDogVGV4dERvY3VtZW50SWRlbnRpZmllcixcclxuICAvLyBUaGUgZm9ybWF0IG9wdGlvbnMuXHJcbiAgb3B0aW9uczogRm9ybWF0dGluZ09wdGlvbnMsXHJcbn07XHJcblxyXG4vLyBWYWx1ZS1vYmplY3QgZGVzY3JpYmluZyB3aGF0IG9wdGlvbnMgZm9ybWF0dGluZyBzaG91bGQgdXNlLlxyXG5leHBvcnQgdHlwZSBGb3JtYXR0aW5nT3B0aW9ucyA9IHtcclxuICAvLyBTaXplIG9mIGEgdGFiIGluIHNwYWNlcy5cclxuICB0YWJTaXplOiBudW1iZXIsXHJcbiAgLy8gUHJlZmVyIHNwYWNlcyBvdmVyIHRhYnMuXHJcbiAgaW5zZXJ0U3BhY2VzOiBib29sZWFuLFxyXG4gIC8vIFNpZ25hdHVyZSBmb3IgZnVydGhlciBwcm9wZXJ0aWVzLlxyXG4gIFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfCBudW1iZXIgfCBzdHJpbmcsXHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBEb2N1bWVudFJhbmdlRm9ybWF0dGluZ1BhcmFtcyA9IHtcclxuICAvLyBUaGUgZG9jdW1lbnQgdG8gZm9ybWF0LlxyXG4gIHRleHREb2N1bWVudDogVGV4dERvY3VtZW50SWRlbnRpZmllcixcclxuICAvLyBUaGUgcmFuZ2UgdG8gZm9ybWF0LlxyXG4gIHJhbmdlOiBSYW5nZSxcclxuICAvLyBUaGUgZm9ybWF0IG9wdGlvbnMuXHJcbiAgb3B0aW9uczogRm9ybWF0dGluZ09wdGlvbnMsXHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBEb2N1bWVudE9uVHlwZUZvcm1hdHRpbmdQYXJhbXMgPSB7XHJcbiAgLy8gVGhlIGRvY3VtZW50IHRvIGZvcm1hdC5cclxuICB0ZXh0RG9jdW1lbnQ6IFRleHREb2N1bWVudElkZW50aWZpZXIsXHJcbiAgLy8gVGhlIHBvc2l0aW9uIGF0IHdoaWNoIHRoaXMgcmVxdWVzdCB3YXMgc2VudC5cclxuICBwb3NpdGlvbjogUG9zaXRpb24sXHJcbiAgLy8gVGhlIGNoYXJhY3RlciB0aGF0IGhhcyBiZWVuIHR5cGVkLlxyXG4gIGNoOiBzdHJpbmcsXHJcbiAgLy8gVGhlIGZvcm1hdCBvcHRpb25zLlxyXG4gIG9wdGlvbnM6IEZvcm1hdHRpbmdPcHRpb25zLFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgUmVuYW1lUGFyYW1zID0ge1xyXG4gIC8vIFRoZSBkb2N1bWVudCB0byBmb3JtYXQuXHJcbiAgdGV4dERvY3VtZW50OiBUZXh0RG9jdW1lbnRJZGVudGlmaWVyLFxyXG4gIC8vIFRoZSBwb3NpdGlvbiBhdCB3aGljaCB0aGlzIHJlcXVlc3Qgd2FzIHNlbnQuXHJcbiAgcG9zaXRpb246IFBvc2l0aW9uLFxyXG4gIC8qKlxyXG4gICAqIFRoZSBuZXcgbmFtZSBvZiB0aGUgc3ltYm9sLiBJZiB0aGUgZ2l2ZW4gbmFtZSBpcyBub3QgdmFsaWQgdGhlXHJcbiAgICogcmVxdWVzdCBtdXN0IHJldHVybiBhIFtSZXNwb25zZUVycm9yXSgjUmVzcG9uc2VFcnJvcikgd2l0aCBhblxyXG4gICAqIGFwcHJvcHJpYXRlIG1lc3NhZ2Ugc2V0LlxyXG4gICAqL1xyXG4gIG5ld05hbWU6IHN0cmluZyxcclxufTtcclxuXHJcbi8vIFdpbmRvd1xyXG5cclxuZXhwb3J0IHR5cGUgU2hvd01lc3NhZ2VQYXJhbXMgPSB7XHJcbiAgLy8gVGhlIG1lc3NhZ2UgdHlwZS4gU2VlIHtAbGluayBNZXNzYWdlVHlwZX07LlxyXG4gIHR5cGU6IG51bWJlcixcclxuICAvLyBUaGUgYWN0dWFsIG1lc3NhZ2UuXHJcbiAgbWVzc2FnZTogc3RyaW5nLFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IE1lc3NhZ2VUeXBlID0ge1xyXG4gIC8vIEFuIGVycm9yIG1lc3NhZ2UuXHJcbiAgRXJyb3I6IDEsXHJcbiAgLy8gQSB3YXJuaW5nIG1lc3NhZ2UuXHJcbiAgV2FybmluZzogMixcclxuICAvLyBBbiBpbmZvcm1hdGlvbiBtZXNzYWdlLlxyXG4gIEluZm86IDMsXHJcbiAgLy8gQSBsb2cgbWVzc2FnZS5cclxuICBMb2c6IDQsXHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBTaG93TWVzc2FnZVJlcXVlc3RQYXJhbXMgPSB7XHJcbiAgLy8gVGhlIG1lc3NhZ2UgdHlwZS4gU2VlIHtAbGluayBNZXNzYWdlVHlwZX07XHJcbiAgdHlwZTogbnVtYmVyLFxyXG4gIC8vIFRoZSBhY3R1YWwgbWVzc2FnZVxyXG4gIG1lc3NhZ2U6IHN0cmluZyxcclxuICAvLyBUaGUgbWVzc2FnZSBhY3Rpb24gaXRlbXMgdG8gcHJlc2VudC5cclxuICBhY3Rpb25zPzogTWVzc2FnZUFjdGlvbkl0ZW1bXSxcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIE1lc3NhZ2VBY3Rpb25JdGVtID0ge1xyXG4gIC8vIEEgc2hvcnQgdGl0bGUgbGlrZSAnUmV0cnknLCAnT3BlbiBMb2cnIGV0Yy5cclxuICB0aXRsZTogc3RyaW5nLFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgTG9nTWVzc2FnZVBhcmFtcyA9IHtcclxuICAvLyBUaGUgbWVzc2FnZSB0eXBlLiBTZWUge0BsaW5rIE1lc3NhZ2VUeXBlfTtcclxuICB0eXBlOiBudW1iZXIsXHJcbiAgLy8gVGhlIGFjdHVhbCBtZXNzYWdlXHJcbiAgbWVzc2FnZTogc3RyaW5nLFxyXG59O1xyXG5cclxuLy8gV29ya3NwYWNlXHJcblxyXG5leHBvcnQgdHlwZSBEaWRDaGFuZ2VDb25maWd1cmF0aW9uUGFyYW1zID0ge1xyXG4gIC8vIFRoZSBhY3R1YWwgY2hhbmdlZCBzZXR0aW5nc1xyXG4gIHNldHRpbmdzOiBhbnksXHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBEaWRPcGVuVGV4dERvY3VtZW50UGFyYW1zID0ge1xyXG4gIC8vIFRoZSBkb2N1bWVudCB0aGF0IHdhcyBvcGVuZWQuXHJcbiAgdGV4dERvY3VtZW50OiBUZXh0RG9jdW1lbnRJdGVtLFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgRGlkQ2hhbmdlVGV4dERvY3VtZW50UGFyYW1zID0ge1xyXG4gIC8vIFRoZSBkb2N1bWVudCB0aGF0IGRpZCBjaGFuZ2UuIFRoZSB2ZXJzaW9uIG51bWJlciBwb2ludHNcclxuICAvLyB0byB0aGUgdmVyc2lvbiBhZnRlciBhbGwgcHJvdmlkZWQgY29udGVudCBjaGFuZ2VzIGhhdmVcclxuICAvLyBiZWVuIGFwcGxpZWQuXHJcbiAgdGV4dERvY3VtZW50OiBWZXJzaW9uZWRUZXh0RG9jdW1lbnRJZGVudGlmaWVyLFxyXG4gIC8vIFRoZSBhY3R1YWwgY29udGVudCBjaGFuZ2VzLlxyXG4gIGNvbnRlbnRDaGFuZ2VzOiBUZXh0RG9jdW1lbnRDb250ZW50Q2hhbmdlRXZlbnRbXSxcclxufTtcclxuXHJcbi8vIEFuIGV2ZW50IGRlc2NyaWJpbmcgYSBjaGFuZ2UgdG8gYSB0ZXh0IGRvY3VtZW50LiBJZiByYW5nZSBhbmQgcmFuZ2VMZW5ndGggYXJlIG9taXR0ZWRcclxuLy8gdGhlIG5ldyB0ZXh0IGlzIGNvbnNpZGVyZWQgdG8gYmUgdGhlIGZ1bGwgY29udGVudCBvZiB0aGUgZG9jdW1lbnQuXHJcbmV4cG9ydCB0eXBlIFRleHREb2N1bWVudENvbnRlbnRDaGFuZ2VFdmVudCA9IHtcclxuICAvLyBUaGUgcmFuZ2Ugb2YgdGhlIGRvY3VtZW50IHRoYXQgY2hhbmdlZC5cclxuICByYW5nZT86IFJhbmdlLFxyXG4gIC8vIFRoZSBsZW5ndGggb2YgdGhlIHJhbmdlIHRoYXQgZ290IHJlcGxhY2VkLlxyXG4gIHJhbmdlTGVuZ3RoPzogbnVtYmVyLFxyXG4gIC8vIFRoZSBuZXcgdGV4dCBvZiB0aGUgZG9jdW1lbnQuXHJcbiAgdGV4dDogc3RyaW5nLFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgRGlkQ2xvc2VUZXh0RG9jdW1lbnRQYXJhbXMgPSB7XHJcbiAgLy8gVGhlIGRvY3VtZW50IHRoYXQgd2FzIGNsb3NlZC5cclxuICB0ZXh0RG9jdW1lbnQ6IFRleHREb2N1bWVudElkZW50aWZpZXIsXHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBEaWRTYXZlVGV4dERvY3VtZW50UGFyYW1zID0ge1xyXG4gIC8vIFRoZSBkb2N1bWVudCB0aGF0IHdhcyBzYXZlZC5cclxuICB0ZXh0RG9jdW1lbnQ6IFRleHREb2N1bWVudElkZW50aWZpZXIsXHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBEaWRDaGFuZ2VXYXRjaGVkRmlsZXNQYXJhbXMgPSB7XHJcbiAgLy8gVGhlIGFjdHVhbCBmaWxlIGV2ZW50cy5cclxuICBjaGFuZ2VzOiBGaWxlRXZlbnRbXSxcclxufTtcclxuXHJcbi8vIFRoZSBmaWxlIGV2ZW50IHR5cGUuXHJcbmV4cG9ydCBjb25zdCBGaWxlQ2hhbmdlVHlwZSA9IHtcclxuICAvLyBUaGUgZmlsZSBnb3QgY3JlYXRlZC5cclxuICBDcmVhdGVkOiAxLFxyXG4gIC8vIFRoZSBmaWxlIGdvdCBjaGFuZ2VkLlxyXG4gIENoYW5nZWQ6IDIsXHJcbiAgLy8gVGhlIGZpbGUgZ290IGRlbGV0ZWQuXHJcbiAgRGVsZXRlZDogMyxcclxufTtcclxuXHJcbi8vIEFuIGV2ZW50IGRlc2NyaWJpbmcgYSBmaWxlIGNoYW5nZS5cclxuZXhwb3J0IHR5cGUgRmlsZUV2ZW50ID0ge1xyXG4gIC8vIFRoZSBmaWxlJ3MgVVJJLlxyXG4gIHVyaTogc3RyaW5nLFxyXG4gIC8vIFRoZSBjaGFuZ2UgdHlwZS5cclxuICB0eXBlOiBudW1iZXIsXHJcbn07XHJcbiJdfQ==