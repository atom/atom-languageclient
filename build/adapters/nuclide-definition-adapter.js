Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _languageclient = require('../languageclient');

var _convert = require('../convert');

var _convert2 = _interopRequireDefault(_convert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let NuclideDefinitionAdapter = class NuclideDefinitionAdapter {

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
exports.default = NuclideDefinitionAdapter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9hZGFwdGVycy9udWNsaWRlLWRlZmluaXRpb24tYWRhcHRlci5qcyJdLCJuYW1lcyI6WyJOdWNsaWRlRGVmaW5pdGlvbkFkYXB0ZXIiLCJjb25zdHJ1Y3RvciIsImxhbmd1YWdlQ2xpZW50IiwiX2xjIiwiZ2V0RGVmaW5pdGlvbiIsImVkaXRvciIsInBvaW50IiwiZG9jdW1lbnRQb3NpdGlvblBhcmFtcyIsInRleHREb2N1bWVudCIsImVkaXRvclRvVGV4dERvY3VtZW50SWRlbnRpZmllciIsInBvc2l0aW9uIiwicG9pbnRUb1Bvc2l0aW9uIiwiaGlnaGxpZ2h0cyIsImRvY3VtZW50SGlnaGxpZ2h0IiwibGVuZ3RoIiwiZGVmaW5pdGlvbiIsImdvdG9EZWZpbml0aW9uIiwiZGVmaW5pdGlvbnMiLCJBcnJheSIsImlzQXJyYXkiLCJmaWx0ZXIiLCJkIiwicmFuZ2UiLCJzdGFydCIsInF1ZXJ5UmFuZ2UiLCJtYXAiLCJsc1JhbmdlVG9BdG9tUmFuZ2UiLCJoIiwicGF0aCIsInVyaVRvUGF0aCIsInVyaSIsInBvc2l0aW9uVG9Qb2ludCIsImxhbmd1YWdlIl0sIm1hcHBpbmdzIjoiOzs7OztBQUVBOztBQUNBOzs7Ozs7OztJQUVxQkEsd0IsR0FBTixNQUFNQSx3QkFBTixDQUErQjs7QUFHNUNDLGNBQVlDLGNBQVosRUFBc0Q7QUFDcEQsU0FBS0MsR0FBTCxHQUFXRCxjQUFYO0FBQ0Q7O0FBRUtFLGVBQU4sQ0FBb0JDLE1BQXBCLEVBQXdDQyxLQUF4QyxFQUFvRztBQUFBOztBQUFBO0FBQ2xHLFlBQU1DLHlCQUF5QjtBQUM3QkMsc0JBQWMsa0JBQVFDLDhCQUFSLENBQXVDSixNQUF2QyxDQURlO0FBRTdCSyxrQkFBVSxrQkFBUUMsZUFBUixDQUF3QkwsS0FBeEI7QUFGbUIsT0FBL0I7O0FBS0EsWUFBTU0sYUFBYSxNQUFNLE1BQUtULEdBQUwsQ0FBU1UsaUJBQVQsQ0FBMkJOLHNCQUEzQixDQUF6QjtBQUNBLFVBQUlLLGNBQWMsSUFBZCxJQUFzQkEsV0FBV0UsTUFBWCxLQUFzQixDQUFoRCxFQUFtRCxPQUFPLElBQVA7O0FBRW5ELFlBQU1DLGFBQWEsTUFBTSxNQUFLWixHQUFMLENBQVNhLGNBQVQsQ0FBd0JULHNCQUF4QixDQUF6QjtBQUNBLFVBQUlRLGNBQWMsSUFBbEIsRUFBd0IsT0FBTyxJQUFQOztBQUV4QixZQUFNRSxjQUFjLENBQUNDLE1BQU1DLE9BQU4sQ0FBY0osVUFBZCxJQUE0QkEsVUFBNUIsR0FBeUMsQ0FBRUEsVUFBRixDQUExQyxFQUEwREssTUFBMUQsQ0FBaUU7QUFBQSxlQUFLQyxFQUFFQyxLQUFGLENBQVFDLEtBQVIsSUFBaUIsSUFBdEI7QUFBQSxPQUFqRSxDQUFwQjtBQUNBLFVBQUlOLFlBQVlILE1BQVosS0FBdUIsQ0FBM0IsRUFBOEIsT0FBTyxJQUFQOztBQUU5QixhQUFPO0FBQ0xVLG9CQUFZWixXQUFXYSxHQUFYLENBQWU7QUFBQSxpQkFBSyxrQkFBUUMsa0JBQVIsQ0FBMkJDLEVBQUVMLEtBQTdCLENBQUw7QUFBQSxTQUFmLENBRFA7QUFFTEwscUJBQWFBLFlBQVlRLEdBQVosQ0FBZ0I7QUFBQSxpQkFBTTtBQUNqQ0csa0JBQU0sa0JBQVFDLFNBQVIsQ0FBa0JSLEVBQUVTLEdBQXBCLENBRDJCO0FBRWpDcEIsc0JBQVUsa0JBQVFxQixlQUFSLENBQXdCVixFQUFFQyxLQUFGLENBQVFDLEtBQWhDLENBRnVCO0FBR2pDRCxtQkFBTyxrQkFBUUksa0JBQVIsQ0FBMkJMLEVBQUVDLEtBQTdCLENBSDBCO0FBSWpDVSxzQkFBVTtBQUp1QixXQUFOO0FBQUEsU0FBaEI7QUFGUixPQUFQO0FBZmtHO0FBd0JuRztBQS9CMkMsQztrQkFBekJoQyx3QiIsImZpbGUiOiJudWNsaWRlLWRlZmluaXRpb24tYWRhcHRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEBmbG93XG5cbmltcG9ydCB7TGFuZ3VhZ2VDbGllbnRDb25uZWN0aW9ufSBmcm9tICcuLi9sYW5ndWFnZWNsaWVudCc7XG5pbXBvcnQgQ29udmVydCBmcm9tICcuLi9jb252ZXJ0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTnVjbGlkZURlZmluaXRpb25BZGFwdGVyIHtcbiAgX2xjOiBMYW5ndWFnZUNsaWVudENvbm5lY3Rpb247XG5cbiAgY29uc3RydWN0b3IobGFuZ3VhZ2VDbGllbnQ6IExhbmd1YWdlQ2xpZW50Q29ubmVjdGlvbikge1xuICAgIHRoaXMuX2xjID0gbGFuZ3VhZ2VDbGllbnQ7XG4gIH1cblxuICBhc3luYyBnZXREZWZpbml0aW9uKGVkaXRvcjogVGV4dEVkaXRvciwgcG9pbnQ6IGF0b20kUG9pbnQpOiBQcm9taXNlPD9udWNsaWRlJERlZmluaXRpb25RdWVyeVJlc3VsdD4ge1xuICAgIGNvbnN0IGRvY3VtZW50UG9zaXRpb25QYXJhbXMgPSB7XG4gICAgICB0ZXh0RG9jdW1lbnQ6IENvbnZlcnQuZWRpdG9yVG9UZXh0RG9jdW1lbnRJZGVudGlmaWVyKGVkaXRvciksXG4gICAgICBwb3NpdGlvbjogQ29udmVydC5wb2ludFRvUG9zaXRpb24ocG9pbnQpXG4gICAgfTtcblxuICAgIGNvbnN0IGhpZ2hsaWdodHMgPSBhd2FpdCB0aGlzLl9sYy5kb2N1bWVudEhpZ2hsaWdodChkb2N1bWVudFBvc2l0aW9uUGFyYW1zKTtcbiAgICBpZiAoaGlnaGxpZ2h0cyA9PSBudWxsIHx8IGhpZ2hsaWdodHMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcblxuICAgIGNvbnN0IGRlZmluaXRpb24gPSBhd2FpdCB0aGlzLl9sYy5nb3RvRGVmaW5pdGlvbihkb2N1bWVudFBvc2l0aW9uUGFyYW1zKTtcbiAgICBpZiAoZGVmaW5pdGlvbiA9PSBudWxsKSByZXR1cm4gbnVsbDtcblxuICAgIGNvbnN0IGRlZmluaXRpb25zID0gKEFycmF5LmlzQXJyYXkoZGVmaW5pdGlvbikgPyBkZWZpbml0aW9uIDogWyBkZWZpbml0aW9uIF0pLmZpbHRlcihkID0+IGQucmFuZ2Uuc3RhcnQgIT0gbnVsbCk7XG4gICAgaWYgKGRlZmluaXRpb25zLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcXVlcnlSYW5nZTogaGlnaGxpZ2h0cy5tYXAoaCA9PiBDb252ZXJ0LmxzUmFuZ2VUb0F0b21SYW5nZShoLnJhbmdlKSksXG4gICAgICBkZWZpbml0aW9uczogZGVmaW5pdGlvbnMubWFwKGQgPT4gKHtcbiAgICAgICAgcGF0aDogQ29udmVydC51cmlUb1BhdGgoZC51cmkpLFxuICAgICAgICBwb3NpdGlvbjogQ29udmVydC5wb3NpdGlvblRvUG9pbnQoZC5yYW5nZS5zdGFydCksXG4gICAgICAgIHJhbmdlOiBDb252ZXJ0LmxzUmFuZ2VUb0F0b21SYW5nZShkLnJhbmdlKSxcbiAgICAgICAgbGFuZ3VhZ2U6ICd0ZXN0J1xuICAgICAgfSkpXG4gICAgfTtcbiAgfVxufVxuIl19