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

let NuclideOutlineViewBridge = class NuclideOutlineViewBridge {

  constructor(languageClient, name) {
    this._disposable = new _atom.CompositeDisposable();

    this._lc = languageClient;
    this._name = name;
  }

  dispose() {
    this._disposable.dispose();
  }

  getOutline(editor) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const results = yield _this._lc.documentSymbol({ textDocument: _convert2.default.editorToTextDocumentIdentifier(editor) });

      return {
        outlineTrees: NuclideOutlineViewBridge.createOutlineTrees(results)
      };
    })();
  }

  static createOutlineTrees(symbols) {
    return Array.from(new Set(symbols.map(r => r.containerName))).map(c => ({
      plainText: c,
      startPosition: 0,
      endPosition: 0,
      children: symbols.filter(s => s.containerName == c).map(NuclideOutlineViewBridge.symbolToOutline)
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
      case ls.SymbolKind.Class:
        return 'type';
      case ls.SymbolKind.Constructor:
        return 'constructor';
      case ls.SymbolKind.Method:
      case ls.SymbolKind.Function:
        return 'method';
      case ls.SymbolKind.String:
        return 'string';
      default:
        return 'plain';
    };
  }
};
exports.default = NuclideOutlineViewBridge;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9icmlkZ2VzL251Y2xpZGUtb3V0bGluZS12aWV3LWJyaWRnZS5qcyJdLCJuYW1lcyI6WyJscyIsIk51Y2xpZGVPdXRsaW5lVmlld0JyaWRnZSIsImNvbnN0cnVjdG9yIiwibGFuZ3VhZ2VDbGllbnQiLCJuYW1lIiwiX2Rpc3Bvc2FibGUiLCJfbGMiLCJfbmFtZSIsImRpc3Bvc2UiLCJnZXRPdXRsaW5lIiwiZWRpdG9yIiwicmVzdWx0cyIsImRvY3VtZW50U3ltYm9sIiwidGV4dERvY3VtZW50IiwiZWRpdG9yVG9UZXh0RG9jdW1lbnRJZGVudGlmaWVyIiwib3V0bGluZVRyZWVzIiwiY3JlYXRlT3V0bGluZVRyZWVzIiwic3ltYm9scyIsIkFycmF5IiwiZnJvbSIsIlNldCIsIm1hcCIsInIiLCJjb250YWluZXJOYW1lIiwiYyIsInBsYWluVGV4dCIsInN0YXJ0UG9zaXRpb24iLCJlbmRQb3NpdGlvbiIsImNoaWxkcmVuIiwiZmlsdGVyIiwicyIsInN5bWJvbFRvT3V0bGluZSIsInN5bWJvbCIsInBvc2l0aW9uVG9Qb2ludCIsImxvY2F0aW9uIiwicmFuZ2UiLCJzdGFydCIsImVuZCIsInN5bWJvbEtpbmRUb1Rva2VuS2luZCIsIlN5bWJvbEtpbmQiLCJDbGFzcyIsIkNvbnN0cnVjdG9yIiwiTWV0aG9kIiwiRnVuY3Rpb24iLCJTdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUE7O0lBQVlBLEU7O0FBQ1o7Ozs7QUFDQTs7Ozs7Ozs7SUFFcUJDLHdCLEdBQU4sTUFBTUEsd0JBQU4sQ0FDZjs7QUFLRUMsY0FBWUMsY0FBWixFQUFpREMsSUFBakQsRUFBK0Q7QUFBQSxTQUovREMsV0FJK0QsR0FKakQsK0JBSWlEOztBQUM3RCxTQUFLQyxHQUFMLEdBQVdILGNBQVg7QUFDQSxTQUFLSSxLQUFMLEdBQWFILElBQWI7QUFDRDs7QUFFREksWUFBZ0I7QUFDZCxTQUFLSCxXQUFMLENBQWlCRyxPQUFqQjtBQUNEOztBQUVLQyxZQUFOLENBQWlCQyxNQUFqQixFQUFxRTtBQUFBOztBQUFBO0FBQ25FLFlBQU1DLFVBQVUsTUFBTSxNQUFLTCxHQUFMLENBQVNNLGNBQVQsQ0FBd0IsRUFBRUMsY0FBYyxrQkFBUUMsOEJBQVIsQ0FBdUNKLE1BQXZDLENBQWhCLEVBQXhCLENBQXRCOztBQUVBLGFBQU87QUFDTEssc0JBQWNkLHlCQUF5QmUsa0JBQXpCLENBQTRDTCxPQUE1QztBQURULE9BQVA7QUFIbUU7QUFNcEU7O0FBRUQsU0FBT0ssa0JBQVAsQ0FBMEJDLE9BQTFCLEVBQTRGO0FBQzFGLFdBQU9DLE1BQU1DLElBQU4sQ0FBVyxJQUFJQyxHQUFKLENBQVFILFFBQVFJLEdBQVIsQ0FBWUMsS0FBS0EsRUFBRUMsYUFBbkIsQ0FBUixDQUFYLEVBQXVERixHQUF2RCxDQUEyREcsTUFBTTtBQUN0RUMsaUJBQVdELENBRDJEO0FBRXRFRSxxQkFBZSxDQUZ1RDtBQUd0RUMsbUJBQWEsQ0FIeUQ7QUFJdEVDLGdCQUFVWCxRQUFRWSxNQUFSLENBQWVDLEtBQUtBLEVBQUVQLGFBQUYsSUFBbUJDLENBQXZDLEVBQTBDSCxHQUExQyxDQUE4Q3BCLHlCQUF5QjhCLGVBQXZFO0FBSjRELEtBQU4sQ0FBM0QsQ0FBUDtBQU1EOztBQUVELFNBQU9BLGVBQVAsQ0FBdUJDLE1BQXZCLEVBQTBFO0FBQ3hFLFdBQU87QUFDTFAsaUJBQVdPLE9BQU81QixJQURiO0FBRUxzQixxQkFBZSxrQkFBUU8sZUFBUixDQUF3QkQsT0FBT0UsUUFBUCxDQUFnQkMsS0FBaEIsQ0FBc0JDLEtBQTlDLENBRlY7QUFHTFQsbUJBQWEsa0JBQVFNLGVBQVIsQ0FBd0JELE9BQU9FLFFBQVAsQ0FBZ0JDLEtBQWhCLENBQXNCRSxHQUE5QyxDQUhSO0FBSUxULGdCQUFVO0FBSkwsS0FBUDtBQU1EOztBQUVELFNBQU9VLHFCQUFQLENBQTZCTixNQUE3QixFQUFnRTtBQUM5RCxZQUFRQSxNQUFSO0FBQ0UsV0FBS2hDLEdBQUd1QyxVQUFILENBQWNDLEtBQW5CO0FBQ0UsZUFBTyxNQUFQO0FBQ0YsV0FBS3hDLEdBQUd1QyxVQUFILENBQWNFLFdBQW5CO0FBQ0UsZUFBTyxhQUFQO0FBQ0YsV0FBS3pDLEdBQUd1QyxVQUFILENBQWNHLE1BQW5CO0FBQ0EsV0FBSzFDLEdBQUd1QyxVQUFILENBQWNJLFFBQW5CO0FBQ0UsZUFBTyxRQUFQO0FBQ0YsV0FBSzNDLEdBQUd1QyxVQUFILENBQWNLLE1BQW5CO0FBQ0UsZUFBTyxRQUFQO0FBQ0Y7QUFDRSxlQUFPLE9BQVA7QUFYSixLQVlDO0FBQ0Y7QUF0REgsQztrQkFEcUIzQyx3QiIsImZpbGUiOiJudWNsaWRlLW91dGxpbmUtdmlldy1icmlkZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAZmxvd1xyXG5cclxuaW1wb3J0ICogYXMgbHMgZnJvbSAnLi4vcHJvdG9jb2wvbGFuZ3VhZ2VjbGllbnQtdjInO1xyXG5pbXBvcnQgQ29udmVydCBmcm9tICcuLi9jb252ZXJ0JztcclxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE51Y2xpZGVPdXRsaW5lVmlld0JyaWRnZVxyXG57XHJcbiAgX2Rpc3Bvc2FibGUgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xyXG4gIF9sYzogbHMuTGFuZ3VhZ2VDbGllbnRWMjtcclxuICBfbmFtZTogc3RyaW5nO1xyXG5cclxuICBjb25zdHJ1Y3RvcihsYW5ndWFnZUNsaWVudDogbHMuTGFuZ3VhZ2VDbGllbnRWMiwgbmFtZTogc3RyaW5nKSB7XHJcbiAgICB0aGlzLl9sYyA9IGxhbmd1YWdlQ2xpZW50O1xyXG4gICAgdGhpcy5fbmFtZSA9IG5hbWU7XHJcbiAgfVxyXG5cclxuICBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5fZGlzcG9zYWJsZS5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBnZXRPdXRsaW5lKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogUHJvbWlzZTw/bnVjbGlkZSRPdXRsaW5lPiB7XHJcbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgdGhpcy5fbGMuZG9jdW1lbnRTeW1ib2woeyB0ZXh0RG9jdW1lbnQ6IENvbnZlcnQuZWRpdG9yVG9UZXh0RG9jdW1lbnRJZGVudGlmaWVyKGVkaXRvcikgfSk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgb3V0bGluZVRyZWVzOiBOdWNsaWRlT3V0bGluZVZpZXdCcmlkZ2UuY3JlYXRlT3V0bGluZVRyZWVzKHJlc3VsdHMpXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIGNyZWF0ZU91dGxpbmVUcmVlcyhzeW1ib2xzOiBBcnJheTxscy5TeW1ib2xJbmZvcm1hdGlvbj4pOiBBcnJheTxudWNsaWRlJE91dGxpbmVUcmVlPiB7XHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KHN5bWJvbHMubWFwKHIgPT4gci5jb250YWluZXJOYW1lKSkpLm1hcChjID0+ICh7XHJcbiAgICAgIHBsYWluVGV4dDogYyxcclxuICAgICAgc3RhcnRQb3NpdGlvbjogMCxcclxuICAgICAgZW5kUG9zaXRpb246IDAsXHJcbiAgICAgIGNoaWxkcmVuOiBzeW1ib2xzLmZpbHRlcihzID0+IHMuY29udGFpbmVyTmFtZSA9PSBjKS5tYXAoTnVjbGlkZU91dGxpbmVWaWV3QnJpZGdlLnN5bWJvbFRvT3V0bGluZSlcclxuICAgIH0pKTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBzeW1ib2xUb091dGxpbmUoc3ltYm9sOiBscy5TeW1ib2xJbmZvcm1hdGlvbik6IG51Y2xpZGUkT3V0bGluZVRyZWUge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcGxhaW5UZXh0OiBzeW1ib2wubmFtZSxcclxuICAgICAgc3RhcnRQb3NpdGlvbjogQ29udmVydC5wb3NpdGlvblRvUG9pbnQoc3ltYm9sLmxvY2F0aW9uLnJhbmdlLnN0YXJ0KSxcclxuICAgICAgZW5kUG9zaXRpb246IENvbnZlcnQucG9zaXRpb25Ub1BvaW50KHN5bWJvbC5sb2NhdGlvbi5yYW5nZS5lbmQpLFxyXG4gICAgICBjaGlsZHJlbjogW11cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgc3ltYm9sS2luZFRvVG9rZW5LaW5kKHN5bWJvbDogbnVtYmVyKTogbnVjbGlkZSRUb2tlbktpbmQge1xyXG4gICAgc3dpdGNoIChzeW1ib2wpIHtcclxuICAgICAgY2FzZSBscy5TeW1ib2xLaW5kLkNsYXNzOlxyXG4gICAgICAgIHJldHVybiAndHlwZSc7XHJcbiAgICAgIGNhc2UgbHMuU3ltYm9sS2luZC5Db25zdHJ1Y3RvcjpcclxuICAgICAgICByZXR1cm4gJ2NvbnN0cnVjdG9yJztcclxuICAgICAgY2FzZSBscy5TeW1ib2xLaW5kLk1ldGhvZDpcclxuICAgICAgY2FzZSBscy5TeW1ib2xLaW5kLkZ1bmN0aW9uOlxyXG4gICAgICAgIHJldHVybiAnbWV0aG9kJztcclxuICAgICAgY2FzZSBscy5TeW1ib2xLaW5kLlN0cmluZzpcclxuICAgICAgICByZXR1cm4gJ3N0cmluZyc7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgcmV0dXJuICdwbGFpbic7XHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG4iXX0=