Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _languageclientV = require('../protocol/languageclient-v2');

var ls = _interopRequireWildcard(_languageclientV);

var _convert = require('../convert');

var _convert2 = _interopRequireDefault(_convert);

var _atom = require('atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let FormatRangeBridge = class FormatRangeBridge {

  constructor(languageClient) {
    this._disposable = new _atom.CompositeDisposable();
    this._lc = languageClient;
    this._disposable.add(atom.commands.add('atom-text-editor', { 'language:format-selection': this.formatSelection.bind(this) }));
  }

  dispose() {
    this._disposable.dispose();
  }

  formatSelection() {
    var _this = this;

    return _asyncToGenerator(function* () {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor == null) return;

      const result = yield _this._lc.documentRangeFormatting({
        textDocument: _convert2.default.editorToTextDocumentIdentifier(editor),
        range: _convert2.default.atomRangeToLSRange(editor.getSelectedBufferRange()),
        options: FormatRangeBridge._getFormatOptions(editor)
      });

      editor.getBuffer().transact(function () {
        return _this.applyTextEdits(editor, result.reverse());
      });
    })();
  }

  applyTextEdits(editor, textEdits) {
    for (let textEdit of textEdits) {
      const atomRange = _convert2.default.lsRangeToAtomRange(textEdit.range);
      editor.setTextInBufferRange(atomRange, textEdit.newText);
    }
  }

  static _getFormatOptions(editor) {
    return {
      tabSize: editor.getTabLength(),
      insertSpaces: editor.getSoftTabs()
    };
  }
};
exports.default = FormatRangeBridge;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9icmlkZ2VzL2Zvcm1hdC1yYW5nZS1icmlkZ2UuanMiXSwibmFtZXMiOlsibHMiLCJGb3JtYXRSYW5nZUJyaWRnZSIsImNvbnN0cnVjdG9yIiwibGFuZ3VhZ2VDbGllbnQiLCJfZGlzcG9zYWJsZSIsIl9sYyIsImFkZCIsImF0b20iLCJjb21tYW5kcyIsImZvcm1hdFNlbGVjdGlvbiIsImJpbmQiLCJkaXNwb3NlIiwiZWRpdG9yIiwid29ya3NwYWNlIiwiZ2V0QWN0aXZlVGV4dEVkaXRvciIsInJlc3VsdCIsImRvY3VtZW50UmFuZ2VGb3JtYXR0aW5nIiwidGV4dERvY3VtZW50IiwiZWRpdG9yVG9UZXh0RG9jdW1lbnRJZGVudGlmaWVyIiwicmFuZ2UiLCJhdG9tUmFuZ2VUb0xTUmFuZ2UiLCJnZXRTZWxlY3RlZEJ1ZmZlclJhbmdlIiwib3B0aW9ucyIsIl9nZXRGb3JtYXRPcHRpb25zIiwiZ2V0QnVmZmVyIiwidHJhbnNhY3QiLCJhcHBseVRleHRFZGl0cyIsInJldmVyc2UiLCJ0ZXh0RWRpdHMiLCJ0ZXh0RWRpdCIsImF0b21SYW5nZSIsImxzUmFuZ2VUb0F0b21SYW5nZSIsInNldFRleHRJbkJ1ZmZlclJhbmdlIiwibmV3VGV4dCIsInRhYlNpemUiLCJnZXRUYWJMZW5ndGgiLCJpbnNlcnRTcGFjZXMiLCJnZXRTb2Z0VGFicyJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQTs7SUFBWUEsRTs7QUFDWjs7OztBQUNBOzs7Ozs7OztJQUVxQkMsaUIsR0FBTixNQUFNQSxpQkFBTixDQUNmOztBQUlFQyxjQUFZQyxjQUFaLEVBQWlEO0FBQy9DLFNBQUtDLFdBQUwsR0FBbUIsK0JBQW5CO0FBQ0EsU0FBS0MsR0FBTCxHQUFXRixjQUFYO0FBQ0EsU0FBS0MsV0FBTCxDQUFpQkUsR0FBakIsQ0FDRUMsS0FBS0MsUUFBTCxDQUFjRixHQUFkLENBQWtCLGtCQUFsQixFQUFzQyxFQUFDLDZCQUE2QixLQUFLRyxlQUFMLENBQXFCQyxJQUFyQixDQUEwQixJQUExQixDQUE5QixFQUF0QyxDQURGO0FBR0Q7O0FBRURDLFlBQWdCO0FBQ2QsU0FBS1AsV0FBTCxDQUFpQk8sT0FBakI7QUFDRDs7QUFFS0YsaUJBQU4sR0FBdUM7QUFBQTs7QUFBQTtBQUNyQyxZQUFNRyxTQUFTTCxLQUFLTSxTQUFMLENBQWVDLG1CQUFmLEVBQWY7QUFDQSxVQUFJRixVQUFVLElBQWQsRUFBb0I7O0FBRXBCLFlBQU1HLFNBQVMsTUFBTSxNQUFLVixHQUFMLENBQVNXLHVCQUFULENBQWlDO0FBQ3BEQyxzQkFBYyxrQkFBUUMsOEJBQVIsQ0FBdUNOLE1BQXZDLENBRHNDO0FBRXBETyxlQUFPLGtCQUFRQyxrQkFBUixDQUEyQlIsT0FBT1Msc0JBQVAsRUFBM0IsQ0FGNkM7QUFHcERDLGlCQUFTckIsa0JBQWtCc0IsaUJBQWxCLENBQW9DWCxNQUFwQztBQUgyQyxPQUFqQyxDQUFyQjs7QUFNQUEsYUFBT1ksU0FBUCxHQUFtQkMsUUFBbkIsQ0FBNEI7QUFBQSxlQUFNLE1BQUtDLGNBQUwsQ0FBb0JkLE1BQXBCLEVBQTRCRyxPQUFPWSxPQUFQLEVBQTVCLENBQU47QUFBQSxPQUE1QjtBQVZxQztBQVd0Qzs7QUFFREQsaUJBQWVkLE1BQWYsRUFBd0NnQixTQUF4QyxFQUE2RTtBQUMzRSxTQUFLLElBQUlDLFFBQVQsSUFBcUJELFNBQXJCLEVBQWdDO0FBQzlCLFlBQU1FLFlBQVksa0JBQVFDLGtCQUFSLENBQTJCRixTQUFTVixLQUFwQyxDQUFsQjtBQUNBUCxhQUFPb0Isb0JBQVAsQ0FBNEJGLFNBQTVCLEVBQXVDRCxTQUFTSSxPQUFoRDtBQUNEO0FBQ0Y7O0FBRUQsU0FBT1YsaUJBQVAsQ0FBeUJYLE1BQXpCLEVBQXdFO0FBQ3RFLFdBQU87QUFDTHNCLGVBQVN0QixPQUFPdUIsWUFBUCxFQURKO0FBRUxDLG9CQUFjeEIsT0FBT3lCLFdBQVA7QUFGVCxLQUFQO0FBSUQ7QUF6Q0gsQztrQkFEcUJwQyxpQiIsImZpbGUiOiJmb3JtYXQtcmFuZ2UtYnJpZGdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQGZsb3dcclxuXHJcbmltcG9ydCAqIGFzIGxzIGZyb20gJy4uL3Byb3RvY29sL2xhbmd1YWdlY2xpZW50LXYyJztcclxuaW1wb3J0IENvbnZlcnQgZnJvbSAnLi4vY29udmVydCc7XHJcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGb3JtYXRSYW5nZUJyaWRnZVxyXG57XHJcbiAgX2Rpc3Bvc2FibGU6IENvbXBvc2l0ZURpc3Bvc2FibGU7XHJcbiAgX2xjOiBscy5MYW5ndWFnZUNsaWVudFYyO1xyXG5cclxuICBjb25zdHJ1Y3RvcihsYW5ndWFnZUNsaWVudDogbHMuTGFuZ3VhZ2VDbGllbnRWMikge1xyXG4gICAgdGhpcy5fZGlzcG9zYWJsZSA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XHJcbiAgICB0aGlzLl9sYyA9IGxhbmd1YWdlQ2xpZW50O1xyXG4gICAgdGhpcy5fZGlzcG9zYWJsZS5hZGQoXHJcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywgeydsYW5ndWFnZTpmb3JtYXQtc2VsZWN0aW9uJzogdGhpcy5mb3JtYXRTZWxlY3Rpb24uYmluZCh0aGlzKX0pXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuX2Rpc3Bvc2FibGUuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZm9ybWF0U2VsZWN0aW9uKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xyXG4gICAgaWYgKGVkaXRvciA9PSBudWxsKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fbGMuZG9jdW1lbnRSYW5nZUZvcm1hdHRpbmcoe1xyXG4gICAgICB0ZXh0RG9jdW1lbnQ6IENvbnZlcnQuZWRpdG9yVG9UZXh0RG9jdW1lbnRJZGVudGlmaWVyKGVkaXRvciksXHJcbiAgICAgIHJhbmdlOiBDb252ZXJ0LmF0b21SYW5nZVRvTFNSYW5nZShlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpKSxcclxuICAgICAgb3B0aW9uczogRm9ybWF0UmFuZ2VCcmlkZ2UuX2dldEZvcm1hdE9wdGlvbnMoZWRpdG9yKVxyXG4gICAgfSk7XHJcblxyXG4gICAgZWRpdG9yLmdldEJ1ZmZlcigpLnRyYW5zYWN0KCgpID0+IHRoaXMuYXBwbHlUZXh0RWRpdHMoZWRpdG9yLCByZXN1bHQucmV2ZXJzZSgpKSk7XHJcbiAgfVxyXG5cclxuICBhcHBseVRleHRFZGl0cyhlZGl0b3I6IGF0b20kVGV4dEVkaXRvciwgdGV4dEVkaXRzOiBBcnJheTxscy5UZXh0RWRpdD4pOiB2b2lkIHtcclxuICAgIGZvciAobGV0IHRleHRFZGl0IG9mIHRleHRFZGl0cykge1xyXG4gICAgICBjb25zdCBhdG9tUmFuZ2UgPSBDb252ZXJ0LmxzUmFuZ2VUb0F0b21SYW5nZSh0ZXh0RWRpdC5yYW5nZSk7XHJcbiAgICAgIGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShhdG9tUmFuZ2UsIHRleHRFZGl0Lm5ld1RleHQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIF9nZXRGb3JtYXRPcHRpb25zKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogbHMuRm9ybWF0dGluZ09wdGlvbnMge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdGFiU2l6ZTogZWRpdG9yLmdldFRhYkxlbmd0aCgpLFxyXG4gICAgICBpbnNlcnRTcGFjZXM6IGVkaXRvci5nZXRTb2Z0VGFicygpXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==