Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _languageclientV = require('../protocol/languageclient-v2');

var _convert = require('../convert');

var _convert2 = _interopRequireDefault(_convert);

var _atom = require('atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    // TODO: Limitation here is that the containerName's do not have any positional information in LSP
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
      case _languageclientV.SymbolKind.Class:
        return 'type';
      case _languageclientV.SymbolKind.Constructor:
        return 'constructor';
      case _languageclientV.SymbolKind.Method:
      case _languageclientV.SymbolKind.Function:
        return 'method';
      case _languageclientV.SymbolKind.String:
        return 'string';
      default:
        return 'plain';
    };
  }
};
exports.default = NuclideOutlineViewBridge;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9icmlkZ2VzL251Y2xpZGUtb3V0bGluZS12aWV3LWJyaWRnZS5qcyJdLCJuYW1lcyI6WyJOdWNsaWRlT3V0bGluZVZpZXdCcmlkZ2UiLCJjb25zdHJ1Y3RvciIsImxhbmd1YWdlQ2xpZW50IiwibmFtZSIsIl9kaXNwb3NhYmxlIiwiX2xjIiwiX25hbWUiLCJkaXNwb3NlIiwiZ2V0T3V0bGluZSIsImVkaXRvciIsInJlc3VsdHMiLCJkb2N1bWVudFN5bWJvbCIsInRleHREb2N1bWVudCIsImVkaXRvclRvVGV4dERvY3VtZW50SWRlbnRpZmllciIsIm91dGxpbmVUcmVlcyIsImNyZWF0ZU91dGxpbmVUcmVlcyIsInN5bWJvbHMiLCJBcnJheSIsImZyb20iLCJTZXQiLCJtYXAiLCJyIiwiY29udGFpbmVyTmFtZSIsImMiLCJwbGFpblRleHQiLCJzdGFydFBvc2l0aW9uIiwiZW5kUG9zaXRpb24iLCJjaGlsZHJlbiIsImZpbHRlciIsInMiLCJzeW1ib2xUb091dGxpbmUiLCJzeW1ib2wiLCJwb3NpdGlvblRvUG9pbnQiLCJsb2NhdGlvbiIsInJhbmdlIiwic3RhcnQiLCJlbmQiLCJzeW1ib2xLaW5kVG9Ub2tlbktpbmQiLCJDbGFzcyIsIkNvbnN0cnVjdG9yIiwiTWV0aG9kIiwiRnVuY3Rpb24iLCJTdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUE7O0FBRUE7Ozs7QUFDQTs7Ozs7O0lBRXFCQSx3QixHQUFOLE1BQU1BLHdCQUFOLENBQStCOztBQUs1Q0MsY0FBWUMsY0FBWixFQUE4Q0MsSUFBOUMsRUFBNEQ7QUFBQSxTQUo1REMsV0FJNEQsR0FKOUMsK0JBSThDOztBQUMxRCxTQUFLQyxHQUFMLEdBQVdILGNBQVg7QUFDQSxTQUFLSSxLQUFMLEdBQWFILElBQWI7QUFDRDs7QUFFREksWUFBZ0I7QUFDZCxTQUFLSCxXQUFMLENBQWlCRyxPQUFqQjtBQUNEOztBQUVLQyxZQUFOLENBQWlCQyxNQUFqQixFQUFxRTtBQUFBOztBQUFBO0FBQ25FLFlBQU1DLFVBQVUsTUFBTSxNQUFLTCxHQUFMLENBQVNNLGNBQVQsQ0FBd0IsRUFBRUMsY0FBYyxrQkFBUUMsOEJBQVIsQ0FBdUNKLE1BQXZDLENBQWhCLEVBQXhCLENBQXRCO0FBQ0EsYUFBTztBQUNMSyxzQkFBY2QseUJBQXlCZSxrQkFBekIsQ0FBNENMLE9BQTVDO0FBRFQsT0FBUDtBQUZtRTtBQUtwRTs7QUFFRCxTQUFPSyxrQkFBUCxDQUEwQkMsT0FBMUIsRUFBeUY7QUFDdkY7QUFDQSxXQUFPQyxNQUFNQyxJQUFOLENBQVcsSUFBSUMsR0FBSixDQUFRSCxRQUFRSSxHQUFSLENBQVlDLEtBQUtBLEVBQUVDLGFBQW5CLENBQVIsQ0FBWCxFQUF1REYsR0FBdkQsQ0FBMkRHLE1BQU07QUFDdEVDLGlCQUFXRCxDQUQyRDtBQUV0RUUscUJBQWUsQ0FGdUQ7QUFHdEVDLG1CQUFhLENBSHlEO0FBSXRFQyxnQkFBVVgsUUFBUVksTUFBUixDQUFlQyxLQUFLQSxFQUFFUCxhQUFGLElBQW1CQyxDQUF2QyxFQUEwQ0gsR0FBMUMsQ0FBOENwQix5QkFBeUI4QixlQUF2RTtBQUo0RCxLQUFOLENBQTNELENBQVA7QUFNRDs7QUFFRCxTQUFPQSxlQUFQLENBQXVCQyxNQUF2QixFQUF1RTtBQUNyRSxXQUFPO0FBQ0xQLGlCQUFXTyxPQUFPNUIsSUFEYjtBQUVMc0IscUJBQWUsa0JBQVFPLGVBQVIsQ0FBd0JELE9BQU9FLFFBQVAsQ0FBZ0JDLEtBQWhCLENBQXNCQyxLQUE5QyxDQUZWO0FBR0xULG1CQUFhLGtCQUFRTSxlQUFSLENBQXdCRCxPQUFPRSxRQUFQLENBQWdCQyxLQUFoQixDQUFzQkUsR0FBOUMsQ0FIUjtBQUlMVCxnQkFBVTtBQUpMLEtBQVA7QUFNRDs7QUFFRCxTQUFPVSxxQkFBUCxDQUE2Qk4sTUFBN0IsRUFBZ0U7QUFDOUQsWUFBT0EsTUFBUDtBQUNFLFdBQUssNEJBQVdPLEtBQWhCO0FBQ0UsZUFBTyxNQUFQO0FBQ0YsV0FBSyw0QkFBV0MsV0FBaEI7QUFDRSxlQUFPLGFBQVA7QUFDRixXQUFLLDRCQUFXQyxNQUFoQjtBQUNBLFdBQUssNEJBQVdDLFFBQWhCO0FBQ0UsZUFBTyxRQUFQO0FBQ0YsV0FBSyw0QkFBV0MsTUFBaEI7QUFDRSxlQUFPLFFBQVA7QUFDRjtBQUNFLGVBQU8sT0FBUDtBQVhKLEtBWUM7QUFDRjtBQXREMkMsQztrQkFBekIxQyx3QiIsImZpbGUiOiJudWNsaWRlLW91dGxpbmUtdmlldy1icmlkZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAZmxvd1xyXG5cclxuaW1wb3J0IHtMYW5ndWFnZUNsaWVudFYyLCBTeW1ib2xLaW5kfSBmcm9tICcuLi9wcm90b2NvbC9sYW5ndWFnZWNsaWVudC12Mic7XHJcbmltcG9ydCB0eXBlIHtTeW1ib2xJbmZvcm1hdGlvbn0gZnJvbSAnLi4vcHJvdG9jb2wvbGFuZ3VhZ2VjbGllbnQtdjInO1xyXG5pbXBvcnQgQ29udmVydCBmcm9tICcuLi9jb252ZXJ0JztcclxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE51Y2xpZGVPdXRsaW5lVmlld0JyaWRnZSB7XHJcbiAgX2Rpc3Bvc2FibGUgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xyXG4gIF9sYzogTGFuZ3VhZ2VDbGllbnRWMjtcclxuICBfbmFtZTogc3RyaW5nO1xyXG5cclxuICBjb25zdHJ1Y3RvcihsYW5ndWFnZUNsaWVudDogTGFuZ3VhZ2VDbGllbnRWMiwgbmFtZTogc3RyaW5nKSB7XHJcbiAgICB0aGlzLl9sYyA9IGxhbmd1YWdlQ2xpZW50O1xyXG4gICAgdGhpcy5fbmFtZSA9IG5hbWU7XHJcbiAgfVxyXG5cclxuICBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5fZGlzcG9zYWJsZS5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBnZXRPdXRsaW5lKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogUHJvbWlzZTw/bnVjbGlkZSRPdXRsaW5lPiB7XHJcbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgdGhpcy5fbGMuZG9jdW1lbnRTeW1ib2woeyB0ZXh0RG9jdW1lbnQ6IENvbnZlcnQuZWRpdG9yVG9UZXh0RG9jdW1lbnRJZGVudGlmaWVyKGVkaXRvcikgfSk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBvdXRsaW5lVHJlZXM6IE51Y2xpZGVPdXRsaW5lVmlld0JyaWRnZS5jcmVhdGVPdXRsaW5lVHJlZXMocmVzdWx0cylcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgY3JlYXRlT3V0bGluZVRyZWVzKHN5bWJvbHM6IEFycmF5PFN5bWJvbEluZm9ybWF0aW9uPik6IEFycmF5PG51Y2xpZGUkT3V0bGluZVRyZWU+IHtcclxuICAgIC8vIFRPRE86IExpbWl0YXRpb24gaGVyZSBpcyB0aGF0IHRoZSBjb250YWluZXJOYW1lJ3MgZG8gbm90IGhhdmUgYW55IHBvc2l0aW9uYWwgaW5mb3JtYXRpb24gaW4gTFNQXHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KHN5bWJvbHMubWFwKHIgPT4gci5jb250YWluZXJOYW1lKSkpLm1hcChjID0+ICh7XHJcbiAgICAgIHBsYWluVGV4dDogYyxcclxuICAgICAgc3RhcnRQb3NpdGlvbjogMCxcclxuICAgICAgZW5kUG9zaXRpb246IDAsXHJcbiAgICAgIGNoaWxkcmVuOiBzeW1ib2xzLmZpbHRlcihzID0+IHMuY29udGFpbmVyTmFtZSA9PSBjKS5tYXAoTnVjbGlkZU91dGxpbmVWaWV3QnJpZGdlLnN5bWJvbFRvT3V0bGluZSlcclxuICAgIH0pKTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBzeW1ib2xUb091dGxpbmUoc3ltYm9sOiBTeW1ib2xJbmZvcm1hdGlvbik6IG51Y2xpZGUkT3V0bGluZVRyZWUge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcGxhaW5UZXh0OiBzeW1ib2wubmFtZSxcclxuICAgICAgc3RhcnRQb3NpdGlvbjogQ29udmVydC5wb3NpdGlvblRvUG9pbnQoc3ltYm9sLmxvY2F0aW9uLnJhbmdlLnN0YXJ0KSxcclxuICAgICAgZW5kUG9zaXRpb246IENvbnZlcnQucG9zaXRpb25Ub1BvaW50KHN5bWJvbC5sb2NhdGlvbi5yYW5nZS5lbmQpLFxyXG4gICAgICBjaGlsZHJlbjogW11cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgc3ltYm9sS2luZFRvVG9rZW5LaW5kKHN5bWJvbDogbnVtYmVyKTogbnVjbGlkZSRUb2tlbktpbmQge1xyXG4gICAgc3dpdGNoKHN5bWJvbCkge1xyXG4gICAgICBjYXNlIFN5bWJvbEtpbmQuQ2xhc3M6XHJcbiAgICAgICAgcmV0dXJuICd0eXBlJztcclxuICAgICAgY2FzZSBTeW1ib2xLaW5kLkNvbnN0cnVjdG9yOlxyXG4gICAgICAgIHJldHVybiAnY29uc3RydWN0b3InO1xyXG4gICAgICBjYXNlIFN5bWJvbEtpbmQuTWV0aG9kOlxyXG4gICAgICBjYXNlIFN5bWJvbEtpbmQuRnVuY3Rpb246XHJcbiAgICAgICAgcmV0dXJuICdtZXRob2QnO1xyXG4gICAgICBjYXNlIFN5bWJvbEtpbmQuU3RyaW5nOlxyXG4gICAgICAgIHJldHVybiAnc3RyaW5nJztcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICByZXR1cm4gJ3BsYWluJztcclxuICAgIH07XHJcbiAgfVxyXG59XHJcbiJdfQ==