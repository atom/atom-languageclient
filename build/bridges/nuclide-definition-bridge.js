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

let NuclideDefinitionBridge = class NuclideDefinitionBridge {

  constructor(languageClient) {
    this._lc = languageClient;
  }

  dispose() {}

  getDefinition(editor, point) {
    var _this = this;

    return _asyncToGenerator(function* () {
      let results = yield _this._lc.gotoDefinition({
        textDocument: _convert2.default.editorToTextDocumentIdentifier(editor),
        position: _convert2.default.pointToPosition(point)
      });
      results = Array.isArray(results) ? results : [results];

      return {
        queryRange: [editor.getBuffer().getRange()],
        definitions: results.map(function (r) {
          return {
            path: _convert2.default.uriToPath(r.uri),
            position: _convert2.default.positionToPoint(r.range.start),
            range: _convert2.default.lsRangeToAtomRange(r.range),
            language: 'test'
          };
        })
      };
    })();
  }
};
exports.default = NuclideDefinitionBridge;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9icmlkZ2VzL251Y2xpZGUtZGVmaW5pdGlvbi1icmlkZ2UuanMiXSwibmFtZXMiOlsiTnVjbGlkZURlZmluaXRpb25CcmlkZ2UiLCJjb25zdHJ1Y3RvciIsImxhbmd1YWdlQ2xpZW50IiwiX2xjIiwiZGlzcG9zZSIsImdldERlZmluaXRpb24iLCJlZGl0b3IiLCJwb2ludCIsInJlc3VsdHMiLCJnb3RvRGVmaW5pdGlvbiIsInRleHREb2N1bWVudCIsImVkaXRvclRvVGV4dERvY3VtZW50SWRlbnRpZmllciIsInBvc2l0aW9uIiwicG9pbnRUb1Bvc2l0aW9uIiwiQXJyYXkiLCJpc0FycmF5IiwicXVlcnlSYW5nZSIsImdldEJ1ZmZlciIsImdldFJhbmdlIiwiZGVmaW5pdGlvbnMiLCJtYXAiLCJwYXRoIiwidXJpVG9QYXRoIiwiciIsInVyaSIsInBvc2l0aW9uVG9Qb2ludCIsInJhbmdlIiwic3RhcnQiLCJsc1JhbmdlVG9BdG9tUmFuZ2UiLCJsYW5ndWFnZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQTs7QUFFQTs7OztBQUNBOzs7Ozs7SUFFcUJBLHVCLEdBQU4sTUFBTUEsdUJBQU4sQ0FBOEI7O0FBRzNDQyxjQUFZQyxjQUFaLEVBQThDO0FBQzVDLFNBQUtDLEdBQUwsR0FBV0QsY0FBWDtBQUNEOztBQUVERSxZQUFnQixDQUNmOztBQUVLQyxlQUFOLENBQW9CQyxNQUFwQixFQUF3Q0MsS0FBeEMsRUFBb0c7QUFBQTs7QUFBQTtBQUNsRyxVQUFJQyxVQUFVLE1BQU0sTUFBS0wsR0FBTCxDQUFTTSxjQUFULENBQXdCO0FBQzFDQyxzQkFBYyxrQkFBUUMsOEJBQVIsQ0FBdUNMLE1BQXZDLENBRDRCO0FBRTFDTSxrQkFBVSxrQkFBUUMsZUFBUixDQUF3Qk4sS0FBeEI7QUFGZ0MsT0FBeEIsQ0FBcEI7QUFJQUMsZ0JBQVVNLE1BQU1DLE9BQU4sQ0FBY1AsT0FBZCxJQUF5QkEsT0FBekIsR0FBbUMsQ0FBRUEsT0FBRixDQUE3Qzs7QUFFQSxhQUFPO0FBQ0xRLG9CQUFZLENBQUVWLE9BQU9XLFNBQVAsR0FBbUJDLFFBQW5CLEVBQUYsQ0FEUDtBQUVMQyxxQkFBYVgsUUFBUVksR0FBUixDQUFZO0FBQUEsaUJBQU07QUFDN0JDLGtCQUFNLGtCQUFRQyxTQUFSLENBQWtCQyxFQUFFQyxHQUFwQixDQUR1QjtBQUU3Qlosc0JBQVUsa0JBQVFhLGVBQVIsQ0FBd0JGLEVBQUVHLEtBQUYsQ0FBUUMsS0FBaEMsQ0FGbUI7QUFHN0JELG1CQUFPLGtCQUFRRSxrQkFBUixDQUEyQkwsRUFBRUcsS0FBN0IsQ0FIc0I7QUFJN0JHLHNCQUFVO0FBSm1CLFdBQU47QUFBQSxTQUFaO0FBRlIsT0FBUDtBQVBrRztBQWdCbkc7QUExQjBDLEM7a0JBQXhCN0IsdUIiLCJmaWxlIjoibnVjbGlkZS1kZWZpbml0aW9uLWJyaWRnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEBmbG93XHJcblxyXG5pbXBvcnQge0xhbmd1YWdlQ2xpZW50VjJ9IGZyb20gJy4uL3Byb3RvY29sL2xhbmd1YWdlY2xpZW50LXYyJztcclxuaW1wb3J0IHR5cGUge0xvY2F0aW9ufSBmcm9tICcuLi9wcm90b2NvbC9sYW5ndWFnZWNsaWVudC12Mic7XHJcbmltcG9ydCBDb252ZXJ0IGZyb20gJy4uL2NvbnZlcnQnO1xyXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTnVjbGlkZURlZmluaXRpb25CcmlkZ2Uge1xyXG4gIF9sYzogTGFuZ3VhZ2VDbGllbnRWMjtcclxuXHJcbiAgY29uc3RydWN0b3IobGFuZ3VhZ2VDbGllbnQ6IExhbmd1YWdlQ2xpZW50VjIpIHtcclxuICAgIHRoaXMuX2xjID0gbGFuZ3VhZ2VDbGllbnQ7XHJcbiAgfVxyXG5cclxuICBkaXNwb3NlKCk6IHZvaWQge1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZ2V0RGVmaW5pdGlvbihlZGl0b3I6IFRleHRFZGl0b3IsIHBvaW50OiBhdG9tJFBvaW50KTogUHJvbWlzZTw/bnVjbGlkZSREZWZpbml0aW9uUXVlcnlSZXN1bHQ+IHtcclxuICAgIGxldCByZXN1bHRzID0gYXdhaXQgdGhpcy5fbGMuZ290b0RlZmluaXRpb24oe1xyXG4gICAgICB0ZXh0RG9jdW1lbnQ6IENvbnZlcnQuZWRpdG9yVG9UZXh0RG9jdW1lbnRJZGVudGlmaWVyKGVkaXRvciksXHJcbiAgICAgIHBvc2l0aW9uOiBDb252ZXJ0LnBvaW50VG9Qb3NpdGlvbihwb2ludClcclxuICAgIH0pO1xyXG4gICAgcmVzdWx0cyA9IEFycmF5LmlzQXJyYXkocmVzdWx0cykgPyByZXN1bHRzIDogWyByZXN1bHRzIF07XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcXVlcnlSYW5nZTogWyBlZGl0b3IuZ2V0QnVmZmVyKCkuZ2V0UmFuZ2UoKSBdLFxyXG4gICAgICBkZWZpbml0aW9uczogcmVzdWx0cy5tYXAociA9PiAoe1xyXG4gICAgICAgIHBhdGg6IENvbnZlcnQudXJpVG9QYXRoKHIudXJpKSxcclxuICAgICAgICBwb3NpdGlvbjogQ29udmVydC5wb3NpdGlvblRvUG9pbnQoci5yYW5nZS5zdGFydCksXHJcbiAgICAgICAgcmFuZ2U6IENvbnZlcnQubHNSYW5nZVRvQXRvbVJhbmdlKHIucmFuZ2UpLFxyXG4gICAgICAgIGxhbmd1YWdlOiAndGVzdCdcclxuICAgICAgfSkpXHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG4iXX0=