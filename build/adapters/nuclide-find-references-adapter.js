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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9hZGFwdGVycy9udWNsaWRlLWZpbmQtcmVmZXJlbmNlcy1hZGFwdGVyLmpzIl0sIm5hbWVzIjpbIk51Y2xpZGVGaW5kUmVmZXJlbmNlc0FkYXB0ZXIiLCJjb25zdHJ1Y3RvciIsImxhbmd1YWdlQ2xpZW50IiwiX2xjIiwiZ2V0UmVmZXJlbmNlcyIsImVkaXRvciIsInBvaW50IiwicHJvamVjdFJvb3QiLCJkb2N1bWVudFBvc2l0aW9uUGFyYW1zIiwidGV4dERvY3VtZW50IiwiZWRpdG9yVG9UZXh0RG9jdW1lbnRJZGVudGlmaWVyIiwicG9zaXRpb24iLCJwb2ludFRvUG9zaXRpb24iLCJjb250ZXh0IiwiaW5jbHVkZURlY2xhcmF0aW9uIiwibG9jYXRpb25zIiwiZmluZFJlZmVyZW5jZXMiLCJsZW5ndGgiLCJyZWZlcmVuY2VzIiwibWFwIiwidXJpIiwidXJpVG9QYXRoIiwiciIsIm5hbWUiLCJyYW5nZSIsImxzUmFuZ2VUb0F0b21SYW5nZSIsImN1cnJlbnRSZWZlcmVuY2UiLCJmaW5kIiwiY29udGFpbnNQb2ludCIsInR5cGUiLCJiYXNlVXJpIiwicmVmZXJlbmNlZFN5bWJvbE5hbWUiLCJnZXRCdWZmZXIiLCJnZXRUZXh0SW5SYW5nZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQTs7QUFDQTs7Ozs7Ozs7SUFFcUJBLDRCLEdBQU4sTUFBTUEsNEJBQU4sQ0FBbUM7O0FBR2hEQyxjQUFZQyxjQUFaLEVBQXNEO0FBQ3BELFNBQUtDLEdBQUwsR0FBV0QsY0FBWDtBQUNEOztBQUVLRSxlQUFOLENBQW9CQyxNQUFwQixFQUE2Q0MsS0FBN0MsRUFBZ0VDLFdBQWhFLEVBQThIO0FBQUE7O0FBQUE7QUFDNUgsWUFBTUMseUJBQXlCO0FBQzdCQyxzQkFBYyxrQkFBUUMsOEJBQVIsQ0FBdUNMLE1BQXZDLENBRGU7QUFFN0JNLGtCQUFVLGtCQUFRQyxlQUFSLENBQXdCTixLQUF4QixDQUZtQjtBQUc3Qk8saUJBQVMsRUFBRUMsb0JBQW9CLElBQXRCO0FBSG9CLE9BQS9COztBQU1BLFlBQU1DLFlBQVksTUFBTSxNQUFLWixHQUFMLENBQVNhLGNBQVQsQ0FBd0JSLHNCQUF4QixDQUF4QjtBQUNBLFVBQUlPLGFBQWEsSUFBYixJQUFxQkEsVUFBVUUsTUFBVixLQUFxQixDQUE5QyxFQUFpRCxPQUFPLElBQVA7O0FBRWpELFlBQU1DLGFBQWFILFVBQVVJLEdBQVYsQ0FBYztBQUFBLGVBQU07QUFDckNDLGVBQUssa0JBQVFDLFNBQVIsQ0FBa0JDLEVBQUVGLEdBQXBCLENBRGdDO0FBRXJDRyxnQkFBTSxJQUYrQjtBQUdyQ0MsaUJBQU8sa0JBQVFDLGtCQUFSLENBQTJCSCxFQUFFRSxLQUE3QjtBQUg4QixTQUFOO0FBQUEsT0FBZCxDQUFuQjs7QUFNQSxZQUFNRSxtQkFBbUJSLFdBQVdTLElBQVgsQ0FBZ0I7QUFBQSxlQUFLTCxFQUFFRSxLQUFGLENBQVFJLGFBQVIsQ0FBc0J0QixLQUF0QixDQUFMO0FBQUEsT0FBaEIsQ0FBekI7QUFDQSxVQUFJb0Isb0JBQW9CLElBQXhCLEVBQThCLE9BQU8sSUFBUDs7QUFFOUIsYUFBTztBQUNMRyxjQUFNLE1BREQ7QUFFTEMsaUJBQVN2QixlQUFlLEVBRm5CO0FBR0x3Qiw4QkFBc0IxQixPQUFPMkIsU0FBUCxHQUFtQkMsY0FBbkIsQ0FBa0NQLGlCQUFpQkYsS0FBbkQsQ0FIakI7QUFJTE4sb0JBQVlBO0FBSlAsT0FBUDtBQW5CNEg7QUF5QjdIO0FBaEMrQyxDO2tCQUE3QmxCLDRCIiwiZmlsZSI6Im51Y2xpZGUtZmluZC1yZWZlcmVuY2VzLWFkYXB0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAZmxvd1xuXG5pbXBvcnQge0xhbmd1YWdlQ2xpZW50Q29ubmVjdGlvbn0gZnJvbSAnLi4vbGFuZ3VhZ2VjbGllbnQnO1xuaW1wb3J0IENvbnZlcnQgZnJvbSAnLi4vY29udmVydCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE51Y2xpZGVGaW5kUmVmZXJlbmNlc0FkYXB0ZXIge1xuICBfbGM6IExhbmd1YWdlQ2xpZW50Q29ubmVjdGlvbjtcblxuICBjb25zdHJ1Y3RvcihsYW5ndWFnZUNsaWVudDogTGFuZ3VhZ2VDbGllbnRDb25uZWN0aW9uKSB7XG4gICAgdGhpcy5fbGMgPSBsYW5ndWFnZUNsaWVudDtcbiAgfVxuXG4gIGFzeW5jIGdldFJlZmVyZW5jZXMoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIHBvaW50OiBhdG9tJFBvaW50LCBwcm9qZWN0Um9vdDogP3N0cmluZyk6IFByb21pc2U8P251Y2xpZGUkRmluZFJlZmVyZW5jZXNSZXR1cm4+IHtcbiAgICBjb25zdCBkb2N1bWVudFBvc2l0aW9uUGFyYW1zID0ge1xuICAgICAgdGV4dERvY3VtZW50OiBDb252ZXJ0LmVkaXRvclRvVGV4dERvY3VtZW50SWRlbnRpZmllcihlZGl0b3IpLFxuICAgICAgcG9zaXRpb246IENvbnZlcnQucG9pbnRUb1Bvc2l0aW9uKHBvaW50KSxcbiAgICAgIGNvbnRleHQ6IHsgaW5jbHVkZURlY2xhcmF0aW9uOiB0cnVlIH1cbiAgICB9O1xuXG4gICAgY29uc3QgbG9jYXRpb25zID0gYXdhaXQgdGhpcy5fbGMuZmluZFJlZmVyZW5jZXMoZG9jdW1lbnRQb3NpdGlvblBhcmFtcyk7XG4gICAgaWYgKGxvY2F0aW9ucyA9PSBudWxsIHx8IGxvY2F0aW9ucy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuXG4gICAgY29uc3QgcmVmZXJlbmNlcyA9IGxvY2F0aW9ucy5tYXAociA9PiAoe1xuICAgICAgdXJpOiBDb252ZXJ0LnVyaVRvUGF0aChyLnVyaSksXG4gICAgICBuYW1lOiBudWxsLFxuICAgICAgcmFuZ2U6IENvbnZlcnQubHNSYW5nZVRvQXRvbVJhbmdlKHIucmFuZ2UpXG4gICAgfSkpO1xuXG4gICAgY29uc3QgY3VycmVudFJlZmVyZW5jZSA9IHJlZmVyZW5jZXMuZmluZChyID0+IHIucmFuZ2UuY29udGFpbnNQb2ludChwb2ludCkpO1xuICAgIGlmIChjdXJyZW50UmVmZXJlbmNlID09IG51bGwpIHJldHVybiBudWxsO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdkYXRhJyxcbiAgICAgIGJhc2VVcmk6IHByb2plY3RSb290IHx8ICcnLFxuICAgICAgcmVmZXJlbmNlZFN5bWJvbE5hbWU6IGVkaXRvci5nZXRCdWZmZXIoKS5nZXRUZXh0SW5SYW5nZShjdXJyZW50UmVmZXJlbmNlLnJhbmdlKSxcbiAgICAgIHJlZmVyZW5jZXM6IHJlZmVyZW5jZXNcbiAgICB9XG4gIH1cbn1cbiJdfQ==