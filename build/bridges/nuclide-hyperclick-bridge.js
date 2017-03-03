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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9icmlkZ2VzL251Y2xpZGUtaHlwZXJjbGljay1icmlkZ2UuanMiXSwibmFtZXMiOlsiTnVjbGlkZUh5cGVyY2xpY2tCcmlkZ2UiLCJjb25zdHJ1Y3RvciIsImxhbmd1YWdlQ2xpZW50IiwiX2xjIiwiZGlzcG9zZSIsImdldFN1Z2dlc3Rpb24iLCJlZGl0b3IiLCJwb2ludCIsImRvY3VtZW50UG9zaXRpb25QYXJhbXMiLCJ0ZXh0RG9jdW1lbnQiLCJlZGl0b3JUb1RleHREb2N1bWVudElkZW50aWZpZXIiLCJwb3NpdGlvbiIsInBvaW50VG9Qb3NpdGlvbiIsImRlZmluaXRpb24iLCJnb3RvRGVmaW5pdGlvbiIsImxlbmd0aCIsImhpZ2hsaWdodHMiLCJkb2N1bWVudEhpZ2hsaWdodCIsInJhbmdlIiwibWFwIiwibHNSYW5nZVRvQXRvbVJhbmdlIiwiaCIsImNhbGxiYWNrIiwiZ29Ub0xvY2F0aW9uSW5GaWxlIiwidXJpVG9QYXRoIiwidXJpIiwicG9zaXRpb25Ub1BvaW50Iiwic3RhcnQiLCJwYXRoIiwiY3VycmVudEVkaXRvciIsImF0b20iLCJ3b3Jrc3BhY2UiLCJnZXRBY3RpdmVUZXh0RWRpdG9yIiwiZ2V0UGF0aCIsInNldEN1cnNvckJ1ZmZlclBvc2l0aW9uIiwicm93IiwiY29sdW1uIiwib3BlbiIsImluaXRpYWxMaW5lIiwiaW5pdGlhbENvbHVtbiIsInNlYXJjaEFsbFBhbmVzIl0sIm1hcHBpbmdzIjoiOzs7OztBQUVBOztBQUVBOzs7O0FBQ0E7Ozs7OztJQUVxQkEsdUIsR0FBTixNQUFNQSx1QkFBTixDQUE4Qjs7QUFHM0NDLGNBQVlDLGNBQVosRUFBOEM7QUFDNUMsU0FBS0MsR0FBTCxHQUFXRCxjQUFYO0FBQ0Q7O0FBRURFLFlBQWdCLENBQ2Y7O0FBRUtDLGVBQU4sQ0FBb0JDLE1BQXBCLEVBQTZDQyxLQUE3QyxFQUF3RztBQUFBOztBQUFBO0FBQ3RHLFlBQU1DLHlCQUF5QjtBQUM3QkMsc0JBQWMsa0JBQVFDLDhCQUFSLENBQXVDSixNQUF2QyxDQURlO0FBRTdCSyxrQkFBVSxrQkFBUUMsZUFBUixDQUF3QkwsS0FBeEI7QUFGbUIsT0FBL0I7O0FBS0EsWUFBTU0sYUFBYSxNQUFNLE1BQUtWLEdBQUwsQ0FBU1csY0FBVCxDQUF3Qk4sc0JBQXhCLENBQXpCO0FBQ0EsVUFBSUssY0FBYyxJQUFkLElBQXNCQSxXQUFXRSxNQUFYLEtBQXNCLENBQWhELEVBQW1ELE9BQU8sSUFBUDs7QUFFbkQsWUFBTUMsYUFBYSxNQUFNLE1BQUtiLEdBQUwsQ0FBU2MsaUJBQVQsQ0FBMkJULHNCQUEzQixDQUF6Qjs7QUFFQSxhQUFPO0FBQ0xVLGVBQU9GLFdBQVdHLEdBQVgsQ0FBZTtBQUFBLGlCQUFLLGtCQUFRQyxrQkFBUixDQUEyQkMsRUFBRUgsS0FBN0IsQ0FBTDtBQUFBLFNBQWYsQ0FERjtBQUVMSSxrQkFBVSxZQUFNO0FBQ2QsZ0JBQUtDLGtCQUFMLENBQXdCLGtCQUFRQyxTQUFSLENBQWtCWCxXQUFXLENBQVgsRUFBY1ksR0FBaEMsQ0FBeEIsRUFBOEQsa0JBQVFDLGVBQVIsQ0FBd0JiLFdBQVcsQ0FBWCxFQUFjSyxLQUFkLENBQW9CUyxLQUE1QyxDQUE5RDtBQUNEO0FBSkksT0FBUDtBQVhzRztBQWlCdkc7O0FBRUtKLG9CQUFOLENBQXlCSyxJQUF6QixFQUF1Q3JCLEtBQXZDLEVBQXdFO0FBQUE7QUFDdEUsWUFBTXNCLGdCQUFnQkMsS0FBS0MsU0FBTCxDQUFlQyxtQkFBZixFQUF0QjtBQUNBLFVBQUlILGlCQUFpQixJQUFqQixJQUF5QkEsY0FBY0ksT0FBZCxPQUE0QkwsSUFBekQsRUFBK0Q7QUFDN0RDLHNCQUFjSyx1QkFBZCxDQUFzQyxDQUFDM0IsTUFBTTRCLEdBQVAsRUFBWTVCLE1BQU02QixNQUFsQixDQUF0QztBQUNELE9BRkQsTUFFTztBQUNMLGNBQU1OLEtBQUtDLFNBQUwsQ0FBZU0sSUFBZixDQUFvQlQsSUFBcEIsRUFBMEI7QUFDOUJVLHVCQUFhL0IsTUFBTTRCLEdBRFc7QUFFOUJJLHlCQUFlaEMsTUFBTTZCLE1BRlM7QUFHOUJJLDBCQUFnQjtBQUhjLFNBQTFCLENBQU47QUFLRDtBQVZxRTtBQVd2RTtBQXhDMEMsQztrQkFBeEJ4Qyx1QiIsImZpbGUiOiJudWNsaWRlLWh5cGVyY2xpY2stYnJpZGdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQGZsb3dcclxuXHJcbmltcG9ydCB7TGFuZ3VhZ2VDbGllbnRWMn0gZnJvbSAnLi4vcHJvdG9jb2wvbGFuZ3VhZ2VjbGllbnQtdjInO1xyXG5pbXBvcnQgdHlwZSB7TG9jYXRpb259IGZyb20gJy4uL3Byb3RvY29sL2xhbmd1YWdlY2xpZW50LXYyJztcclxuaW1wb3J0IENvbnZlcnQgZnJvbSAnLi4vY29udmVydCc7XHJcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOdWNsaWRlSHlwZXJjbGlja0JyaWRnZSB7XHJcbiAgX2xjOiBMYW5ndWFnZUNsaWVudFYyO1xyXG5cclxuICBjb25zdHJ1Y3RvcihsYW5ndWFnZUNsaWVudDogTGFuZ3VhZ2VDbGllbnRWMikge1xyXG4gICAgdGhpcy5fbGMgPSBsYW5ndWFnZUNsaWVudDtcclxuICB9XHJcblxyXG4gIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgfVxyXG5cclxuICBhc3luYyBnZXRTdWdnZXN0aW9uKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLCBwb2ludDogYXRvbSRQb2ludCk6IFByb21pc2U8P251Y2xpZGUkSHlwZXJjbGlja1N1Z2dlc3Rpb24+IHtcclxuICAgIGNvbnN0IGRvY3VtZW50UG9zaXRpb25QYXJhbXMgPSB7XHJcbiAgICAgIHRleHREb2N1bWVudDogQ29udmVydC5lZGl0b3JUb1RleHREb2N1bWVudElkZW50aWZpZXIoZWRpdG9yKSxcclxuICAgICAgcG9zaXRpb246IENvbnZlcnQucG9pbnRUb1Bvc2l0aW9uKHBvaW50KVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBkZWZpbml0aW9uID0gYXdhaXQgdGhpcy5fbGMuZ290b0RlZmluaXRpb24oZG9jdW1lbnRQb3NpdGlvblBhcmFtcyk7XHJcbiAgICBpZiAoZGVmaW5pdGlvbiA9PSBudWxsIHx8IGRlZmluaXRpb24ubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICBjb25zdCBoaWdobGlnaHRzID0gYXdhaXQgdGhpcy5fbGMuZG9jdW1lbnRIaWdobGlnaHQoZG9jdW1lbnRQb3NpdGlvblBhcmFtcyk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcmFuZ2U6IGhpZ2hsaWdodHMubWFwKGggPT4gQ29udmVydC5sc1JhbmdlVG9BdG9tUmFuZ2UoaC5yYW5nZSkpLFxyXG4gICAgICBjYWxsYmFjazogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuZ29Ub0xvY2F0aW9uSW5GaWxlKENvbnZlcnQudXJpVG9QYXRoKGRlZmluaXRpb25bMF0udXJpKSwgQ29udmVydC5wb3NpdGlvblRvUG9pbnQoZGVmaW5pdGlvblswXS5yYW5nZS5zdGFydCkpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZ29Ub0xvY2F0aW9uSW5GaWxlKHBhdGg6IHN0cmluZywgcG9pbnQ6YXRvbSRQb2ludCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgY3VycmVudEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcclxuICAgIGlmIChjdXJyZW50RWRpdG9yICE9IG51bGwgJiYgY3VycmVudEVkaXRvci5nZXRQYXRoKCkgPT09IHBhdGgpIHtcclxuICAgICAgY3VycmVudEVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbcG9pbnQucm93LCBwb2ludC5jb2x1bW5dKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aCwge1xyXG4gICAgICAgIGluaXRpYWxMaW5lOiBwb2ludC5yb3csXHJcbiAgICAgICAgaW5pdGlhbENvbHVtbjogcG9pbnQuY29sdW1uLFxyXG4gICAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=