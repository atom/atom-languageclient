Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _languageclientV = require('../protocol/languageclient-v2');

var _convert = require('../convert');

var _convert2 = _interopRequireDefault(_convert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let NuclideDefinitionBridge = class NuclideDefinitionBridge {

  constructor(languageClient) {
    this._lc = languageClient;
  }

  getDefinition(editor, point) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const documentPositionParams = {
        textDocument: _convert2.default.editorToTextDocumentIdentifier(editor),
        position: _convert2.default.pointToPosition(point)
      };

      const highlights = yield _this._lc.documentHighlight(documentPositionParams);
      if (highlights == null || highlights.length === 0) return null;

      const definition = yield _this._lc.gotoDefinition(documentPositionParams);
      if (definition == null) return null;

      const definitions = (Array.isArray(definition) ? definition : [definition]).filter(function (d) {
        return d.range.start != null;
      });
      if (definitions.length === 0) return null;

      return {
        queryRange: highlights.map(function (h) {
          return _convert2.default.lsRangeToAtomRange(h.range);
        }),
        definitions: definitions.map(function (d) {
          return {
            path: _convert2.default.uriToPath(d.uri),
            position: _convert2.default.positionToPoint(d.range.start),
            range: _convert2.default.lsRangeToAtomRange(d.range),
            language: 'test'
          };
        })
      };
    })();
  }
};
exports.default = NuclideDefinitionBridge;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9icmlkZ2VzL251Y2xpZGUtZGVmaW5pdGlvbi1icmlkZ2UuanMiXSwibmFtZXMiOlsiTnVjbGlkZURlZmluaXRpb25CcmlkZ2UiLCJjb25zdHJ1Y3RvciIsImxhbmd1YWdlQ2xpZW50IiwiX2xjIiwiZ2V0RGVmaW5pdGlvbiIsImVkaXRvciIsInBvaW50IiwiZG9jdW1lbnRQb3NpdGlvblBhcmFtcyIsInRleHREb2N1bWVudCIsImVkaXRvclRvVGV4dERvY3VtZW50SWRlbnRpZmllciIsInBvc2l0aW9uIiwicG9pbnRUb1Bvc2l0aW9uIiwiaGlnaGxpZ2h0cyIsImRvY3VtZW50SGlnaGxpZ2h0IiwibGVuZ3RoIiwiZGVmaW5pdGlvbiIsImdvdG9EZWZpbml0aW9uIiwiZGVmaW5pdGlvbnMiLCJBcnJheSIsImlzQXJyYXkiLCJmaWx0ZXIiLCJkIiwicmFuZ2UiLCJzdGFydCIsInF1ZXJ5UmFuZ2UiLCJtYXAiLCJsc1JhbmdlVG9BdG9tUmFuZ2UiLCJoIiwicGF0aCIsInVyaVRvUGF0aCIsInVyaSIsInBvc2l0aW9uVG9Qb2ludCIsImxhbmd1YWdlIl0sIm1hcHBpbmdzIjoiOzs7OztBQUVBOztBQUNBOzs7Ozs7OztJQUVxQkEsdUIsR0FBTixNQUFNQSx1QkFBTixDQUE4Qjs7QUFHM0NDLGNBQVlDLGNBQVosRUFBOEM7QUFDNUMsU0FBS0MsR0FBTCxHQUFXRCxjQUFYO0FBQ0Q7O0FBRUtFLGVBQU4sQ0FBb0JDLE1BQXBCLEVBQXdDQyxLQUF4QyxFQUFvRztBQUFBOztBQUFBO0FBQ2xHLFlBQU1DLHlCQUF5QjtBQUM3QkMsc0JBQWMsa0JBQVFDLDhCQUFSLENBQXVDSixNQUF2QyxDQURlO0FBRTdCSyxrQkFBVSxrQkFBUUMsZUFBUixDQUF3QkwsS0FBeEI7QUFGbUIsT0FBL0I7O0FBS0EsWUFBTU0sYUFBYSxNQUFNLE1BQUtULEdBQUwsQ0FBU1UsaUJBQVQsQ0FBMkJOLHNCQUEzQixDQUF6QjtBQUNBLFVBQUlLLGNBQWMsSUFBZCxJQUFzQkEsV0FBV0UsTUFBWCxLQUFzQixDQUFoRCxFQUFtRCxPQUFPLElBQVA7O0FBRW5ELFlBQU1DLGFBQWEsTUFBTSxNQUFLWixHQUFMLENBQVNhLGNBQVQsQ0FBd0JULHNCQUF4QixDQUF6QjtBQUNBLFVBQUlRLGNBQWMsSUFBbEIsRUFBd0IsT0FBTyxJQUFQOztBQUV4QixZQUFNRSxjQUFjLENBQUNDLE1BQU1DLE9BQU4sQ0FBY0osVUFBZCxJQUE0QkEsVUFBNUIsR0FBeUMsQ0FBRUEsVUFBRixDQUExQyxFQUEwREssTUFBMUQsQ0FBaUU7QUFBQSxlQUFLQyxFQUFFQyxLQUFGLENBQVFDLEtBQVIsSUFBaUIsSUFBdEI7QUFBQSxPQUFqRSxDQUFwQjtBQUNBLFVBQUlOLFlBQVlILE1BQVosS0FBdUIsQ0FBM0IsRUFBOEIsT0FBTyxJQUFQOztBQUU5QixhQUFPO0FBQ0xVLG9CQUFZWixXQUFXYSxHQUFYLENBQWU7QUFBQSxpQkFBSyxrQkFBUUMsa0JBQVIsQ0FBMkJDLEVBQUVMLEtBQTdCLENBQUw7QUFBQSxTQUFmLENBRFA7QUFFTEwscUJBQWFBLFlBQVlRLEdBQVosQ0FBZ0I7QUFBQSxpQkFBTTtBQUNqQ0csa0JBQU0sa0JBQVFDLFNBQVIsQ0FBa0JSLEVBQUVTLEdBQXBCLENBRDJCO0FBRWpDcEIsc0JBQVUsa0JBQVFxQixlQUFSLENBQXdCVixFQUFFQyxLQUFGLENBQVFDLEtBQWhDLENBRnVCO0FBR2pDRCxtQkFBTyxrQkFBUUksa0JBQVIsQ0FBMkJMLEVBQUVDLEtBQTdCLENBSDBCO0FBSWpDVSxzQkFBVTtBQUp1QixXQUFOO0FBQUEsU0FBaEI7QUFGUixPQUFQO0FBZmtHO0FBd0JuRztBQS9CMEMsQztrQkFBeEJoQyx1QiIsImZpbGUiOiJudWNsaWRlLWRlZmluaXRpb24tYnJpZGdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQGZsb3dcclxuXHJcbmltcG9ydCB7TGFuZ3VhZ2VDbGllbnRWMn0gZnJvbSAnLi4vcHJvdG9jb2wvbGFuZ3VhZ2VjbGllbnQtdjInO1xyXG5pbXBvcnQgQ29udmVydCBmcm9tICcuLi9jb252ZXJ0JztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE51Y2xpZGVEZWZpbml0aW9uQnJpZGdlIHtcclxuICBfbGM6IExhbmd1YWdlQ2xpZW50VjI7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGxhbmd1YWdlQ2xpZW50OiBMYW5ndWFnZUNsaWVudFYyKSB7XHJcbiAgICB0aGlzLl9sYyA9IGxhbmd1YWdlQ2xpZW50O1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZ2V0RGVmaW5pdGlvbihlZGl0b3I6IFRleHRFZGl0b3IsIHBvaW50OiBhdG9tJFBvaW50KTogUHJvbWlzZTw/bnVjbGlkZSREZWZpbml0aW9uUXVlcnlSZXN1bHQ+IHtcclxuICAgIGNvbnN0IGRvY3VtZW50UG9zaXRpb25QYXJhbXMgPSB7XHJcbiAgICAgIHRleHREb2N1bWVudDogQ29udmVydC5lZGl0b3JUb1RleHREb2N1bWVudElkZW50aWZpZXIoZWRpdG9yKSxcclxuICAgICAgcG9zaXRpb246IENvbnZlcnQucG9pbnRUb1Bvc2l0aW9uKHBvaW50KVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBoaWdobGlnaHRzID0gYXdhaXQgdGhpcy5fbGMuZG9jdW1lbnRIaWdobGlnaHQoZG9jdW1lbnRQb3NpdGlvblBhcmFtcyk7XHJcbiAgICBpZiAoaGlnaGxpZ2h0cyA9PSBudWxsIHx8IGhpZ2hsaWdodHMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICBjb25zdCBkZWZpbml0aW9uID0gYXdhaXQgdGhpcy5fbGMuZ290b0RlZmluaXRpb24oZG9jdW1lbnRQb3NpdGlvblBhcmFtcyk7XHJcbiAgICBpZiAoZGVmaW5pdGlvbiA9PSBudWxsKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICBjb25zdCBkZWZpbml0aW9ucyA9IChBcnJheS5pc0FycmF5KGRlZmluaXRpb24pID8gZGVmaW5pdGlvbiA6IFsgZGVmaW5pdGlvbiBdKS5maWx0ZXIoZCA9PiBkLnJhbmdlLnN0YXJ0ICE9IG51bGwpO1xyXG4gICAgaWYgKGRlZmluaXRpb25zLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcXVlcnlSYW5nZTogaGlnaGxpZ2h0cy5tYXAoaCA9PiBDb252ZXJ0LmxzUmFuZ2VUb0F0b21SYW5nZShoLnJhbmdlKSksXHJcbiAgICAgIGRlZmluaXRpb25zOiBkZWZpbml0aW9ucy5tYXAoZCA9PiAoe1xyXG4gICAgICAgIHBhdGg6IENvbnZlcnQudXJpVG9QYXRoKGQudXJpKSxcclxuICAgICAgICBwb3NpdGlvbjogQ29udmVydC5wb3NpdGlvblRvUG9pbnQoZC5yYW5nZS5zdGFydCksXHJcbiAgICAgICAgcmFuZ2U6IENvbnZlcnQubHNSYW5nZVRvQXRvbVJhbmdlKGQucmFuZ2UpLFxyXG4gICAgICAgIGxhbmd1YWdlOiAndGVzdCdcclxuICAgICAgfSkpXHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG4iXX0=