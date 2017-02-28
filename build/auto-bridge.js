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
    return _asyncToGenerator(function* () {
      throw "Must override startServerProcess to start the language server process when extending AutoBridge";
    })();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9hdXRvLWJyaWRnZS5qcyJdLCJuYW1lcyI6WyJjcCIsInBhdGgiLCJscyIsIkF1dG9CcmlkZ2UiLCJuYW1lIiwiZ3JhbW1hclNjb3BlcyIsImFjdGl2YXRlIiwibGVuZ3RoIiwic3RhcnRTZXJ2ZXIiLCJkZWFjdGl2YXRlIiwic3RvcFNlcnZlciIsIl9zZXJ2ZXIiLCJfcHJvY2VzcyIsInN0YXJ0U2VydmVyUHJvY2VzcyIsInN0YXJ0IiwiX2dldEluaXRpYWxpemVQYXJhbXMiLCJfbG9nIiwic3RvcCIsImtpbGwiLCJwcm92aWRlT3V0bGluZXMiLCJwcmlvcml0eSIsImdldE91dGxpbmUiLCJiaW5kIiwiZWRpdG9yIiwic3ltYm9sUHJvdmlkZXIiLCJQcm9taXNlIiwicmVzb2x2ZSIsInByb3ZpZGVMaW50ZXIiLCJzY29wZSIsImxpbnRPbkZseSIsImxpbnQiLCJwcm92aWRlTGludGluZyIsImxpbnRlciIsInByb3ZpZGVEaWFnbm9zdGljcyIsInByb3ZpZGVBdXRvY29tcGxldGUiLCJzZWxlY3RvciIsImV4Y2x1ZGVMb3dlclByaW9yaXR5IiwiZ2V0U3VnZ2VzdGlvbnMiLCJwcm92aWRlU3VnZ2VzdGlvbnMiLCJyZXF1ZXN0IiwiYXV0b0NvbXBsZXRlIiwicm9vdERpcnMiLCJhdG9tIiwicHJvamVjdCIsImdldERpcmVjdG9yaWVzIiwicHJvY2Vzc0lkIiwicHJvY2VzcyIsInBpZCIsImNhcGFiaWxpdGllcyIsInJvb3RQYXRoIiwibWVzc2FnZSIsImNvbnNvbGUiLCJsb2ciXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUE7O0lBQVlBLEU7O0FBQ1o7O0lBQVlDLEk7O0FBQ1o7O0lBQVlDLEU7O0FBQ1o7Ozs7Ozs7Ozs7SUFFcUJDLFUsR0FBTixNQUFNQSxVQUFOLENBQWlCO0FBQUE7QUFBQSxTQUk5QkMsSUFKOEIsR0FJZixFQUplO0FBQUEsU0FLOUJDLGFBTDhCLEdBS2QsRUFMYztBQUFBOztBQU85QkMsYUFBaUI7QUFDZixRQUFJLEtBQUtGLElB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QUdMQyxnQkFBVVIsU0FBU2xDLE1BQVQsR0FBa0IsQ0FBbEIsR0FBc0JrQyxTQUFTLENBQVQsRUFBWXhDLElBQWxDLEdBQXlDO0FBSDlDLEtBQVA7QUFLRDs7QUFFRGUsT0FBS2tDLE9BQUwsRUFBc0I7QUFDcEJDLFlBQVFDLEdBQVIsQ0FBYSxHQUFFLEtBQUtoRCxJQUFLLElBQUc4QyxPQUFRLEVBQXBDO0FBQ0Q7QUE5RjZCLEM7a0JBQVgvQyxVIiwiZmlsZSI6ImF1dG8tYnJpZGdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQGZsb3dcclxuXHJcbmltcG9ydCAqIGFzIGNwIGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgKiBhcyBscyBmcm9tICcuL3Byb3RvY29sL2xhbmd1YWdlY2xpZW50LXYyJztcclxuaW1wb3J0IFJ1bm5pbmdTZXJ2ZXJWMiBmcm9tICcuL3J1bm5pbmctc2VydmVyJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF1dG9CcmlkZ2Uge1xyXG4gIF9wcm9jZXNzOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2VzcztcclxuICBfc2VydmVyOiA/UnVubmluZ1NlcnZlclYyO1xyXG5cclxuICBuYW1lOiBzdHJpbmcgPSAnJztcclxuICBncmFtbWFyU2NvcGVzID0gW107XHJcblxyXG4gIGFjdGl2YXRlKCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMubmFtZSA9PT0gJycpIHtcclxuICAgICAgdGhyb3cgXCJNdXN0IHNldCBuYW1lIGZpZWxkIHdoZW4gZXh0ZW5kaW5nIEF1dG9CcmlkZ2VcIjtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmdyYW1tYXJTY29wZXMgPT0gbnVsbCB8fCB0aGlzLmdyYW1tYXJTY29wZXMubGVuZ3RoID09IDApIHtcclxuICAgICAgdGhyb3cgXCJNdXN0IHNldCBncmFtbWFyU2NvcGVzIGZpZWxkIHdoZW4gZXh0ZW5kaW5nIEF1dG9CcmlkZ2VcIjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnN0YXJ0U2VydmVyKCk7XHJcbiAgfVxyXG5cclxuICBkZWFjdGl2YXRlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5zdG9wU2VydmVyKCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBzdGFydFNlcnZlcigpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGlmICh0aGlzLl9zZXJ2ZXIgIT0gbnVsbCkgcmV0dXJuO1xyXG5cclxuICAgIHRoaXMuX3Byb2Nlc3MgPSBhd2FpdCB0aGlzLnN0YXJ0U2VydmVyUHJvY2VzcygpO1xyXG4gICAgdGhpcy5fc2VydmVyID0gbmV3IFJ1bm5pbmdTZXJ2ZXJWMih0aGlzLm5hbWUsIHRoaXMuX3Byb2Nlc3MpO1xyXG4gICAgYXdhaXQgdGhpcy5fc2VydmVyLnN0YXJ0KHRoaXMuX2dldEluaXRpYWxpemVQYXJhbXMoKSk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBzdGFydFNlcnZlclByb2Nlc3MoKTogUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4ge1xyXG4gICAgdGhyb3cgXCJNdXN0IG92ZXJyaWRlIHN0YXJ0U2VydmVyUHJvY2VzcyB0byBzdGFydCB0aGUgbGFuZ3VhZ2Ugc2VydmVyIHByb2Nlc3Mgd2hlbiBleHRlbmRpbmcgQXV0b0JyaWRnZVwiO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgc3RvcFNlcnZlcigpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHRoaXMuX2xvZygnc3RvcHBpbmcnKTtcclxuICAgIGlmICh0aGlzLl9zZXJ2ZXIgIT0gbnVsbCkge1xyXG4gICAgICBhd2FpdCB0aGlzLl9zZXJ2ZXIuc3RvcCgpO1xyXG4gICAgICB0aGlzLl9zZXJ2ZXIgPSBudWxsO1xyXG4gICAgICB0aGlzLl9wcm9jZXNzLmtpbGwoKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwcm92aWRlT3V0bGluZXMoKTogbnVjbGlkZSRPdXRsaW5lUHJvdmlkZXIge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxyXG4gICAgICBncmFtbWFyU2NvcGVzOiB0aGlzLmdyYW1tYXJTY29wZXMsXHJcbiAgICAgIHByaW9yaXR5OiAxLFxyXG4gICAgICBnZXRPdXRsaW5lOiB0aGlzLmdldE91dGxpbmUuYmluZCh0aGlzKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZ2V0T3V0bGluZShlZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IFByb21pc2U8P251Y2xpZGUkT3V0bGluZT4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NlcnZlciAmJiB0aGlzLl9zZXJ2ZXIuc3ltYm9sUHJvdmlkZXIgPyB0aGlzLl9zZXJ2ZXIuc3ltYm9sUHJvdmlkZXIuZ2V0T3V0bGluZShlZGl0b3IpIDogUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xyXG4gIH1cclxuXHJcbiAgcHJvdmlkZUxpbnRlcigpOiBsaW50ZXIkU3RhbmRhcmRMaW50ZXIge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxyXG4gICAgICBzY29wZTogJ3Byb2plY3QnLFxyXG4gICAgICBsaW50T25GbHk6IHRydWUsXHJcbiAgICAgIGdyYW1tYXJTY29wZXM6IHRoaXMuZ3JhbW1hclNjb3BlcyxcclxuICAgICAgbGludDogdGhpcy5wcm92aWRlTGludGluZy5iaW5kKHRoaXMpXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHJvdmlkZUxpbnRpbmcoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiA/QXJyYXk8bGludGVyJE1lc3NhZ2U+IHwgUHJvbWlzZTw/QXJyYXk8bGludGVyJE1lc3NhZ2U+PiB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2VydmVyICYmIHRoaXMuX3NlcnZlci5saW50ZXIgPyB0aGlzLl9zZXJ2ZXIubGludGVyLnByb3ZpZGVEaWFnbm9zdGljcygpIDogUHJvbWlzZS5yZXNvbHZlKFtdKTtcclxuICB9XHJcblxyXG4gIHByb3ZpZGVBdXRvY29tcGxldGUoKTogYXRvbSRBdXRvY29tcGxldGVQcm92aWRlciB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzZWxlY3RvcjogJy5zb3VyY2UnLFxyXG4gICAgICBleGNsdWRlTG93ZXJQcmlvcml0eTogZmFsc2UsXHJcbiAgICAgIGdldFN1Z2dlc3Rpb25zOiB0aGlzLnByb3ZpZGVTdWdnZXN0aW9ucy5iaW5kKHRoaXMpLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHByb3ZpZGVTdWdnZXN0aW9ucyhyZXF1ZXN0OiBhbnkpOiBQcm9taXNlPEFycmF5PGF0b20kQXV0b2NvbXBsZXRlU3VnZ2VzdGlvbj4+IHtcclxuICAgIHJldHVybiB0aGlzLl9zZXJ2ZXIgJiYgdGhpcy5fc2VydmVyLmF1dG9Db21wbGV0ZSA/IHRoaXMuX3NlcnZlci5hdXRvQ29tcGxldGUucHJvdmlkZVN1Z2dlc3Rpb25zKHJlcXVlc3QpIDogUHJvbWlzZS5yZXNvbHZlKFtdKTtcclxuICB9XHJcblxyXG4gIF9nZXRJbml0aWFsaXplUGFyYW1zKCk6IGxzLkluaXRpYWxpemVQYXJhbXMge1xyXG4gICAgY29uc3Qgcm9vdERpcnM6IEFycmF5PGFueT4gPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBwcm9jZXNzSWQ6IHByb2Nlc3MucGlkLFxyXG4gICAgICBjYXBhYmlsaXRpZXM6IHsgfSxcclxuICAgICAgcm9vdFBhdGg6IHJvb3REaXJzLmxlbmd0aCA+IDAgPyByb290RGlyc1swXS5wYXRoIDogbnVsbFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgX2xvZyhtZXNzYWdlOiBzdHJpbmcpIHtcclxuICAgIGNvbnNvbGUubG9nKGAke3RoaXMubmFtZX0gJHttZXNzYWdlfWApO1xyXG4gIH1cclxufVxyXG4iXX0=