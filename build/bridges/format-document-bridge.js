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

let FormatDocumentBridge = class FormatDocumentBridge {

  constructor(languageClient) {
    this._disposable = new _atom.CompositeDisposable();

    this._lc = languageClient;
    this._disposable.add(atom.commands.add('atom-text-editor', { 'language:format-document': this.formatDocument.bind(this) }));
  }

  dispose() {
    this._disposable.dispose();
  }

  formatDocument() {
    var _this = this;

    return _asyncToGenerator(function* () {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor == null) return;

      const result = yield _this._lc.documentFormatting({
        textDocument: _convert2.default.editorToTextDocumentIdentifier(editor),
        options: FormatDocumentBridge.getFormatOptions(editor)
      });

      editor.getBuffer().transact(function () {
        return FormatDocumentBridge.applyTextEdits(editor, result.reverse());
      });
    })();
  }

  static applyTextEdits(editor, textEdits) {
    for (let textEdit of textEdits) {
      const atomRange = _convert2.default.lsRangeToAtomRange(textEdit.range);
      editor.setTextInBufferRange(atomRange, textEdit.newText);
    }
  }

  static getFormatOptions(editor) {
    return {
      tabSize: editor.getTabLength(),
      insertSpaces: editor.getSoftTabs()
    };
  }
};
exports.default = FormatDocumentBridge;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9icmlkZ2VzL2Zvcm1hdC1kb2N1bWVudC1icmlkZ2UuanMiXSwibmFtZXMiOlsiRm9ybWF0RG9jdW1lbnRCcmlkZ2UiLCJjb25zdHJ1Y3RvciIsImxhbmd1YWdlQ2xpZW50IiwiX2Rpc3Bvc2FibGUiLCJfbGMiLCJhZGQiLCJhdG9tIiwiY29tbWFuZHMiLCJmb3JtYXREb2N1bWVudCIsImJpbmQiLCJkaXNwb3NlIiwiZWRpdG9yIiwid29ya3NwYWNlIiwiZ2V0QWN0aXZlVGV4dEVkaXRvciIsInJlc3VsdCIsImRvY3VtZW50Rm9ybWF0dGluZyIsInRleHREb2N1bWVudCIsImVkaXRvclRvVGV4dERvY3VtZW50SWRlbnRpZmllciIsIm9wdGlvbnMiLCJnZXRGb3JtYXRPcHRpb25zIiwiZ2V0QnVmZmVyIiwidHJhbnNhY3QiLCJhcHBseVRleHRFZGl0cyIsInJldmVyc2UiLCJ0ZXh0RWRpdHMiLCJ0ZXh0RWRpdCIsImF0b21SYW5nZSIsImxzUmFuZ2VUb0F0b21SYW5nZSIsInJhbmdlIiwic2V0VGV4dEluQnVmZmVyUmFuZ2UiLCJuZXdUZXh0IiwidGFiU2l6ZSIsImdldFRhYkxlbmd0aCIsImluc2VydFNwYWNlcyIsImdldFNvZnRUYWJzIl0sIm1hcHBpbmdzIjoiOzs7OztBQUVBOztBQUVBOzs7O0FBQ0E7Ozs7OztJQUVxQkEsb0IsR0FBTixNQUFNQSxvQkFBTixDQUEyQjs7QUFJeENDLGNBQVlDLGNBQVosRUFBOEM7QUFBQSxTQUg5Q0MsV0FHOEMsR0FIaEMsK0JBR2dDOztBQUM1QyxTQUFLQyxHQUFMLEdBQVdGLGNBQVg7QUFDQSxTQUFLQyxXQUFMLENBQWlCRSxHQUFqQixDQUNFQyxLQUFLQyxRQUFMLENBQWNGLEdBQWQsQ0FBa0Isa0JBQWxCLEVBQXNDLEVBQUMsNEJBQTRCLEtBQUtHLGNBQUwsQ0FBb0JDLElBQXBCLENBQXlCLElBQXpCLENBQTdCLEVBQXRDLENBREY7QUFHRDs7QUFFREMsWUFBZ0I7QUFDZCxTQUFLUCxXQUFMLENBQWlCTyxPQUFqQjtBQUNEOztBQUVLRixnQkFBTixHQUFzQztBQUFBOztBQUFBO0FBQ3BDLFlBQU1HLFNBQVNMLEtBQUtNLFNBQUwsQ0FBZUMsbUJBQWYsRUFBZjtBQUNBLFVBQUlGLFVBQVUsSUFBZCxFQUFvQjs7QUFFcEIsWUFBTUcsU0FBUyxNQUFNLE1BQUtWLEdBQUwsQ0FBU1csa0JBQVQsQ0FBNEI7QUFDL0NDLHNCQUFjLGtCQUFRQyw4QkFBUixDQUF1Q04sTUFBdkMsQ0FEaUM7QUFFL0NPLGlCQUFTbEIscUJBQXFCbUIsZ0JBQXJCLENBQXNDUixNQUF0QztBQUZzQyxPQUE1QixDQUFyQjs7QUFLQUEsYUFBT1MsU0FBUCxHQUFtQkMsUUFBbkIsQ0FBNEI7QUFBQSxlQUFNckIscUJBQXFCc0IsY0FBckIsQ0FBb0NYLE1BQXBDLEVBQTRDRyxPQUFPUyxPQUFQLEVBQTVDLENBQU47QUFBQSxPQUE1QjtBQVRvQztBQVVyQzs7QUFFRCxTQUFPRCxjQUFQLENBQXNCWCxNQUF0QixFQUErQ2EsU0FBL0MsRUFBaUY7QUFDL0UsU0FBSyxJQUFJQyxRQUFULElBQXFCRCxTQUFyQixFQUFnQztBQUM5QixZQUFNRSxZQUFZLGtCQUFRQyxrQkFBUixDQUEyQkYsU0FBU0csS0FBcEMsQ0FBbEI7QUFDQWpCLGFBQU9rQixvQkFBUCxDQUE0QkgsU0FBNUIsRUFBdUNELFNBQVNLLE9BQWhEO0FBQ0Q7QUFDRjs7QUFFRCxTQUFPWCxnQkFBUCxDQUF3QlIsTUFBeEIsRUFBb0U7QUFDbEUsV0FBTztBQUNMb0IsZUFBU3BCLE9BQU9xQixZQUFQLEVBREo7QUFFTEMsb0JBQWN0QixPQUFPdUIsV0FBUDtBQUZULEtBQVA7QUFJRDtBQXZDdUMsQztrQkFBckJsQyxvQiIsImZpbGUiOiJmb3JtYXQtZG9jdW1lbnQtYnJpZGdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQGZsb3dcclxuXHJcbmltcG9ydCB7TGFuZ3VhZ2VDbGllbnRWMn0gZnJvbSAnLi4vcHJvdG9jb2wvbGFuZ3VhZ2VjbGllbnQtdjInO1xyXG5pbXBvcnQgdHlwZSB7Rm9ybWF0dGluZ09wdGlvbnMsIFRleHRFZGl0fSBmcm9tICcuLi9wcm90b2NvbC9sYW5ndWFnZWNsaWVudC12Mic7XHJcbmltcG9ydCBDb252ZXJ0IGZyb20gJy4uL2NvbnZlcnQnO1xyXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRm9ybWF0RG9jdW1lbnRCcmlkZ2Uge1xyXG4gIF9kaXNwb3NhYmxlID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcclxuICBfbGM6IExhbmd1YWdlQ2xpZW50VjI7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGxhbmd1YWdlQ2xpZW50OiBMYW5ndWFnZUNsaWVudFYyKSB7XHJcbiAgICB0aGlzLl9sYyA9IGxhbmd1YWdlQ2xpZW50O1xyXG4gICAgdGhpcy5fZGlzcG9zYWJsZS5hZGQoXHJcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywgeydsYW5ndWFnZTpmb3JtYXQtZG9jdW1lbnQnOiB0aGlzLmZvcm1hdERvY3VtZW50LmJpbmQodGhpcyl9KVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLl9kaXNwb3NhYmxlLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGZvcm1hdERvY3VtZW50KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xyXG4gICAgaWYgKGVkaXRvciA9PSBudWxsKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fbGMuZG9jdW1lbnRGb3JtYXR0aW5nKHtcclxuICAgICAgdGV4dERvY3VtZW50OiBDb252ZXJ0LmVkaXRvclRvVGV4dERvY3VtZW50SWRlbnRpZmllcihlZGl0b3IpLFxyXG4gICAgICBvcHRpb25zOiBGb3JtYXREb2N1bWVudEJyaWRnZS5nZXRGb3JtYXRPcHRpb25zKGVkaXRvcilcclxuICAgIH0pO1xyXG5cclxuICAgIGVkaXRvci5nZXRCdWZmZXIoKS50cmFuc2FjdCgoKSA9PiBGb3JtYXREb2N1bWVudEJyaWRnZS5hcHBseVRleHRFZGl0cyhlZGl0b3IsIHJlc3VsdC5yZXZlcnNlKCkpKTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBhcHBseVRleHRFZGl0cyhlZGl0b3I6IGF0b20kVGV4dEVkaXRvciwgdGV4dEVkaXRzOiBBcnJheTxUZXh0RWRpdD4pOiB2b2lkIHtcclxuICAgIGZvciAobGV0IHRleHRFZGl0IG9mIHRleHRFZGl0cykge1xyXG4gICAgICBjb25zdCBhdG9tUmFuZ2UgPSBDb252ZXJ0LmxzUmFuZ2VUb0F0b21SYW5nZSh0ZXh0RWRpdC5yYW5nZSk7XHJcbiAgICAgIGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShhdG9tUmFuZ2UsIHRleHRFZGl0Lm5ld1RleHQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGdldEZvcm1hdE9wdGlvbnMoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiBGb3JtYXR0aW5nT3B0aW9ucyB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0YWJTaXplOiBlZGl0b3IuZ2V0VGFiTGVuZ3RoKCksXHJcbiAgICAgIGluc2VydFNwYWNlczogZWRpdG9yLmdldFNvZnRUYWJzKClcclxuICAgIH1cclxuICB9XHJcbn1cclxuIl19