Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _languageclientV = require('../protocol/languageclient-v2');

var _convert = require('../convert');

var _convert2 = _interopRequireDefault(_convert);

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
      const documentPositionParams = {
        textDocument: _convert2.default.editorToTextDocumentIdentifier(editor),
        position: _convert2.default.pointToPosition(point)
      };

      const definition = yield _this._lc.gotoDefinition(documentPositionParams);
      if (definition == null || definition.length === 0) return null;

      const highlights = yield _this._lc.documentHighlight(documentPositionParams);

      return {
        range: highlights.map(function (h) {
          return _convert2.default.lsRangeToAtomRange(h.range);
        }),
        callback: function () {
          _this.goToLocationInFile(_convert2.default.uriToPath(definition[0].uri), _convert2.default.positionToPoint(definition[0].range.start));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9icmlkZ2VzL251Y2xpZGUtaHlwZXJjbGljay1icmlkZ2UuanMiXSwibmFtZXMiOlsiTnVjbGlkZUh5cGVyY2xpY2tCcmlkZ2UiLCJjb25zdHJ1Y3RvciIsImxhbmd1YWdlQ2xpZW50IiwiX2xjIiwiZGlzcG9zZSIsImdldFN1Z2dlc3Rpb24iLCJlZGl0b3IiLCJwb2ludCIsImRvY3VtZW50UG9zaXRpb25QYXJhbXMiLCJ0ZXh0RG9jdW1lbnQiLCJlZGl0b3JUb1RleHREb2N1bWVudElkZW50aWZpZXIiLCJwb3NpdGlvbiIsInBvaW50VG9Qb3NpdGlvbiIsImRlZmluaXRpb24iLCJnb3RvRGVmaW5pdGlvbiIsImxlbmd0aCIsImhpZ2hsaWdodHMiLCJkb2N1bWVudEhpZ2hsaWdodCIsInJhbmdlIiwibWFwIiwibHNSYW5nZVRvQXRvbVJhbmdlIiwiaCIsImNhbGxiYWNrIiwiZ29Ub0xvY2F0aW9uSW5GaWxlIiwidXJpVG9QYXRoIiwidXJpIiwicG9zaXRpb25Ub1BvaW50Iiwic3RhcnQiLCJwYXRoIiwiY3VycmVudEVkaXRvciIsImF0b20iLCJ3b3Jrc3BhY2UiLCJnZXRBY3RpdmVUZXh0RWRpdG9yIiwiZ2V0UGF0aCIsInNldEN1cnNvckJ1ZmZlclBvc2l0aW9uIiwicm93IiwiY29sdW1uIiwib3BlbiIsImluaXRpYWxMaW5lIiwiaW5pdGlhbENvbHVtbiIsInNlYXJjaEFsbFBhbmVzIl0sIm1hcHBpbmdzIjoiOzs7OztBQUVBOztBQUNBOzs7Ozs7OztJQUVxQkEsdUIsR0FBTixNQUFNQSx1QkFBTixDQUE4Qjs7QUFHM0NDLGNBQVlDLGNBQVosRUFBOEM7QUFDNUMsU0FBS0MsR0FBTCxHQUFXRCxjQUFYO0FBQ0Q7O0FBRURFLFlBQWdCLENBQ2Y7O0FBRUtDLGVBQU4sQ0FBb0JDLE1BQXBCLEVBQTZDQyxLQUE3QyxFQUF3RztBQUFBOztBQUFBO0FBQ3RHLFlBQU1DLHlCQUF5QjtBQUM3QkMsc0JBQWMsa0JBQVFDLDhCQUFSLENBQXVDSixNQUF2QyxDQURlO0FBRTdCSyxrQkFBVSxrQkFBUUMsZUFBUixDQUF3QkwsS0FBeEI7QUFGbUIsT0FBL0I7O0FBS0EsWUFBTU0sYUFBYSxNQUFNLE1BQUtWLEdBQUwsQ0FBU1csY0FBVCxDQUF3Qk4sc0JBQXhCLENBQXpCO0FBQ0EsVUFBSUssY0FBYyxJQUFkLElBQXNCQSxXQUFXRSxNQUFYLEtBQXNCLENBQWhELEVBQW1ELE9BQU8sSUFBUDs7QUFFbkQsWUFBTUMsYUFBYSxNQUFNLE1BQUtiLEdBQUwsQ0FBU2MsaUJBQVQsQ0FBMkJULHNCQUEzQixDQUF6Qjs7QUFFQSxhQUFPO0FBQ0xVLGVBQU9GLFdBQVdHLEdBQVgsQ0FBZTtBQUFBLGlCQUFLLGtCQUFRQyxrQkFBUixDQUEyQkMsRUFBRUgsS0FBN0IsQ0FBTDtBQUFBLFNBQWYsQ0FERjtBQUVMSSxrQkFBVSxZQUFNO0FBQ2QsZ0JBQUtDLGtCQUFMLENBQXdCLGtCQUFRQyxTQUFSLENBQWtCWCxXQUFXLENBQVgsRUFBY1ksR0FBaEMsQ0FBeEIsRUFBOEQsa0JBQVFDLGVBQVIsQ0FBd0JiLFdBQVcsQ0FBWCxFQUFjSyxLQUFkLENBQW9CUyxLQUE1QyxDQUE5RDtBQUNEO0FBSkksT0FBUDtBQVhzRztBQWlCdkc7O0FBRUtKLG9CQUFOLENBQXlCSyxJQUF6QixFQUF1Q3JCLEtBQXZDLEVBQXdFO0FBQUE7QUFDdEUsWUFBTXNCLGdCQUFnQkMsS0FBS0MsU0FBTCxDQUFlQyxtQkFBZixFQUF0QjtBQUNBLFVBQUlILGlCQUFpQixJQUFqQixJQUF5QkEsY0FBY0ksT0FBZCxPQUE0QkwsSUFBekQsRUFBK0Q7QUFDN0RDLHNCQUFjSyx1QkFBZCxDQUFzQyxDQUFDM0IsTUFBTTRCLEdBQVAsRUFBWTVCLE1BQU02QixNQUFsQixDQUF0QztBQUNELE9BRkQsTUFFTztBQUNMLGNBQU1OLEtBQUtDLFNBQUwsQ0FBZU0sSUFBZixDQUFvQlQsSUFBcEIsRUFBMEI7QUFDOUJVLHVCQUFhL0IsTUFBTTRCLEdBRFc7QUFFOUJJLHlCQUFlaEMsTUFBTTZCLE1BRlM7QUFHOUJJLDBCQUFnQjtBQUhjLFNBQTFCLENBQU47QUFLRDtBQVZxRTtBQVd2RTtBQXhDMEMsQztrQkFBeEJ4Qyx1QiIsImZpbGUiOiJudWNsaWRlLWh5cGVyY2xpY2stYnJpZGdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQGZsb3dcclxuXHJcbmltcG9ydCB7TGFuZ3VhZ2VDbGllbnRWMn0gZnJvbSAnLi4vcHJvdG9jb2wvbGFuZ3VhZ2VjbGllbnQtdjInO1xyXG5pbXBvcnQgQ29udmVydCBmcm9tICcuLi9jb252ZXJ0JztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE51Y2xpZGVIeXBlcmNsaWNrQnJpZGdlIHtcclxuICBfbGM6IExhbmd1YWdlQ2xpZW50VjI7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGxhbmd1YWdlQ2xpZW50OiBMYW5ndWFnZUNsaWVudFYyKSB7XHJcbiAgICB0aGlzLl9sYyA9IGxhbmd1YWdlQ2xpZW50O1xyXG4gIH1cclxuXHJcbiAgZGlzcG9zZSgpOiB2b2lkIHtcclxuICB9XHJcblxyXG4gIGFzeW5jIGdldFN1Z2dlc3Rpb24oZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIHBvaW50OiBhdG9tJFBvaW50KTogUHJvbWlzZTw/bnVjbGlkZSRIeXBlcmNsaWNrU3VnZ2VzdGlvbj4ge1xyXG4gICAgY29uc3QgZG9jdW1lbnRQb3NpdGlvblBhcmFtcyA9IHtcclxuICAgICAgdGV4dERvY3VtZW50OiBDb252ZXJ0LmVkaXRvclRvVGV4dERvY3VtZW50SWRlbnRpZmllcihlZGl0b3IpLFxyXG4gICAgICBwb3NpdGlvbjogQ29udmVydC5wb2ludFRvUG9zaXRpb24ocG9pbnQpXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGRlZmluaXRpb24gPSBhd2FpdCB0aGlzLl9sYy5nb3RvRGVmaW5pdGlvbihkb2N1bWVudFBvc2l0aW9uUGFyYW1zKTtcclxuICAgIGlmIChkZWZpbml0aW9uID09IG51bGwgfHwgZGVmaW5pdGlvbi5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xyXG5cclxuICAgIGNvbnN0IGhpZ2hsaWdodHMgPSBhd2FpdCB0aGlzLl9sYy5kb2N1bWVudEhpZ2hsaWdodChkb2N1bWVudFBvc2l0aW9uUGFyYW1zKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByYW5nZTogaGlnaGxpZ2h0cy5tYXAoaCA9PiBDb252ZXJ0LmxzUmFuZ2VUb0F0b21SYW5nZShoLnJhbmdlKSksXHJcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5nb1RvTG9jYXRpb25JbkZpbGUoQ29udmVydC51cmlUb1BhdGgoZGVmaW5pdGlvblswXS51cmkpLCBDb252ZXJ0LnBvc2l0aW9uVG9Qb2ludChkZWZpbml0aW9uWzBdLnJhbmdlLnN0YXJ0KSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBhc3luYyBnb1RvTG9jYXRpb25JbkZpbGUocGF0aDogc3RyaW5nLCBwb2ludDphdG9tJFBvaW50KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBjb25zdCBjdXJyZW50RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xyXG4gICAgaWYgKGN1cnJlbnRFZGl0b3IgIT0gbnVsbCAmJiBjdXJyZW50RWRpdG9yLmdldFBhdGgoKSA9PT0gcGF0aCkge1xyXG4gICAgICBjdXJyZW50RWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFtwb2ludC5yb3csIHBvaW50LmNvbHVtbl0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoLCB7XHJcbiAgICAgICAgaW5pdGlhbExpbmU6IHBvaW50LnJvdyxcclxuICAgICAgICBpbml0aWFsQ29sdW1uOiBwb2ludC5jb2x1bW4sXHJcbiAgICAgICAgc2VhcmNoQWxsUGFuZXM6IHRydWVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==