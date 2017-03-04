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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9icmlkZ2VzL251Y2xpZGUtaHlwZXJjbGljay1icmlkZ2UuanMiXSwibmFtZXMiOlsiTnVjbGlkZUh5cGVyY2xpY2tCcmlkZ2UiLCJjb25zdHJ1Y3RvciIsImxhbmd1YWdlQ2xpZW50IiwiX2xjIiwiZ2V0U3VnZ2VzdGlvbiIsImVkaXRvciIsInBvaW50IiwiZG9jdW1lbnRQb3NpdGlvblBhcmFtcyIsInRleHREb2N1bWVudCIsImVkaXRvclRvVGV4dERvY3VtZW50SWRlbnRpZmllciIsInBvc2l0aW9uIiwicG9pbnRUb1Bvc2l0aW9uIiwiaGlnaGxpZ2h0cyIsImRvY3VtZW50SGlnaGxpZ2h0IiwibGVuZ3RoIiwiZGVmaW5pdGlvbiIsImdvdG9EZWZpbml0aW9uIiwiZGVmaW5pdGlvbnMiLCJBcnJheSIsImlzQXJyYXkiLCJyYW5nZSIsIm1hcCIsImxzUmFuZ2VUb0F0b21SYW5nZSIsImgiLCJjYWxsYmFjayIsImdvVG9Mb2NhdGlvbkluRmlsZSIsInVyaVRvUGF0aCIsInVyaSIsInBvc2l0aW9uVG9Qb2ludCIsInN0YXJ0IiwicGF0aCIsImN1cnJlbnRFZGl0b3IiLCJhdG9tIiwid29ya3NwYWNlIiwiZ2V0QWN0aXZlVGV4dEVkaXRvciIsImdldFBhdGgiLCJzZXRDdXJzb3JCdWZmZXJQb3NpdGlvbiIsInJvdyIsImNvbHVtbiIsIm9wZW4iLCJpbml0aWFsTGluZSIsImluaXRpYWxDb2x1bW4iLCJzZWFyY2hBbGxQYW5lcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQTs7QUFDQTs7Ozs7Ozs7SUFFcUJBLHVCLEdBQU4sTUFBTUEsdUJBQU4sQ0FBOEI7O0FBRzNDQyxjQUFZQyxjQUFaLEVBQThDO0FBQzVDLFNBQUtDLEdBQUwsR0FBV0QsY0FBWDtBQUNEOztBQUVLRSxlQUFOLENBQW9CQyxNQUFwQixFQUE2Q0MsS0FBN0MsRUFBd0c7QUFBQTs7QUFBQTtBQUN0RyxZQUFNQyx5QkFBeUI7QUFDN0JDLHNCQUFjLGtCQUFRQyw4QkFBUixDQUF1Q0osTUFBdkMsQ0FEZTtBQUU3Qkssa0JBQVUsa0JBQVFDLGVBQVIsQ0FBd0JMLEtBQXhCO0FBRm1CLE9BQS9COztBQUtBLFlBQU1NLGFBQWEsTUFBTSxNQUFLVCxHQUFMLENBQVNVLGlCQUFULENBQTJCTixzQkFBM0IsQ0FBekI7QUFDQSxVQUFJSyxjQUFjLElBQWQsSUFBc0JBLFdBQVdFLE1BQVgsS0FBc0IsQ0FBaEQsRUFBbUQsT0FBTyxJQUFQOztBQUVuRCxZQUFNQyxhQUFhLE1BQU0sTUFBS1osR0FBTCxDQUFTYSxjQUFULENBQXdCVCxzQkFBeEIsQ0FBekI7QUFDQSxVQUFJUSxjQUFjLElBQWQsSUFBc0JBLFdBQVdELE1BQVgsS0FBc0IsQ0FBaEQsRUFBbUQsT0FBTyxJQUFQOztBQUVuRCxZQUFNRyxjQUFjQyxNQUFNQyxPQUFOLENBQWNKLFVBQWQsSUFBNEJBLFVBQTVCLEdBQXlDLENBQUVBLFVBQUYsQ0FBN0Q7O0FBRUEsYUFBTztBQUNMSyxlQUFPUixXQUFXUyxHQUFYLENBQWU7QUFBQSxpQkFBSyxrQkFBUUMsa0JBQVIsQ0FBMkJDLEVBQUVILEtBQTdCLENBQUw7QUFBQSxTQUFmLENBREY7QUFFTEksa0JBQVUsWUFBTTtBQUNkLGdCQUFLQyxrQkFBTCxDQUF3QixrQkFBUUMsU0FBUixDQUFrQlgsV0FBVyxDQUFYLEVBQWNZLEdBQWhDLENBQXhCLEVBQThELGtCQUFRQyxlQUFSLENBQXdCYixXQUFXLENBQVgsRUFBY0ssS0FBZCxDQUFvQlMsS0FBNUMsQ0FBOUQ7QUFDRDtBQUpJLE9BQVA7QUFkc0c7QUFvQnZHOztBQUVLSixvQkFBTixDQUF5QkssSUFBekIsRUFBdUN4QixLQUF2QyxFQUF3RTtBQUFBO0FBQ3RFLFlBQU15QixnQkFBZ0JDLEtBQUtDLFNBQUwsQ0FBZUMsbUJBQWYsRUFBdEI7QUFDQSxVQUFJSCxpQkFBaUIsSUFBakIsSUFBeUJBLGNBQWNJLE9BQWQsT0FBNEJMLElBQXpELEVBQStEO0FBQzdEQyxzQkFBY0ssdUJBQWQsQ0FBc0MsQ0FBQzlCLE1BQU0rQixHQUFQLEVBQVkvQixNQUFNZ0MsTUFBbEIsQ0FBdEM7QUFDRCxPQUZELE1BRU87QUFDTCxjQUFNTixLQUFLQyxTQUFMLENBQWVNLElBQWYsQ0FBb0JULElBQXBCLEVBQTBCO0FBQzlCVSx1QkFBYWxDLE1BQU0rQixHQURXO0FBRTlCSSx5QkFBZW5DLE1BQU1nQyxNQUZTO0FBRzlCSSwwQkFBZ0I7QUFIYyxTQUExQixDQUFOO0FBS0Q7QUFWcUU7QUFXdkU7QUF4QzBDLEM7a0JBQXhCMUMsdUIiLCJmaWxlIjoibnVjbGlkZS1oeXBlcmNsaWNrLWJyaWRnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEBmbG93XHJcblxyXG5pbXBvcnQge0xhbmd1YWdlQ2xpZW50VjJ9IGZyb20gJy4uL3Byb3RvY29sL2xhbmd1YWdlY2xpZW50LXYyJztcclxuaW1wb3J0IENvbnZlcnQgZnJvbSAnLi4vY29udmVydCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOdWNsaWRlSHlwZXJjbGlja0JyaWRnZSB7XHJcbiAgX2xjOiBMYW5ndWFnZUNsaWVudFYyO1xyXG5cclxuICBjb25zdHJ1Y3RvcihsYW5ndWFnZUNsaWVudDogTGFuZ3VhZ2VDbGllbnRWMikge1xyXG4gICAgdGhpcy5fbGMgPSBsYW5ndWFnZUNsaWVudDtcclxuICB9XHJcblxyXG4gIGFzeW5jIGdldFN1Z2dlc3Rpb24oZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIHBvaW50OiBhdG9tJFBvaW50KTogUHJvbWlzZTw/bnVjbGlkZSRIeXBlcmNsaWNrU3VnZ2VzdGlvbj4ge1xyXG4gICAgY29uc3QgZG9jdW1lbnRQb3NpdGlvblBhcmFtcyA9IHtcclxuICAgICAgdGV4dERvY3VtZW50OiBDb252ZXJ0LmVkaXRvclRvVGV4dERvY3VtZW50SWRlbnRpZmllcihlZGl0b3IpLFxyXG4gICAgICBwb3NpdGlvbjogQ29udmVydC5wb2ludFRvUG9zaXRpb24ocG9pbnQpXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGhpZ2hsaWdodHMgPSBhd2FpdCB0aGlzLl9sYy5kb2N1bWVudEhpZ2hsaWdodChkb2N1bWVudFBvc2l0aW9uUGFyYW1zKTtcclxuICAgIGlmIChoaWdobGlnaHRzID09IG51bGwgfHwgaGlnaGxpZ2h0cy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xyXG5cclxuICAgIGNvbnN0IGRlZmluaXRpb24gPSBhd2FpdCB0aGlzLl9sYy5nb3RvRGVmaW5pdGlvbihkb2N1bWVudFBvc2l0aW9uUGFyYW1zKTtcclxuICAgIGlmIChkZWZpbml0aW9uID09IG51bGwgfHwgZGVmaW5pdGlvbi5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xyXG5cclxuICAgIGNvbnN0IGRlZmluaXRpb25zID0gQXJyYXkuaXNBcnJheShkZWZpbml0aW9uKSA/IGRlZmluaXRpb24gOiBbIGRlZmluaXRpb24gXTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByYW5nZTogaGlnaGxpZ2h0cy5tYXAoaCA9PiBDb252ZXJ0LmxzUmFuZ2VUb0F0b21SYW5nZShoLnJhbmdlKSksXHJcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5nb1RvTG9jYXRpb25JbkZpbGUoQ29udmVydC51cmlUb1BhdGgoZGVmaW5pdGlvblswXS51cmkpLCBDb252ZXJ0LnBvc2l0aW9uVG9Qb2ludChkZWZpbml0aW9uWzBdLnJhbmdlLnN0YXJ0KSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBhc3luYyBnb1RvTG9jYXRpb25JbkZpbGUocGF0aDogc3RyaW5nLCBwb2ludDphdG9tJFBvaW50KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBjb25zdCBjdXJyZW50RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xyXG4gICAgaWYgKGN1cnJlbnRFZGl0b3IgIT0gbnVsbCAmJiBjdXJyZW50RWRpdG9yLmdldFBhdGgoKSA9PT0gcGF0aCkge1xyXG4gICAgICBjdXJyZW50RWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFtwb2ludC5yb3csIHBvaW50LmNvbHVtbl0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoLCB7XHJcbiAgICAgICAgaW5pdGlhbExpbmU6IHBvaW50LnJvdyxcclxuICAgICAgICBpbml0aWFsQ29sdW1uOiBwb2ludC5jb2x1bW4sXHJcbiAgICAgICAgc2VhcmNoQWxsUGFuZXM6IHRydWVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==