Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _languageclientV = require('./protocol/languageclient-v2');

var ls = _interopRequireWildcard(_languageclientV);

var _vscodeJsonrpc = require('vscode-jsonrpc');

var rpc = _interopRequireWildcard(_vscodeJsonrpc);

var _autocompleteBridge = require('./bridges/autocomplete-bridge');

var _autocompleteBridge2 = _interopRequireDefault(_autocompleteBridge);

var _documentSyncBridge = require('./bridges/document-sync-bridge');

var _documentSyncBridge2 = _interopRequireDefault(_documentSyncBridge);

var _formatDocumentBridge = require('./bridges/format-document-bridge');

var _formatDocumentBridge2 = _interopRequireDefault(_formatDocumentBridge);

var _formatRangeBridge = require('./bridges/format-range-bridge');

var _formatRangeBridge2 = _interopRequireDefault(_formatRangeBridge);

var _linterBridge = require('./bridges/linter-bridge');

var _linterBridge2 = _interopRequireDefault(_linterBridge);

var _nuclideOutlineViewBridge = require('./bridges/nuclide-outline-view-bridge');

var _nuclideOutlineViewBridge2 = _interopRequireDefault(_nuclideOutlineViewBridge);

var _atom = require('atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let RunningServerV2 = class RunningServerV2 {

  constructor(name, process) {
    this._disposable = new _atom.CompositeDisposable();

    this.name = name;

    this._process = process;
    this._connection = rpc.createMessageConnection(new rpc.StreamMessageReader(this._process.stdout), new rpc.StreamMessageWriter(this._process.stdin), { error: m => console.log(m) });
  }

  start(initializerParams) {
    var _this = this;

    return _asyncToGenerator(function* () {
      _this._lc = new ls.LanguageClientV2(_this._connection);
      _this._lc.onLogMessage(function (m) {
        return _this._logMessage(m);
      });
      _this._lc.onTelemetryEvent(function (e) {
        return _this._telemetryEvent(e);
      });

      const initializeResponse = yield _this._lc.initialize(initializerParams);
      _this._bridgeCapabilities(initializeResponse.capabilities);
    })();
  }

  _bridgeCapabilities(capabilities) {
    if (capabilities.completionProvider) {
      this.autoComplete = new _autocompleteBridge2.default(this._lc);
    }
    if (capabilities.textDocumentSync) {
      this.documentSync = new _documentSyncBridge2.default(this._lc, capabilities.textDocumentSync);
    }
    if (capabilities.documentSymbolProvider) {
      this.symbolProvider = new _nuclideOutlineViewBridge2.default(this._lc, this.name);
    }

    if (capabilities.documentRangeFormattingProvider) {
      this._disposable.add(new _formatRangeBridge2.default(this._lc));
    }
    if (capabilities.documentFormattingProvider) {
      this._disposable.add(new _formatDocumentBridge2.default(this._lc));
    }

    this.linter = new _linterBridge2.default(this._lc);
  }

  stop() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      if (_this2.autoComplete != null) {
        _this2.autoComplete.dispose();
      }
      if (_this2.linter != null) {
        _this2.linter.dispose();
      }
      if (_this2.documentSync != null) {
        _this2.documentSync.dispose();
      }
      if (_this2.symbolProvider != null) {
        _this2.symbolProvider.dispose();
      }

      _this2._disposable.dispose();

      yield _this2._lc.shutdown();
      _this2._connection.stop();
      _this2._process.kill();
    })();
  }

  _logMessage(message) {
    if (message.type < ls.MessageType.Info) console.log(`${this.name} Log`, message);
  }

  _telemetryEvent(params) {
    if (params.type != 'error' || params.message != undefined) // OmniSharp spam
      console.log(`${this.name} Telemetry`, params);
  }
};
exports.default = RunningServerV2;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9ydW5uaW5nLXNlcnZlci5qcyJdLCJuYW1lcyI6WyJscyIsInJwYyIsIlJ1bm5pbmdTZXJ2ZXJWMiIsImNvbnN0cnVjdG9yIiwibmFtZSIsInByb2Nlc3MiLCJfZGlzcG9zYWJsZSIsIl9wcm9jZXNzIiwiX2Nvbm5lY3Rpb24iLCJjcmVhdGVNZXNzYWdlQ29ubmVjdGlvbiIsIlN0cmVhbU1lc3NhZ2VSZWFkZXIiLCJzdGRvdXQiLCJTdHJlYW1NZXNzYWdlV3JpdGVyIiwic3RkaW4iLCJlcnJvciIsIm0iLCJjb25zb2xlIiwibG9nIiwic3RhcnQiLCJpbml0aWFsaXplclBhcmFtcyIsIl9sYyIsIkxhbmd1YWdlQ2xpZW50VjIiLCJvbkxvZ01lc3NhZ2UiLCJfbG9nTWVzc2FnZSIsIm9uVGVsZW1ldHJ5RXZlbnQiLCJfdGVsZW1ldHJ5RXZlbnQiLCJlIiwiaW5pdGlhbGl6ZVJlc3BvbnNlIiwiaW5pdGlhbGl6ZSIsIl9icmlkZ2VDYXBhYmlsaXRpZXMiLCJjYXBhYmlsaXRpZXMiLCJjb21wbGV0aW9uUHJvdmlkZXIiLCJhdXRvQ29tcGxldGUiLCJ0ZXh0RG9jdW1lbnRTeW5jIiwiZG9jdW1lbnRTeW5jIiwiZG9jdW1lbnRTeW1ib2xQcm92aWRlciIsInN5bWJvbFByb3ZpZGVyIiwiZG9jdW1lbnRSYW5nZUZvcm1hdHRpbmdQcm92aWRlciIsImFkZCIsImRvY3VtZW50Rm9ybWF0dGluZ1Byb3ZpZGVyIiwibGludGVyIiwic3RvcCIsImRpc3Bvc2UiLCJzaHV0ZG93biIsImtpbGwiLCJtZXNzYWdlIiwidHlwZSIsIk1lc3NhZ2VUeXBlIiwiSW5mbyIsInBhcmFtcyIsInVuZGVmaW5lZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQTs7SUFBWUEsRTs7QUFDWjs7SUFBWUMsRzs7QUFFWjs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7Ozs7Ozs7SUFFcUJDLGUsR0FBTixNQUFNQSxlQUFOLENBQXNCOztBQVluQ0Ms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RDtBQUM5QyxRQUFJQSxRQUFRQyxJQUFSLEdBQWU5QyxHQUFHK0MsV0FBSCxDQUFlQyxJQUFsQyxFQUF3Q2hDLFFBQVFDLEdBQVIsQ0FBYSxHQUFFLEtBQUtiLElBQUssTUFBekIsRUFBZ0N5QyxPQUFoQztBQUN6Qzs7QUFFRHBCLGtCQUFnQndCLE1BQWhCLEVBQW1DO0FBQ2pDLFFBQUlBLE9BQU9ILElBQVAsSUFBZSxPQUFmLElBQTBCRyxPQUFPSixPQUFQLElBQWtCSyxTQUFoRCxFQUEyRDtBQUN6RGxDLGNBQVFDLEdBQVIsQ0FBYSxHQUFFLEtBQUtiLElBQUssWUFBekIsRUFBc0M2QyxNQUF0QztBQUNIO0FBaEZrQyxDO2tCQUFoQi9DLGUiLCJmaWxlIjoicnVubmluZy1zZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAZmxvd1xyXG5cclxuaW1wb3J0ICogYXMgbHMgZnJvbSAnLi9wcm90b2NvbC9sYW5ndWFnZWNsaWVudC12Mic7XHJcbmltcG9ydCAqIGFzIHJwYyBmcm9tICd2c2NvZGUtanNvbnJwYyc7XHJcblxyXG5pbXBvcnQgQXV0b2NvbXBsZXRlQnJpZGdlIGZyb20gJy4vYnJpZGdlcy9hdXRvY29tcGxldGUtYnJpZGdlJztcclxuaW1wb3J0IERvY3VtZW50U3luY0JyaWRnZSBmcm9tICcuL2JyaWRnZXMvZG9jdW1lbnQtc3luYy1icmlkZ2UnO1xyXG5pbXBvcnQgRm9ybWF0RG9jdW1lbnRCcmlkZ2UgZnJvbSAnLi9icmlkZ2VzL2Zvcm1hdC1kb2N1bWVudC1icmlkZ2UnO1xyXG5pbXBvcnQgRm9ybWF0UmFuZ2VCcmlkZ2UgZnJvbSAnLi9icmlkZ2VzL2Zvcm1hdC1yYW5nZS1icmlkZ2UnO1xyXG5pbXBvcnQgTGludGVyQnJpZGdlIGZyb20gJy4vYnJpZGdlcy9saW50ZXItYnJpZGdlJztcclxuaW1wb3J0IE51Y2xpZGVPdXRsaW5lVmlld0JyaWRnZSBmcm9tICcuL2JyaWRnZXMvbnVjbGlkZS1vdXRsaW5lLXZpZXctYnJpZGdlJztcclxuXHJcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSdW5uaW5nU2VydmVyVjIge1xyXG4gIF9kaXNwb3NhYmxlID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcclxuICBfY29ubmVjdGlvbjogcnBjLk1lc3NhZ2VDb25uZWN0aW9uO1xyXG4gIF9wcm9jZXNzOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2VzcztcclxuICBfbGM6IGxzLkxhbmd1YWdlQ2xpZW50VjI7XHJcblxyXG4gIG5hbWU6IHN0cmluZztcclxuICBhdXRvQ29tcGxldGU6ID9BdXRvY29tcGxldGVCcmlkZ2U7XHJcbiAgbGludGVyOiA/TGludGVyQnJpZGdlO1xyXG4gIGRvY3VtZW50U3luYzogP0RvY3VtZW50U3luY0JyaWRnZTtcclxuICBzeW1ib2xQcm92aWRlcjogP051Y2xpZGVPdXRsaW5lVmlld0JyaWRnZTtcclxuXHJcbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCBwcm9jZXNzOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcykge1xyXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcclxuXHJcbiAgICB0aGlzLl9wcm9jZXNzID0gcHJvY2VzcztcclxuICAgIHRoaXMuX2Nvbm5lY3Rpb24gPSBycGMuY3JlYXRlTWVzc2FnZUNvbm5lY3Rpb24oXHJcbiAgICAgIG5ldyBycGMuU3RyZWFtTWVzc2FnZVJlYWRlcih0aGlzLl9wcm9jZXNzLnN0ZG91dCksXHJcbiAgICAgIG5ldyBycGMuU3RyZWFtTWVzc2FnZVdyaXRlcih0aGlzLl9wcm9jZXNzLnN0ZGluKSxcclxuICAgICAgeyBlcnJvcjogKG06IE9iamVjdCkgPT4gY29uc29sZS5sb2cobSkgfSk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBzdGFydChpbml0aWFsaXplclBhcmFtczogbHMuSW5pdGlhbGl6ZVBhcmFtcyk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgdGhpcy5fbGMgPSBuZXcgbHMuTGFuZ3VhZ2VDbGllbnRWMih0aGlzLl9jb25uZWN0aW9uKTtcclxuICAgIHRoaXMuX2xjLm9uTG9nTWVzc2FnZShtID0+IHRoaXMuX2xvZ01lc3NhZ2UobSkpO1xyXG4gICAgdGhpcy5fbGMub25UZWxlbWV0cnlFdmVudChlID0+IHRoaXMuX3RlbGVtZXRyeUV2ZW50KGUpKTtcclxuXHJcbiAgICBjb25zdCBpbml0aWFsaXplUmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9sYy5pbml0aWFsaXplKGluaXRpYWxpemVyUGFyYW1zKTtcclxuICAgIHRoaXMuX2JyaWRnZUNhcGFiaWxpdGllcyhpbml0aWFsaXplUmVzcG9uc2UuY2FwYWJpbGl0aWVzKTtcclxuICB9XHJcblxyXG4gIF9icmlkZ2VDYXBhYmlsaXRpZXMoY2FwYWJpbGl0aWVzOiBscy5TZXJ2ZXJDYXBhYmlsaXRpZXMpOiB2b2lkIHtcclxuICAgIGlmIChjYXBhYmlsaXRpZXMuY29tcGxldGlvblByb3ZpZGVyKSB7XHJcbiAgICAgIHRoaXMuYXV0b0NvbXBsZXRlID0gbmV3IEF1dG9jb21wbGV0ZUJyaWRnZSh0aGlzLl9sYyk7XHJcbiAgICB9XHJcbiAgICBpZiAoY2FwYWJpbGl0aWVzLnRleHREb2N1bWVudFN5bmMpIHtcclxuICAgICAgdGhpcy5kb2N1bWVudFN5bmMgPSBuZXcgRG9jdW1lbnRTeW5jQnJpZGdlKHRoaXMuX2xjLCBjYXBhYmlsaXRpZXMudGV4dERvY3VtZW50U3luYyk7XHJcbiAgICB9XHJcbiAgICBpZiAoY2FwYWJpbGl0aWVzLmRvY3VtZW50U3ltYm9sUHJvdmlkZXIpIHtcclxuICAgICAgdGhpcy5zeW1ib2xQcm92aWRlciA9IG5ldyBOdWNsaWRlT3V0bGluZVZpZXdCcmlkZ2UodGhpcy5fbGMsIHRoaXMubmFtZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGNhcGFiaWxpdGllcy5kb2N1bWVudFJhbmdlRm9ybWF0dGluZ1Byb3ZpZGVyKSB7XHJcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGUuYWRkKG5ldyBGb3JtYXRSYW5nZUJyaWRnZSh0aGlzLl9sYykpO1xyXG4gICAgfVxyXG4gICAgaWYgKGNhcGFiaWxpdGllcy5kb2N1bWVudEZvcm1hdHRpbmdQcm92aWRlcikge1xyXG4gICAgICB0aGlzLl9kaXNwb3NhYmxlLmFkZChuZXcgRm9ybWF0RG9jdW1lbnRCcmlkZ2UodGhpcy5fbGMpKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmxpbnRlciA9IG5ldyBMaW50ZXJCcmlkZ2UodGhpcy5fbGMpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgc3RvcCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGlmICh0aGlzLmF1dG9Db21wbGV0ZSAhPSBudWxsKSB7XHJcbiAgICAgIHRoaXMuYXV0b0NvbXBsZXRlLmRpc3Bvc2UoKTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmxpbnRlciAhPSBudWxsKSB7XHJcbiAgICAgIHRoaXMubGludGVyLmRpc3Bvc2UoKTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmRvY3VtZW50U3luYyAhPSBudWxsKSB7XHJcbiAgICAgIHRoaXMuZG9jdW1lbnRTeW5jLmRpc3Bvc2UoKTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnN5bWJvbFByb3ZpZGVyICE9IG51bGwpIHtcclxuICAgICAgdGhpcy5zeW1ib2xQcm92aWRlci5kaXNwb3NlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fZGlzcG9zYWJsZS5kaXNwb3NlKCk7XHJcblxyXG4gICAgYXdhaXQgdGhpcy5fbGMuc2h1dGRvd24oKTtcclxuICAgIHRoaXMuX2Nvbm5lY3Rpb24uc3RvcCgpO1xyXG4gICAgdGhpcy5fcHJvY2Vzcy5raWxsKCk7XHJcbiAgfVxyXG5cclxuICBfbG9nTWVzc2FnZShtZXNzYWdlOiBscy5Mb2dNZXNzYWdlUGFyYW1zKTogdm9pZCB7XHJcbiAgICBpZiAobWVzc2FnZS50eXBlIDwgbHMuTWVzc2FnZVR5cGUuSW5mbykgY29uc29sZS5sb2coYCR7dGhpcy5uYW1lfSBMb2dgLCBtZXNzYWdlKTtcclxuICB9XHJcblxyXG4gIF90ZWxlbWV0cnlFdmVudChwYXJhbXM6IGFueSk6IHZvaWQge1xyXG4gICAgaWYgKHBhcmFtcy50eXBlICE9ICdlcnJvcicgfHwgcGFyYW1zLm1lc3NhZ2UgIT0gdW5kZWZpbmVkKSAvLyBPbW5pU2hhcnAgc3BhbVxyXG4gICAgICBjb25zb2xlLmxvZyhgJHt0aGlzLm5hbWV9IFRlbGVtZXRyeWAsIHBhcmFtcyk7XHJcbiAgfVxyXG59XHJcbiJdfQ==