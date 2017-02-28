Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _languageclientV = require('../protocol/languageclient-v2');

var ls = _interopRequireWildcard(_languageclientV);

var _convert = require('../convert');

var _convert2 = _interopRequireDefault(_convert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let AutocompleteBridge = class AutocompleteBridge {

  constructor(languageClient) {
    this._lc = languageClient;
  }

  dispose() {}

  provideSuggestions(request) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const suggestions = yield _this._lc.completion({
        textDocument: _convert2.default.editorToTextDocumentIdentifier(request.editor),
        position: _convert2.default.pointToPosition(request.bufferPosition)
      });
      return (Array.isArray(suggestions) ? suggestions : suggestions.items || []).map(function (s) {
        return AutocompleteBridge.completionItemToSuggestion(s, request);
      });
    })();
  }

  static completionItemToSuggestion(item, request) {
    let suggestion = {
      text: item.insertText || item.label,
      displayText: item.label,
      filterText: item.filterText || item.label,
      type: AutocompleteBridge.completionKindToSuggestionType(item.kind),
      description: item.detail,
      descriptionMoreURL: item.documentation
    };

    if (item.textEdit) {
      const { range, newText } = item.textEdit;
      suggestion.replacementPrefix = request.editor.getTextInBufferRange(_convert2.default.lsRangeToAtomRange(range));
      suggestion.text = newText;
    }

    // TODO: Snippets
    return suggestion;
  }

  static completionKindToSuggestionType(kind) {
    switch (kind) {
      case ls.CompletionItemKind.Method:
        return 'method';
      case ls.CompletionItemKind.Function:
      case ls.CompletionItemKind.Constructor:
        return 'function';
      case ls.CompletionItemKind.Field:
      case ls.CompletionItemKind.Property:
        return 'property';
      case ls.CompletionItemKind.Variable:
        return 'variable';
      case ls.CompletionItemKind.Class:
        return 'class';
      case ls.CompletionItemKind.Interface:
        return 'interface';
      case ls.CompletionItemKind.Module:
        return 'module';
      case ls.CompletionItemKind.Unit:
        return 'builtin';
      case ls.CompletionItemKind.Enum:
        return 'enum';
      case ls.CompletionItemKind.Keyword:
        return 'keyword';
      case ls.CompletionItemKind.Snippet:
        return 'snippet';
      case ls.CompletionItemKind.File:
        return 'import';
      case ls.CompletionItemKind.Reference:
        return 'require';
      case ls.CompletionItemKind.Color:
      case ls.CompletionItemKind.Text:
      case ls.CompletionItemKind.Value:
      default:
        return 'value';
    }
  }
};
exports.default = AutocompleteBridge;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9icmlkZ2VzL2F1dG9jb21wbGV0ZS1icmlkZ2UuanMiXSwibmFtZXMiOlsibHMiLCJBdXRvY29tcGxldGVCcmlkZ2UiLCJjb25zdHJ1Y3RvciIsImxhbmd1YWdlQ2xpZW50IiwiX2xjIiwiZGlzcG9zZSIsInByb3ZpZGVTdWdnZXN0aW9ucyIsInJlcXVlc3QiLCJzdWdnZXN0aW9ucyIsImNvbXBsZXRpb24iLCJ0ZXh0RG9jdW1lbnQiLCJlZGl0b3JUb1RleHREb2N1bWVudElkZW50aWZpZXIiLCJlZGl0b3IiLCJwb3NpdGlvbiIsInBvaW50VG9Qb3NpdGlvbiIsImJ1ZmZlclBvc2l0aW9uIiwiQXJyYXkiLCJpc0FycmF5IiwiaXRlbXMiLCJtYXAiLCJjb21wbGV0aW9uSXRlbVRvU3VnZ2VzdGlvbiIsInMiLCJpdGVtIiwic3VnZ2VzdGlvbiIsInRleHQiLCJpbnNlcnRUZXh0IiwibGFiZWwiLCJkaXNwbGF5VGV4dCIsImZpbHRlclRleHQiLCJ0eXBlIiwiY29tcGxldGlvbktpbmRUb1N1Z2dlc3Rpb25UeXBlIiwia2luZCIsImRlc2NyaXB0aW9uIiwiZGV0YWlsIiwiZGVzY3JpcHRpb25Nb3JlVVJMIiwiZG9jdW1lbnRhdGlvbiIsInRleHRFZGl0IiwicmFuZ2UiLCJuZXdUZXh0IiwicmVwbGFjZW1lbnRQcmVmaXgiLCJnZXRUZXh0SW5CdWZmZXJSYW5nZSIsImxzUmFuZ2VUb0F0b21SYW5nZSIsIkNvbXBsZXRpb25JdGVtS2luZCIsIk1ldGhvZCIsIkZ1bmN0aW9uIiwiQ29uc3RydWN0b3IiLCJGaWVsZCIsIlByb3BlcnR5IiwiVmFyaWFibGUiLCJDbGFzcyIsIkludGVyZmFjZSIsIk1vZHVsZSIsIlVuaXQiLCJFbnVtIiwiS2V5d29yZCIsIlNuaXBwZXQiLCJGaWxlIiwiUmVmZXJlbmNlIiwiQ29sb3IiLCJUZXh0IiwiVmFsdWUiXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUE7O0lBQVlBLEU7O0FBQ1o7Ozs7Ozs7Ozs7SUFFcUJDLGtCLEdB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RzBDLGtCQUFILENBQXNCZSxTQUEzQjtBQUNFLGVBQU8sU0FBUDtBQUNGLFdBQUt6RCxHQUFHMEMsa0JBQUgsQ0FBc0JnQixLQUEzQjtBQUNBLFdBQUsxRCxHQUFHMEMsa0JBQUgsQ0FBc0JpQixJQUEzQjtBQUNBLFdBQUszRCxHQUFHMEMsa0JBQUgsQ0FBc0JrQixLQUEzQjtBQUNBO0FBQ0UsZUFBTyxPQUFQO0FBakNKO0FBbUNEO0FBM0VILEM7a0JBRHFCM0Qsa0IiLCJmaWxlIjoiYXV0b2NvbXBsZXRlLWJyaWRnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEBmbG93XHJcblxyXG5pbXBvcnQgKiBhcyBscyBmcm9tICcuLi9wcm90b2NvbC9sYW5ndWFnZWNsaWVudC12Mic7XHJcbmltcG9ydCBDb252ZXJ0IGZyb20gJy4uL2NvbnZlcnQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXV0b2NvbXBsZXRlQnJpZGdlXHJcbntcclxuICBfbGM6IGxzLkxhbmd1YWdlQ2xpZW50VjI7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGxhbmd1YWdlQ2xpZW50OiBscy5MYW5ndWFnZUNsaWVudFYyKSB7XHJcbiAgICB0aGlzLl9sYyA9IGxhbmd1YWdlQ2xpZW50O1xyXG4gIH1cclxuXHJcbiAgZGlzcG9zZSgpOiB2b2lkIHtcclxuICB9XHJcblxyXG4gIGFzeW5jIHByb3ZpZGVTdWdnZXN0aW9ucyhyZXF1ZXN0OiBhdG9tJEF1dG9jb21wbGV0ZVJlcXVlc3QpOiBQcm9taXNlPEFycmF5PGF0b20kQXV0b2NvbXBsZXRlU3VnZ2VzdGlvbj4+IHtcclxuICAgIGNvbnN0IHN1Z2dlc3Rpb25zID0gYXdhaXQgdGhpcy5fbGMuY29tcGxldGlvbih7XHJcbiAgICAgIHRleHREb2N1bWVudDogQ29udmVydC5lZGl0b3JUb1RleHREb2N1bWVudElkZW50aWZpZXIocmVxdWVzdC5lZGl0b3IpLFxyXG4gICAgICBwb3NpdGlvbjogQ29udmVydC5wb2ludFRvUG9zaXRpb24ocmVxdWVzdC5idWZmZXJQb3NpdGlvbilcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIChBcnJheS5pc0FycmF5KHN1Z2dlc3Rpb25zKSA/IHN1Z2dlc3Rpb25zIDogc3VnZ2VzdGlvbnMuaXRlbXMgfHwgW10pXHJcbiAgICAgIC5tYXAocyA9PiBBdXRvY29tcGxldGVCcmlkZ2UuY29tcGxldGlvbkl0ZW1Ub1N1Z2dlc3Rpb24ocywgcmVxdWVzdCkpO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIGNvbXBsZXRpb25JdGVtVG9TdWdnZXN0aW9uKGl0ZW06IGxzLkNvbXBsZXRpb25JdGVtLCByZXF1ZXN0OiBhdG9tJEF1dG9jb21wbGV0ZVJlcXVlc3QpOiBhdG9tJEF1dG9jb21wbGV0ZVN1Z2dlc3Rpb24ge1xyXG4gICAgbGV0IHN1Z2dlc3Rpb246IGF0b20kQXV0b2NvbXBsZXRlU3VnZ2VzdGlvbiA9IHtcclxuICAgICAgdGV4dDogaXRlbS5pbnNlcnRUZXh0IHx8IGl0ZW0ubGFiZWwsXHJcbiAgICAgIGRpc3BsYXlUZXh0OiBpdGVtLmxhYmVsLFxyXG4gICAgICBmaWx0ZXJUZXh0OiBpdGVtLmZpbHRlclRleHQgfHwgaXRlbS5sYWJlbCxcclxuICAgICAgdHlwZTogQXV0b2NvbXBsZXRlQnJpZGdlLmNvbXBsZXRpb25LaW5kVG9TdWdnZXN0aW9uVHlwZShpdGVtLmtpbmQpLFxyXG4gICAgICBkZXNjcmlwdGlvbjogaXRlbS5kZXRhaWwsXHJcbiAgICAgIGRlc2NyaXB0aW9uTW9yZVVSTDogaXRlbS5kb2N1bWVudGF0aW9uLFxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoaXRlbS50ZXh0RWRpdCkge1xyXG4gICAgICBjb25zdCB7cmFuZ2UsIG5ld1RleHR9ID0gaXRlbS50ZXh0RWRpdDtcclxuICAgICAgc3VnZ2VzdGlvbi5yZXBsYWNlbWVudFByZWZpeCA9IHJlcXVlc3QuZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKENvbnZlcnQubHNSYW5nZVRvQXRvbVJhbmdlKHJhbmdlKSk7XHJcbiAgICAgIHN1Z2dlc3Rpb24udGV4dCA9IG5ld1RleHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE9ETzogU25pcHBldHNcclxuICAgIHJldHVybiBzdWdnZXN0aW9uO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIGNvbXBsZXRpb25LaW5kVG9TdWdnZXN0aW9uVHlwZShraW5kOiA/bnVtYmVyKTogc3RyaW5nIHtcclxuICAgIHN3aXRjaChraW5kKSB7XHJcbiAgICAgIGNhc2UgbHMuQ29tcGxldGlvbkl0ZW1LaW5kLk1ldGhvZDpcclxuICAgICAgICByZXR1cm4gJ21ldGhvZCc7XHJcbiAgICAgIGNhc2UgbHMuQ29tcGxldGlvbkl0ZW1LaW5kLkZ1bmN0aW9uOlxyXG4gICAgICBjYXNlIGxzLkNvbXBsZXRpb25JdGVtS2luZC5Db25zdHJ1Y3RvcjpcclxuICAgICAgICByZXR1cm4gJ2Z1bmN0aW9uJztcclxuICAgICAgY2FzZSBscy5Db21wbGV0aW9uSXRlbUtpbmQuRmllbGQ6XHJcbiAgICAgIGNhc2UgbHMuQ29tcGxldGlvbkl0ZW1LaW5kLlByb3BlcnR5OlxyXG4gICAgICAgIHJldHVybiAncHJvcGVydHknO1xyXG4gICAgICBjYXNlIGxzLkNvbXBsZXRpb25JdGVtS2luZC5WYXJpYWJsZTpcclxuICAgICAgICByZXR1cm4gJ3ZhcmlhYmxlJztcclxuICAgICAgY2FzZSBscy5Db21wbGV0aW9uSXRlbUtpbmQuQ2xhc3M6XHJcbiAgICAgICAgcmV0dXJuICdjbGFzcyc7XHJcbiAgICAgIGNhc2UgbHMuQ29tcGxldGlvbkl0ZW1LaW5kLkludGVyZmFjZTpcclxuICAgICAgICByZXR1cm4gJ2ludGVyZmFjZSc7XHJcbiAgICAgIGNhc2UgbHMuQ29tcGxldGlvbkl0ZW1LaW5kLk1vZHVsZTpcclxuICAgICAgICByZXR1cm4gJ21vZHVsZSc7XHJcbiAgICAgIGNhc2UgbHMuQ29tcGxldGlvbkl0ZW1LaW5kLlVuaXQ6XHJcbiAgICAgICAgcmV0dXJuICdidWlsdGluJztcclxuICAgICAgY2FzZSBscy5Db21wbGV0aW9uSXRlbUtpbmQuRW51bTpcclxuICAgICAgICByZXR1cm4gJ2VudW0nO1xyXG4gICAgICBjYXNlIGxzLkNvbXBsZXRpb25JdGVtS2luZC5LZXl3b3JkOlxyXG4gICAgICAgIHJldHVybiAna2V5d29yZCc7XHJcbiAgICAgIGNhc2UgbHMuQ29tcGxldGlvbkl0ZW1LaW5kLlNuaXBwZXQ6XHJcbiAgICAgICAgcmV0dXJuICdzbmlwcGV0JztcclxuICAgICAgY2FzZSBscy5Db21wbGV0aW9uSXRlbUtpbmQuRmlsZTpcclxuICAgICAgICByZXR1cm4gJ2ltcG9ydCc7XHJcbiAgICAgIGNhc2UgbHMuQ29tcGxldGlvbkl0ZW1LaW5kLlJlZmVyZW5jZTpcclxuICAgICAgICByZXR1cm4gJ3JlcXVpcmUnO1xyXG4gICAgICBjYXNlIGxzLkNvbXBsZXRpb25JdGVtS2luZC5Db2xvcjpcclxuICAgICAgY2FzZSBscy5Db21wbGV0aW9uSXRlbUtpbmQuVGV4dDpcclxuICAgICAgY2FzZSBscy5Db21wbGV0aW9uSXRlbUtpbmQuVmFsdWU6XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgcmV0dXJuICd2YWx1ZSc7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==