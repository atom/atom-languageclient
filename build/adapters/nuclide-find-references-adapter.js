Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _languageclient = require('../languageclient');

var _convert = require('../convert');

var _convert2 = _interopRequireDefault(_convert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let NuclideFindReferencesAdapter = class NuclideFindReferencesAdapter {

  constructor(languageClient) {
    this._lc = languageClient;
  }

  getReferences(editor, point, projectRoot) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const documentPositionParams = {
        textDocument: _convert2.default.editorToTextDocumentIdentifier(editor),
        position: _convert2.default.pointToPosition(point),
        context: { includeDeclaration: true }
      };

      const locations = yield _this._lc.findReferences(documentPositionParams);
      if (locations == null || locations.length === 0) return null;

      const references = locations.map(function (r) {
        return {
          uri: _convert2.default.uriToPath(r.uri),
          name: null,
          range: _convert2.default.lsRangeToAtomRange(r.range)
        };
      });

      const currentReference = references.find(function (r) {
        return r.range.containsPoint(point);
      });
      if (currentReference == null) return null;

      return {
        type: 'data',
        baseUri: projectRoot || '',
        referencedSymbolName: editor.getBuffer().getTextInRange(currentReference.range),
        references: references
      };
    })();
  }
};
exports.default = NuclideFindReferencesAdapter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9hZGFwdGVycy9udWNsaWRlLWZpbmQtcmVmZXJlbmNlcy1hZGFwdGVyLmpzIl0sIm5hbWVzIjpbIk51Y2xpZGVGaW5kUmVmZXJlbmNlc0FkYXB0ZXIiLCJjb25zdHJ1Y3RvciIsImxhbmd1YWdlQ2xpZW50IiwiX2xjIiwiZ2V0UmVmZXJlbmNlcyIsImVkaXRvciIsInBvaW50IiwicHJvamVjdFJvb3QiLCJkb2N1bWVudFBvc2l0aW9uUGFyYW1zIiwidGV4dERvY3VtZW50IiwiZWRpdG9yVG9UZXh0RG9jdW1lbnRJZGVudGlmaWVyIiwicG9zaXRpb24iLCJwb2ludFRvUG9zaXRpb24iLCJjb250ZXh0IiwiaW5jbHVkZURlY2xhcmF0aW9uIiwibG9jYXRpb25zIiwiZmluZFJlZmVyZW5jZXMiLCJsZW5ndGgiLCJyZWZlcmVuY2VzIiwibWFwIiwidXJpIiwidXJpVG9QYXRoIiwiciIsIm5hbWUiLCJyYW5nZSIsImxzUmFuZ2VUb0F0b21SYW5nZSIsImN1cnJlbnRSZWZlcmVuY2UiLCJmaW5kIiwiY29udGFpbnNQb2ludCIsInR5cGUiLCJiYXNlVXJpIiwicmVmZXJlbmNlZFN5bWJvbE5hbWUiLCJnZXRCdWZmZXIiLCJnZXRUZXh0SW5SYW5nZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQTs7QUFDQTs7Ozs7Ozs7SUFFcUJBLDRCLEdBQU4sTUFBTUEsNEJBQU4sQ0FBbUM7O0FBR2hEQyxjQUFZQyxjQUFaLEVBQXNEO0FBQ3BELFNBQUtDLEdBQUwsR0FBV0QsY0FBWDtBQUNEOztBQUVLRSxlQUFOLENBQW9CQyxNQUFwQixFQUE2Q0MsS0FBN0MsRUFBZ0VDLFdBQWhFLEVBQThIO0FBQUE7O0FBQUE7QUFDNUgsWUFBTUMseUJBQXlCO0FBQzdCQyxzQkFBYyxrQkFBUUMsOEJBQVIsQ0FBdUNMLE1BQXZDLENBRGU7QUFFN0JNLGtCQUFVLGtCQUFRQyxlQUFSLENBQXdCTixLQUF4QixDQUZtQjtBQUc3Qk8saUJBQVMsRUFBRUMsb0JBQW9CLElBQXRCO0FBSG9CLE9BQS9COztBQU1BLFlBQU1DLFlBQVksTUFBTSxNQUFLWixHQUFMLENBQVNhLGNBQVQsQ0FBd0JSLHNCQUF4QixDQUF4QjtBQUNBLFVBQUlPLGFBQWEsSUFBYixJQUFxQkEsVUFBVUUsTUFBVixLQUFxQixDQUE5QyxFQUFpRCxPQUFPLElBQVA7O0FBRWpELFlBQU1DLGFBQWFILFVBQVVJLEdBQVYsQ0FBYztBQUFBLGVBQU07QUFDckNDLGVBQUssa0JBQVFDLFNBQVIsQ0FBa0JDLEVBQUVGLEdBQXBCLENBRGdDO0FBRXJDRyxnQkFBTSxJQUYrQjtBQUdyQ0MsaUJBQU8sa0JBQVFDLGtCQUFSLENBQTJCSCxFQUFFRSxLQUE3QjtBQUg4QixTQUFOO0FBQUEsT0FBZCxDQUFuQjs7QUFNQSxZQUFNRSxtQkFBbUJSLFdBQVdTLElBQVgsQ0FBZ0I7QUFBQSxlQUFLTCxFQUFFRSxLQUFGLENBQVFJLGFBQVIsQ0FBc0J0QixLQUF0QixDQUFMO0FBQUEsT0FBaEIsQ0FBekI7QUFDQSxVQUFJb0Isb0JBQW9CLElBQXhCLEVBQThCLE9BQU8sSUFBUDs7QUFFOUIsYUFBTztBQUNMRyxjQUFNLE1BREQ7QUFFTEMsaUJBQVN2QixlQUFlLEVBRm5CO0FBR0x3Qiw4QkFBc0IxQixPQUFPMkIsU0FBUCxHQUFtQkMsY0FBbkIsQ0FBa0NQLGlCQUFpQkYsS0FBbkQsQ0FIakI7QUFJTE4sb0JBQVlBO0FBSlAsT0FBUDtBQW5CNEg7QUF5QjdIO0FBaEMrQyxDO2tCQUE3QmxCLDRCIiwiZmlsZSI6Im51Y2xpZGUtZmluZC1yZWZlcmVuY2VzLWFkYXB0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAZmxvd1xyXG5cclxuaW1wb3J0IHtMYW5ndWFnZUNsaWVudENvbm5lY3Rpb259IGZyb20gJy4uL2xhbmd1YWdlY2xpZW50JztcclxuaW1wb3J0IENvbnZlcnQgZnJvbSAnLi4vY29udmVydCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOdWNsaWRlRmluZFJlZmVyZW5jZXNBZGFwdGVyIHtcclxuICBfbGM6IExhbmd1YWdlQ2xpZW50Q29ubmVjdGlvbjtcclxuXHJcbiAgY29uc3RydWN0b3IobGFuZ3VhZ2VDbGllbnQ6IExhbmd1YWdlQ2xpZW50Q29ubmVjdGlvbikge1xyXG4gICAgdGhpcy5fbGMgPSBsYW5ndWFnZUNsaWVudDtcclxuICB9XHJcblxyXG4gIGFzeW5jIGdldFJlZmVyZW5jZXMoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIHBvaW50OiBhdG9tJFBvaW50LCBwcm9qZWN0Um9vdDogP3N0cmluZyk6IFByb21pc2U8P251Y2xpZGUkRmluZFJlZmVyZW5jZXNSZXR1cm4+IHtcclxuICAgIGNvbnN0IGRvY3VtZW50UG9zaXRpb25QYXJhbXMgPSB7XHJcbiAgICAgIHRleHREb2N1bWVudDogQ29udmVydC5lZGl0b3JUb1RleHREb2N1bWVudElkZW50aWZpZXIoZWRpdG9yKSxcclxuICAgICAgcG9zaXRpb246IENvbnZlcnQucG9pbnRUb1Bvc2l0aW9uKHBvaW50KSxcclxuICAgICAgY29udGV4dDogeyBpbmNsdWRlRGVjbGFyYXRpb246IHRydWUgfVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBsb2NhdGlvbnMgPSBhd2FpdCB0aGlzLl9sYy5maW5kUmVmZXJlbmNlcyhkb2N1bWVudFBvc2l0aW9uUGFyYW1zKTtcclxuICAgIGlmIChsb2NhdGlvbnMgPT0gbnVsbCB8fCBsb2NhdGlvbnMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICBjb25zdCByZWZlcmVuY2VzID0gbG9jYXRpb25zLm1hcChyID0+ICh7XHJcbiAgICAgIHVyaTogQ29udmVydC51cmlUb1BhdGgoci51cmkpLFxyXG4gICAgICBuYW1lOiBudWxsLFxyXG4gICAgICByYW5nZTogQ29udmVydC5sc1JhbmdlVG9BdG9tUmFuZ2Uoci5yYW5nZSlcclxuICAgIH0pKTtcclxuXHJcbiAgICBjb25zdCBjdXJyZW50UmVmZXJlbmNlID0gcmVmZXJlbmNlcy5maW5kKHIgPT4gci5yYW5nZS5jb250YWluc1BvaW50KHBvaW50KSk7XHJcbiAgICBpZiAoY3VycmVudFJlZmVyZW5jZSA9PSBudWxsKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiAnZGF0YScsXHJcbiAgICAgIGJhc2VVcmk6IHByb2plY3RSb290IHx8ICcnLFxyXG4gICAgICByZWZlcmVuY2VkU3ltYm9sTmFtZTogZWRpdG9yLmdldEJ1ZmZlcigpLmdldFRleHRJblJhbmdlKGN1cnJlbnRSZWZlcmVuY2UucmFuZ2UpLFxyXG4gICAgICByZWZlcmVuY2VzOiByZWZlcmVuY2VzXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==