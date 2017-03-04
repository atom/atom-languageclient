Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _languageclientV = require('../protocol/languageclient-v2');

var _convert = require('../convert');

var _convert2 = _interopRequireDefault(_convert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let NuclideOutlineViewBridge = class NuclideOutlineViewBridge {

  constructor(languageClient, name) {
    this._lc = languageClient;
    this._name = name;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9icmlkZ2VzL251Y2xpZGUtb3V0bGluZS12aWV3LWJyaWRnZS5qcyJdLCJuYW1lcyI6WyJOdWNsaWRlT3V0bGluZVZpZXdCcmlkZ2UiLCJjb25zdHJ1Y3RvciIsImxhbmd1YWdlQ2xpZW50IiwibmFtZSIsIl9sYyIsIl9uYW1lIiwiZ2V0T3V0bGluZSIsImVkaXRvciIsInJlc3VsdHMiLCJkb2N1bWVudFN5bWJvbCIsInRleHREb2N1bWVudCIsImVkaXRvclRvVGV4dERvY3VtZW50SWRlbnRpZmllciIsIm91dGxpbmVUcmVlcyIsImNyZWF0ZU91dGxpbmVUcmVlcyIsInN5bWJvbHMiLCJBcnJheSIsImZyb20iLCJTZXQiLCJtYXAiLCJyIiwiY29udGFpbmVyTmFtZSIsImMiLCJwbGFpblRleHQiLCJzdGFydFBvc2l0aW9uIiwiZW5kUG9zaXRpb24iLCJjaGlsZHJlbiIsImZpbHRlciIsInMiLCJzeW1ib2xUb091dGxpbmUiLCJzeW1ib2wiLCJwb3NpdGlvblRvUG9pbnQiLCJsb2NhdGlvbiIsInJhbmdlIiwic3RhcnQiLCJlbmQiLCJzeW1ib2xLaW5kVG9Ub2tlbktpbmQiLCJDbGFzcyIsIkNvbnN0cnVjdG9yIiwiTWV0aG9kIiwiRnVuY3Rpb24iLCJTdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUE7O0FBRUE7Ozs7Ozs7O0lBRXFCQSx3QixHQUFOLE1BQU1BLHdCQUFOLENBQStCOztBQUk1Q0MsY0FBWUMsY0FBWixFQUE4Q0MsSUFBOUMsRUFBNEQ7QUFDMUQsU0FBS0MsR0FBTCxHQUFXRixjQUFYO0FBQ0EsU0FBS0csS0FBTCxHQUFhRixJQUFiO0FBQ0Q7O0FBRUtHLFlBQU4sQ0FBaUJDLE1BQWpCLEVBQXFFO0FBQUE7O0FBQUE7QUFDbkUsWUFBTUMsVUFBVSxNQUFNLE1BQUtKLEdBQUwsQ0FBU0ssY0FBVCxDQUF3QixFQUFFQyxjQUFjLGtCQUFRQyw4QkFBUixDQUF1Q0osTUFBdkMsQ0FBaEIsRUFBeEIsQ0FBdEI7QUFDQSxhQUFPO0FBQ0xLLHNCQUFjWix5QkFBeUJhLGtCQUF6QixDQUE0Q0wsT0FBNUM7QUFEVCxPQUFQO0FBRm1FO0FBS3BFOztBQUVELFNBQU9LLGtCQUFQLENBQTBCQyxPQUExQixFQUF5RjtBQUN2RjtBQUNBLFdBQU9DLE1BQU1DLElBQU4sQ0FBVyxJQUFJQyxHQUFKLENBQVFILFFBQVFJLEdBQVIsQ0FBWUMsS0FBS0EsRUFBRUMsYUFBbkIsQ0FBUixDQUFYLEVBQXVERixHQUF2RCxDQUEyREcsTUFBTTtBQUN0RUMsaUJBQVdELENBRDJEO0FBRXRFRSxxQkFBZSxDQUZ1RDtBQUd0RUMsbUJBQWEsQ0FIeUQ7QUFJdEVDLGdCQUFVWCxRQUFRWSxNQUFSLENBQWVDLEtBQUtBLEVBQUVQLGFBQUYsSUFBbUJDLENBQXZDLEVBQTBDSCxHQUExQyxDQUE4Q2xCLHlCQUF5QjRCLGVBQXZFO0FBSjRELEtBQU4sQ0FBM0QsQ0FBUDtBQU1EOztBQUVELFNBQU9BLGVBQVAsQ0FBdUJDLE1BQXZCLEVBQXVFO0FBQ3JFLFdBQU87QUFDTFAsaUJBQVdPLE9BQU8xQixJQURiO0FBRUxvQixxQkFBZSxrQkFBUU8sZUFBUixDQUF3QkQsT0FBT0UsUUFBUCxDQUFnQkMsS0FBaEIsQ0FBc0JDLEtBQTlDLENBRlY7QUFHTFQsbUJBQWEsa0JBQVFNLGVBQVIsQ0FBd0JELE9BQU9FLFFBQVAsQ0FBZ0JDLEtBQWhCLENBQXNCRSxHQUE5QyxDQUhSO0FBSUxULGdCQUFVO0FBSkwsS0FBUDtBQU1EOztBQUVELFNBQU9VLHFCQUFQLENBQTZCTixNQUE3QixFQUFnRTtBQUM5RCxZQUFPQSxNQUFQO0FBQ0UsV0FBSyw0QkFBV08sS0FBaEI7QUFDRSxlQUFPLE1BQVA7QUFDRixXQUFLLDRCQUFXQyxXQUFoQjtBQUNFLGVBQU8sYUFBUDtBQUNGLFdBQUssNEJBQVdDLE1BQWhCO0FBQ0EsV0FBSyw0QkFBV0MsUUFBaEI7QUFDRSxlQUFPLFFBQVA7QUFDRixXQUFLLDRCQUFXQyxNQUFoQjtBQUNFLGVBQU8sUUFBUDtBQUNGO0FBQ0UsZUFBTyxPQUFQO0FBWEosS0FZQztBQUNGO0FBakQyQyxDO2tCQUF6QnhDLHdCIiwiZmlsZSI6Im51Y2xpZGUtb3V0bGluZS12aWV3LWJyaWRnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEBmbG93XHJcblxyXG5pbXBvcnQge0xhbmd1YWdlQ2xpZW50VjIsIFN5bWJvbEtpbmR9IGZyb20gJy4uL3Byb3RvY29sL2xhbmd1YWdlY2xpZW50LXYyJztcclxuaW1wb3J0IHR5cGUge1N5bWJvbEluZm9ybWF0aW9ufSBmcm9tICcuLi9wcm90b2NvbC9sYW5ndWFnZWNsaWVudC12Mic7XHJcbmltcG9ydCBDb252ZXJ0IGZyb20gJy4uL2NvbnZlcnQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTnVjbGlkZU91dGxpbmVWaWV3QnJpZGdlIHtcclxuICBfbGM6IExhbmd1YWdlQ2xpZW50VjI7XHJcbiAgX25hbWU6IHN0cmluZztcclxuXHJcbiAgY29uc3RydWN0b3IobGFuZ3VhZ2VDbGllbnQ6IExhbmd1YWdlQ2xpZW50VjIsIG5hbWU6IHN0cmluZykge1xyXG4gICAgdGhpcy5fbGMgPSBsYW5ndWFnZUNsaWVudDtcclxuICAgIHRoaXMuX25hbWUgPSBuYW1lO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZ2V0T3V0bGluZShlZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IFByb21pc2U8P251Y2xpZGUkT3V0bGluZT4ge1xyXG4gICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHRoaXMuX2xjLmRvY3VtZW50U3ltYm9sKHsgdGV4dERvY3VtZW50OiBDb252ZXJ0LmVkaXRvclRvVGV4dERvY3VtZW50SWRlbnRpZmllcihlZGl0b3IpIH0pO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgb3V0bGluZVRyZWVzOiBOdWNsaWRlT3V0bGluZVZpZXdCcmlkZ2UuY3JlYXRlT3V0bGluZVRyZWVzKHJlc3VsdHMpXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIGNyZWF0ZU91dGxpbmVUcmVlcyhzeW1ib2xzOiBBcnJheTxTeW1ib2xJbmZvcm1hdGlvbj4pOiBBcnJheTxudWNsaWRlJE91dGxpbmVUcmVlPiB7XHJcbiAgICAvLyBUT0RPOiBMaW1pdGF0aW9uIGhlcmUgaXMgdGhhdCB0aGUgY29udGFpbmVyTmFtZSdzIGRvIG5vdCBoYXZlIGFueSBwb3NpdGlvbmFsIGluZm9ybWF0aW9uIGluIExTUFxyXG4gICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChzeW1ib2xzLm1hcChyID0+IHIuY29udGFpbmVyTmFtZSkpKS5tYXAoYyA9PiAoe1xyXG4gICAgICBwbGFpblRleHQ6IGMsXHJcbiAgICAgIHN0YXJ0UG9zaXRpb246IDAsXHJcbiAgICAgIGVuZFBvc2l0aW9uOiAwLFxyXG4gICAgICBjaGlsZHJlbjogc3ltYm9scy5maWx0ZXIocyA9PiBzLmNvbnRhaW5lck5hbWUgPT0gYykubWFwKE51Y2xpZGVPdXRsaW5lVmlld0JyaWRnZS5zeW1ib2xUb091dGxpbmUpXHJcbiAgICB9KSk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgc3ltYm9sVG9PdXRsaW5lKHN5bWJvbDogU3ltYm9sSW5mb3JtYXRpb24pOiBudWNsaWRlJE91dGxpbmVUcmVlIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHBsYWluVGV4dDogc3ltYm9sLm5hbWUsXHJcbiAgICAgIHN0YXJ0UG9zaXRpb246IENvbnZlcnQucG9zaXRpb25Ub1BvaW50KHN5bWJvbC5sb2NhdGlvbi5yYW5nZS5zdGFydCksXHJcbiAgICAgIGVuZFBvc2l0aW9uOiBDb252ZXJ0LnBvc2l0aW9uVG9Qb2ludChzeW1ib2wubG9jYXRpb24ucmFuZ2UuZW5kKSxcclxuICAgICAgY2hpbGRyZW46IFtdXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIHN5bWJvbEtpbmRUb1Rva2VuS2luZChzeW1ib2w6IG51bWJlcik6IG51Y2xpZGUkVG9rZW5LaW5kIHtcclxuICAgIHN3aXRjaChzeW1ib2wpIHtcclxuICAgICAgY2FzZSBTeW1ib2xLaW5kLkNsYXNzOlxyXG4gICAgICAgIHJldHVybiAndHlwZSc7XHJcbiAgICAgIGNhc2UgU3ltYm9sS2luZC5Db25zdHJ1Y3RvcjpcclxuICAgICAgICByZXR1cm4gJ2NvbnN0cnVjdG9yJztcclxuICAgICAgY2FzZSBTeW1ib2xLaW5kLk1ldGhvZDpcclxuICAgICAgY2FzZSBTeW1ib2xLaW5kLkZ1bmN0aW9uOlxyXG4gICAgICAgIHJldHVybiAnbWV0aG9kJztcclxuICAgICAgY2FzZSBTeW1ib2xLaW5kLlN0cmluZzpcclxuICAgICAgICByZXR1cm4gJ3N0cmluZyc7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgcmV0dXJuICdwbGFpbic7XHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG4iXX0=