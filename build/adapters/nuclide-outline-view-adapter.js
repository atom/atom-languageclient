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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9hZGFwdGVycy9udWNsaWRlLW91dGxpbmUtdmlldy1hZGFwdGVyLmpzIl0sIm5hbWVzIjpbIk51Y2xpZGVPdXRsaW5lVmlld0FkYXB0ZXIiLCJjb25zdHJ1Y3RvciIsImxhbmd1YWdlQ2xpZW50IiwibmFtZSIsIl9sYyIsIl9uYW1lIiwiZ2V0T3V0bGluZSIsImVkaXRvciIsInJlc3VsdHMiLCJkb2N1bWVudFN5bWJvbCIsInRleHREb2N1bWVudCIsImVkaXRvclRvVGV4dERvY3VtZW50SWRlbnRpZmllciIsIm91dGxpbmVUcmVlcyIsImNyZWF0ZU91dGxpbmVUcmVlcyIsInN5bWJvbHMiLCJBcnJheSIsImZyb20iLCJTZXQiLCJtYXAiLCJyIiwiY29udGFpbmVyTmFtZSIsImMiLCJwbGFpblRleHQiLCJzdGFydFBvc2l0aW9uIiwiZW5kUG9zaXRpb24iLCJjaGlsZHJlbiIsImZpbHRlciIsInMiLCJzeW1ib2xUb091dGxpbmUiLCJzeW1ib2wiLCJwb3NpdGlvblRvUG9pbnQiLCJsb2NhdGlvbiIsInJhbmdlIiwic3RhcnQiLCJlbmQiLCJzeW1ib2xLaW5kVG9Ub2tlbktpbmQiLCJDbGFzcyIsIkNvbnN0cnVjdG9yIiwiTWV0aG9kIiwiRnVuY3Rpb24iLCJTdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUE7O0FBRUE7Ozs7Ozs7O0lBRXFCQSx5QixHQUFOLE1BQU1BLHlCQUFOLENBQWdDOztBQUk3Q0MsY0FBWUMsY0FBWixFQUFzREMsSUFBdEQsRUFBb0U7QUFDbEUsU0FBS0MsR0FBTCxHQUFXRixjQUFYO0FBQ0EsU0FBS0csS0FBTCxHQUFhRixJQUFiO0FBQ0Q7O0FBRUtHLFlBQU4sQ0FBaUJDLE1BQWpCLEVBQXFFO0FBQUE7O0FBQUE7QUFDbkUsWUFBTUMsVUFBVSxNQUFNLE1BQUtKLEdBQUwsQ0FBU0ssY0FBVCxDQUF3QixFQUFFQyxjQUFjLGtCQUFRQyw4QkFBUixDQUF1Q0osTUFBdkMsQ0FBaEIsRUFBeEIsQ0FBdEI7QUFDQSxhQUFPO0FBQ0xLLHNCQUFjWiwwQkFBMEJhLGtCQUExQixDQUE2Q0wsT0FBN0M7QUFEVCxPQUFQO0FBRm1FO0FBS3BFOztBQUVELFNBQU9LLGtCQUFQLENBQTBCQyxPQUExQixFQUF5RjtBQUN2RjtBQUNBLFdBQU9DLE1BQU1DLElBQU4sQ0FBVyxJQUFJQyxHQUFKLENBQVFILFFBQVFJLEdBQVIsQ0FBWUMsS0FBS0EsRUFBRUMsYUFBbkIsQ0FBUixDQUFYLEVBQXVERixHQUF2RCxDQUEyREcsTUFBTTtBQUN0RUMsaUJBQVdELENBRDJEO0FBRXRFRSxxQkFBZSxDQUZ1RDtBQUd0RUMsbUJBQWEsQ0FIeUQ7QUFJdEVDLGdCQUFVWCxRQUFRWSxNQUFSLENBQWVDLEtBQUtBLEVBQUVQLGFBQUYsSUFBbUJDLENBQXZDLEVBQTBDSCxHQUExQyxDQUE4Q2xCLDBCQUEwQjRCLGVBQXhFO0FBSjRELEtBQU4sQ0FBM0QsQ0FBUDtBQU1EOztBQUVELFNBQU9BLGVBQVAsQ0FBdUJDLE1BQXZCLEVBQXVFO0FBQ3JFLFdBQU87QUFDTFAsaUJBQVdPLE9BQU8xQixJQURiO0FBRUxvQixxQkFBZSxrQkFBUU8sZUFBUixDQUF3QkQsT0FBT0UsUUFBUCxDQUFnQkMsS0FBaEIsQ0FBc0JDLEtBQTlDLENBRlY7QUFHTFQsbUJBQWEsa0JBQVFNLGVBQVIsQ0FBd0JELE9BQU9FLFFBQVAsQ0FBZ0JDLEtBQWhCLENBQXNCRSxHQUE5QyxDQUhSO0FBSUxULGdCQUFVO0FBSkwsS0FBUDtBQU1EOztBQUVELFNBQU9VLHFCQUFQLENBQTZCTixNQUE3QixFQUFnRTtBQUM5RCxZQUFPQSxNQUFQO0FBQ0UsV0FBSywyQkFBV08sS0FBaEI7QUFDRSxlQUFPLE1BQVA7QUFDRixXQUFLLDJCQUFXQyxXQUFoQjtBQUNFLGVBQU8sYUFBUDtBQUNGLFdBQUssMkJBQVdDLE1BQWhCO0FBQ0EsV0FBSywyQkFBV0MsUUFBaEI7QUFDRSxlQUFPLFFBQVA7QUFDRixXQUFLLDJCQUFXQyxNQUFoQjtBQUNFLGVBQU8sUUFBUDtBQUNGO0FBQ0UsZUFBTyxPQUFQO0FBWEosS0FZQztBQUNGO0FBakQ0QyxDO2tCQUExQnhDLHlCIiwiZmlsZSI6Im51Y2xpZGUtb3V0bGluZS12aWV3LWFkYXB0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAZmxvd1xuXG5pbXBvcnQge0xhbmd1YWdlQ2xpZW50Q29ubmVjdGlvbiwgU3ltYm9sS2luZH0gZnJvbSAnLi4vbGFuZ3VhZ2VjbGllbnQnO1xuaW1wb3J0IHR5cGUge1N5bWJvbEluZm9ybWF0aW9ufSBmcm9tICcuLi9sYW5ndWFnZWNsaWVudCc7XG5pbXBvcnQgQ29udmVydCBmcm9tICcuLi9jb252ZXJ0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTnVjbGlkZU91dGxpbmVWaWV3QWRhcHRlciB7XG4gIF9sYzogTGFuZ3VhZ2VDbGllbnRDb25uZWN0aW9uO1xuICBfbmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGxhbmd1YWdlQ2xpZW50OiBMYW5ndWFnZUNsaWVudENvbm5lY3Rpb24sIG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuX2xjID0gbGFuZ3VhZ2VDbGllbnQ7XG4gICAgdGhpcy5fbmFtZSA9IG5hbWU7XG4gIH1cblxuICBhc3luYyBnZXRPdXRsaW5lKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogUHJvbWlzZTw/bnVjbGlkZSRPdXRsaW5lPiB7XG4gICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHRoaXMuX2xjLmRvY3VtZW50U3ltYm9sKHsgdGV4dERvY3VtZW50OiBDb252ZXJ0LmVkaXRvclRvVGV4dERvY3VtZW50SWRlbnRpZmllcihlZGl0b3IpIH0pO1xuICAgIHJldHVybiB7XG4gICAgICBvdXRsaW5lVHJlZXM6IE51Y2xpZGVPdXRsaW5lVmlld0FkYXB0ZXIuY3JlYXRlT3V0bGluZVRyZWVzKHJlc3VsdHMpXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBjcmVhdGVPdXRsaW5lVHJlZXMoc3ltYm9sczogQXJyYXk8U3ltYm9sSW5mb3JtYXRpb24+KTogQXJyYXk8bnVjbGlkZSRPdXRsaW5lVHJlZT4ge1xuICAgIC8vIFRPRE86IExpbWl0YXRpb24gaGVyZSBpcyB0aGF0IHRoZSBjb250YWluZXJOYW1lcyBkbyBub3QgaGF2ZSBhbnkgcG9zaXRpb25hbCBpbmZvcm1hdGlvbiBpbiBMU1BcbiAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KHN5bWJvbHMubWFwKHIgPT4gci5jb250YWluZXJOYW1lKSkpLm1hcChjID0+ICh7XG4gICAgICBwbGFpblRleHQ6IGMsXG4gICAgICBzdGFydFBvc2l0aW9uOiAwLFxuICAgICAgZW5kUG9zaXRpb246IDAsXG4gICAgICBjaGlsZHJlbjogc3ltYm9scy5maWx0ZXIocyA9PiBzLmNvbnRhaW5lck5hbWUgPT0gYykubWFwKE51Y2xpZGVPdXRsaW5lVmlld0FkYXB0ZXIuc3ltYm9sVG9PdXRsaW5lKVxuICAgIH0pKTtcbiAgfVxuXG4gIHN0YXRpYyBzeW1ib2xUb091dGxpbmUoc3ltYm9sOiBTeW1ib2xJbmZvcm1hdGlvbik6IG51Y2xpZGUkT3V0bGluZVRyZWUge1xuICAgIHJldHVybiB7XG4gICAgICBwbGFpblRleHQ6IHN5bWJvbC5uYW1lLFxuICAgICAgc3RhcnRQb3NpdGlvbjogQ29udmVydC5wb3NpdGlvblRvUG9pbnQoc3ltYm9sLmxvY2F0aW9uLnJhbmdlLnN0YXJ0KSxcbiAgICAgIGVuZFBvc2l0aW9uOiBDb252ZXJ0LnBvc2l0aW9uVG9Qb2ludChzeW1ib2wubG9jYXRpb24ucmFuZ2UuZW5kKSxcbiAgICAgIGNoaWxkcmVuOiBbXVxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgc3ltYm9sS2luZFRvVG9rZW5LaW5kKHN5bWJvbDogbnVtYmVyKTogbnVjbGlkZSRUb2tlbktpbmQge1xuICAgIHN3aXRjaChzeW1ib2wpIHtcbiAgICAgIGNhc2UgU3ltYm9sS2luZC5DbGFzczpcbiAgICAgICAgcmV0dXJuICd0eXBlJztcbiAgICAgIGNhc2UgU3ltYm9sS2luZC5Db25zdHJ1Y3RvcjpcbiAgICAgICAgcmV0dXJuICdjb25zdHJ1Y3Rvcic7XG4gICAgICBjYXNlIFN5bWJvbEtpbmQuTWV0aG9kOlxuICAgICAgY2FzZSBTeW1ib2xLaW5kLkZ1bmN0aW9uOlxuICAgICAgICByZXR1cm4gJ21ldGhvZCc7XG4gICAgICBjYXNlIFN5bWJvbEtpbmQuU3RyaW5nOlxuICAgICAgICByZXR1cm4gJ3N0cmluZyc7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gJ3BsYWluJztcbiAgICB9O1xuICB9XG59XG4iXX0=