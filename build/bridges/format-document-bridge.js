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
        options: FormatDocumentBridge._getFormatOptions(editor)
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
exports.default = FormatDocumentBridge;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9icmlkZ2VzL2Zvcm1hdC1kb2N1bWVudC1icmlkZ2UuanMiXSwibmFtZXMiOlsibHMiLCJGb3JtYXREb2N1bWVudEJyaWRnZSIsImNvbnN0cnVjdG9yIiwibGFuZ3VhZ2VDbGllbnQiLCJfZGlzcG9zYWJsZSIsIl9sYyIsImFkZCIsImF0b20iLCJjb21tYW5kcyIsImZvcm1hdERvY3VtZW50IiwiYmluZCIsImRpc3Bvc2UiLCJlZGl0b3IiLCJ3b3Jrc3BhY2UiLCJnZXRBY3RpdmVUZXh0RWRpdG9yIiwicmVzdWx0IiwiZG9jdW1lbnRGb3JtYXR0aW5nIiwidGV4dERvY3VtZW50IiwiZWRpdG9yVG9UZXh0RG9jdW1lbnRJZGVudGlmaWVyIiwib3B0aW9ucyIsIl9nZXRGb3JtYXRPcHRpb25zIiwiZ2V0QnVmZmVyIiwidHJhbnNhY3QiLCJhcHBseVRleHRFZGl0cyIsInJldmVyc2UiLCJ0ZXh0RWRpdHMiLCJ0ZXh0RWRpdCIsImF0b21SYW5nZSIsImxzUmFuZ2VUb0F0b21SYW5nZSIsInJhbmdlIiwic2V0VGV4dEluQnVmZmVyUmFuZ2UiLCJuZXdUZXh0IiwidGFiU2l6ZSIsImdldFRhYkxlbmd0aCIsImluc2VydFNwYWNlcyIsImdldFNvZnRUYWJzIl0sIm1hcHBpbmdzIjoiOzs7OztBQUVBOztJQUFZQSxFOztBQUNaOzs7O0FBQ0E7Ozs7Ozs7O0lBRXFCQyxvQixHQUFOLE1BQU1BLG9CQUFOLENBQ2Y7O0FBSUVDLGNBQVlDLGNBQVosRUFBaUQ7QUFDL0MsU0FBS0MsV0FBTCxHQUFtQiwrQkFBbkI7QUFDQSxTQUFLQyxHQUFMLEdBQVdGLGNBQVg7QUFDQSxTQUFLQyxXQUFMLENBQWlCRSxHQUFqQixDQUNFQyxLQUFLQyxRQUFMLENBQWNGLEdBQWQsQ0FBa0Isa0JBQWxCLEVBQXNDLEVBQUMsNEJBQTRCLEtBQUtHLGNBQUwsQ0FBb0JDLElBQXBCLENBQXlCLElBQXpCLENBQTdCLEVBQXRDLENBREY7QUFHRDs7QUFFREMsWUFBZ0I7QUFDZCxTQUFLUCxXQUFMLENBQWlCTyxPQUFqQjtBQUNEOztBQUVLRixnQkFBTixHQUFzQztBQUFBOztBQUFBO0FBQ3BDLFlBQU1HLFNBQVNMLEtBQUtNLFNBQUwsQ0FBZUMsbUJBQWYsRUFBZjtBQUNBLFVBQUlGLFVBQVUsSUFBZCxFQUFvQjs7QUFFcEIsWUFBTUcsU0FBUyxNQUFNLE1BQUtWLEdBQUwsQ0FBU1csa0JBQVQsQ0FBNEI7QUFDL0NDLHNCQUFjLGtCQUFRQyw4QkFBUixDQUF1Q04sTUFBdkMsQ0FEaUM7QUFFL0NPLGlCQUFTbEIscUJBQXFCbUIsaUJBQXJCLENBQXVDUixNQUF2QztBQUZzQyxPQUE1QixDQUFyQjs7QUFLQUEsYUFBT1MsU0FBUCxHQUFtQkMsUUFBbkIsQ0FBNEI7QUFBQSxlQUFNLE1BQUtDLGNBQUwsQ0FBb0JYLE1BQXBCLEVBQTRCRyxPQUFPUyxPQUFQLEVBQTVCLENBQU47QUFBQSxPQUE1QjtBQVRvQztBQVVyQzs7QUFFREQsaUJBQWVYLE1BQWYsRUFBd0NhLFNBQXhDLEVBQTZFO0FBQzNFLFNBQUssSUFBSUMsUUFBVCxJQUFxQkQsU0FBckIsRUFBZ0M7QUFDOUIsWUFBTUUsWUFBWSxrQkFBUUMsa0JBQVIsQ0FBMkJGLFNBQVNHLEtBQXBDLENBQWxCO0FBQ0FqQixhQUFPa0Isb0JBQVAsQ0FBNEJILFNBQTVCLEVBQXVDRCxTQUFTSyxPQUFoRDtBQUNEO0FBQ0Y7O0FBRUQsU0FBT1gsaUJBQVAsQ0FBeUJSLE1BQXpCLEVBQXdFO0FBQ3RFLFdBQU87QUFDTG9CLGVBQVNwQixPQUFPcUIsWUFBUCxFQURKO0FBRUxDLG9CQUFjdEIsT0FBT3VCLFdBQVA7QUFGVCxLQUFQO0FBSUQ7QUF4Q0gsQztrQkFEcUJsQyxvQiIsImZpbGUiOiJmb3JtYXQtZG9jdW1lbnQtYnJpZGdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQGZsb3dcclxuXHJcbmltcG9ydCAqIGFzIGxzIGZyb20gJy4uL3Byb3RvY29sL2xhbmd1YWdlY2xpZW50LXYyJztcclxuaW1wb3J0IENvbnZlcnQgZnJvbSAnLi4vY29udmVydCc7XHJcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGb3JtYXREb2N1bWVudEJyaWRnZVxyXG57XHJcbiAgX2Rpc3Bvc2FibGU6IENvbXBvc2l0ZURpc3Bvc2FibGU7XHJcbiAgX2xjOiBscy5MYW5ndWFnZUNsaWVudFYyO1xyXG5cclxuICBjb25zdHJ1Y3RvcihsYW5ndWFnZUNsaWVudDogbHMuTGFuZ3VhZ2VDbGllbnRWMikge1xyXG4gICAgdGhpcy5fZGlzcG9zYWJsZSA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XHJcbiAgICB0aGlzLl9sYyA9IGxhbmd1YWdlQ2xpZW50O1xyXG4gICAgdGhpcy5fZGlzcG9zYWJsZS5hZGQoXHJcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywgeydsYW5ndWFnZTpmb3JtYXQtZG9jdW1lbnQnOiB0aGlzLmZvcm1hdERvY3VtZW50LmJpbmQodGhpcyl9KVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLl9kaXNwb3NhYmxlLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGZvcm1hdERvY3VtZW50KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xyXG4gICAgaWYgKGVkaXRvciA9PSBudWxsKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fbGMuZG9jdW1lbnRGb3JtYXR0aW5nKHtcclxuICAgICAgdGV4dERvY3VtZW50OiBDb252ZXJ0LmVkaXRvclRvVGV4dERvY3VtZW50SWRlbnRpZmllcihlZGl0b3IpLFxyXG4gICAgICBvcHRpb25zOiBGb3JtYXREb2N1bWVudEJyaWRnZS5fZ2V0Rm9ybWF0T3B0aW9ucyhlZGl0b3IpXHJcbiAgICB9KTtcclxuXHJcbiAgICBlZGl0b3IuZ2V0QnVmZmVyKCkudHJhbnNhY3QoKCkgPT4gdGhpcy5hcHBseVRleHRFZGl0cyhlZGl0b3IsIHJlc3VsdC5yZXZlcnNlKCkpKTtcclxuICB9XHJcblxyXG4gIGFwcGx5VGV4dEVkaXRzKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLCB0ZXh0RWRpdHM6IEFycmF5PGxzLlRleHRFZGl0Pik6IHZvaWQge1xyXG4gICAgZm9yIChsZXQgdGV4dEVkaXQgb2YgdGV4dEVkaXRzKSB7XHJcbiAgICAgIGNvbnN0IGF0b21SYW5nZSA9IENvbnZlcnQubHNSYW5nZVRvQXRvbVJhbmdlKHRleHRFZGl0LnJhbmdlKTtcclxuICAgICAgZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKGF0b21SYW5nZSwgdGV4dEVkaXQubmV3VGV4dCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgX2dldEZvcm1hdE9wdGlvbnMoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiBscy5Gb3JtYXR0aW5nT3B0aW9ucyB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0YWJTaXplOiBlZGl0b3IuZ2V0VGFiTGVuZ3RoKCksXHJcbiAgICAgIGluc2VydFNwYWNlczogZWRpdG9yLmdldFNvZnRUYWJzKClcclxuICAgIH1cclxuICB9XHJcbn1cclxuIl19