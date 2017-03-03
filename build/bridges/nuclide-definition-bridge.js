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

  dispose() {}

  getDefinition(editor, point) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const documentPositionParams = {
        textDocument: _convert2.default.editorToTextDocumentIdentifier(editor),
        position: _convert2.default.pointToPosition(point)
      };

      const highlights = yield _this._lc.documentHighlight(documentPositionParams);
      const definition = yield _this._lc.gotoDefinition(documentPositionParams);
      const definitions = Array.isArray(definition) ? definition : [definition];

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9icmlkZ2VzL251Y2xpZGUtZGVmaW5pdGlvbi1icmlkZ2UuanMiXSwibmFtZXMiOlsiTnVjbGlkZURlZmluaXRpb25CcmlkZ2UiLCJjb25zdHJ1Y3RvciIsImxhbmd1YWdlQ2xpZW50IiwiX2xjIiwiZGlzcG9zZSIsImdldERlZmluaXRpb24iLCJlZGl0b3IiLCJwb2ludCIsImRvY3VtZW50UG9zaXRpb25QYXJhbXMiLCJ0ZXh0RG9jdW1lbnQiLCJlZGl0b3JUb1RleHREb2N1bWVudElkZW50aWZpZXIiLCJwb3NpdGlvbiIsInBvaW50VG9Qb3NpdGlvbiIsImhpZ2hsaWdodHMiLCJkb2N1bWVudEhpZ2hsaWdodCIsImRlZmluaXRpb24iLCJnb3RvRGVmaW5pdGlvbiIsImRlZmluaXRpb25zIiwiQXJyYXkiLCJpc0FycmF5IiwicXVlcnlSYW5nZSIsIm1hcCIsImxzUmFuZ2VUb0F0b21SYW5nZSIsImgiLCJyYW5nZSIsInBhdGgiLCJ1cmlUb1BhdGgiLCJkIiwidXJpIiwicG9zaXRpb25Ub1BvaW50Iiwic3RhcnQiLCJsYW5ndWFnZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQTs7QUFDQTs7Ozs7Ozs7SUFFcUJBLHVCLEdBQU4sTUFBTUEsdUJBQU4sQ0FBOEI7O0FBRzNDQyxjQUFZQyxjQUFaLEVBQThDO0FBQzVDLFNBQUtDLEdBQUwsR0FBV0QsY0FBWDtBQUNEOztBQUVERSxZQUFnQixDQUNmOztBQUVLQyxlQUFOLENBQW9CQyxNQUFwQixFQUF3Q0MsS0FBeEMsRUFBb0c7QUFBQTs7QUFBQTtBQUNsRyxZQUFNQyx5QkFBeUI7QUFDN0JDLHNCQUFjLGtCQUFRQyw4QkFBUixDQUF1Q0osTUFBdkMsQ0FEZTtBQUU3Qkssa0JBQVUsa0JBQVFDLGVBQVIsQ0FBd0JMLEtBQXhCO0FBRm1CLE9BQS9COztBQUtBLFlBQU1NLGFBQWEsTUFBTSxNQUFLVixHQUFMLENBQVNXLGlCQUFULENBQTJCTixzQkFBM0IsQ0FBekI7QUFDQSxZQUFNTyxhQUFhLE1BQU0sTUFBS1osR0FBTCxDQUFTYSxjQUFULENBQXdCUixzQkFBeEIsQ0FBekI7QUFDQSxZQUFNUyxjQUFjQyxNQUFNQyxPQUFOLENBQWNKLFVBQWQsSUFBNEJBLFVBQTVCLEdBQXlDLENBQUVBLFVBQUYsQ0FBN0Q7O0FBRUEsYUFBTztBQUNMSyxvQkFBWVAsV0FBV1EsR0FBWCxDQUFlO0FBQUEsaUJBQUssa0JBQVFDLGtCQUFSLENBQTJCQyxFQUFFQyxLQUE3QixDQUFMO0FBQUEsU0FBZixDQURQO0FBRUxQLHFCQUFhQSxZQUFZSSxHQUFaLENBQWdCO0FBQUEsaUJBQU07QUFDakNJLGtCQUFNLGtCQUFRQyxTQUFSLENBQWtCQyxFQUFFQyxHQUFwQixDQUQyQjtBQUVqQ2pCLHNCQUFVLGtCQUFRa0IsZUFBUixDQUF3QkYsRUFBRUgsS0FBRixDQUFRTSxLQUFoQyxDQUZ1QjtBQUdqQ04sbUJBQU8sa0JBQVFGLGtCQUFSLENBQTJCSyxFQUFFSCxLQUE3QixDQUgwQjtBQUlqQ08sc0JBQVU7QUFKdUIsV0FBTjtBQUFBLFNBQWhCO0FBRlIsT0FBUDtBQVZrRztBQW1Cbkc7QUE3QjBDLEM7a0JBQXhCL0IsdUIiLCJmaWxlIjoibnVjbGlkZS1kZWZpbml0aW9uLWJyaWRnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEBmbG93XHJcblxyXG5pbXBvcnQge0xhbmd1YWdlQ2xpZW50VjJ9IGZyb20gJy4uL3Byb3RvY29sL2xhbmd1YWdlY2xpZW50LXYyJztcclxuaW1wb3J0IENvbnZlcnQgZnJvbSAnLi4vY29udmVydCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOdWNsaWRlRGVmaW5pdGlvbkJyaWRnZSB7XHJcbiAgX2xjOiBMYW5ndWFnZUNsaWVudFYyO1xyXG5cclxuICBjb25zdHJ1Y3RvcihsYW5ndWFnZUNsaWVudDogTGFuZ3VhZ2VDbGllbnRWMikge1xyXG4gICAgdGhpcy5fbGMgPSBsYW5ndWFnZUNsaWVudDtcclxuICB9XHJcblxyXG4gIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgfVxyXG5cclxuICBhc3luYyBnZXREZWZpbml0aW9uKGVkaXRvcjogVGV4dEVkaXRvciwgcG9pbnQ6IGF0b20kUG9pbnQpOiBQcm9taXNlPD9udWNsaWRlJERlZmluaXRpb25RdWVyeVJlc3VsdD4ge1xyXG4gICAgY29uc3QgZG9jdW1lbnRQb3NpdGlvblBhcmFtcyA9IHtcclxuICAgICAgdGV4dERvY3VtZW50OiBDb252ZXJ0LmVkaXRvclRvVGV4dERvY3VtZW50SWRlbnRpZmllcihlZGl0b3IpLFxyXG4gICAgICBwb3NpdGlvbjogQ29udmVydC5wb2ludFRvUG9zaXRpb24ocG9pbnQpXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGhpZ2hsaWdodHMgPSBhd2FpdCB0aGlzLl9sYy5kb2N1bWVudEhpZ2hsaWdodChkb2N1bWVudFBvc2l0aW9uUGFyYW1zKTtcclxuICAgIGNvbnN0IGRlZmluaXRpb24gPSBhd2FpdCB0aGlzLl9sYy5nb3RvRGVmaW5pdGlvbihkb2N1bWVudFBvc2l0aW9uUGFyYW1zKTtcclxuICAgIGNvbnN0IGRlZmluaXRpb25zID0gQXJyYXkuaXNBcnJheShkZWZpbml0aW9uKSA/IGRlZmluaXRpb24gOiBbIGRlZmluaXRpb24gXTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBxdWVyeVJhbmdlOiBoaWdobGlnaHRzLm1hcChoID0+IENvbnZlcnQubHNSYW5nZVRvQXRvbVJhbmdlKGgucmFuZ2UpKSxcclxuICAgICAgZGVmaW5pdGlvbnM6IGRlZmluaXRpb25zLm1hcChkID0+ICh7XHJcbiAgICAgICAgcGF0aDogQ29udmVydC51cmlUb1BhdGgoZC51cmkpLFxyXG4gICAgICAgIHBvc2l0aW9uOiBDb252ZXJ0LnBvc2l0aW9uVG9Qb2ludChkLnJhbmdlLnN0YXJ0KSxcclxuICAgICAgICByYW5nZTogQ29udmVydC5sc1JhbmdlVG9BdG9tUmFuZ2UoZC5yYW5nZSksXHJcbiAgICAgICAgbGFuZ3VhZ2U6ICd0ZXN0J1xyXG4gICAgICB9KSlcclxuICAgIH07XHJcbiAgfVxyXG59XHJcbiJdfQ==