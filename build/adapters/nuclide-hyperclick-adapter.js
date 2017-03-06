Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _languageclient = require('../languageclient');

var _convert = require('../convert');

var _convert2 = _interopRequireDefault(_convert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let NuclideHyperclickAdapter = class NuclideHyperclickAdapter {

  constructor(languageClient) {
    this._lc = languageClient;
  }

  getSuggestion(editor, point) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const documentPositionParams = {
        textDocument: _convert2.default.editorToTextDocumentIdentifier(editor),
        position: _convert2.default.pointToPosition(point)
      };

      const highlights = yield _this._lc.documentHighlight(documentPositionParams);
      if (highlights == null || highlights.length === 0) return null;

      const definition = yield _this._lc.gotoDefinition(documentPositionParams);
      if (definition == null || definition.length === 0) return null;

      const definitions = Array.isArray(definition) ? definition : [definition];

      return {
        range: highlights.map(function (h) {
          return _convert2.default.lsRangeToAtomRange(h.range);
        }),
        callback: function () {
          NuclideHyperclickAdapter.goToLocationInFile(_convert2.default.uriToPath(definition[0].uri), _convert2.default.positionToPoint(definition[0].range.start));
        }
      };
    })();
  }

  static goToLocationInFile(path, point) {
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
exports.default = NuclideHyperclickAdapter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9hZGFwdGVycy9udWNsaWRlLWh5cGVyY2xpY2stYWRhcHRlci5qcyJdLCJuYW1lcyI6WyJOdWNsaWRlSHlwZXJjbGlja0FkYXB0ZXIiLCJjb25zdHJ1Y3RvciIsImxhbmd1YWdlQ2xpZW50IiwiX2xjIiwiZ2V0U3VnZ2VzdGlvbiIsImVkaXRvciIsInBvaW50IiwiZG9jdW1lbnRQb3NpdGlvblBhcmFtcyIsInRleHREb2N1bWVudCIsImVkaXRvclRvVGV4dERvY3VtZW50SWRlbnRpZmllciIsInBvc2l0aW9uIiwicG9pbnRUb1Bvc2l0aW9uIiwiaGlnaGxpZ2h0cyIsImRvY3VtZW50SGlnaGxpZ2h0IiwibGVuZ3RoIiwiZGVmaW5pdGlvbiIsImdvdG9EZWZpbml0aW9uIiwiZGVmaW5pdGlvbnMiLCJBcnJheSIsImlzQXJyYXkiLCJyYW5nZSIsIm1hcCIsImxzUmFuZ2VUb0F0b21SYW5nZSIsImgiLCJjYWxsYmFjayIsImdvVG9Mb2NhdGlvbkluRmlsZSIsInVyaVRvUGF0aCIsInVyaSIsInBvc2l0aW9uVG9Qb2ludCIsInN0YXJ0IiwicGF0aCIsImN1cnJlbnRFZGl0b3IiLCJhdG9tIiwid29ya3NwYWNlIiwiZ2V0QWN0aXZlVGV4dEVkaXRvciIsImdldFBhdGgiLCJzZXRDdXJzb3JCdWZmZXJQb3NpdGlvbiIsInJvdyIsImNvbHVtbiIsIm9wZW4iLCJpbml0aWFsTGluZSIsImluaXRpYWxDb2x1bW4iLCJzZWFyY2hBbGxQYW5lcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQTs7QUFDQTs7Ozs7Ozs7SUFFcUJBLHdCLEdBQU4sTUFBTUEsd0JBQU4sQ0FBK0I7O0FBRzVDQyxjQUFZQyxjQUFaLEVBQXNEO0FBQ3BELFNBQUtDLEdBQUwsR0FBV0QsY0FBWDtBQUNEOztBQUVLRSxlQUFOLENBQW9CQyxNQUFwQixFQUE2Q0MsS0FBN0MsRUFBd0c7QUFBQTs7QUFBQTtBQUN0RyxZQUFNQyx5QkFBeUI7QUFDN0JDLHNCQUFjLGtCQUFRQyw4QkFBUixDQUF1Q0osTUFBdkMsQ0FEZTtBQUU3Qkssa0JBQVUsa0JBQVFDLGVBQVIsQ0FBd0JMLEtBQXhCO0FBRm1CLE9BQS9COztBQUtBLFlBQU1NLGFBQWEsTUFBTSxNQUFLVCxHQUFMLENBQVNVLGlCQUFULENBQTJCTixzQkFBM0IsQ0FBekI7QUFDQSxVQUFJSyxjQUFjLElBQWQsSUFBc0JBLFdBQVdFLE1BQVgsS0FBc0IsQ0FBaEQsRUFBbUQsT0FBTyxJQUFQOztBQUVuRCxZQUFNQyxhQUFhLE1BQU0sTUFBS1osR0FBTCxDQUFTYSxjQUFULENBQXdCVCxzQkFBeEIsQ0FBekI7QUFDQSxVQUFJUSxjQUFjLElBQWQsSUFBc0JBLFdBQVdELE1BQVgsS0FBc0IsQ0FBaEQsRUFBbUQsT0FBTyxJQUFQOztBQUVuRCxZQUFNRyxjQUFjQyxNQUFNQyxPQUFOLENBQWNKLFVBQWQsSUFBNEJBLFVBQTVCLEdBQXlDLENBQUVBLFVBQUYsQ0FBN0Q7O0FBRUEsYUFBTztBQUNMSyxlQUFPUixXQUFXUyxHQUFYLENBQWU7QUFBQSxpQkFBSyxrQkFBUUMsa0JBQVIsQ0FBMkJDLEVBQUVILEtBQTdCLENBQUw7QUFBQSxTQUFmLENBREY7QUFFTEksa0JBQVUsWUFBTTtBQUNkeEIsbUNBQXlCeUIsa0JBQXpCLENBQTRDLGtCQUFRQyxTQUFSLENBQWtCWCxXQUFXLENBQVgsRUFBY1ksR0FBaEMsQ0FBNUMsRUFBa0Ysa0JBQVFDLGVBQVIsQ0FBd0JiLFdBQVcsQ0FBWCxFQUFjSyxLQUFkLENBQW9CUyxLQUE1QyxDQUFsRjtBQUNEO0FBSkksT0FBUDtBQWRzRztBQW9Cdkc7O0FBRUQsU0FBYUosa0JBQWIsQ0FBZ0NLLElBQWhDLEVBQThDeEIsS0FBOUMsRUFBK0U7QUFBQTtBQUM3RSxZQUFNeUIsZ0JBQWdCQyxLQUFLQyxTQUFMLENBQWVDLG1CQUFmLEVBQXRCO0FBQ0EsVUFBSUgsaUJBQWlCLElBQWpCLElBQXlCQSxjQUFjSSxPQUFkLE9BQTRCTCxJQUF6RCxFQUErRDtBQUM3REMsc0JBQWNLLHVCQUFkLENBQXNDLENBQUM5QixNQUFNK0IsR0FBUCxFQUFZL0IsTUFBTWdDLE1BQWxCLENBQXRDO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsY0FBTU4sS0FBS0MsU0FBTCxDQUFlTSxJQUFmLENBQW9CVCxJQUFwQixFQUEwQjtBQUM5QlUsdUJBQWFsQyxNQUFNK0IsR0FEVztBQUU5QkkseUJBQWVuQyxNQUFNZ0MsTUFGUztBQUc5QkksMEJBQWdCO0FBSGMsU0FBMUIsQ0FBTjtBQUtEO0FBVjRFO0FBVzlFO0FBeEMyQyxDO2tCQUF6QjFDLHdCIiwiZmlsZSI6Im51Y2xpZGUtaHlwZXJjbGljay1hZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQGZsb3dcclxuXHJcbmltcG9ydCB7TGFuZ3VhZ2VDbGllbnRDb25uZWN0aW9ufSBmcm9tICcuLi9sYW5ndWFnZWNsaWVudCc7XHJcbmltcG9ydCBDb252ZXJ0IGZyb20gJy4uL2NvbnZlcnQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTnVjbGlkZUh5cGVyY2xpY2tBZGFwdGVyIHtcclxuICBfbGM6IExhbmd1YWdlQ2xpZW50Q29ubmVjdGlvbjtcclxuXHJcbiAgY29uc3RydWN0b3IobGFuZ3VhZ2VDbGllbnQ6IExhbmd1YWdlQ2xpZW50Q29ubmVjdGlvbikge1xyXG4gICAgdGhpcy5fbGMgPSBsYW5ndWFnZUNsaWVudDtcclxuICB9XHJcblxyXG4gIGFzeW5jIGdldFN1Z2dlc3Rpb24oZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIHBvaW50OiBhdG9tJFBvaW50KTogUHJvbWlzZTw/bnVjbGlkZSRIeXBlcmNsaWNrU3VnZ2VzdGlvbj4ge1xyXG4gICAgY29uc3QgZG9jdW1lbnRQb3NpdGlvblBhcmFtcyA9IHtcclxuICAgICAgdGV4dERvY3VtZW50OiBDb252ZXJ0LmVkaXRvclRvVGV4dERvY3VtZW50SWRlbnRpZmllcihlZGl0b3IpLFxyXG4gICAgICBwb3NpdGlvbjogQ29udmVydC5wb2ludFRvUG9zaXRpb24ocG9pbnQpXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGhpZ2hsaWdodHMgPSBhd2FpdCB0aGlzLl9sYy5kb2N1bWVudEhpZ2hsaWdodChkb2N1bWVudFBvc2l0aW9uUGFyYW1zKTtcclxuICAgIGlmIChoaWdobGlnaHRzID09IG51bGwgfHwgaGlnaGxpZ2h0cy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xyXG5cclxuICAgIGNvbnN0IGRlZmluaXRpb24gPSBhd2FpdCB0aGlzLl9sYy5nb3RvRGVmaW5pdGlvbihkb2N1bWVudFBvc2l0aW9uUGFyYW1zKTtcclxuICAgIGlmIChkZWZpbml0aW9uID09IG51bGwgfHwgZGVmaW5pdGlvbi5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xyXG5cclxuICAgIGNvbnN0IGRlZmluaXRpb25zID0gQXJyYXkuaXNBcnJheShkZWZpbml0aW9uKSA/IGRlZmluaXRpb24gOiBbIGRlZmluaXRpb24gXTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByYW5nZTogaGlnaGxpZ2h0cy5tYXAoaCA9PiBDb252ZXJ0LmxzUmFuZ2VUb0F0b21SYW5nZShoLnJhbmdlKSksXHJcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XHJcbiAgICAgICAgTnVjbGlkZUh5cGVyY2xpY2tBZGFwdGVyLmdvVG9Mb2NhdGlvbkluRmlsZShDb252ZXJ0LnVyaVRvUGF0aChkZWZpbml0aW9uWzBdLnVyaSksIENvbnZlcnQucG9zaXRpb25Ub1BvaW50KGRlZmluaXRpb25bMF0ucmFuZ2Uuc3RhcnQpKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBhc3luYyBnb1RvTG9jYXRpb25JbkZpbGUocGF0aDogc3RyaW5nLCBwb2ludDphdG9tJFBvaW50KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBjb25zdCBjdXJyZW50RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xyXG4gICAgaWYgKGN1cnJlbnRFZGl0b3IgIT0gbnVsbCAmJiBjdXJyZW50RWRpdG9yLmdldFBhdGgoKSA9PT0gcGF0aCkge1xyXG4gICAgICBjdXJyZW50RWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFtwb2ludC5yb3csIHBvaW50LmNvbHVtbl0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoLCB7XHJcbiAgICAgICAgaW5pdGlhbExpbmU6IHBvaW50LnJvdyxcclxuICAgICAgICBpbml0aWFsQ29sdW1uOiBwb2ludC5jb2x1bW4sXHJcbiAgICAgICAgc2VhcmNoQWxsUGFuZXM6IHRydWVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==