Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _languageclient = require('../languageclient');

var _convert = require('../convert');

var _convert2 = _interopRequireDefault(_convert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let NuclideOutlineViewAdapter = class NuclideOutlineViewAdapter {

  constructor(languageClient, name) {
    this._lc = languageClient;
    this._name = name;
  }

  getOutline(editor) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const results = yield _this._lc.documentSymbol({ textDocument: _convert2.default.editorToTextDocumentIdentifier(editor) });
      return {
        outlineTrees: NuclideOutlineViewAdapter.createOutlineTrees(results)
      };
    })();
  }

  static createOutlineTrees(symbols) {
    // TODO: Limitation here is that the containerNames do not have any positional information in LSP
    return Array.from(new Set(symbols.map(r => r.containerName))).map(c => ({
      plainText: c,
      startPosition: 0,
      endPosition: 0,
      children: symbols.filter(s => s.containerName == c).map(NuclideOutlineViewAdapter.symbolToOutline)
    }));
  }

  static symbolToOutline(symbol) {
    return {
      plainText: symbol.name,
      startPosition: _convert2.default.positionToPoint(symbol.location.range.start),
      endPosition: _convert2.default.positionToPoint(symbol.location.range.end),
      children: []
    };
  }

  static symbolKindToTokenKind(symbol) {
    switch (symbol) {
      case _languageclient.SymbolKind.Class:
        return 'type';
      case _languageclient.SymbolKind.Constructor:
        return 'constructor';
      case _languageclient.SymbolKind.Method:
      case _languageclient.SymbolKind.Function:
        return 'method';
      case _languageclient.SymbolKind.String:
        return 'string';
      default:
        return 'plain';
    };
  }
};
exports.default = NuclideOutlineViewAdapter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9hZGFwdGVycy9udWNsaWRlLW91dGxpbmUtdmlldy1hZGFwdGVyLmpzIl0sIm5hbWVzIjpbIk51Y2xpZGVPdXRsaW5lVmlld0FkYXB0ZXIiLCJjb25zdHJ1Y3RvciIsImxhbmd1YWdlQ2xpZW50IiwibmFtZSIsIl9sYyIsIl9uYW1lIiwiZ2V0T3V0bGluZSIsImVkaXRvciIsInJlc3VsdHMiLCJkb2N1bWVudFN5bWJvbCIsInRleHREb2N1bWVudCIsImVkaXRvclRvVGV4dERvY3VtZW50SWRlbnRpZmllciIsIm91dGxpbmVUcmVlcyIsImNyZWF0ZU91dGxpbmVUcmVlcyIsInN5bWJvbHMiLCJBcnJheSIsImZyb20iLCJTZXQiLCJtYXAiLCJyIiwiY29udGFpbmVyTmFtZSIsImMiLCJwbGFpblRleHQiLCJzdGFydFBvc2l0aW9uIiwiZW5kUG9zaXRpb24iLCJjaGlsZHJlbiIsImZpbHRlciIsInMiLCJzeW1ib2xUb091dGxpbmUiLCJzeW1ib2wiLCJwb3NpdGlvblRvUG9pbnQiLCJsb2NhdGlvbiIsInJhbmdlIiwic3RhcnQiLCJlbmQiLCJzeW1ib2xLaW5kVG9Ub2tlbktpbmQiLCJDbGFzcyIsIkNvbnN0cnVjdG9yIiwiTWV0aG9kIiwiRnVuY3Rpb24iLCJTdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUE7O0FBRUE7Ozs7Ozs7O0lBRXFCQSx5QixHQUFOLE1BQU1BLHlCQUFOLENBQWdDOztBQUk3Q0MsY0FBWUMsY0FBWixFQUFzREMsSUFBdEQsRUFBb0U7QUFDbEUsU0FBS0MsR0FBTCxHQUFXRixjQUFYO0FBQ0EsU0FBS0csS0FBTCxHQUFhRixJQUFiO0FBQ0Q7O0FBRUtHLFlBQU4sQ0FBaUJDLE1BQWpCLEVBQXFFO0FBQUE7O0FBQUE7QUFDbkUsWUFBTUMsVUFBVSxNQUFNLE1BQUtKLEdBQUwsQ0FBU0ssY0FBVCxDQUF3QixFQUFFQyxjQUFjLGtCQUFRQyw4QkFBUixDQUF1Q0osTUFBdkMsQ0FBaEIsRUFBeEIsQ0FBdEI7QUFDQSxhQUFPO0FBQ0xLLHNCQUFjWiwwQkFBMEJhLGtCQUExQixDQUE2Q0wsT0FBN0M7QUFEVCxPQUFQO0FBRm1FO0FBS3BFOztBQUVELFNBQU9LLGtCQUFQLENBQTBCQyxPQUExQixFQUF5RjtBQUN2RjtBQUNBLFdBQU9DLE1BQU1DLElBQU4sQ0FBVyxJQUFJQyxHQUFKLENBQVFILFFBQVFJLEdBQVIsQ0FBWUMsS0FBS0EsRUFBRUMsYUFBbkIsQ0FBUixDQUFYLEVBQXVERixHQUF2RCxDQUEyREcsTUFBTTtBQUN0RUMsaUJBQVdELENBRDJEO0FBRXRFRSxxQkFBZSxDQUZ1RDtBQUd0RUMsbUJBQWEsQ0FIeUQ7QUFJdEVDLGdCQUFVWCxRQUFRWSxNQUFSLENBQWVDLEtBQUtBLEVBQUVQLGFBQUYsSUFBbUJDLENBQXZDLEVBQTBDSCxHQUExQyxDQUE4Q2xCLDBCQUEwQjRCLGVBQXhFO0FBSjRELEtBQU4sQ0FBM0QsQ0FBUDtBQU1EOztBQUVELFNBQU9BLGVBQVAsQ0FBdUJDLE1BQXZCLEVBQXVFO0FBQ3JFLFdBQU87QUFDTFAsaUJBQVdPLE9BQU8xQixJQURiO0FBRUxvQixxQkFBZSxrQkFBUU8sZUFBUixDQUF3QkQsT0FBT0UsUUFBUCxDQUFnQkMsS0FBaEIsQ0FBc0JDLEtBQTlDLENBRlY7QUFHTFQsbUJBQWEsa0JBQVFNLGVBQVIsQ0FBd0JELE9BQU9FLFFBQVAsQ0FBZ0JDLEtBQWhCLENBQXNCRSxHQUE5QyxDQUhSO0FBSUxULGdCQUFVO0FBSkwsS0FBUDtBQU1EOztBQUVELFNBQU9VLHFCQUFQLENBQTZCTixNQUE3QixFQUFnRTtBQUM5RCxZQUFPQSxNQUFQO0FBQ0UsV0FBSywyQkFBV08sS0FBaEI7QUFDRSxlQUFPLE1BQVA7QUFDRixXQUFLLDJCQUFXQyxXQUFoQjtBQUNFLGVBQU8sYUFBUDtBQUNGLFdBQUssMkJBQVdDLE1BQWhCO0FBQ0EsV0FBSywyQkFBV0MsUUFBaEI7QUFDRSxlQUFPLFFBQVA7QUFDRixXQUFLLDJCQUFXQyxNQUFoQjtBQUNFLGVBQU8sUUFBUDtBQUNGO0FBQ0UsZUFBTyxPQUFQO0FBWEosS0FZQztBQUNGO0FBakQ0QyxDO2tCQUExQnhDLHlCIiwiZmlsZSI6Im51Y2xpZGUtb3V0bGluZS12aWV3LWFkYXB0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAZmxvd1xyXG5cclxuaW1wb3J0IHtMYW5ndWFnZUNsaWVudENvbm5lY3Rpb24sIFN5bWJvbEtpbmR9IGZyb20gJy4uL2xhbmd1YWdlY2xpZW50JztcclxuaW1wb3J0IHR5cGUge1N5bWJvbEluZm9ybWF0aW9ufSBmcm9tICcuLi9sYW5ndWFnZWNsaWVudCc7XHJcbmltcG9ydCBDb252ZXJ0IGZyb20gJy4uL2NvbnZlcnQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTnVjbGlkZU91dGxpbmVWaWV3QWRhcHRlciB7XHJcbiAgX2xjOiBMYW5ndWFnZUNsaWVudENvbm5lY3Rpb247XHJcbiAgX25hbWU6IHN0cmluZztcclxuXHJcbiAgY29uc3RydWN0b3IobGFuZ3VhZ2VDbGllbnQ6IExhbmd1YWdlQ2xpZW50Q29ubmVjdGlvbiwgbmFtZTogc3RyaW5nKSB7XHJcbiAgICB0aGlzLl9sYyA9IGxhbmd1YWdlQ2xpZW50O1xyXG4gICAgdGhpcy5fbmFtZSA9IG5hbWU7XHJcbiAgfVxyXG5cclxuICBhc3luYyBnZXRPdXRsaW5lKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogUHJvbWlzZTw/bnVjbGlkZSRPdXRsaW5lPiB7XHJcbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgdGhpcy5fbGMuZG9jdW1lbnRTeW1ib2woeyB0ZXh0RG9jdW1lbnQ6IENvbnZlcnQuZWRpdG9yVG9UZXh0RG9jdW1lbnRJZGVudGlmaWVyKGVkaXRvcikgfSk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBvdXRsaW5lVHJlZXM6IE51Y2xpZGVPdXRsaW5lVmlld0FkYXB0ZXIuY3JlYXRlT3V0bGluZVRyZWVzKHJlc3VsdHMpXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIGNyZWF0ZU91dGxpbmVUcmVlcyhzeW1ib2xzOiBBcnJheTxTeW1ib2xJbmZvcm1hdGlvbj4pOiBBcnJheTxudWNsaWRlJE91dGxpbmVUcmVlPiB7XHJcbiAgICAvLyBUT0RPOiBMaW1pdGF0aW9uIGhlcmUgaXMgdGhhdCB0aGUgY29udGFpbmVyTmFtZXMgZG8gbm90IGhhdmUgYW55IHBvc2l0aW9uYWwgaW5mb3JtYXRpb24gaW4gTFNQXHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KHN5bWJvbHMubWFwKHIgPT4gci5jb250YWluZXJOYW1lKSkpLm1hcChjID0+ICh7XHJcbiAgICAgIHBsYWluVGV4dDogYyxcclxuICAgICAgc3RhcnRQb3NpdGlvbjogMCxcclxuICAgICAgZW5kUG9zaXRpb246IDAsXHJcbiAgICAgIGNoaWxkcmVuOiBzeW1ib2xzLmZpbHRlcihzID0+IHMuY29udGFpbmVyTmFtZSA9PSBjKS5tYXAoTnVjbGlkZU91dGxpbmVWaWV3QWRhcHRlci5zeW1ib2xUb091dGxpbmUpXHJcbiAgICB9KSk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgc3ltYm9sVG9PdXRsaW5lKHN5bWJvbDogU3ltYm9sSW5mb3JtYXRpb24pOiBudWNsaWRlJE91dGxpbmVUcmVlIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHBsYWluVGV4dDogc3ltYm9sLm5hbWUsXHJcbiAgICAgIHN0YXJ0UG9zaXRpb246IENvbnZlcnQucG9zaXRpb25Ub1BvaW50KHN5bWJvbC5sb2NhdGlvbi5yYW5nZS5zdGFydCksXHJcbiAgICAgIGVuZFBvc2l0aW9uOiBDb252ZXJ0LnBvc2l0aW9uVG9Qb2ludChzeW1ib2wubG9jYXRpb24ucmFuZ2UuZW5kKSxcclxuICAgICAgY2hpbGRyZW46IFtdXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIHN5bWJvbEtpbmRUb1Rva2VuS2luZChzeW1ib2w6IG51bWJlcik6IG51Y2xpZGUkVG9rZW5LaW5kIHtcclxuICAgIHN3aXRjaChzeW1ib2wpIHtcclxuICAgICAgY2FzZSBTeW1ib2xLaW5kLkNsYXNzOlxyXG4gICAgICAgIHJldHVybiAndHlwZSc7XHJcbiAgICAgIGNhc2UgU3ltYm9sS2luZC5Db25zdHJ1Y3RvcjpcclxuICAgICAgICByZXR1cm4gJ2NvbnN0cnVjdG9yJztcclxuICAgICAgY2FzZSBTeW1ib2xLaW5kLk1ldGhvZDpcclxuICAgICAgY2FzZSBTeW1ib2xLaW5kLkZ1bmN0aW9uOlxyXG4gICAgICAgIHJldHVybiAnbWV0aG9kJztcclxuICAgICAgY2FzZSBTeW1ib2xLaW5kLlN0cmluZzpcclxuICAgICAgICByZXR1cm4gJ3N0cmluZyc7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgcmV0dXJuICdwbGFpbic7XHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG4iXX0=