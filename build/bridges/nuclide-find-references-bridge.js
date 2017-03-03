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

  dispose() {}

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
      if (currentReference == null) {
        throw "Can't determine current references";
      }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9icmlkZ2VzL251Y2xpZGUtZmluZC1yZWZlcmVuY2VzLWJyaWRnZS5qcyJdLCJuYW1lcyI6WyJOdWNsaWRlRmluZFJlZmVyZW5jZXNCcmlkZ2UiLCJjb25zdHJ1Y3RvciIsImxhbmd1YWdlQ2xpZW50IiwiX2xjIiwiZGlzcG9zZSIsImdldFJlZmVyZW5jZXMiLCJlZGl0b3IiLCJwb2ludCIsInByb2plY3RSb290IiwiZG9jdW1lbnRQb3NpdGlvblBhcmFtcyIsInRleHREb2N1bWVudCIsImVkaXRvclRvVGV4dERvY3VtZW50SWRlbnRpZmllciIsInBvc2l0aW9uIiwicG9pbnRUb1Bvc2l0aW9uIiwiY29udGV4dCIsImluY2x1ZGVEZWNsYXJhdGlvbiIsImxvY2F0aW9ucyIsImZpbmRSZWZlcmVuY2VzIiwibGVuZ3RoIiwicmVmZXJlbmNlcyIsIm1hcCIsInVyaSIsInVyaVRvUGF0aCIsInIiLCJuYW1lIiwicmFuZ2UiLCJsc1JhbmdlVG9BdG9tUmFuZ2UiLCJjdXJyZW50UmVmZXJlbmNlIiwiZmluZCIsImNvbnRhaW5zUG9pbnQiLCJ0eXBlIiwiYmFzZVVyaSIsInJlZmVyZW5jZWRTeW1ib2xOYW1lIiwiZ2V0QnVmZmVyIiwiZ2V0VGV4dEluUmFuZ2UiXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUE7O0FBRUE7Ozs7Ozs7O0lBRXFCQSwyQixHQUFOLE1BQU1BLDJCQUFOLENBQWtDOztBQUcvQ0MsY0FBWUMsY0FBWixFQUE4QztBQUM1QyxTQUFLQyxHQUFMLEdBQVdELGNBQVg7QUFDRDs7QUFFREUsWUFBZ0IsQ0FDZjs7QUFFS0MsZUFBTixDQUFvQkMsTUFBcEIsRUFBNkNDLEtBQTdDLEVBQWdFQyxXQUFoRSxFQUE4SDtBQUFBOztBQUFBO0FBQzVILFlBQU1DLHlCQUF5QjtBQUM3QkMsc0JBQWMsa0JBQVFDLDhCQUFSLENBQXVDTCxNQUF2QyxDQURlO0FBRTdCTSxrQkFBVSxrQkFBUUMsZUFBUixDQUF3Qk4sS0FBeEIsQ0FGbUI7QUFHN0JPLGlCQUFTLEVBQUVDLG9CQUFvQixJQUF0QjtBQUhvQixPQUEvQjs7QUFNQSxZQUFNQyxZQUFZLE1BQU0sTUFBS2IsR0FBTCxDQUFTYyxjQUFULENBQXdCUixzQkFBeEIsQ0FBeEI7QUFDQSxVQUFJTyxhQUFhLElBQWIsSUFBcUJBLFVBQVVFLE1BQVYsS0FBcUIsQ0FBOUMsRUFBaUQsT0FBTyxJQUFQOztBQUVqRCxZQUFNQyxhQUFhSCxVQUFVSSxHQUFWLENBQWM7QUFBQSxlQUFNO0FBQ3JDQyxlQUFLLGtCQUFRQyxTQUFSLENBQWtCQyxFQUFFRixHQUFwQixDQURnQztBQUVyQ0csZ0JBQU0sSUFGK0I7QUFHckNDLGlCQUFPLGtCQUFRQyxrQkFBUixDQUEyQkgsRUFBRUUsS0FBN0I7QUFIOEIsU0FBTjtBQUFBLE9BQWQsQ0FBbkI7O0FBTUEsWUFBTUUsbUJBQW1CUixXQUFXUyxJQUFYLENBQWdCO0FBQUEsZUFBS0wsRUFBRUUsS0FBRixDQUFRSSxhQUFSLENBQXNCdEIsS0FBdEIsQ0FBTDtBQUFBLE9BQWhCLENBQXpCO0FBQ0EsVUFBSW9CLG9CQUFvQixJQUF4QixFQUE4QjtBQUM1QixjQUFNLG9DQUFOO0FBQ0Q7O0FBRUQsYUFBTztBQUNMRyxjQUFNLE1BREQ7QUFFTEMsaUJBQVN2QixlQUFlLEVBRm5CO0FBR0x3Qiw4QkFBc0IxQixPQUFPMkIsU0FBUCxHQUFtQkMsY0FBbkIsQ0FBa0NQLGlCQUFpQkYsS0FBbkQsQ0FIakI7QUFJTE4sb0JBQVlBO0FBSlAsT0FBUDtBQXJCNEg7QUEyQjdIO0FBckM4QyxDO2tCQUE1Qm5CLDJCIiwiZmlsZSI6Im51Y2xpZGUtZmluZC1yZWZlcmVuY2VzLWJyaWRnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEBmbG93XHJcblxyXG5pbXBvcnQge0xhbmd1YWdlQ2xpZW50VjJ9IGZyb20gJy4uL3Byb3RvY29sL2xhbmd1YWdlY2xpZW50LXYyJztcclxuaW1wb3J0IHR5cGUge0xvY2F0aW9ufSBmcm9tICcuLi9wcm90b2NvbC9sYW5ndWFnZWNsaWVudC12Mic7XHJcbmltcG9ydCBDb252ZXJ0IGZyb20gJy4uL2NvbnZlcnQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTnVjbGlkZUZpbmRSZWZlcmVuY2VzQnJpZGdlIHtcclxuICBfbGM6IExhbmd1YWdlQ2xpZW50VjI7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGxhbmd1YWdlQ2xpZW50OiBMYW5ndWFnZUNsaWVudFYyKSB7XHJcbiAgICB0aGlzLl9sYyA9IGxhbmd1YWdlQ2xpZW50O1xyXG4gIH1cclxuXHJcbiAgZGlzcG9zZSgpOiB2b2lkIHtcclxuICB9XHJcblxyXG4gIGFzeW5jIGdldFJlZmVyZW5jZXMoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIHBvaW50OiBhdG9tJFBvaW50LCBwcm9qZWN0Um9vdDogP3N0cmluZyk6IFByb21pc2U8P251Y2xpZGUkRmluZFJlZmVyZW5jZXNSZXR1cm4+IHtcclxuICAgIGNvbnN0IGRvY3VtZW50UG9zaXRpb25QYXJhbXMgPSB7XHJcbiAgICAgIHRleHREb2N1bWVudDogQ29udmVydC5lZGl0b3JUb1RleHREb2N1bWVudElkZW50aWZpZXIoZWRpdG9yKSxcclxuICAgICAgcG9zaXRpb246IENvbnZlcnQucG9pbnRUb1Bvc2l0aW9uKHBvaW50KSxcclxuICAgICAgY29udGV4dDogeyBpbmNsdWRlRGVjbGFyYXRpb246IHRydWUgfVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBsb2NhdGlvbnMgPSBhd2FpdCB0aGlzLl9sYy5maW5kUmVmZXJlbmNlcyhkb2N1bWVudFBvc2l0aW9uUGFyYW1zKTtcclxuICAgIGlmIChsb2NhdGlvbnMgPT0gbnVsbCB8fCBsb2NhdGlvbnMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICBjb25zdCByZWZlcmVuY2VzID0gbG9jYXRpb25zLm1hcChyID0+ICh7XHJcbiAgICAgIHVyaTogQ29udmVydC51cmlUb1BhdGgoci51cmkpLFxyXG4gICAgICBuYW1lOiBudWxsLFxyXG4gICAgICByYW5nZTogQ29udmVydC5sc1JhbmdlVG9BdG9tUmFuZ2Uoci5yYW5nZSlcclxuICAgIH0pKTtcclxuXHJcbiAgICBjb25zdCBjdXJyZW50UmVmZXJlbmNlID0gcmVmZXJlbmNlcy5maW5kKHIgPT4gci5yYW5nZS5jb250YWluc1BvaW50KHBvaW50KSk7XHJcbiAgICBpZiAoY3VycmVudFJlZmVyZW5jZSA9PSBudWxsKSB7XHJcbiAgICAgIHRocm93IFwiQ2FuJ3QgZGV0ZXJtaW5lIGN1cnJlbnQgcmVmZXJlbmNlc1wiO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6ICdkYXRhJyxcclxuICAgICAgYmFzZVVyaTogcHJvamVjdFJvb3QgfHwgJycsXHJcbiAgICAgIHJlZmVyZW5jZWRTeW1ib2xOYW1lOiBlZGl0b3IuZ2V0QnVmZmVyKCkuZ2V0VGV4dEluUmFuZ2UoY3VycmVudFJlZmVyZW5jZS5yYW5nZSksXHJcbiAgICAgIHJlZmVyZW5jZXM6IHJlZmVyZW5jZXNcclxuICAgIH1cclxuICB9XHJcbn1cclxuIl19