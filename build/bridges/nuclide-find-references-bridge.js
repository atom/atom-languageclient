Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _languageclientV = require('../protocol/languageclient-v2');

var _convert = require('../convert');

var _convert2 = _interopRequireDefault(_convert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let NuclideFindReferencesBridge = class NuclideFindReferencesBridge {

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
exports.default = NuclideFindReferencesBridge;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9icmlkZ2VzL251Y2xpZGUtZmluZC1yZWZlcmVuY2VzLWJyaWRnZS5qcyJdLCJuYW1lcyI6WyJOdWNsaWRlRmluZFJlZmVyZW5jZXNCcmlkZ2UiLCJjb25zdHJ1Y3RvciIsImxhbmd1YWdlQ2xpZW50IiwiX2xjIiwiZ2V0UmVmZXJlbmNlcyIsImVkaXRvciIsInBvaW50IiwicHJvamVjdFJvb3QiLCJkb2N1bWVudFBvc2l0aW9uUGFyYW1zIiwidGV4dERvY3VtZW50IiwiZWRpdG9yVG9UZXh0RG9jdW1lbnRJZGVudGlmaWVyIiwicG9zaXRpb24iLCJwb2ludFRvUG9zaXRpb24iLCJjb250ZXh0IiwiaW5jbHVkZURlY2xhcmF0aW9uIiwibG9jYXRpb25zIiwiZmluZFJlZmVyZW5jZXMiLCJsZW5ndGgiLCJyZWZlcmVuY2VzIiwibWFwIiwidXJpIiwidXJpVG9QYXRoIiwiciIsIm5hbWUiLCJyYW5nZSIsImxzUmFuZ2VUb0F0b21SYW5nZSIsImN1cnJlbnRSZWZlcmVuY2UiLCJmaW5kIiwiY29udGFpbnNQb2ludCIsInR5cGUiLCJiYXNlVXJpIiwicmVmZXJlbmNlZFN5bWJvbE5hbWUiLCJnZXRCdWZmZXIiLCJnZXRUZXh0SW5SYW5nZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQTs7QUFDQTs7Ozs7Ozs7SUFFcUJBLDJCLEdBQU4sTUFBTUEsMkJBQU4sQ0FBa0M7O0FBRy9DQyxjQUFZQyxjQUFaLEVBQThDO0FBQzVDLFNBQUtDLEdBQUwsR0FBV0QsY0FBWDtBQUNEOztBQUVLRSxlQUFOLENBQW9CQyxNQUFwQixFQUE2Q0MsS0FBN0MsRUFBZ0VDLFdBQWhFLEVBQThIO0FBQUE7O0FBQUE7QUFDNUgsWUFBTUMseUJBQXlCO0FBQzdCQyxzQkFBYyxrQkFBUUMsOEJBQVIsQ0FBdUNMLE1BQXZDLENBRGU7QUFFN0JNLGtCQUFVLGtCQUFRQyxlQUFSLENBQXdCTixLQUF4QixDQUZtQjtBQUc3Qk8saUJBQVMsRUFBRUMsb0JBQW9CLElBQXRCO0FBSG9CLE9BQS9COztBQU1BLFlBQU1DLFlBQVksTUFBTSxNQUFLWixHQUFMLENBQVNhLGNBQVQsQ0FBd0JSLHNCQUF4QixDQUF4QjtBQUNBLFVBQUlPLGFBQWEsSUFBYixJQUFxQkEsVUFBVUUsTUFBVixLQUFxQixDQUE5QyxFQUFpRCxPQUFPLElBQVA7O0FBRWpELFlBQU1DLGFBQWFILFVBQVVJLEdBQVYsQ0FBYztBQUFBLGVBQU07QUFDckNDLGVBQUssa0JBQVFDLFNBQVIsQ0FBa0JDLEVBQUVGLEdBQXBCLENBRGdDO0FBRXJDRyxnQkFBTSxJQUYrQjtBQUdyQ0MsaUJBQU8sa0JBQVFDLGtCQUFSLENBQTJCSCxFQUFFRSxLQUE3QjtBQUg4QixTQUFOO0FBQUEsT0FBZCxDQUFuQjs7QUFNQSxZQUFNRSxtQkFBbUJSLFdBQVdTLElBQVgsQ0FBZ0I7QUFBQSxlQUFLTCxFQUFFRSxLQUFGLENBQVFJLGFBQVIsQ0FBc0J0QixLQUF0QixDQUFMO0FBQUEsT0FBaEIsQ0FBekI7QUFDQSxVQUFJb0Isb0JBQW9CLElBQXhCLEVBQThCLE9BQU8sSUFBUDs7QUFFOUIsYUFBTztBQUNMRyxjQUFNLE1BREQ7QUFFTEMsaUJBQVN2QixlQUFlLEVBRm5CO0FBR0x3Qiw4QkFBc0IxQixPQUFPMkIsU0FBUCxHQUFtQkMsY0FBbkIsQ0FBa0NQLGlCQUFpQkYsS0FBbkQsQ0FIakI7QUFJTE4sb0JBQVlBO0FBSlAsT0FBUDtBQW5CNEg7QUF5QjdIO0FBaEM4QyxDO2tCQUE1QmxCLDJCIiwiZmlsZSI6Im51Y2xpZGUtZmluZC1yZWZlcmVuY2VzLWJyaWRnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEBmbG93XHJcblxyXG5pbXBvcnQge0xhbmd1YWdlQ2xpZW50VjJ9IGZyb20gJy4uL3Byb3RvY29sL2xhbmd1YWdlY2xpZW50LXYyJztcclxuaW1wb3J0IENvbnZlcnQgZnJvbSAnLi4vY29udmVydCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOdWNsaWRlRmluZFJlZmVyZW5jZXNCcmlkZ2Uge1xyXG4gIF9sYzogTGFuZ3VhZ2VDbGllbnRWMjtcclxuXHJcbiAgY29uc3RydWN0b3IobGFuZ3VhZ2VDbGllbnQ6IExhbmd1YWdlQ2xpZW50VjIpIHtcclxuICAgIHRoaXMuX2xjID0gbGFuZ3VhZ2VDbGllbnQ7XHJcbiAgfVxyXG5cclxuICBhc3luYyBnZXRSZWZlcmVuY2VzKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLCBwb2ludDogYXRvbSRQb2ludCwgcHJvamVjdFJvb3Q6ID9zdHJpbmcpOiBQcm9taXNlPD9udWNsaWRlJEZpbmRSZWZlcmVuY2VzUmV0dXJuPiB7XHJcbiAgICBjb25zdCBkb2N1bWVudFBvc2l0aW9uUGFyYW1zID0ge1xyXG4gICAgICB0ZXh0RG9jdW1lbnQ6IENvbnZlcnQuZWRpdG9yVG9UZXh0RG9jdW1lbnRJZGVudGlmaWVyKGVkaXRvciksXHJcbiAgICAgIHBvc2l0aW9uOiBDb252ZXJ0LnBvaW50VG9Qb3NpdGlvbihwb2ludCksXHJcbiAgICAgIGNvbnRleHQ6IHsgaW5jbHVkZURlY2xhcmF0aW9uOiB0cnVlIH1cclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgbG9jYXRpb25zID0gYXdhaXQgdGhpcy5fbGMuZmluZFJlZmVyZW5jZXMoZG9jdW1lbnRQb3NpdGlvblBhcmFtcyk7XHJcbiAgICBpZiAobG9jYXRpb25zID09IG51bGwgfHwgbG9jYXRpb25zLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgY29uc3QgcmVmZXJlbmNlcyA9IGxvY2F0aW9ucy5tYXAociA9PiAoe1xyXG4gICAgICB1cmk6IENvbnZlcnQudXJpVG9QYXRoKHIudXJpKSxcclxuICAgICAgbmFtZTogbnVsbCxcclxuICAgICAgcmFuZ2U6IENvbnZlcnQubHNSYW5nZVRvQXRvbVJhbmdlKHIucmFuZ2UpXHJcbiAgICB9KSk7XHJcblxyXG4gICAgY29uc3QgY3VycmVudFJlZmVyZW5jZSA9IHJlZmVyZW5jZXMuZmluZChyID0+IHIucmFuZ2UuY29udGFpbnNQb2ludChwb2ludCkpO1xyXG4gICAgaWYgKGN1cnJlbnRSZWZlcmVuY2UgPT0gbnVsbCkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogJ2RhdGEnLFxyXG4gICAgICBiYXNlVXJpOiBwcm9qZWN0Um9vdCB8fCAnJyxcclxuICAgICAgcmVmZXJlbmNlZFN5bWJvbE5hbWU6IGVkaXRvci5nZXRCdWZmZXIoKS5nZXRUZXh0SW5SYW5nZShjdXJyZW50UmVmZXJlbmNlLnJhbmdlKSxcclxuICAgICAgcmVmZXJlbmNlczogcmVmZXJlbmNlc1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=