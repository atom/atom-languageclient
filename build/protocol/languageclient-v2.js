Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileChangeType = exports.MessageType = exports.SymbolKind = exports.DocumentHighlightKind = exports.CompletionItemKind = exports.TextDocumentSyncKind = exports.DiagnosticSeverity = exports.LanguageClientV2 = undefined;

var _vscodeJsonrpc = require('vscode-jsonrpc');

var rpc = _interopRequireWildcard(_vscodeJsonrpc);

var _consoleLogger = require('../loggers/console-logger');

var _consoleLogger2 = _interopRequireDefault(_consoleLogger);

var _nullLogger = require('../loggers/null-logger');

var _nullLogger2 = _interopRequireDefault(_nullLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// Flow-typed wrapper around JSONRPC to implement Microsoft Language Server Protocol v2
// https://github.com/Microsoft/language-server-protocol/blob/master/versions/protocol-2-x.md
let LanguageClientV2 = exports.LanguageClientV2 = class LanguageClientV2 {

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9wcm90b2NvbC9sYW5ndWFnZWNsaWVudC12Mi5qcyJdLCJuYW1lcyI6WyJycGMiLCJMYW5ndWFnZUNsaWVudFYyIiwiY29uc3RydWN0b3IiLCJjb25uZWN0aW9uIiwibG9nZ2VyIiwiX2NvbiIsIl9sb2ciLCJvbkVycm9yIiwiZXJyb3IiLCJvblVuaGFuZGxlZE5vdGlmaWNhdGlvbiIsIm5vdGlmaWNhdGlvbiIsIm1ldGhvZCIsInBhcmFtcyIsIndhcm4iLCJvbk5vdGlmaWNhdGlvbiIsImRlYnVnIiwiYXJndW1lbnRzIiwibGlzdGVuIiwiZGlzcG9zZSIsImluaXRpYWxpemUiLCJfc2VuZFJlcXVlc3QiLCJzaHV0ZG93biIsIm9uQ3VzdG9tIiwiY2FsbGJhY2siLCJfb25Ob3RpZmljYXRpb24iLCJvbkV4aXQiLCJvblNob3dNZXNzYWdlIiwib25TaG93TWVzc2FnZVJlcXVlc3QiLCJfb25SZXF1ZXN0Iiwib25Mb2dNZXNzYWdlIiwib25UZWxlbWV0cnlFdmVudCIsImRpZENoYW5nZUNvbmZpZ3VyYXRpb24iLCJfc2VuZE5vdGlmaWNhdGlvbiIsImRpZE9wZW5UZXh0RG9jdW1lbnQiLCJkaWRDaGFuZ2VUZXh0RG9jdW1lbnQiLCJkaWRDbG9zZVRleHREb2N1bWVudCIsImRpZFNhdmVUZXh0RG9jdW1lbnQiLCJkaWRDaGFuZ2VXYXRjaGVkRmlsZXMiLCJvblB1Ymxpc2hEaWFnbm9zdGljcyIsImNvbXBsZXRpb24iLCJjb21wbGV0aW9uSXRlbVJlc29sdmUiLCJob3ZlciIsInNpZ25hdHVyZUhlbHAiLCJnb3RvRGVmaW5pdGlvbiIsImZpbmRSZWZlcmVuY2VzIiwiZG9jdW1lbnRIaWdobGlnaHQiLCJkb2N1bWVudFN5bWJvbCIsIndvcmtzcGFjZVN5bWJvbCIsImNvZGVBY3Rpb24iLCJjb2RlTGVucyIsImNvZGVMZW5zUmVzb2x2ZSIsImRvY3VtZW50TGluayIsImRvY3VtZW50TGlua1Jlc29sdmUiLCJkb2N1bWVudEZvcm1hdHRpbmciLCJkb2N1bWVudFJhbmdlRm9ybWF0dGluZyIsImRvY3VtZW50T25UeXBlRm9ybWF0dGluZyIsInJlbmFtZSIsInR5cGUiLCJvblJlcXVlc3QiLCJ2YWx1ZSIsImFyZ3MiLCJzZW5kTm90aWZpY2F0aW9uIiwic3RhcnQiLCJwZXJmb3JtYW5jZSIsIm5vdyIsInJlc3VsdCIsInNlbmRSZXF1ZXN0IiwidG9vayIsIk1hdGgiLCJmbG9vciIsImUiLCJEaWFnbm9zdGljU2V2ZXJpdHkiLCJFcnJvciIsIldhcm5pbmciLCJJbmZvcm1hdGlvbiIsIkhpbnQiLCJUZXh0RG9jdW1lbnRTeW5jS2luZCIsIk5vbmUiLCJGdWxsIiwiSW5jcmVtZW50YWwiLCJDb21wbGV0aW9uSXRlbUtpbmQiLCJUZXh0IiwiTWV0aG9kIiwiRnVuY3Rpb24iLCJDb25zdHJ1Y3RvciIsIkZpZWxkIiwiVmFyaWFibGUiLCJDbGFzcyIsIkludGVyZmFjZSIsIk1vZHVsZSIsIlByb3BlcnR5IiwiVW5pdCIsIlZhbHVlIiwiRW51bSIsIktleXdvcmQiLCJTbmlwcGV0IiwiQ29sb3IiLCJGaWxlIiwiUmVmZXJlbmNlIiwiRG9jdW1lbnRIaWdobGlnaHRLaW5kIiwiUmVhZCIsIldyaXRlIiwiU3ltYm9sS2luZCIsIk5hbWVzcGFjZSIsIlBhY2thZ2UiLCJDb25zdGFudCIsIlN0cmluZyIsIk51bWJlciIsIkJvb2xlYW4iLCJBcnJheSIsIk1lc3NhZ2VUeXBlIiwiSW5mbyIsIkxvZyIsIkZpbGVDaGFuZ2VUeXBlIiwiQ3JlYXRlZCIsIkNoYW5nZWQiLCJEZWxldGVkIl0sIm1hcHBpbmdzIjoiOzs7OztBQUVBOztJQUFZQSxHOztBQUNaOzs7O0FBQ0E7Ozs7Ozs7Ozs7QUFFQTtBQUNBO0lBQ2FDLGdCLFdBQUFBLGdCLEdBQU4sTUFBTUEsZ0JBQU4sQ0FBdUI7O0FBSTVCQyxjQUFZQyxVQUFaLEVBQXdDQyxNQUF4QyxFQUE0RTtBQUMxRSxTQUFLQyxJQUFMLEdBQVlGLFVBQVo7QUFDQSxTQUFLRyxJQUFMLEdBQVlGLE1BQVo7O0FBRUFELGVBQVdJLE9B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QUFLNUI7QUFDQUMsV0FBUztBQU5tQixDQUF2Qjs7QUFTUCIsImZpbGUiOiJsYW5ndWFnZWNsaWVudC12Mi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEBmbG93XHJcblxyXG5pbXBvcnQgKiBhcyBycGMgZnJvbSAndnNjb2RlLWpzb25ycGMnO1xyXG5pbXBvcnQgQ29uc29sZUxvZ2dlciBmcm9tICcuLi9sb2dnZXJzL2NvbnNvbGUtbG9nZ2VyJztcclxuaW1wb3J0IE51bGxMb2dnZXIgZnJvbSAnLi4vbG9nZ2Vycy9udWxsLWxvZ2dlcic7XHJcblxyXG4vLyBGbG93LXR5cGVkIHdyYXBwZXIgYXJvdW5kIEpTT05SUEMgdG8gaW1wbGVtZW50IE1pY3Jvc29mdCBMYW5ndWFnZSBTZXJ2ZXIgUHJvdG9jb2wgdjJcclxuLy8gaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9sYW5ndWFnZS1zZXJ2ZXItcHJvdG9jb2wvYmxvYi9tYXN0ZXIvdmVyc2lvbnMvcHJvdG9jb2wtMi14Lm1kXHJcbmV4cG9ydCBjbGFzcyBMYW5ndWFnZUNsaWVudFYyIHtcclxuICBfY29uOiBycGMuY29ubmVjdGlvbjtcclxuICBfbG9nOiBDb25zb2xlTG9nZ2VyIHwgTnVsbExvZ2dlcjtcclxuXHJcbiAgY29uc3RydWN0b3IoY29ubmVjdGlvbjogcnBjLmNvbm5lY3Rpb24sIGxvZ2dlcjogQ29uc29sZUxvZ2dlciB8IE51bGxMb2dnZXIpIHtcclxuICAgIHRoaXMuX2NvbiA9IGNvbm5lY3Rpb247XHJcbiAgICB0aGlzLl9sb2cgPSBsb2dnZXI7XHJcblxyXG4gICAgY29ubmVjdGlvbi5vbkVycm9yKChlcnJvcikgPT4gbG9nZ2VyLmVycm9yKFsncnBjLm9uRXJyb3InLCBlcnJvcl0pKTtcclxuICAgIGNvbm5lY3Rpb24ub25VbmhhbmRsZWROb3RpZmljYXRpb24oKG5vdGlmaWNhdGlvbikgPT4ge1xyXG4gICAgICBpZiAobm90aWZpY2F0aW9uLm1ldGhvZCAhPSBudWxsICYmIG5vdGlmaWNhdGlvbi5wYXJhbXMgIT0gbnVsbCkge1xyXG4gICAgICAgIGxvZ2dlci53YXJuKGBycGMub25VbmhhbmRsZWROb3RpZmljYXRpb24gJHtub3RpZmljYXRpb24ubWV0aG9kfWAsIG5vdGlmaWNhdGlvbi5wYXJhbXMpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxvZ2dlci53YXJuKCdycGMub25VbmhhbmRsZWROb3RpZmljYXRpb24nLCBub3RpZmljYXRpb24pO1xyXG4gICAgICB9O1xyXG4gICAgfSk7XHJcbiAgICBjb25uZWN0aW9uLm9uTm90aWZpY2F0aW9uKCgpID0+IGxvZ2dlci5kZWJ1ZygncnBjLm9uTm90aWZpY2F0aW9uJywgYXJndW1lbnRzKSk7XHJcblxyXG4gICAgY29ubmVjdGlvbi5saXN0ZW4oKTtcclxuICB9XHJcblxyXG4gIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLl9jb24uZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgaW5pdGlhbGl6ZShwYXJhbXM6IEluaXRpYWxpemVQYXJhbXMpOiBQcm9taXNlPEluaXRpYWxpemVSZXN1bHQ+IHtcclxuICAgIHJldHVybiB0aGlzLl9zZW5kUmVxdWVzdCgnaW5pdGlhbGl6ZScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBzaHV0ZG93bigpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHJldHVybiB0aGlzLl9zZW5kUmVxdWVzdCgnc2h1dGRvd24nKTtcclxuICB9XHJcblxyXG4gIG9uQ3VzdG9tKG1ldGhvZDogc3RyaW5nLCBjYWxsYmFjazogT2JqZWN0ID0+IHZvaWQpOiB2b2lkIHtcclxuICAgIHRoaXMuX29uTm90aWZpY2F0aW9uKHttZXRob2Q6IG1ldGhvZH0sIGNhbGxiYWNrKTtcclxuICB9XHJcblxyXG4gIG9uRXhpdChjYWxsYmFjazogKCkgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgdGhpcy5fb25Ob3RpZmljYXRpb24oe21ldGhvZDonZXhpdCd9LCBjYWxsYmFjayk7XHJcbiAgfVxyXG5cclxuICBvblNob3dNZXNzYWdlKGNhbGxiYWNrOiBTaG93TWVzc2FnZVBhcmFtcyA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICB0aGlzLl9vbk5vdGlmaWNhdGlvbih7bWV0aG9kOid3aW5kb3cvc2hvd01lc3NhZ2UnfSwgY2FsbGJhY2spO1xyXG4gIH1cclxuXHJcbiAgb25TaG93TWVzc2FnZVJlcXVlc3QoY2FsbGJhY2s6IFNob3dNZXNzYWdlUmVxdWVzdFBhcmFtcyA9PiBNZXNzYWdlQWN0aW9uSXRlbSk6IHZvaWQge1xyXG4gICAgdGhpcy5fb25SZXF1ZXN0KHttZXRob2Q6J3dpbmRvdy9TaG93TWVzc2FnZVJlcXVlc3QnfSwgY2FsbGJhY2spO1xyXG4gIH1cclxuXHJcbiAgb25Mb2dNZXNzYWdlKGNhbGxiYWNrOiBMb2dNZXNzYWdlUGFyYW1zID0+IHZvaWQpOiB2b2lkIHtcclxuICAgIHRoaXMuX29uTm90aWZpY2F0aW9uKHttZXRob2Q6J3dpbmRvdy9sb2dNZXNzYWdlJ30sIGNhbGxiYWNrKTtcclxuICB9XHJcblxyXG4gIG9uVGVsZW1ldHJ5RXZlbnQoY2FsbGJhY2s6IGFueSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICB0aGlzLl9vbk5vdGlmaWNhdGlvbih7bWV0aG9kOid0ZWxlbWV0cnkvZXZlbnQnfSwgY2FsbGJhY2spO1xyXG4gIH1cclxuXHJcbiAgZGlkQ2hhbmdlQ29uZmlndXJhdGlvbihwYXJhbXM6IERpZENoYW5nZUNvbmZpZ3VyYXRpb25QYXJhbXMpOiB2b2lkIHtcclxuICAgIHRoaXMuX3NlbmROb3RpZmljYXRpb24oJ3dvcmtzcGFjZS9kaWRDaGFuZ2VDb25maWd1cmF0aW9uJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIGRpZE9wZW5UZXh0RG9jdW1lbnQocGFyYW1zOiBEaWRPcGVuVGV4dERvY3VtZW50UGFyYW1zKTogdm9pZCB7XHJcbiAgICB0aGlzLl9zZW5kTm90aWZpY2F0aW9uKCd0ZXh0RG9jdW1lbnQvZGlkT3BlbicsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICBkaWRDaGFuZ2VUZXh0RG9jdW1lbnQocGFyYW1zOiBEaWRDaGFuZ2VUZXh0RG9jdW1lbnRQYXJhbXMpOiB2b2lkIHtcclxuICAgIHRoaXMuX3NlbmROb3RpZmljYXRpb24oJ3RleHREb2N1bWVudC9kaWRDaGFuZ2UnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgZGlkQ2xvc2VUZXh0RG9jdW1lbnQocGFyYW1zOiBEaWRDbG9zZVRleHREb2N1bWVudFBhcmFtcyk6IHZvaWQge1xyXG4gICAgdGhpcy5fc2VuZE5vdGlmaWNhdGlvbigndGV4dERvY3VtZW50L2RpZENsb3NlJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIGRpZFNhdmVUZXh0RG9jdW1lbnQocGFyYW1zOiBEaWRTYXZlVGV4dERvY3VtZW50UGFyYW1zKTogdm9pZCB7XHJcbiAgICB0aGlzLl9zZW5kTm90aWZpY2F0aW9uKCd0ZXh0RG9jdW1lbnQvZGlkU2F2ZScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICBkaWRDaGFuZ2VXYXRjaGVkRmlsZXMocGFyYW1zOiBEaWRDaGFuZ2VXYXRjaGVkRmlsZXNQYXJhbXMpOiB2b2lkIHtcclxuICAgIHRoaXMuX3NlbmROb3RpZmljYXRpb24oJ3dvcmtzcGFjZS9kaWRDaGFuZ2VXYXRjaGVkRmlsZXMnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgb25QdWJsaXNoRGlhZ25vc3RpY3MoY2FsbGJhY2s6IFB1Ymxpc2hEaWFnbm9zdGljc1BhcmFtcyA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICB0aGlzLl9vbk5vdGlmaWNhdGlvbih7bWV0aG9kOid0ZXh0RG9jdW1lbnQvcHVibGlzaERpYWdub3N0aWNzJ30sIGNhbGxiYWNrKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGNvbXBsZXRpb24ocGFyYW1zOiBUZXh0RG9jdW1lbnRQb3NpdGlvblBhcmFtcyk6IFByb21pc2U8QXJyYXk8Q29tcGxldGlvbkl0ZW0+IHwgQ29tcGxldGlvbkxpc3Q+IHtcclxuICAgIHJldHVybiB0aGlzLl9zZW5kUmVxdWVzdCgndGV4dERvY3VtZW50L2NvbXBsZXRpb24nLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgY29tcGxldGlvbkl0ZW1SZXNvbHZlKHBhcmFtczogQ29tcGxldGlvbkl0ZW0pOiBQcm9taXNlPENvbXBsZXRpb25JdGVtPiB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2VuZFJlcXVlc3QoJ2NvbXBsZXRpb25JdGVtL3Jlc29sdmUnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgaG92ZXIocGFyYW1zOiBUZXh0RG9jdW1lbnRQb3NpdGlvblBhcmFtcyk6IFByb21pc2U8SG92ZXI+IHtcclxuICAgIHJldHVybiB0aGlzLl9zZW5kUmVxdWVzdCgndGV4dERvY3VtZW50L2hvdmVyJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIHNpZ25hdHVyZUhlbHAocGFyYW1zOiBUZXh0RG9jdW1lbnRQb3NpdGlvblBhcmFtcyk6IFByb21pc2U8U2lnbmF0dXJlSGVscD4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NlbmRSZXF1ZXN0KCd0ZXh0RG9jdW1lbnQvc2lnbmF0dXJlSGVscCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBnb3RvRGVmaW5pdGlvbihwYXJhbXM6IFRleHREb2N1bWVudFBvc2l0aW9uUGFyYW1zKTogUHJvbWlzZTxMb2NhdGlvbiB8IEFycmF5PExvY2F0aW9uPj4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NlbmRSZXF1ZXN0KCd0ZXh0RG9jdW1lbnQvZGVmaW5pdGlvbicsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBmaW5kUmVmZXJlbmNlcyhwYXJhbXM6IFRleHREb2N1bWVudFBvc2l0aW9uUGFyYW1zKTogUHJvbWlzZTxBcnJheTxMb2NhdGlvbj4+IHtcclxuICAgIHJldHVybiB0aGlzLl9zZW5kUmVxdWVzdCgndGV4dERvY3VtZW50L3JlZmVyZW5jZXMnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZG9jdW1lbnRIaWdobGlnaHQocGFyYW1zOiBUZXh0RG9jdW1lbnRQb3NpdGlvblBhcmFtcyk6IFByb21pc2U8QXJyYXk8RG9jdW1lbnRIaWdobGlnaHQ+PiB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2VuZFJlcXVlc3QoJ3RleHREb2N1bWVudC9kb2N1bWVudEhpZ2hsaWdodCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBkb2N1bWVudFN5bWJvbChwYXJhbXM6IERvY3VtZW50U3ltYm9sUGFyYW1zKTogUHJvbWlzZTxBcnJheTxTeW1ib2xJbmZvcm1hdGlvbj4+IHtcclxuICAgIHJldHVybiB0aGlzLl9zZW5kUmVxdWVzdCgndGV4dERvY3VtZW50L2RvY3VtZW50U3ltYm9sJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIHdvcmtzcGFjZVN5bWJvbChwYXJhbXM6IFdvcmtzcGFjZVN5bWJvbFBhcmFtcyk6IFByb21pc2U8QXJyYXk8U3ltYm9sSW5mb3JtYXRpb24+PiB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2VuZFJlcXVlc3QoJ3dvcmtzcGFjZS9zeW1ib2wnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgY29kZUFjdGlvbihwYXJhbXM6IENvZGVBY3Rpb25QYXJhbXMpOiBQcm9taXNlPEFycmF5PENvbW1hbmQ+PiB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2VuZFJlcXVlc3QoJ3RleHREb2N1bWVudC9jb2RlQWN0aW9uJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGNvZGVMZW5zKHBhcmFtczogQ29kZUxlbnNQYXJhbXMpOiBQcm9taXNlPEFycmF5PENvZGVMZW5zPj4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NlbmRSZXF1ZXN0KCd0ZXh0RG9jdW1lbnQvY29kZUxlbnMnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgY29kZUxlbnNSZXNvbHZlKHBhcmFtczogQ29kZUxlbnMpOiBQcm9taXNlPEFycmF5PENvZGVMZW5zPj4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NlbmRSZXF1ZXN0KCdjb2RlTGVucy9yZXNvbHZlJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGRvY3VtZW50TGluayhwYXJhbXM6IERvY3VtZW50TGlua1BhcmFtcyk6IFByb21pc2U8QXJyYXk8RG9jdW1lbnRMaW5rPj4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NlbmRSZXF1ZXN0KCd0ZXh0RG9jdW1lbnQvZG9jdW1lbnRMaW5rJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGRvY3VtZW50TGlua1Jlc29sdmUocGFyYW1zOiBEb2N1bWVudExpbmspOiBQcm9taXNlPERvY3VtZW50TGluaz4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NlbmRSZXF1ZXN0KCdkb2N1bWVudExpbmsvcmVzb2x2ZScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBkb2N1bWVudEZvcm1hdHRpbmcocGFyYW1zOiBEb2N1bWVudEZvcm1hdHRpbmdQYXJhbXMpOiBQcm9taXNlPEFycmF5PFRleHRFZGl0Pj4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NlbmRSZXF1ZXN0KCd0ZXh0RG9jdW1lbnQvZm9ybWF0dGluZycsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBkb2N1bWVudFJhbmdlRm9ybWF0dGluZyhwYXJhbXM6IERvY3VtZW50UmFuZ2VGb3JtYXR0aW5nUGFyYW1zKTogUHJvbWlzZTxBcnJheTxUZXh0RWRpdD4+IHtcclxuICAgIHJldHVybiB0aGlzLl9zZW5kUmVxdWVzdCgndGV4dERvY3VtZW50L3JhbmdlRm9ybWF0dGluZycsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBkb2N1bWVudE9uVHlwZUZvcm1hdHRpbmcocGFyYW1zOiBEb2N1bWVudE9uVHlwZUZvcm1hdHRpbmdQYXJhbXMpOiBQcm9taXNlPEFycmF5PFRleHRFZGl0Pj4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NlbmRSZXF1ZXN0KCd0ZXh0RG9jdW1lbnQvb25UeXBlRm9ybWF0dGluZycsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICBhc3luYyByZW5hbWUocGFyYW1zOiBSZW5hbWVQYXJhbXMpOiBQcm9taXNlPFdvcmtzcGFjZUVkaXQ+IHtcclxuICAgIHJldHVybiB0aGlzLl9zZW5kUmVxdWVzdCgndGV4dERvY3VtZW50L3JlbmFtZScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICBfb25SZXF1ZXN0KHR5cGU6IHttZXRob2Q6IHN0cmluZ30sIGNhbGxiYWNrOiBPYmplY3QgPT4gT2JqZWN0KTogdm9pZCB7XHJcbiAgICB0aGlzLl9jb24ub25SZXF1ZXN0KHR5cGUsIHZhbHVlID0+IHtcclxuICAgICAgdGhpcy5fbG9nLmRlYnVnKGBycGMub25SZXF1ZXN0ICR7dHlwZS5tZXRob2R9YCwgdmFsdWUpO1xyXG4gICAgICByZXR1cm4gY2FsbGJhY2sodmFsdWUpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBfb25Ob3RpZmljYXRpb24odHlwZToge21ldGhvZDogc3RyaW5nfSwgY2FsbGJhY2s6IE9iamVjdCA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICB0aGlzLl9jb24ub25Ob3RpZmljYXRpb24odHlwZSwgdmFsdWUgPT4ge1xyXG4gICAgICB0aGlzLl9sb2cuZGVidWcoYHJwYy5vbk5vdGlmaWNhdGlvbiAke3R5cGUubWV0aG9kfWAsIHZhbHVlKTtcclxuICAgICAgY2FsbGJhY2sodmFsdWUpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBfc2VuZE5vdGlmaWNhdGlvbihtZXRob2Q6IHN0cmluZywgYXJncz86IE9iamVjdCk6IHZvaWQge1xyXG4gICAgdGhpcy5fbG9nLmRlYnVnKGBycGMuc2VuZE5vdGlmaWNhdGlvbiAke21ldGhvZH1gLCBhcmdzKTtcclxuICAgIHRoaXMuX2Nvbi5zZW5kTm90aWZpY2F0aW9uKG1ldGhvZCwgYXJncyk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBfc2VuZFJlcXVlc3QobWV0aG9kOiBzdHJpbmcsIGFyZ3M/OiBPYmplY3QpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgdGhpcy5fbG9nLmRlYnVnKGBycGMuc2VuZFJlcXVlc3QgJHttZXRob2R9IHNlbmRpbmdgLCBhcmdzKTtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2Nvbi5zZW5kUmVxdWVzdChtZXRob2QsIGFyZ3MpO1xyXG4gICAgICBjb25zdCB0b29rID0gcGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydDtcclxuICAgICAgdGhpcy5fbG9nLmRlYnVnKGBycGMuc2VuZFJlcXVlc3QgJHttZXRob2R9IHJlY2VpdmVkICgke01hdGguZmxvb3IodG9vayl9bXMpYCwgcmVzdWx0KTtcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgdGhpcy5fbG9nLmVycm9yKGBycGMuc2VuZFJlcXVlc3QgJHttZXRob2R9IHRocmV3YCwgZSk7XHJcbiAgICAgIHRocm93IGU7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyBTdHJ1Y3R1cmVzXHJcblxyXG5leHBvcnQgdHlwZSBQb3NpdGlvbiA9IHtcclxuICAvLyBMaW5lIHBvc2l0aW9uIGluIGEgZG9jdW1lbnQgKHplcm8tYmFzZWQpLlxyXG4gIGxpbmU6IG51bWJlcixcclxuICAvLyBDaGFyYWN0ZXIgb2Zmc2V0IG9uIGEgbGluZSBpbiBhIGRvY3VtZW50ICh6ZXJvLWJhc2VkKS5cclxuICBjaGFyYWN0ZXI6IG51bWJlcixcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFJhbmdlID0ge1xyXG4gIC8vIFRoZSByYW5nZSdzIHN0YXJ0IHBvc2l0aW9uLlxyXG4gIHN0YXJ0OiBQb3NpdGlvbixcclxuICAvLyBUaGUgcmFuZ2UncyBlbmQgcG9zaXRpb24uXHJcbiAgZW5kOiBQb3NpdGlvbixcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIExvY2F0aW9uID0ge1xyXG4gIC8vIFRoZSBsb2NhdGlvbidzIFVSSS5cclxuICB1cmk6IHN0cmluZyxcclxuICAvLyBUaGUgcG9zaXRpb24gd2l0aGluIHRoZSBVUkkuXHJcbiAgcmFuZ2U6IFJhbmdlLFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgRGlhZ25vc3RpYyA9IHtcclxuICAvLyBUaGUgcmFuZ2UgYXQgd2hpY2ggdGhlIG1lc3NhZ2UgYXBwbGllcy5cclxuICByYW5nZTogUmFuZ2UsXHJcbiAgLy8gVGhlIGRpYWdub3N0aWMncyBzZXZlcml0eS4gQ2FuIGJlIG9taXR0ZWQuIElmIG9taXR0ZWQgaXQgaXMgdXAgdG8gdGhlXHJcbiAgLy8gY2xpZW50IHRvIGludGVycHJldCBkaWFnbm9zdGljcyBhcyBlcnJvciwgd2FybmluZywgaW5mbyBvciBoaW50LlxyXG4gIHNldmVyaXR5PzogbnVtYmVyLFxyXG4gIC8vIFRoZSBkaWFnbm9zdGljJ3MgY29kZS4gQ2FuIGJlIG9taXR0ZWQuXHJcbiAgY29kZT86IG51bWJlciB8IHN0cmluZyxcclxuICAvLyBBIGh1bWFuLXJlYWRhYmxlIHN0cmluZyBkZXNjcmliaW5nIHRoZSBzb3VyY2Ugb2YgdGhpc1xyXG4gIC8vIGRpYWdub3N0aWMsIGUuZy4gJ3R5cGVzY3JpcHQnIG9yICdzdXBlciBsaW50Jy5cclxuICBzb3VyY2U/OiBzdHJpbmcsXHJcbiAgLy8gVGhlIGRpYWdub3N0aWMncyBtZXNzYWdlLlxyXG4gIG1lc3NhZ2U6IHN0cmluZyxcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBEaWFnbm9zdGljU2V2ZXJpdHkgPSB7XHJcbiAgLy8gUmVwb3J0cyBhbiBlcnJvci5cclxuICBFcnJvcjogMSxcclxuICAvLyBSZXBvcnRzIGEgd2FybmluZy5cclxuICBXYXJuaW5nOiAyLFxyXG4gIC8vIFJlcG9ydHMgYW4gaW5mb3JtYXRpb24uXHJcbiAgSW5mb3JtYXRpb246IDMsXHJcbiAgLy8gUmVwb3J0cyBhIGhpbnQuXHJcbiAgSGludDogNCxcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIENvbW1hbmQgPSB7XHJcbiAgLy8gVGl0bGUgb2YgdGhlIGNvbW1hbmQsIGxpa2UgYHNhdmVgLlxyXG4gIHRpdGxlOiBzdHJpbmcsXHJcbiAgLy8gVGhlIGlkZW50aWZpZXIgb2YgdGhlIGFjdHVhbCBjb21tYW5kIGhhbmRsZXIuXHJcbiAgY29tbWFuZDogc3RyaW5nLFxyXG4gIC8vIEFyZ3VtZW50cyB0aGF0IHRoZSBjb21tYW5kIGhhbmRsZXIgc2hvdWxkIGJlIGludm9rZWQgd2l0aC5cclxuICBhcmd1bWVudHM/OiBhbnlbXSxcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFRleHRFZGl0ID0ge1xyXG4gIC8vIFRoZSByYW5nZSBvZiB0aGUgdGV4dCBkb2N1bWVudCB0byBiZSBtYW5pcHVsYXRlZC4gVG8gaW5zZXJ0XHJcbiAgLy8gdGV4dCBpbnRvIGEgZG9jdW1lbnQgY3JlYXRlIGEgcmFuZ2Ugd2hlcmUgc3RhcnQgPT09IGVuZC5cclxuICByYW5nZTogUmFuZ2UsXHJcbiAgLy8gVGhlIHN0cmluZyB0byBiZSBpbnNlcnRlZC4gRm9yIGRlbGV0ZSBvcGVyYXRpb25zIHVzZSBhbiBlbXB0eSBzdHJpbmcuXHJcbiAgbmV3VGV4dDogc3RyaW5nLFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgV29ya3NwYWNlRWRpdCA9IHtcclxuICAvLyBIb2xkcyBjaGFuZ2VzIHRvIGV4aXN0aW5nIHJlc291cmNlcy5cclxuICBjaGFuZ2VzOiB7IFt1cmk6IHN0cmluZ106IFRleHRFZGl0W10gfSxcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFRleHREb2N1bWVudElkZW50aWZpZXIgPSB7XHJcbiAgLy8gVGhlIHRleHQgZG9jdW1lbnQncyBVUkkuXHJcbiAgdXJpOiBzdHJpbmcsXHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBUZXh0RG9jdW1lbnRJdGVtID0ge1xyXG4gIC8vIFRoZSB0ZXh0IGRvY3VtZW50J3MgVVJJLlxyXG4gIHVyaTogc3RyaW5nLFxyXG4gIC8vIFRoZSB0ZXh0IGRvY3VtZW50J3MgbGFuZ3VhZ2UgaWRlbnRpZmllci5cclxuICBsYW5ndWFnZUlkOiBzdHJpbmcsXHJcbiAgLy8gVGhlIHZlcnNpb24gbnVtYmVyIG9mIHRoaXMgZG9jdW1lbnQgKGl0IHdpbGwgc3RyaWN0bHkgaW5jcmVhc2UgYWZ0ZXIgZWFjaFxyXG4gIC8vIGNoYW5nZSwgaW5jbHVkaW5nIHVuZG8vcmVkbykuXHJcbiAgdmVyc2lvbjogbnVtYmVyLFxyXG4gIC8vIFRoZSBjb250ZW50IG9mIHRoZSBvcGVuZWQgdGV4dCBkb2N1bWVudC5cclxuICB0ZXh0OiBzdHJpbmcsXHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBWZXJzaW9uZWRUZXh0RG9jdW1lbnRJZGVudGlmaWVyID0gVGV4dERvY3VtZW50SWRlbnRpZmllciAmIHtcclxuICAvLyBUaGUgdmVyc2lvbiBudW1iZXIgb2YgdGhpcyBkb2N1bWVudC5cclxuICB2ZXJzaW9uOiBudW1iZXIsXHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBUZXh0RG9jdW1lbnRQb3NpdGlvblBhcmFtcyA9IHtcclxuICAvLyBUaGUgdGV4dCBkb2N1bWVudC5cclxuICB0ZXh0RG9jdW1lbnQ6IFRleHREb2N1bWVudElkZW50aWZpZXIsXHJcbiAgLy8gVGhlIHBvc2l0aW9uIGluc2lkZSB0aGUgdGV4dCBkb2N1bWVudC5cclxuICBwb3NpdGlvbjogUG9zaXRpb24sXHJcbn07XHJcblxyXG4vLyBHZW5lcmFsXHJcblxyXG5leHBvcnQgdHlwZSBJbml0aWFsaXplUGFyYW1zID0ge1xyXG4gIC8vICBUaGUgcHJvY2VzcyBJZCBvZiB0aGUgcGFyZW50IHByb2Nlc3MgdGhhdCBzdGFydGVkXHJcbiAgLy8gIHRoZSBzZXJ2ZXIuIElzIG51bGwgaWYgdGhlIHByb2Nlc3MgaGFzIG5vdCBiZWVuIHN0YXJ0ZWQgYnkgYW5vdGhlciBwcm9jZXNzLlxyXG4gIC8vICBJZiB0aGUgcGFyZW50IHByb2Nlc3MgaXMgbm90IGFsaXZlIHRoZW4gdGhlIHNlcnZlciBzaG91bGQgZXhpdFxyXG4gIC8vIChzZWUgZXhpdCBub3RpZmljYXRpb24pIGl0cyBwcm9jZXNzLlxyXG4gIHByb2Nlc3NJZD86ID9udW1iZXIsXHJcbiAgLy8gIFRoZSByb290UGF0aCBvZiB0aGUgd29ya3NwYWNlLiBJcyBudWxsIGlmIG5vIGZvbGRlciBpcyBvcGVuLlxyXG4gIHJvb3RQYXRoPzogP3N0cmluZyxcclxuICAvLyAgVXNlciBwcm92aWRlZCBpbml0aWFsaXphdGlvbiBvcHRpb25zLlxyXG4gIGluaXRpYWxpemF0aW9uT3B0aW9ucz86IGFueSxcclxuICAvLyAgVGhlIGNhcGFiaWxpdGllcyBwcm92aWRlZCBieSB0aGUgY2xpZW50IChlZGl0b3IpXHJcbiAgY2FwYWJpbGl0aWVzOiBDbGllbnRDYXBhYmlsaXRpZXMsXHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBDbGllbnRDYXBhYmlsaXRpZXMgPSB7XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBJbml0aWFsaXplUmVzdWx0ID0ge1xyXG4gIC8vICBUaGUgY2FwYWJpbGl0aWVzIHRoZSBsYW5ndWFnZSBzZXJ2ZXIgcHJvdmlkZXMuXHJcbiAgY2FwYWJpbGl0aWVzOiBTZXJ2ZXJDYXBhYmlsaXRpZXMsXHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBJbml0aWFsaXplRXJyb3IgPSB7XHJcbiAgLy8gIEluZGljYXRlcyB3aGV0aGVyIHRoZSBjbGllbnQgc2hvdWxkIHJldHJ5IHRvIHNlbmQgdGhlXHJcbiAgLy8gIGluaXRpbGl6ZSByZXF1ZXN0IGFmdGVyIHNob3dpbmcgdGhlIG1lc3NhZ2UgcHJvdmlkZWRcclxuICAvLyAgaW4gdGhlIFJlc3BvbnNlRXJyb3IuXHJcbiAgcmV0cnk6IGJvb2xlYW4sXHJcbn07XHJcblxyXG4vLyBEZWZpbmVzIGhvdyB0aGUgaG9zdCAoZWRpdG9yKSBzaG91bGQgc3luYyBkb2N1bWVudCBjaGFuZ2VzIHRvIHRoZSBsYW5ndWFnZSBzZXJ2ZXIuXHJcbmV4cG9ydCBjb25zdCBUZXh0RG9jdW1lbnRTeW5jS2luZCA9IHtcclxuICAvLyAgRG9jdW1lbnRzIHNob3VsZCBub3QgYmUgc3luY2VkIGF0IGFsbC5cclxuICBOb25lOiAwLFxyXG4gIC8vICBEb2N1bWVudHMgYXJlIHN5bmNlZCBieSBhbHdheXMgc2VuZGluZyB0aGUgZnVsbCBjb250ZW50IG9mIHRoZSBkb2N1bWVudC5cclxuICBGdWxsOiAxLFxyXG4gIC8vICBEb2N1bWVudHMgYXJlIHN5bmNlZCBieSBzZW5kaW5nIHRoZSBmdWxsIGNvbnRlbnQgb24gb3Blbi4gQWZ0ZXIgdGhhdCBvbmx5IGluY3JlbWVudGFsXHJcbiAgLy8gIHVwZGF0ZXMgdG8gdGhlIGRvY3VtZW50IGFyZSBzZW50LlxyXG4gIEluY3JlbWVudGFsOiAyLFxyXG59O1xyXG5cclxuLy8gQ29tcGxldGlvbiBvcHRpb25zLlxyXG5leHBvcnQgdHlwZSBDb21wbGV0aW9uT3B0aW9ucyA9IHtcclxuICAvLyBUaGUgc2VydmVyIHByb3ZpZGVzIHN1cHBvcnQgdG8gcmVzb2x2ZSBhZGRpdGlvbmFsIGluZm9ybWF0aW9uIGZvciBhIGNvbXBsZXRpb24gaXRlbS5cclxuICByZXNvbHZlUHJvdmlkZXI/OiBib29sZWFuLFxyXG4gIC8vIFRoZSBjaGFyYWN0ZXJzIHRoYXQgdHJpZ2dlciBjb21wbGV0aW9uIGF1dG9tYXRpY2FsbHkuXHJcbiAgdHJpZ2dlckNoYXJhY3RlcnM/OiBzdHJpbmdbXSxcclxufTtcclxuXHJcbi8vIFNpZ25hdHVyZSBoZWxwIG9wdGlvbnMuXHJcbmV4cG9ydCB0eXBlIFNpZ25hdHVyZUhlbHBPcHRpb25zID0ge1xyXG4gIC8vIFRoZSBjaGFyYWN0ZXJzIHRoYXQgdHJpZ2dlciBzaWduYXR1cmUgaGVscCBhdXRvbWF0aWNhbGx5LlxyXG4gIHRyaWdnZXJDaGFyYWN0ZXJzPzogc3RyaW5nW10sXHJcbn07XHJcblxyXG4vLyBDb2RlIExlbnMgb3B0aW9ucy5cclxuZXhwb3J0IHR5cGUgQ29kZUxlbnNPcHRpb25zID0ge1xyXG4gIC8vIENvZGUgbGVucyBoYXMgYSByZXNvbHZlIHByb3ZpZGVyIGFzIHdlbGwuXHJcbiAgcmVzb2x2ZVByb3ZpZGVyPzogYm9vbGVhbixcclxufTtcclxuXHJcbi8vIEZvcm1hdCBkb2N1bWVudCBvbiB0eXBlIG9wdGlvbnNcclxuZXhwb3J0IHR5cGUgRG9jdW1lbnRPblR5cGVGb3JtYXR0aW5nT3B0aW9ucyA9IHtcclxuICAvLyBBIGNoYXJhY3RlciBvbiB3aGljaCBmb3JtYXR0aW5nIHNob3VsZCBiZSB0cmlnZ2VyZWQsIGxpa2UgYH07YC5cclxuICBmaXJzdFRyaWdnZXJDaGFyYWN0ZXI6IHN0cmluZyxcclxuICAvLyBNb3JlIHRyaWdnZXIgY2hhcmFjdGVycy5cclxuICBtb3JlVHJpZ2dlckNoYXJhY3Rlcj86IHN0cmluZ1tdLFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgU2VydmVyQ2FwYWJpbGl0aWVzID0ge1xyXG4gIC8vIERlZmluZXMgaG93IHRleHQgZG9jdW1lbnRzIGFyZSBzeW5jZWQuXHJcbiAgdGV4dERvY3VtZW50U3luYz86IG51bWJlcixcclxuICAvLyBUaGUgc2VydmVyIHByb3ZpZGVzIGhvdmVyIHN1cHBvcnQuXHJcbiAgaG92ZXJQcm92aWRlcj86IGJvb2xlYW4sXHJcbiAgLy8gVGhlIHNlcnZlciBwcm92aWRlcyBjb21wbGV0aW9uIHN1cHBvcnQuXHJcbiAgY29tcGxldGlvblByb3ZpZGVyPzogQ29tcGxldGlvbk9wdGlvbnMsXHJcbiAgLy8gVGhlIHNlcnZlciBwcm92aWRlcyBzaWduYXR1cmUgaGVscCBzdXBwb3J0LlxyXG4gIHNpZ25hdHVyZUhlbHBQcm92aWRlcj86IFNpZ25hdHVyZUhlbHBPcHRpb25zLFxyXG4gIC8vIFRoZSBzZXJ2ZXIgcHJvdmlkZXMgZ290byBkZWZpbml0aW9uIHN1cHBvcnQuXHJcbiAgZGVmaW5pdGlvblByb3ZpZGVyPzogYm9vbGVhbixcclxuICAvLyBUaGUgc2VydmVyIHByb3ZpZGVzIGZpbmQgcmVmZXJlbmNlcyBzdXBwb3J0LlxyXG4gIHJlZmVyZW5jZXNQcm92aWRlcj86IGJvb2xlYW4sXHJcbiAgLy8gVGhlIHNlcnZlciBwcm92aWRlcyBkb2N1bWVudCBoaWdobGlnaHQgc3VwcG9ydC5cclxuICBkb2N1bWVudEhpZ2hsaWdodFByb3ZpZGVyPzogYm9vbGVhbixcclxuICAvLyBUaGUgc2VydmVyIHByb3ZpZGVzIGRvY3VtZW50IHN5bWJvbCBzdXBwb3J0LlxyXG4gIGRvY3VtZW50U3ltYm9sUHJvdmlkZXI/OiBib29sZWFuLFxyXG4gIC8vIFRoZSBzZXJ2ZXIgcHJvdmlkZXMgd29ya3NwYWNlIHN5bWJvbCBzdXBwb3J0LlxyXG4gIHdvcmtzcGFjZVN5bWJvbFByb3ZpZGVyPzogYm9vbGVhbixcclxuICAvLyBUaGUgc2VydmVyIHByb3ZpZGVzIGNvZGUgYWN0aW9ucy5cclxuICBjb2RlQWN0aW9uUHJvdmlkZXI/OiBib29sZWFuLFxyXG4gIC8vIFRoZSBzZXJ2ZXIgcHJvdmlkZXMgY29kZSBsZW5zLlxyXG4gIGNvZGVMZW5zUHJvdmlkZXI/OiBDb2RlTGVuc09wdGlvbnMsXHJcbiAgLy8gVGhlIHNlcnZlciBwcm92aWRlcyBkb2N1bWVudCBmb3JtYXR0aW5nLlxyXG4gIGRvY3VtZW50Rm9ybWF0dGluZ1Byb3ZpZGVyPzogYm9vbGVhbixcclxuICAvLyBUaGUgc2VydmVyIHByb3ZpZGVzIGRvY3VtZW50IHJhbmdlIGZvcm1hdHRpbmcuXHJcbiAgZG9jdW1lbnRSYW5nZUZvcm1hdHRpbmdQcm92aWRlcj86IGJvb2xlYW4sXHJcbiAgLy8gVGhlIHNlcnZlciBwcm92aWRlcyBkb2N1bWVudCBmb3JtYXR0aW5nIG9uIHR5cGluZy5cclxuICBkb2N1bWVudE9uVHlwZUZvcm1hdHRpbmdQcm92aWRlcj86IERvY3VtZW50T25UeXBlRm9ybWF0dGluZ09wdGlvbnMsXHJcbiAgLy8gVGhlIHNlcnZlciBwcm92aWRlcyByZW5hbWUgc3VwcG9ydC5cclxuICByZW5hbWVQcm92aWRlcj86IGJvb2xlYW4sXHJcbn07XHJcblxyXG4vLyBEb2N1bWVudFxyXG5cclxuZXhwb3J0IHR5cGUgUHVibGlzaERpYWdub3N0aWNzUGFyYW1zID0ge1xyXG4gIC8vIFRoZSBVUkkgZm9yIHdoaWNoIGRpYWdub3N0aWMgaW5mb3JtYXRpb24gaXMgcmVwb3J0ZWQuXHJcbiAgdXJpOiBzdHJpbmcsXHJcbiAgIC8vIEFuIGFycmF5IG9mIGRpYWdub3N0aWMgaW5mb3JtYXRpb24gaXRlbXMuXHJcbiAgZGlhZ25vc3RpY3M6IERpYWdub3N0aWNbXSxcclxufTtcclxuXHJcbi8vIFJlcHJlc2VudHMgYSBjb2xsZWN0aW9uIG9mIFtjb21wbGV0aW9uIGl0ZW1zXSgjQ29tcGxldGlvbkl0ZW0pIHRvIGJlIHByZXNlbnRlZCBpbiB0aGUgZWRpdG9yLlxyXG5leHBvcnQgdHlwZSBDb21wbGV0aW9uTGlzdCA9IHtcclxuICAvLyBUaGlzIGxpc3QgaXQgbm90IGNvbXBsZXRlLiBGdXJ0aGVyIHR5cGluZyBzaG91bGQgcmVzdWx0IGluIHJlY29tcHV0aW5nIHRoaXMgbGlzdC5cclxuICBpc0luY29tcGxldGU6IGJvb2xlYW4sXHJcbiAgLy8gVGhlIGNvbXBsZXRpb24gaXRlbXMuXHJcbiAgaXRlbXM6IENvbXBsZXRpb25JdGVtW10sXHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBDb21wbGV0aW9uSXRlbSA9IHtcclxuICAvLyAgVGhlIGxhYmVsIG9mIHRoaXMgY29tcGxldGlvbiBpdGVtLiBCeSBkZWZhdWx0XHJcbiAgLy8gIGFsc28gdGhlIHRleHQgdGhhdCBpcyBpbnNlcnRlZCB3aGVuIHNlbGVjdGluZ1xyXG4gIC8vICB0aGlzIGNvbXBsZXRpb24uXHJcbiAgbGFiZWw6IHN0cmluZyxcclxuICAvLyBUaGUga2luZCBvZiB0aGlzIGNvbXBsZXRpb24gaXRlbS4gQmFzZWQgb2YgdGhlIGtpbmQgYW4gaWNvbiBpcyBjaG9zZW4gYnkgdGhlIGVkaXRvci5cclxuICBraW5kPzogbnVtYmVyLFxyXG4gIC8vIEEgaHVtYW4tcmVhZGFibGUgc3RyaW5nIHdpdGggYWRkaXRpb25hbCBpbmZvcm1hdGlvblxyXG4gIC8vIGFib3V0IHRoaXMgaXRlbSwgbGlrZSB0eXBlIG9yIHN5bWJvbCBpbmZvcm1hdGlvbi5cclxuICBkZXRhaWw/OiBzdHJpbmcsXHJcbiAgLy8gQSBodW1hbi1yZWFkYWJsZSBzdHJpbmcgdGhhdCByZXByZXNlbnRzIGEgZG9jLWNvbW1lbnQuXHJcbiAgZG9jdW1lbnRhdGlvbj86IHN0cmluZyxcclxuICAvLyAgQSBzdHJpbmcgdGhhdCBzaG91ZCBiZSB1c2VkIHdoZW4gY29tcGFyaW5nIHRoaXMgaXRlbVxyXG4gIC8vICB3aXRoIG90aGVyIGl0ZW1zLiBXaGVuIGBmYWxzeWAgdGhlIGxhYmVsIGlzIHVzZWQuXHJcbiAgc29ydFRleHQ/OiBzdHJpbmcsXHJcbiAgLy8gIEEgc3RyaW5nIHRoYXQgc2hvdWxkIGJlIHVzZWQgd2hlbiBmaWx0ZXJpbmcgYSBzZXQgb2ZcclxuICAvLyAgY29tcGxldGlvbiBpdGVtcy4gV2hlbiBgZmFsc3lgIHRoZSBsYWJlbCBpcyB1c2VkLlxyXG4gIGZpbHRlclRleHQ/OiBzdHJpbmcsXHJcbiAgLy8gIEEgc3RyaW5nIHRoYXQgc2hvdWxkIGJlIGluc2VydGVkIGEgZG9jdW1lbnQgd2hlbiBzZWxlY3RpbmdcclxuICAvLyAgdGhpcyBjb21wbGV0aW9uLiBXaGVuIGBmYWxzeWAgdGhlIGxhYmVsIGlzIHVzZWQuXHJcbiAgaW5zZXJ0VGV4dD86IHN0cmluZyxcclxuICAvLyAgQW4gZWRpdCB3aGljaCBpcyBhcHBsaWVkIHRvIGEgZG9jdW1lbnQgd2hlbiBzZWxlY3RpbmdcclxuICAvLyAgdGhpcyBjb21wbGV0aW9uLiBXaGVuIGFuIGVkaXQgaXMgcHJvdmlkZWQgdGhlIHZhbHVlIG9mXHJcbiAgLy8gIGluc2VydFRleHQgaXMgaWdub3JlZC5cclxuICB0ZXh0RWRpdD86IFRleHRFZGl0LFxyXG4gIC8vICBBbiBvcHRpb25hbCBhcnJheSBvZiBhZGRpdGlvbmFsIHRleHQgZWRpdHMgdGhhdCBhcmUgYXBwbGllZCB3aGVuXHJcbiAgLy8gIHNlbGVjdGluZyB0aGlzIGNvbXBsZXRpb24uIEVkaXRzIG11c3Qgbm90IG92ZXJsYXAgd2l0aCB0aGUgbWFpbiBlZGl0XHJcbiAgLy8gIG5vciB3aXRoIHRoZW1zZWx2ZXMuXHJcbiAgYWRkaXRpb25hbFRleHRFZGl0cz86IFRleHRFZGl0W10sXHJcbiAgLy8gIEFuIG9wdGlvbmFsIGNvbW1hbmQgdGhhdCBpcyBleGVjdXRlZCAqYWZ0ZXIqIGluc2VydGluZyB0aGlzIGNvbXBsZXRpb24uICpOb3RlKiB0aGF0XHJcbiAgLy8gIGFkZGl0aW9uYWwgbW9kaWZpY2F0aW9ucyB0byB0aGUgY3VycmVudCBkb2N1bWVudCBzaG91bGQgYmUgZGVzY3JpYmVkIHdpdGggdGhlXHJcbiAgLy8gIGFkZGl0aW9uYWxUZXh0RWRpdHMtcHJvcGVydHkuXHJcbiAgY29tbWFuZD86IENvbW1hbmQsXHJcbiAgLy8gIEFuIGRhdGEgZW50cnkgZmllbGQgdGhhdCBpcyBwcmVzZXJ2ZWQgb24gYSBjb21wbGV0aW9uIGl0ZW0gYmV0d2VlblxyXG4gIC8vICBhIGNvbXBsZXRpb24gYW5kIGEgY29tcGxldGlvbiByZXNvbHZlIHJlcXVlc3QuXHJcbiAgZGF0YT86IGFueSxcclxufTtcclxuXHJcbi8vIFRoZSBraW5kIG9mIGEgY29tcGxldGlvbiBlbnRyeS5cclxuZXhwb3J0IGNvbnN0IENvbXBsZXRpb25JdGVtS2luZCA9IHtcclxuICBUZXh0OiAxLFxyXG4gIE1ldGhvZDogMixcclxuICBGdW5jdGlvbjogMyxcclxuICBDb25zdHJ1Y3RvcjogNCxcclxuICBGaWVsZDogNSxcclxuICBWYXJpYWJsZTogNixcclxuICBDbGFzczogNyxcclxuICBJbnRlcmZhY2U6IDgsXHJcbiAgTW9kdWxlOiA5LFxyXG4gIFByb3BlcnR5OiAxMCxcclxuICBVbml0OiAxMSxcclxuICBWYWx1ZTogMTIsXHJcbiAgRW51bTogMTMsXHJcbiAgS2V5d29yZDogMTQsXHJcbiAgU25pcHBldDogMTUsXHJcbiAgQ29sb3I6IDE2LFxyXG4gIEZpbGU6IDE3LFxyXG4gIFJlZmVyZW5jZTogMTgsXHJcbn07XHJcblxyXG4vLyBUaGUgcmVzdWx0IG9mIGEgaG92ZXIgcmVxdWVzdC5cclxuZXhwb3J0IHR5cGUgSG92ZXIgPSB7XHJcbiAgLy8gVGhlIGhvdmVyJ3MgY29udGVudFxyXG4gIGNvbnRlbnRzOiBNYXJrZWRTdHJpbmcgfCBNYXJrZWRTdHJpbmdbXSxcclxuICAvLyBBbiBvcHRpb25hbCByYW5nZSBpcyBhIHJhbmdlIGluc2lkZSBhIHRleHQgZG9jdW1lbnRcclxuICAvLyB0aGF0IGlzIHVzZWQgdG8gdmlzdWFsaXplIGEgaG92ZXIsIGUuZy4gYnkgY2hhbmdpbmcgdGhlIGJhY2tncm91bmQgY29sb3IuXHJcbiAgcmFuZ2U/OiBSYW5nZSxcclxufTtcclxuXHJcbi8qKlxyXG4gKiBUaGUgbWFya2VkIHN0cmluZyBpcyByZW5kZXJlZDpcclxuICogLSBhcyBtYXJrZG93biBpZiBpdCBpcyByZXByZXNlbnRlZCBhcyBhIHN0cmluZ1xyXG4gKiAtIGFzIGNvZGUgYmxvY2sgb2YgdGhlIGdpdmVuIGxhbmdhdWdlIGlmIGl0IGlzIHJlcHJlc2VudGVkIGFzIGEgcGFpciBvZiBhIGxhbmd1YWdlIGFuZCBhIHZhbHVlXHJcbiAqXHJcbiAqIFRoZSBwYWlyIG9mIGEgbGFuZ3VhZ2UgYW5kIGEgdmFsdWUgaXMgYW4gZXF1aXZhbGVudCB0byBtYXJrZG93bjpcclxuICogYGBgJHtsYW5ndWFnZX07XHJcbiAqICR7dmFsdWV9O1xyXG4gKiBgYGBcclxuICovXHJcbmV4cG9ydCB0eXBlIE1hcmtlZFN0cmluZyA9IHN0cmluZyB8IHsgbGFuZ3VhZ2U6IHN0cmluZywgdmFsdWU6IHN0cmluZyB9O1xyXG5cclxuLyoqXHJcbiAqIFNpZ25hdHVyZSBoZWxwIHJlcHJlc2VudHMgdGhlIHNpZ25hdHVyZSBvZiBzb21ldGhpbmdcclxuICogY2FsbGFibGUuIFRoZXJlIGNhbiBiZSBtdWx0aXBsZSBzaWduYXR1cmUgYnV0IG9ubHkgb25lXHJcbiAqIGFjdGl2ZSBhbmQgb25seSBvbmUgYWN0aXZlIHBhcmFtZXRlci5cclxuICovXHJcbmV4cG9ydCB0eXBlIFNpZ25hdHVyZUhlbHAgPSB7XHJcbiAgLy8gT25lIG9yIG1vcmUgc2lnbmF0dXJlcy5cclxuICBzaWduYXR1cmVzOiBTaWduYXR1cmVJbmZvcm1hdGlvbltdLFxyXG4gIC8vIFRoZSBhY3RpdmUgc2lnbmF0dXJlLlxyXG4gIGFjdGl2ZVNpZ25hdHVyZT86IG51bWJlcixcclxuICAvLyBUaGUgYWN0aXZlIHBhcmFtZXRlciBvZiB0aGUgYWN0aXZlIHNpZ25hdHVyZS5cclxuICBhY3RpdmVQYXJhbWV0ZXI/OiBudW1iZXIsXHJcbn07XHJcblxyXG4vKipcclxuICogUmVwcmVzZW50cyB0aGUgc2lnbmF0dXJlIG9mIHNvbWV0aGluZyBjYWxsYWJsZS4gQSBzaWduYXR1cmVcclxuICogY2FuIGhhdmUgYSBsYWJlbCwgbGlrZSBhIGZ1bmN0aW9uLW5hbWUsIGEgZG9jLWNvbW1lbnQsIGFuZFxyXG4gKiBhIHNldCBvZiBwYXJhbWV0ZXJzLlxyXG4gKi9cclxuZXhwb3J0IHR5cGUgU2lnbmF0dXJlSW5mb3JtYXRpb24gPSB7XHJcbiAgLy8gVGhlIGxhYmVsIG9mIHRoaXMgc2lnbmF0dXJlLiBXaWxsIGJlIHNob3duIGluIHRoZSBVSS5cclxuICBsYWJlbDogc3RyaW5nLFxyXG4gIC8vICBUaGUgaHVtYW4tcmVhZGFibGUgZG9jLWNvbW1lbnQgb2YgdGhpcyBzaWduYXR1cmUuIFdpbGwgYmUgc2hvd24gaW4gdGhlIFVJIGJ1dCBjYW4gYmUgb21pdHRlZC5cclxuICBkb2N1bWVudGF0aW9uPzogc3RyaW5nLFxyXG4gIC8vIFRoZSBwYXJhbWV0ZXJzIG9mIHRoaXMgc2lnbmF0dXJlLlxyXG4gIHBhcmFtZXRlcnM/OiBQYXJhbWV0ZXJJbmZvcm1hdGlvbltdLFxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudHMgYSBwYXJhbWV0ZXIgb2YgYSBjYWxsYWJsZS1zaWduYXR1cmUuIEEgcGFyYW1ldGVyIGNhblxyXG4gKiBoYXZlIGEgbGFiZWwgYW5kIGEgZG9jLWNvbW1lbnQuXHJcbiAqL1xyXG5leHBvcnQgdHlwZSBQYXJhbWV0ZXJJbmZvcm1hdGlvbiA9IHtcclxuICAvLyBUaGUgbGFiZWwgb2YgdGhpcyBwYXJhbWV0ZXIuIFdpbGwgYmUgc2hvd24gaW4gdGhlIFVJLlxyXG4gIGxhYmVsOiBzdHJpbmcsXHJcbiAgLy8gVGhlIGh1bWFuLXJlYWRhYmxlIGRvYy1jb21tZW50IG9mIHRoaXMgcGFyYW1ldGVyLiBXaWxsIGJlIHNob3duIGluIHRoZSBVSSBidXQgY2FuIGJlIG9taXR0ZWQuXHJcbiAgZG9jdW1lbnRhdGlvbj86IHN0cmluZyxcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFJlZmVyZW5jZVBhcmFtcyA9IFRleHREb2N1bWVudFBvc2l0aW9uUGFyYW1zICYge1xyXG4gIGNvbnRleHQ6IFJlZmVyZW5jZUNvbnRleHQsXHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBSZWZlcmVuY2VDb250ZXh0ID0ge1xyXG4gIC8vIEluY2x1ZGUgdGhlIGRlY2xhcmF0aW9uIG9mIHRoZSBjdXJyZW50IHN5bWJvbC5cclxuICBpbmNsdWRlRGVjbGFyYXRpb246IGJvb2xlYW4sXHJcbn07XHJcblxyXG4vKipcclxuICogQSBkb2N1bWVudCBoaWdobGlnaHQgaXMgYSByYW5nZSBpbnNpZGUgYSB0ZXh0IGRvY3VtZW50IHdoaWNoIGRlc2VydmVzXHJcbiAqIHNwZWNpYWwgYXR0ZW50aW9uLiBVc3VhbGx5IGEgZG9jdW1lbnQgaGlnaGxpZ2h0IGlzIHZpc3VhbGl6ZWQgYnkgY2hhbmdpbmdcclxuICogdGhlIGJhY2tncm91bmQgY29sb3Igb2YgaXRzIHJhbmdlLlxyXG4gKlxyXG4gKi9cclxuZXhwb3J0IHR5cGUgRG9jdW1lbnRIaWdobGlnaHQgPSB7XHJcbiAgLy8gVGhlIHJhbmdlIHRoaXMgaGlnaGxpZ2h0IGFwcGxpZXMgdG8uXHJcbiAgcmFuZ2U6IFJhbmdlLFxyXG4gIC8vIFRoZSBoaWdobGlnaHQga2luZCwgZGVmYXVsdCBpcyBEb2N1bWVudEhpZ2hsaWdodEtpbmQuVGV4dC5cclxuICBraW5kPzogbnVtYmVyLFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IERvY3VtZW50SGlnaGxpZ2h0S2luZCA9IHtcclxuICAvLyBBIHRleHR1YWwgb2NjdXJyYW5jZS5cclxuICBUZXh0OiAxLFxyXG4gIC8vIFJlYWQtYWNjZXNzIG9mIGEgc3ltYm9sLCBsaWtlIHJlYWRpbmcgYSB2YXJpYWJsZS5cclxuICBSZWFkOiAyLFxyXG4gIC8vIFdyaXRlLWFjY2VzcyBvZiBhIHN5bWJvbCwgbGlrZSB3cml0aW5nIHRvIGEgdmFyaWFibGUuXHJcbiAgV3JpdGU6IDMsXHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBEb2N1bWVudFN5bWJvbFBhcmFtcyA9IHtcclxuICAvLyBUaGUgdGV4dCBkb2N1bWVudC5cclxuICB0ZXh0RG9jdW1lbnQ6IFRleHREb2N1bWVudElkZW50aWZpZXIsXHJcbn07XHJcblxyXG4vKipcclxuICogUmVwcmVzZW50cyBpbmZvcm1hdGlvbiBhYm91dCBwcm9ncmFtbWluZyBjb25zdHJ1Y3RzIGxpa2UgdmFyaWFibGVzLCBjbGFzc2VzLFxyXG4gKiBpbnRlcmZhY2VzIGV0Yy5cclxuICovXHJcbmV4cG9ydCB0eXBlIFN5bWJvbEluZm9ybWF0aW9uID0ge1xyXG4gIC8vIFRoZSBuYW1lIG9mIHRoaXMgc3ltYm9sLlxyXG4gIG5hbWU6IHN0cmluZyxcclxuICAvLyBUaGUga2luZCBvZiB0aGlzIHN5bWJvbC5cclxuICBraW5kOiBudW1iZXIsXHJcbiAgLy8gVGhlIGxvY2F0aW9uIG9mIHRoaXMgc3ltYm9sLlxyXG4gIGxvY2F0aW9uOiBMb2NhdGlvbixcclxuICAvLyBUaGUgbmFtZSBvZiB0aGUgc3ltYm9sIGNvbnRhaW5pbmcgdGhpcyBzeW1ib2wuXHJcbiAgY29udGFpbmVyTmFtZT86IHN0cmluZyxcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBTeW1ib2xLaW5kID0ge1xyXG4gIEZpbGU6IDEsXHJcbiAgTW9kdWxlOiAyLFxyXG4gIE5hbWVzcGFjZTogMyxcclxuICBQYWNrYWdlOiA0LFxyXG4gIENsYXNzOiA1LFxyXG4gIE1ldGhvZDogNixcclxuICBQcm9wZXJ0eTogNyxcclxuICBGaWVsZDogOCxcclxuICBDb25zdHJ1Y3RvcjogOSxcclxuICBFbnVtOiAxMCxcclxuICBJbnRlcmZhY2U6IDExLFxyXG4gIEZ1bmN0aW9uOiAxMixcclxuICBWYXJpYWJsZTogMTMsXHJcbiAgQ29uc3RhbnQ6IDE0LFxyXG4gIFN0cmluZzogMTUsXHJcbiAgTnVtYmVyOiAxNixcclxuICBCb29sZWFuOiAxNyxcclxuICBBcnJheTogMTgsXHJcbn07XHJcblxyXG4vLyBUaGUgcGFyYW1ldGVycyBvZiBhIFdvcmtzcGFjZSBTeW1ib2wgUmVxdWVzdC5cclxuZXhwb3J0IHR5cGUgV29ya3NwYWNlU3ltYm9sUGFyYW1zID0ge1xyXG4gIC8vIEEgbm9uLWVtcHR5IHF1ZXJ5IHN0cmluZy5cclxuICBxdWVyeTogc3RyaW5nLFxyXG59O1xyXG5cclxuLy8gUGFyYW1zIGZvciB0aGUgQ29kZUFjdGlvblJlcXVlc3RcclxuZXhwb3J0IHR5cGUgQ29kZUFjdGlvblBhcmFtcyA9IHtcclxuICAvLyBUaGUgZG9jdW1lbnQgaW4gd2hpY2ggdGhlIGNvbW1hbmQgd2FzIGludm9rZWQuXHJcbiAgdGV4dERvY3VtZW50OiBUZXh0RG9jdW1lbnRJZGVudGlmaWVyLFxyXG4gIC8vIFRoZSByYW5nZSBmb3Igd2hpY2ggdGhlIGNvbW1hbmQgd2FzIGludm9rZWQuXHJcbiAgcmFuZ2U6IFJhbmdlLFxyXG4gIC8vIENvbnRleHQgY2FycnlpbmcgYWRkaXRpb25hbCBpbmZvcm1hdGlvbi5cclxuICBjb250ZXh0OiBDb2RlQWN0aW9uQ29udGV4dCxcclxufTtcclxuXHJcbi8vIENvbnRhaW5zIGFkZGl0aW9uYWwgZGlhZ25vc3RpYyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgY29udGV4dCBpbiB3aGljaCBhIGNvZGUgYWN0aW9uIGlzIHJ1bi5cclxuZXhwb3J0IHR5cGUgQ29kZUFjdGlvbkNvbnRleHQgPSB7XHJcbiAgLy8gQW4gYXJyYXkgb2YgZGlhZ25vc3RpY3MuXHJcbiAgZGlhZ25vc3RpY3M6IERpYWdub3N0aWNbXSxcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIENvZGVMZW5zUGFyYW1zID0ge1xyXG4gIC8vIFRoZSBkb2N1bWVudCB0byByZXF1ZXN0IGNvZGUgbGVucyBmb3IuXHJcbiAgdGV4dERvY3VtZW50OiBUZXh0RG9jdW1lbnRJZGVudGlmaWVyLFxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEEgY29kZSBsZW5zIHJlcHJlc2VudHMgYSBjb21tYW5kIHRoYXQgc2hvdWxkIGJlIHNob3duIGFsb25nIHdpdGhcclxuICogc291cmNlIHRleHQsIGxpa2UgdGhlIG51bWJlciBvZiByZWZlcmVuY2VzLCBhIHdheSB0byBydW4gdGVzdHMsIGV0Yy5cclxuICpcclxuICogQSBjb2RlIGxlbnMgaXMgX3VucmVzb2x2ZWRfIHdoZW4gbm8gY29tbWFuZCBpcyBhc3NvY2lhdGVkIHRvIGl0LiBGb3IgcGVyZm9ybWFuY2VcclxuICogcmVhc29ucyB0aGUgY3JlYXRpb24gb2YgYSBjb2RlIGxlbnMgYW5kIHJlc29sdmluZyBzaG91bGQgYmUgZG9uZSBpbiB0d28gc3RhZ2VzLlxyXG4gKi9cclxuZXhwb3J0IHR5cGUgQ29kZUxlbnMgPSB7XHJcbiAgLy8gVGhlIHJhbmdlIGluIHdoaWNoIHRoaXMgY29kZSBsZW5zIGlzIHZhbGlkLiBTaG91bGQgb25seSBzcGFuIGEgc2luZ2xlIGxpbmUuXHJcbiAgcmFuZ2U6IFJhbmdlLFxyXG4gIC8vIFRoZSBjb21tYW5kIHRoaXMgY29kZSBsZW5zIHJlcHJlc2VudHMuXHJcbiAgY29tbWFuZD86IENvbW1hbmQsXHJcbiAgLy8gQSBkYXRhIGVudHJ5IGZpZWxkIHRoYXQgaXMgcHJlc2VydmVkIG9uIGEgY29kZSBsZW5zIGl0ZW0gYmV0d2VlbiBhIGNvZGUgbGVuc1xyXG4gIC8vIGFuZCBhIGNvZGUgbGVucyByZXNvbHZlIHJlcXVlc3QuXHJcbiAgZGF0YT86IGFueSxcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIERvY3VtZW50TGlua1BhcmFtcyA9IHtcclxuICAvLyBUaGUgZG9jdW1lbnQgdG8gcHJvdmlkZSBkb2N1bWVudCBsaW5rcyBmb3IuXHJcbiAgdGV4dERvY3VtZW50OiBUZXh0RG9jdW1lbnRJZGVudGlmaWVyLFxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEEgZG9jdW1lbnQgbGluayBpcyBhIHJhbmdlIGluIGEgdGV4dCBkb2N1bWVudCB0aGF0IGxpbmtzIHRvIGFuIGludGVybmFsIG9yXHJcbiogZXh0ZXJuYWwgcmVzb3VyY2UsIGxpa2UgYW5vdGhlclxyXG4gKiB0ZXh0IGRvY3VtZW50IG9yIGEgd2ViIHNpdGUuXHJcbiAqL1xyXG5leHBvcnQgdHlwZSBEb2N1bWVudExpbmsgPSB7XHJcbiAgLy8gVGhlIHJhbmdlIHRoaXMgbGluayBhcHBsaWVzIHRvLlxyXG4gIHJhbmdlOiBSYW5nZSxcclxuICAvLyBUaGUgdXJpIHRoaXMgbGluayBwb2ludHMgdG8uXHJcbiAgdGFyZ2V0OiBzdHJpbmcsXHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBEb2N1bWVudEZvcm1hdHRpbmdQYXJhbXMgPSB7XHJcbiAgLy8gVGhlIGRvY3VtZW50IHRvIGZvcm1hdC5cclxuICB0ZXh0RG9jdW1lbnQ6IFRleHREb2N1bWVudElkZW50aWZpZXIsXHJcbiAgLy8gVGhlIGZvcm1hdCBvcHRpb25zLlxyXG4gIG9wdGlvbnM6IEZvcm1hdHRpbmdPcHRpb25zLFxyXG59O1xyXG5cclxuLy8gVmFsdWUtb2JqZWN0IGRlc2NyaWJpbmcgd2hhdCBvcHRpb25zIGZvcm1hdHRpbmcgc2hvdWxkIHVzZS5cclxuZXhwb3J0IHR5cGUgRm9ybWF0dGluZ09wdGlvbnMgPSB7XHJcbiAgLy8gU2l6ZSBvZiBhIHRhYiBpbiBzcGFjZXMuXHJcbiAgdGFiU2l6ZTogbnVtYmVyLFxyXG4gIC8vIFByZWZlciBzcGFjZXMgb3ZlciB0YWJzLlxyXG4gIGluc2VydFNwYWNlczogYm9vbGVhbixcclxuICAvLyBTaWduYXR1cmUgZm9yIGZ1cnRoZXIgcHJvcGVydGllcy5cclxuICBba2V5OiBzdHJpbmddOiBib29sZWFuIHwgbnVtYmVyIHwgc3RyaW5nLFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgRG9jdW1lbnRSYW5nZUZvcm1hdHRpbmdQYXJhbXMgPSB7XHJcbiAgLy8gVGhlIGRvY3VtZW50IHRvIGZvcm1hdC5cclxuICB0ZXh0RG9jdW1lbnQ6IFRleHREb2N1bWVudElkZW50aWZpZXIsXHJcbiAgLy8gVGhlIHJhbmdlIHRvIGZvcm1hdC5cclxuICByYW5nZTogUmFuZ2UsXHJcbiAgLy8gVGhlIGZvcm1hdCBvcHRpb25zLlxyXG4gIG9wdGlvbnM6IEZvcm1hdHRpbmdPcHRpb25zLFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgRG9jdW1lbnRPblR5cGVGb3JtYXR0aW5nUGFyYW1zID0ge1xyXG4gIC8vIFRoZSBkb2N1bWVudCB0byBmb3JtYXQuXHJcbiAgdGV4dERvY3VtZW50OiBUZXh0RG9jdW1lbnRJZGVudGlmaWVyLFxyXG4gIC8vIFRoZSBwb3NpdGlvbiBhdCB3aGljaCB0aGlzIHJlcXVlc3Qgd2FzIHNlbnQuXHJcbiAgcG9zaXRpb246IFBvc2l0aW9uLFxyXG4gIC8vIFRoZSBjaGFyYWN0ZXIgdGhhdCBoYXMgYmVlbiB0eXBlZC5cclxuICBjaDogc3RyaW5nLFxyXG4gIC8vIFRoZSBmb3JtYXQgb3B0aW9ucy5cclxuICBvcHRpb25zOiBGb3JtYXR0aW5nT3B0aW9ucyxcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFJlbmFtZVBhcmFtcyA9IHtcclxuICAvLyBUaGUgZG9jdW1lbnQgdG8gZm9ybWF0LlxyXG4gIHRleHREb2N1bWVudDogVGV4dERvY3VtZW50SWRlbnRpZmllcixcclxuICAvLyBUaGUgcG9zaXRpb24gYXQgd2hpY2ggdGhpcyByZXF1ZXN0IHdhcyBzZW50LlxyXG4gIHBvc2l0aW9uOiBQb3NpdGlvbixcclxuICAvKipcclxuICAgKiBUaGUgbmV3IG5hbWUgb2YgdGhlIHN5bWJvbC4gSWYgdGhlIGdpdmVuIG5hbWUgaXMgbm90IHZhbGlkIHRoZVxyXG4gICAqIHJlcXVlc3QgbXVzdCByZXR1cm4gYSBbUmVzcG9uc2VFcnJvcl0oI1Jlc3BvbnNlRXJyb3IpIHdpdGggYW5cclxuICAgKiBhcHByb3ByaWF0ZSBtZXNzYWdlIHNldC5cclxuICAgKi9cclxuICBuZXdOYW1lOiBzdHJpbmcsXHJcbn07XHJcblxyXG4vLyBXaW5kb3dcclxuXHJcbmV4cG9ydCB0eXBlIFNob3dNZXNzYWdlUGFyYW1zID0ge1xyXG4gIC8vIFRoZSBtZXNzYWdlIHR5cGUuIFNlZSB7QGxpbmsgTWVzc2FnZVR5cGV9Oy5cclxuICB0eXBlOiBudW1iZXIsXHJcbiAgLy8gVGhlIGFjdHVhbCBtZXNzYWdlLlxyXG4gIG1lc3NhZ2U6IHN0cmluZyxcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBNZXNzYWdlVHlwZSA9IHtcclxuICAvLyBBbiBlcnJvciBtZXNzYWdlLlxyXG4gIEVycm9yOiAxLFxyXG4gIC8vIEEgd2FybmluZyBtZXNzYWdlLlxyXG4gIFdhcm5pbmc6IDIsXHJcbiAgLy8gQW4gaW5mb3JtYXRpb24gbWVzc2FnZS5cclxuICBJbmZvOiAzLFxyXG4gIC8vIEEgbG9nIG1lc3NhZ2UuXHJcbiAgTG9nOiA0LFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgU2hvd01lc3NhZ2VSZXF1ZXN0UGFyYW1zID0ge1xyXG4gIC8vIFRoZSBtZXNzYWdlIHR5cGUuIFNlZSB7QGxpbmsgTWVzc2FnZVR5cGV9O1xyXG4gIHR5cGU6IG51bWJlcixcclxuICAvLyBUaGUgYWN0dWFsIG1lc3NhZ2VcclxuICBtZXNzYWdlOiBzdHJpbmcsXHJcbiAgLy8gVGhlIG1lc3NhZ2UgYWN0aW9uIGl0ZW1zIHRvIHByZXNlbnQuXHJcbiAgYWN0aW9ucz86IE1lc3NhZ2VBY3Rpb25JdGVtW10sXHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBNZXNzYWdlQWN0aW9uSXRlbSA9IHtcclxuICAvLyBBIHNob3J0IHRpdGxlIGxpa2UgJ1JldHJ5JywgJ09wZW4gTG9nJyBldGMuXHJcbiAgdGl0bGU6IHN0cmluZyxcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIExvZ01lc3NhZ2VQYXJhbXMgPSB7XHJcbiAgLy8gVGhlIG1lc3NhZ2UgdHlwZS4gU2VlIHtAbGluayBNZXNzYWdlVHlwZX07XHJcbiAgdHlwZTogbnVtYmVyLFxyXG4gIC8vIFRoZSBhY3R1YWwgbWVzc2FnZVxyXG4gIG1lc3NhZ2U6IHN0cmluZyxcclxufTtcclxuXHJcbi8vIFdvcmtzcGFjZVxyXG5cclxuZXhwb3J0IHR5cGUgRGlkQ2hhbmdlQ29uZmlndXJhdGlvblBhcmFtcyA9IHtcclxuICAvLyBUaGUgYWN0dWFsIGNoYW5nZWQgc2V0dGluZ3NcclxuICBzZXR0aW5nczogYW55LFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgRGlkT3BlblRleHREb2N1bWVudFBhcmFtcyA9IHtcclxuICAvLyBUaGUgZG9jdW1lbnQgdGhhdCB3YXMgb3BlbmVkLlxyXG4gIHRleHREb2N1bWVudDogVGV4dERvY3VtZW50SXRlbSxcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIERpZENoYW5nZVRleHREb2N1bWVudFBhcmFtcyA9IHtcclxuICAvLyBUaGUgZG9jdW1lbnQgdGhhdCBkaWQgY2hhbmdlLiBUaGUgdmVyc2lvbiBudW1iZXIgcG9pbnRzXHJcbiAgLy8gdG8gdGhlIHZlcnNpb24gYWZ0ZXIgYWxsIHByb3ZpZGVkIGNvbnRlbnQgY2hhbmdlcyBoYXZlXHJcbiAgLy8gYmVlbiBhcHBsaWVkLlxyXG4gIHRleHREb2N1bWVudDogVmVyc2lvbmVkVGV4dERvY3VtZW50SWRlbnRpZmllcixcclxuICAvLyBUaGUgYWN0dWFsIGNvbnRlbnQgY2hhbmdlcy5cclxuICBjb250ZW50Q2hhbmdlczogVGV4dERvY3VtZW50Q29udGVudENoYW5nZUV2ZW50W10sXHJcbn07XHJcblxyXG4vLyBBbiBldmVudCBkZXNjcmliaW5nIGEgY2hhbmdlIHRvIGEgdGV4dCBkb2N1bWVudC4gSWYgcmFuZ2UgYW5kIHJhbmdlTGVuZ3RoIGFyZSBvbWl0dGVkXHJcbi8vIHRoZSBuZXcgdGV4dCBpcyBjb25zaWRlcmVkIHRvIGJlIHRoZSBmdWxsIGNvbnRlbnQgb2YgdGhlIGRvY3VtZW50LlxyXG5leHBvcnQgdHlwZSBUZXh0RG9jdW1lbnRDb250ZW50Q2hhbmdlRXZlbnQgPSB7XHJcbiAgLy8gVGhlIHJhbmdlIG9mIHRoZSBkb2N1bWVudCB0aGF0IGNoYW5nZWQuXHJcbiAgcmFuZ2U/OiBSYW5nZSxcclxuICAvLyBUaGUgbGVuZ3RoIG9mIHRoZSByYW5nZSB0aGF0IGdvdCByZXBsYWNlZC5cclxuICByYW5nZUxlbmd0aD86IG51bWJlcixcclxuICAvLyBUaGUgbmV3IHRleHQgb2YgdGhlIGRvY3VtZW50LlxyXG4gIHRleHQ6IHN0cmluZyxcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIERpZENsb3NlVGV4dERvY3VtZW50UGFyYW1zID0ge1xyXG4gIC8vIFRoZSBkb2N1bWVudCB0aGF0IHdhcyBjbG9zZWQuXHJcbiAgdGV4dERvY3VtZW50OiBUZXh0RG9jdW1lbnRJZGVudGlmaWVyLFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgRGlkU2F2ZVRleHREb2N1bWVudFBhcmFtcyA9IHtcclxuICAvLyBUaGUgZG9jdW1lbnQgdGhhdCB3YXMgc2F2ZWQuXHJcbiAgdGV4dERvY3VtZW50OiBUZXh0RG9jdW1lbnRJZGVudGlmaWVyLFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgRGlkQ2hhbmdlV2F0Y2hlZEZpbGVzUGFyYW1zID0ge1xyXG4gIC8vIFRoZSBhY3R1YWwgZmlsZSBldmVudHMuXHJcbiAgY2hhbmdlczogRmlsZUV2ZW50W10sXHJcbn07XHJcblxyXG4vLyBUaGUgZmlsZSBldmVudCB0eXBlLlxyXG5leHBvcnQgY29uc3QgRmlsZUNoYW5nZVR5cGUgPSB7XHJcbiAgLy8gVGhlIGZpbGUgZ290IGNyZWF0ZWQuXHJcbiAgQ3JlYXRlZDogMSxcclxuICAvLyBUaGUgZmlsZSBnb3QgY2hhbmdlZC5cclxuICBDaGFuZ2VkOiAyLFxyXG4gIC8vIFRoZSBmaWxlIGdvdCBkZWxldGVkLlxyXG4gIERlbGV0ZWQ6IDMsXHJcbn07XHJcblxyXG4vLyBBbiBldmVudCBkZXNjcmliaW5nIGEgZmlsZSBjaGFuZ2UuXHJcbmV4cG9ydCB0eXBlIEZpbGVFdmVudCA9IHtcclxuICAvLyBUaGUgZmlsZSdzIFVSSS5cclxuICB1cmk6IHN0cmluZyxcclxuICAvLyBUaGUgY2hhbmdlIHR5cGUuXHJcbiAgdHlwZTogbnVtYmVyLFxyXG59O1xyXG4iXX0=