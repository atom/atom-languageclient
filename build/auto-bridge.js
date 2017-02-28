Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _child_process = require('child_process');

var cp = _interopRequireWildcard(_child_process);

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _languageclientV = require('./protocol/languageclient-v2');

var ls = _interopRequireWildcard(_languageclientV);

var _runningServer = require('./running-server');

var _runningServer2 = _interopRequireDefault(_runningServer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let AutoBridge = class AutoBridge {
  constructor() {
    this.name = '';
    this.grammarScopes = [];
  }

  activate() {
    if (this.name === '') {
      throw "Must set name field when extending AutoBridge";
    }
    if (this.grammarScopes == null || this.grammarScopes.length == 0) {
      throw "Must set grammarScopes field when extending AutoBridge";
    }

    this.startServer();
  }

  deactivate() {
    this.stopServer();
  }

  startServer() {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (_this._server != null) return;

      _this._process = yield _this.startServerProcess();
      _this._server = new _runningServer2.default(_this.name, _this._process);
      yield _this._server.start(_this._getInitializeParams());
    })();
  }

  startServerProcess() {
    throw "Must override startServerProcess to start the language server process when extending AutoBridge";
  }

  stopServer() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      _this2._log('stopping');
      if (_this2._server != null) {
        yield _this2._server.stop();
        _this2._server = null;
        _this2._process.kill();
      };
    })();
  }

  provideOutlines() {
    return {
      name: this.name,
      grammarScopes: this.grammarScopes,
      priority: 1,
      getOutline: this.getOutline.bind(this)
    };
  }

  getOutline(editor) {
    return this._server && this._server.symbolProvider ? this._server.symbolProvider.getOutline(editor) : Promise.resolve(null);
  }

  provideLinter() {
    return {
      name: this.name,
      scope: 'project',
      lintOnFly: true,
      grammarScopes: this.grammarScopes,
      lint: this.provideLinting.bind(this)
    };
  }

  provideLinting(editor) {
    return this._server && this._server.linter ? this._server.linter.provideDiagnostics() : Promise.resolve([]);
  }

  provideAutocomplete() {
    return {
      selector: '.source',
      excludeLowerPriority: false,
      getSuggestions: this.provideSuggestions.bind(this)
    };
  }

  provideSuggestions(request) {
    return this._server && this._server.autoComplete ? this._server.autoComplete.provideSuggestions(request) : Promise.resolve([]);
  }

  _getInitializeParams() {
    const rootDirs = atom.project.getDirectories();

    return {
      processId: process.pid,
      capabilities: {},
      rootPath: rootDirs.length > 0 ? rootDirs[0].path : null
    };
  }

  _log(message) {
    console.log(`${this.name} ${message}`);
  }
};
exports.default = AutoBridge;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9hdXRvLWJyaWRnZS5qcyJdLCJuYW1lcyI6WyJjcCIsInBhdGgiLCJscyIsIkF1dG9CcmlkZ2UiLCJuYW1lIiwiZ3JhbW1hclNjb3BlcyIsImFjdGl2YXRlIiwibGVuZ3RoIiwic3RhcnRTZXJ2ZXIiLCJkZWFjdGl2YXRlIiwic3RvcFNlcnZlciIsIl9zZXJ2ZXIiLCJfcHJvY2VzcyIsInN0YXJ0U2VydmVyUHJvY2VzcyIsInN0YXJ0IiwiX2dldEluaXRpYWxpemVQYXJhbXMiLCJfbG9nIiwic3RvcCIsImtpbGwiLCJwcm92aWRlT3V0bGluZXMiLCJwcmlvcml0eSIsImdldE91dGxpbmUiLCJiaW5kIiwiZWRpdG9yIiwic3ltYm9sUHJvdmlkZXIiLCJQcm9taXNlIiwicmVzb2x2ZSIsInByb3ZpZGVMaW50ZXIiLCJzY29wZSIsImxpbnRPbkZseSIsImxpbnQiLCJwcm92aWRlTGludGluZyIsImxpbnRlciIsInByb3ZpZGVEaWFnbm9zdGljcyIsInByb3ZpZGVBdXRvY29tcGxldGUiLCJzZWxlY3RvciIsImV4Y2x1ZGVMb3dlclByaW9yaXR5IiwiZ2V0U3VnZ2VzdGlvbnMiLCJwcm92aWRlU3VnZ2VzdGlvbnMiLCJyZXF1ZXN0IiwiYXV0b0NvbXBsZXRlIiwicm9vdERpcnMiLCJhdG9tIiwicHJvamVjdCIsImdldERpcmVjdG9yaWVzIiwicHJvY2Vzc0lkIiwicHJvY2VzcyIsInBpZCIsImNhcGFiaWxpdGllcyIsInJvb3RQYXRoIiwibWVzc2FnZSIsImNvbnNvbGUiLCJsb2ciXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUE7O0lBQVlBLEU7O0FBQ1o7O0lBQVlDLEk7O0FBQ1o7O0lBQVlDLEU7O0FBQ1o7Ozs7Ozs7Ozs7SUFFcUJDLFUsR0FBTixNQUFNQSxVQUFOLENBQWlCO0FBQUE7QUFBQSxTQUk5QkMsSUFKOEIsR0FJZixFQUplO0FBQUEsU0FLOUJDLGFBTDhCLEdBS2QsRUFMYztBQUFBOztBQU85QkMsYUFBaUI7QUFDZixRQUFJLEtBQUtGLElB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QyxNQUFULEdBQWtCLENBQWxCLEdBQXNCa0MsU0FBUyxDQUFULEVBQVl4QyxJQUFsQyxHQUF5QztBQUg5QyxLQUFQO0FBS0Q7O0FBRURlLE9BQUtrQyxPQUFMLEVBQXNCO0FBQ3BCQyxZQUFRQyxHQUFSLENBQWEsR0FBRSxLQUFLaEQsSUFBSyxJQUFHOEMsT0FBUSxFQUFwQztBQUNEO0FBOUY2QixDO2tCQUFYL0MsVSIsImZpbGUiOiJhdXRvLWJyaWRnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEBmbG93XHJcblxyXG5pbXBvcnQgKiBhcyBjcCBmcm9tICdjaGlsZF9wcm9jZXNzJztcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0ICogYXMgbHMgZnJvbSAnLi9wcm90b2NvbC9sYW5ndWFnZWNsaWVudC12Mic7XHJcbmltcG9ydCBSdW5uaW5nU2VydmVyVjIgZnJvbSAnLi9ydW5uaW5nLXNlcnZlcic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdXRvQnJpZGdlIHtcclxuICBfcHJvY2VzczogY2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M7XHJcbiAgX3NlcnZlcjogP1J1bm5pbmdTZXJ2ZXJWMjtcclxuXHJcbiAgbmFtZTogc3RyaW5nID0gJyc7XHJcbiAgZ3JhbW1hclNjb3BlcyA9IFtdO1xyXG5cclxuICBhY3RpdmF0ZSgpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLm5hbWUgPT09ICcnKSB7XHJcbiAgICAgIHRocm93IFwiTXVzdCBzZXQgbmFtZSBmaWVsZCB3aGVuIGV4dGVuZGluZyBBdXRvQnJpZGdlXCI7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5ncmFtbWFyU2NvcGVzID09IG51bGwgfHwgdGhpcy5ncmFtbWFyU2NvcGVzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgIHRocm93IFwiTXVzdCBzZXQgZ3JhbW1hclNjb3BlcyBmaWVsZCB3aGVuIGV4dGVuZGluZyBBdXRvQnJpZGdlXCI7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zdGFydFNlcnZlcigpO1xyXG4gIH1cclxuXHJcbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuc3RvcFNlcnZlcigpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgc3RhcnRTZXJ2ZXIoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBpZiAodGhpcy5fc2VydmVyICE9IG51bGwpIHJldHVybjtcclxuXHJcbiAgICB0aGlzLl9wcm9jZXNzID0gYXdhaXQgdGhpcy5zdGFydFNlcnZlclByb2Nlc3MoKTtcclxuICAgIHRoaXMuX3NlcnZlciA9IG5ldyBSdW5uaW5nU2VydmVyVjIodGhpcy5uYW1lLCB0aGlzLl9wcm9jZXNzKTtcclxuICAgIGF3YWl0IHRoaXMuX3NlcnZlci5zdGFydCh0aGlzLl9nZXRJbml0aWFsaXplUGFyYW1zKCkpO1xyXG4gIH1cclxuXHJcbiAgc3RhcnRTZXJ2ZXJQcm9jZXNzKCk6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzIHtcclxuICAgIHRocm93IFwiTXVzdCBvdmVycmlkZSBzdGFydFNlcnZlclByb2Nlc3MgdG8gc3RhcnQgdGhlIGxhbmd1YWdlIHNlcnZlciBwcm9jZXNzIHdoZW4gZXh0ZW5kaW5nIEF1dG9CcmlkZ2VcIjtcclxuICB9XHJcblxyXG4gIGFzeW5jIHN0b3BTZXJ2ZXIoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICB0aGlzLl9sb2coJ3N0b3BwaW5nJyk7XHJcbiAgICBpZiAodGhpcy5fc2VydmVyICE9IG51bGwpIHtcclxuICAgICAgYXdhaXQgdGhpcy5fc2VydmVyLnN0b3AoKTtcclxuICAgICAgdGhpcy5fc2VydmVyID0gbnVsbDtcclxuICAgICAgdGhpcy5fcHJvY2Vzcy5raWxsKCk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHJvdmlkZU91dGxpbmVzKCk6IG51Y2xpZGUkT3V0bGluZVByb3ZpZGVyIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcclxuICAgICAgZ3JhbW1hclNjb3BlczogdGhpcy5ncmFtbWFyU2NvcGVzLFxyXG4gICAgICBwcmlvcml0eTogMSxcclxuICAgICAgZ2V0T3V0bGluZTogdGhpcy5nZXRPdXRsaW5lLmJpbmQodGhpcylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGdldE91dGxpbmUoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiBQcm9taXNlPD9udWNsaWRlJE91dGxpbmU+IHtcclxuICAgIHJldHVybiB0aGlzLl9zZXJ2ZXIgJiYgdGhpcy5fc2VydmVyLnN5bWJvbFByb3ZpZGVyID8gdGhpcy5fc2VydmVyLnN5bWJvbFByb3ZpZGVyLmdldE91dGxpbmUoZWRpdG9yKSA6IFByb21pc2UucmVzb2x2ZShudWxsKTtcclxuICB9XHJcblxyXG4gIHByb3ZpZGVMaW50ZXIoKTogbGludGVyJFN0YW5kYXJkTGludGVyIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcclxuICAgICAgc2NvcGU6ICdwcm9qZWN0JyxcclxuICAgICAgbGludE9uRmx5OiB0cnVlLFxyXG4gICAgICBncmFtbWFyU2NvcGVzOiB0aGlzLmdyYW1tYXJTY29wZXMsXHJcbiAgICAgIGxpbnQ6IHRoaXMucHJvdmlkZUxpbnRpbmcuYmluZCh0aGlzKVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHByb3ZpZGVMaW50aW5nKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogP0FycmF5PGxpbnRlciRNZXNzYWdlPiB8IFByb21pc2U8P0FycmF5PGxpbnRlciRNZXNzYWdlPj4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NlcnZlciAmJiB0aGlzLl9zZXJ2ZXIubGludGVyID8gdGhpcy5fc2VydmVyLmxpbnRlci5wcm92aWRlRGlhZ25vc3RpY3MoKSA6IFByb21pc2UucmVzb2x2ZShbXSk7XHJcbiAgfVxyXG5cclxuICBwcm92aWRlQXV0b2NvbXBsZXRlKCk6IGF0b20kQXV0b2NvbXBsZXRlUHJvdmlkZXIge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc2VsZWN0b3I6ICcuc291cmNlJyxcclxuICAgICAgZXhjbHVkZUxvd2VyUHJpb3JpdHk6IGZhbHNlLFxyXG4gICAgICBnZXRTdWdnZXN0aW9uczogdGhpcy5wcm92aWRlU3VnZ2VzdGlvbnMuYmluZCh0aGlzKSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwcm92aWRlU3VnZ2VzdGlvbnMocmVxdWVzdDogYW55KTogUHJvbWlzZTxBcnJheTxhdG9tJEF1dG9jb21wbGV0ZVN1Z2dlc3Rpb24+PiB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2VydmVyICYmIHRoaXMuX3NlcnZlci5hdXRvQ29tcGxldGUgPyB0aGlzLl9zZXJ2ZXIuYXV0b0NvbXBsZXRlLnByb3ZpZGVTdWdnZXN0aW9ucyhyZXF1ZXN0KSA6IFByb21pc2UucmVzb2x2ZShbXSk7XHJcbiAgfVxyXG5cclxuICBfZ2V0SW5pdGlhbGl6ZVBhcmFtcygpOiBscy5Jbml0aWFsaXplUGFyYW1zIHtcclxuICAgIGNvbnN0IHJvb3REaXJzOiBBcnJheTxhbnk+ID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKCk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcHJvY2Vzc0lkOiBwcm9jZXNzLnBpZCxcclxuICAgICAgY2FwYWJpbGl0aWVzOiB7IH0sXHJcbiAgICAgIHJvb3RQYXRoOiByb290RGlycy5sZW5ndGggPiAwID8gcm9vdERpcnNbMF0ucGF0aCA6IG51bGxcclxuICAgIH1cclxuICB9XHJcblxyXG4gIF9sb2cobWVzc2FnZTogc3RyaW5nKSB7XHJcbiAgICBjb25zb2xlLmxvZyhgJHt0aGlzLm5hbWV9ICR7bWVzc2FnZX1gKTtcclxuICB9XHJcbn1cclxuIl19