Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _languageclientV = require('../protocol/languageclient-v2');

var _convert = require('../convert');

var _convert2 = _interopRequireDefault(_convert);

var _atom = require('atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9icmlkZ2VzL2Zvcm1hdC1yYW5nZS1icmlkZ2UuanMiXSwibmFtZXMiOlsiRm9ybWF0UmFuZ2VCcmlkZ2UiLCJjb25zdHJ1Y3RvciIsImxhbmd1YWdlQ2xpZW50IiwiX2Rpc3Bvc2FibGUiLCJfbGMiLCJhZGQiLCJhdG9tIiwiY29tbWFuZHMiLCJmb3JtYXRTZWxlY3Rpb24iLCJiaW5kIiwiZGlzcG9zZSIsImVkaXRvciIsIndvcmtzcGFjZSIsImdldEFjdGl2ZVRleHRFZGl0b3IiLCJyZXN1bHQiLCJkb2N1bWVudFJhbmdlRm9ybWF0dGluZyIsInRleHREb2N1bWVudCIsImVkaXRvclRvVGV4dERvY3VtZW50SWRlbnRpZmllciIsInJhbmdlIiwiYXRvbVJhbmdlVG9MU1JhbmdlIiwiZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSIsIm9wdGlvbnMiLCJfZ2V0Rm9ybWF0T3B0aW9ucyIsImdldEJ1ZmZlciIsInRyYW5zYWN0IiwiYXBwbHlUZXh0RWRpdHMiLCJyZXZlcnNlIiwidGV4dEVkaXRzIiwidGV4dEVkaXQiLCJhdG9tUmFuZ2UiLCJsc1JhbmdlVG9BdG9tUmFuZ2UiLCJzZXRUZXh0SW5CdWZmZXJSYW5nZSIsIm5ld1RleHQiLCJ0YWJTaXplIiwiZ2V0VGFiTGVuZ3RoIiwiaW5zZXJ0U3BhY2VzIiwiZ2V0U29mdFRhYnMiXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUE7O0FBRUE7Ozs7QUFDQTs7Ozs7O0lBRXFCQSxpQixHQUFOLE1BQU1BLGlCQUFOLENBQXdCOztBQUlyQ0MsY0FBWUMsY0FBWixFQUE4QztBQUM1QyxTQUFLQyxXQUFMLEdBQW1CLCtCQUFuQjtBQUNBLFNBQUtDLEdBQUwsR0FBV0YsY0FBWDtBQUNBLFNBQUtDLFdBQUwsQ0FBaUJFLEdBQWpCLENBQ0VDLEtBQUtDLFFBQUwsQ0FBY0YsR0FBZCxDQUFrQixrQkFBbEIsRUFBc0MsRUFBQyw2QkFBNkIsS0FBS0csZUFBTCxDQUFxQkMsSUFBckIsQ0FBMEIsSUFBMUIsQ0FBOUIsRUFBdEMsQ0FERjtBQUdEOztBQUVEQyxZQUFnQjtBQUNkLFNBQUtQLFdBQUwsQ0FBaUJPLE9BQWpCO0FBQ0Q7O0FBRUtGLGlCQUFOLEdBQXVDO0FBQUE7O0FBQUE7QUFDckMsWUFBTUcsU0FBU0wsS0FBS00sU0FBTCxDQUFlQyxtQkFBZixFQUFmO0FBQ0EsVUFBSUYsVUFBVSxJQUFkLEVBQW9COztBQUVwQixZQUFNRyxTQUFTLE1BQU0sTUFBS1YsR0FBTCxDQUFTVyx1QkFBVCxDQUFpQztBQUNwREMsc0JBQWMsa0JBQVFDLDhCQUFSLENBQXVDTixNQUF2QyxDQURzQztBQUVwRE8sZUFBTyxrQkFBUUMsa0JBQVIsQ0FBMkJSLE9BQU9TLHNCQUFQLEVBQTNCLENBRjZDO0FBR3BEQyxpQkFBU3JCLGtCQUFrQnNCLGlCQUFsQixDQUFvQ1gsTUFBcEM7QUFIMkMsT0FBakMsQ0FBckI7O0FBTUFBLGFBQU9ZLFNBQVAsR0FBbUJDLFFBQW5CLENBQTRCO0FBQUEsZUFBTSxNQUFLQyxjQUFMLENBQW9CZCxNQUFwQixFQUE0QkcsT0FBT1ksT0FBUCxFQUE1QixDQUFOO0FBQUEsT0FBNUI7QUFWcUM7QUFXdEM7O0FBRURELGlCQUFlZCxNQUFmLEVBQXdDZ0IsU0FBeEMsRUFBMEU7QUFDeEUsU0FBSyxJQUFJQyxRQUFULElBQXFCRCxTQUFyQixFQUFnQztBQUM5QixZQUFNRSxZQUFZLGtCQUFRQyxrQkFBUixDQUEyQkYsU0FBU1YsS0FBcEMsQ0FBbEI7QUFDQVAsYUFBT29CLG9CQUFQLENBQTRCRixTQUE1QixFQUF1Q0QsU0FBU0ksT0FBaEQ7QUFDRDtBQUNGOztBQUVELFNBQU9WLGlCQUFQLENBQXlCWCxNQUF6QixFQUFxRTtBQUNuRSxXQUFPO0FBQ0xzQixlQUFTdEIsT0FBT3VCLFlBQVAsRUFESjtBQUVMQyxvQkFBY3hCLE9BQU95QixXQUFQO0FBRlQsS0FBUDtBQUlEO0FBekNvQyxDO2tCQUFsQnBDLGlCIiwiZmlsZSI6ImZvcm1hdC1yYW5nZS1icmlkZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAZmxvd1xyXG5cclxuaW1wb3J0IHtMYW5ndWFnZUNsaWVudFYyfSBmcm9tICcuLi9wcm90b2NvbC9sYW5ndWFnZWNsaWVudC12Mic7XHJcbmltcG9ydCB0eXBlIHtGb3JtYXR0aW5nT3B0aW9ucywgVGV4dEVkaXR9IGZyb20gJy4uL3Byb3RvY29sL2xhbmd1YWdlY2xpZW50LXYyJztcclxuaW1wb3J0IENvbnZlcnQgZnJvbSAnLi4vY29udmVydCc7XHJcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGb3JtYXRSYW5nZUJyaWRnZSB7XHJcbiAgX2Rpc3Bvc2FibGU6IENvbXBvc2l0ZURpc3Bvc2FibGU7XHJcbiAgX2xjOiBMYW5ndWFnZUNsaWVudFYyO1xyXG5cclxuICBjb25zdHJ1Y3RvcihsYW5ndWFnZUNsaWVudDogTGFuZ3VhZ2VDbGllbnRWMikge1xyXG4gICAgdGhpcy5fZGlzcG9zYWJsZSA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XHJcbiAgICB0aGlzLl9sYyA9IGxhbmd1YWdlQ2xpZW50O1xyXG4gICAgdGhpcy5fZGlzcG9zYWJsZS5hZGQoXHJcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywgeydsYW5ndWFnZTpmb3JtYXQtc2VsZWN0aW9uJzogdGhpcy5mb3JtYXRTZWxlY3Rpb24uYmluZCh0aGlzKX0pXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuX2Rpc3Bvc2FibGUuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZm9ybWF0U2VsZWN0aW9uKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xyXG4gICAgaWYgKGVkaXRvciA9PSBudWxsKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fbGMuZG9jdW1lbnRSYW5nZUZvcm1hdHRpbmcoe1xyXG4gICAgICB0ZXh0RG9jdW1lbnQ6IENvbnZlcnQuZWRpdG9yVG9UZXh0RG9jdW1lbnRJZGVudGlmaWVyKGVkaXRvciksXHJcbiAgICAgIHJhbmdlOiBDb252ZXJ0LmF0b21SYW5nZVRvTFNSYW5nZShlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpKSxcclxuICAgICAgb3B0aW9uczogRm9ybWF0UmFuZ2VCcmlkZ2UuX2dldEZvcm1hdE9wdGlvbnMoZWRpdG9yKVxyXG4gICAgfSk7XHJcblxyXG4gICAgZWRpdG9yLmdldEJ1ZmZlcigpLnRyYW5zYWN0KCgpID0+IHRoaXMuYXBwbHlUZXh0RWRpdHMoZWRpdG9yLCByZXN1bHQucmV2ZXJzZSgpKSk7XHJcbiAgfVxyXG5cclxuICBhcHBseVRleHRFZGl0cyhlZGl0b3I6IGF0b20kVGV4dEVkaXRvciwgdGV4dEVkaXRzOiBBcnJheTxUZXh0RWRpdD4pOiB2b2lkIHtcclxuICAgIGZvciAobGV0IHRleHRFZGl0IG9mIHRleHRFZGl0cykge1xyXG4gICAgICBjb25zdCBhdG9tUmFuZ2UgPSBDb252ZXJ0LmxzUmFuZ2VUb0F0b21SYW5nZSh0ZXh0RWRpdC5yYW5nZSk7XHJcbiAgICAgIGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShhdG9tUmFuZ2UsIHRleHRFZGl0Lm5ld1RleHQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIF9nZXRGb3JtYXRPcHRpb25zKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogRm9ybWF0dGluZ09wdGlvbnMge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdGFiU2l6ZTogZWRpdG9yLmdldFRhYkxlbmd0aCgpLFxyXG4gICAgICBpbnNlcnRTcGFjZXM6IGVkaXRvci5nZXRTb2Z0VGFicygpXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==