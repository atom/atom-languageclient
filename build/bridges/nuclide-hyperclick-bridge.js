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

let NuclideHyperclickBridge = class NuclideHyperclickBridge {

  constructor(languageClient) {
    this._lc = languageClient;
  }

  dispose() {}

  getSuggestion(editor, point) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const results = yield _this._lc.gotoDefinition({
        textDocument: _convert2.default.editorToTextDocumentIdentifier(editor),
        position: _convert2.default.pointToPosition(point)
      });
      const result = Array.isArray(results) ? results[0] : results;
      if (result == null) return null;
      debugger;
      return {
        range: _convert2.default.lsRangeToAtomRange(result.range),
        callback: function () {
          _this.goToLocationInFile(_convert2.default.uriToPath(result.uri), _convert2.default.positionToPoint(result.range.start));
        }
      };
    })();
  }

  goToLocationInFile(path, point) {
    return _asyncToGenerator(function* () {
      const currentEditor = atom.workspace.getActiveTextEditor();
      if (currentEditor != null && currentEditor.getPath() === path) {
        currentEditor.setCursorBufferPosition([point.row, point.column]);
      } else {
        yield atom.workspace.open(path, {
          initialLine: point.row,
          initialColumn: point.column,
          searchAllPanes: true
        });
      }
    })();
  }
};
exports.default = NuclideHyperclickBridge;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9icmlkZ2VzL251Y2xpZGUtaHlwZXJjbGljay1icmlkZ2UuanMiXSwibmFtZXMiOlsiTnVjbGlkZUh5cGVyY2xpY2tCcmlkZ2UiLCJjb25zdHJ1Y3RvciIsImxhbmd1YWdlQ2xpZW50IiwiX2xjIiwiZGlzcG9zZSIsImdldFN1Z2dlc3Rpb24iLCJlZGl0b3IiLCJwb2ludCIsInJlc3VsdHMiLCJnb3RvRGVmaW5pdGlvbiIsInRleHREb2N1bWVudCIsImVkaXRvclRvVGV4dERvY3VtZW50SWRlbnRpZmllciIsInBvc2l0aW9uIiwicG9pbnRUb1Bvc2l0aW9uIiwicmVzdWx0IiwiQXJyYXkiLCJpc0FycmF5IiwicmFuZ2UiLCJsc1JhbmdlVG9BdG9tUmFuZ2UiLCJjYWxsYmFjayIsImdvVG9Mb2NhdGlvbkluRmlsZSIsInVyaVRvUGF0aCIsInVyaSIsInBvc2l0aW9uVG9Qb2ludCIsInN0YXJ0IiwicGF0aCIsImN1cnJlbnRFZGl0b3IiLCJhdG9tIiwid29ya3NwYWNlIiwiZ2V0QWN0aXZlVGV4dEVkaXRvciIsImdldFBhdGgiLCJzZXRDdXJzb3JCdWZmZXJQb3NpdGlvbiIsInJvdyIsImNvbHVtbiIsIm9wZW4iLCJpbml0aWFsTGluZSIsImluaXRpYWxDb2x1bW4iLCJzZWFyY2hBbGxQYW5lcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQTs7QUFFQTs7OztBQUNBOzs7Ozs7SUFFcUJBLHVCLEdBQU4sTUFBTUEsdUJBQU4sQ0FBOEI7O0FBRzNDQyxjQUFZQyxjQUFaLEVBQThDO0FBQzVDLFNBQUtDLEdBQUwsR0FBV0QsY0FBWDtBQUNEOztBQUVERSxZQUFnQixDQUNmOztBQUVLQyxlQUFOLENBQW9CQyxNQUFwQixFQUE2Q0MsS0FBN0MsRUFBd0c7QUFBQTs7QUFBQTtBQUN0RyxZQUFNQyxVQUFVLE1BQU0sTUFBS0wsR0FBTCxDQUFTTSxjQUFULENBQXdCO0FBQzVDQyxzQkFBYyxrQkFBUUMsOEJBQVIsQ0FBdUNMLE1BQXZDLENBRDhCO0FBRTVDTSxrQkFBVSxrQkFBUUMsZUFBUixDQUF3Qk4sS0FBeEI7QUFGa0MsT0FBeEIsQ0FBdEI7QUFJQSxZQUFNTyxTQUFTQyxNQUFNQyxPQUFOLENBQWNSLE9BQWQsSUFBeUJBLFFBQVEsQ0FBUixDQUF6QixHQUFzQ0EsT0FBckQ7QUFDQSxVQUFJTSxVQUFVLElBQWQsRUFBb0IsT0FBTyxJQUFQO0FBQ3BCO0FBQ0EsYUFBTztBQUNMRyxlQUFPLGtCQUFRQyxrQkFBUixDQUEyQkosT0FBT0csS0FBbEMsQ0FERjtBQUVMRSxrQkFBVSxZQUFNO0FBQUUsZ0JBQUtDLGtCQUFMLENBQXdCLGtCQUFRQyxTQUFSLENBQWtCUCxPQUFPUSxHQUF6QixDQUF4QixFQUF1RCxrQkFBUUMsZUFBUixDQUF3QlQsT0FBT0csS0FBUCxDQUFhTyxLQUFyQyxDQUF2RDtBQUFzRztBQUZuSCxPQUFQO0FBUnNHO0FBWXZHOztBQUVLSixvQkFBTixDQUF5QkssSUFBekIsRUFBdUNsQixLQUF2QyxFQUF3RTtBQUFBO0FBQ3RFLFlBQU1tQixnQkFBZ0JDLEtBQUtDLFNBQUwsQ0FBZUMsbUJBQWYsRUFBdEI7QUFDQSxVQUFJSCxpQkFBaUIsSUFBakIsSUFBeUJBLGNBQWNJLE9BQWQsT0FBNEJMLElBQXpELEVBQStEO0FBQzdEQyxzQkFBY0ssdUJBQWQsQ0FBc0MsQ0FBQ3hCLE1BQU15QixHQUFQLEVBQVl6QixNQUFNMEIsTUFBbEIsQ0FBdEM7QUFDRCxPQUZELE1BRU87QUFDTCxjQUFNTixLQUFLQyxTQUFMLENBQWVNLElBQWYsQ0FBb0JULElBQXBCLEVBQTBCO0FBQzlCVSx1QkFBYTVCLE1BQU15QixHQURXO0FBRTlCSSx5QkFBZTdCLE1BQU0wQixNQUZTO0FBRzlCSSwwQkFBZ0I7QUFIYyxTQUExQixDQUFOO0FBS0Q7QUFWcUU7QUFXdkU7QUFuQzBDLEM7a0JBQXhCckMsdUIiLCJmaWxlIjoibnVjbGlkZS1oeXBlcmNsaWNrLWJyaWRnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEBmbG93XHJcblxyXG5pbXBvcnQge0xhbmd1YWdlQ2xpZW50VjJ9IGZyb20gJy4uL3Byb3RvY29sL2xhbmd1YWdlY2xpZW50LXYyJztcclxuaW1wb3J0IHR5cGUge0xvY2F0aW9ufSBmcm9tICcuLi9wcm90b2NvbC9sYW5ndWFnZWNsaWVudC12Mic7XHJcbmltcG9ydCBDb252ZXJ0IGZyb20gJy4uL2NvbnZlcnQnO1xyXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTnVjbGlkZUh5cGVyY2xpY2tCcmlkZ2Uge1xyXG4gIF9sYzogTGFuZ3VhZ2VDbGllbnRWMjtcclxuXHJcbiAgY29uc3RydWN0b3IobGFuZ3VhZ2VDbGllbnQ6IExhbmd1YWdlQ2xpZW50VjIpIHtcclxuICAgIHRoaXMuX2xjID0gbGFuZ3VhZ2VDbGllbnQ7XHJcbiAgfVxyXG5cclxuICBkaXNwb3NlKCk6IHZvaWQge1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZ2V0U3VnZ2VzdGlvbihlZGl0b3I6IGF0b20kVGV4dEVkaXRvciwgcG9pbnQ6IGF0b20kUG9pbnQpOiBQcm9taXNlPD9udWNsaWRlJEh5cGVyY2xpY2tTdWdnZXN0aW9uPiB7XHJcbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgdGhpcy5fbGMuZ290b0RlZmluaXRpb24oe1xyXG4gICAgICB0ZXh0RG9jdW1lbnQ6IENvbnZlcnQuZWRpdG9yVG9UZXh0RG9jdW1lbnRJZGVudGlmaWVyKGVkaXRvciksXHJcbiAgICAgIHBvc2l0aW9uOiBDb252ZXJ0LnBvaW50VG9Qb3NpdGlvbihwb2ludClcclxuICAgIH0pO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gQXJyYXkuaXNBcnJheShyZXN1bHRzKSA/IHJlc3VsdHNbMF0gOiByZXN1bHRzO1xyXG4gICAgaWYgKHJlc3VsdCA9PSBudWxsKSByZXR1cm4gbnVsbDtcclxuICAgIGRlYnVnZ2VyO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcmFuZ2U6IENvbnZlcnQubHNSYW5nZVRvQXRvbVJhbmdlKHJlc3VsdC5yYW5nZSksXHJcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB7IHRoaXMuZ29Ub0xvY2F0aW9uSW5GaWxlKENvbnZlcnQudXJpVG9QYXRoKHJlc3VsdC51cmkpLCBDb252ZXJ0LnBvc2l0aW9uVG9Qb2ludChyZXN1bHQucmFuZ2Uuc3RhcnQpKTsgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGdvVG9Mb2NhdGlvbkluRmlsZShwYXRoOiBzdHJpbmcsIHBvaW50OmF0b20kUG9pbnQpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGNvbnN0IGN1cnJlbnRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XHJcbiAgICBpZiAoY3VycmVudEVkaXRvciAhPSBudWxsICYmIGN1cnJlbnRFZGl0b3IuZ2V0UGF0aCgpID09PSBwYXRoKSB7XHJcbiAgICAgIGN1cnJlbnRFZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW3BvaW50LnJvdywgcG9pbnQuY29sdW1uXSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGgsIHtcclxuICAgICAgICBpbml0aWFsTGluZTogcG9pbnQucm93LFxyXG4gICAgICAgIGluaXRpYWxDb2x1bW46IHBvaW50LmNvbHVtbixcclxuICAgICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIl19