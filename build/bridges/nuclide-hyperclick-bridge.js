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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9icmlkZ2VzL251Y2xpZGUtaHlwZXJjbGljay1icmlkZ2UuanMiXSwibmFtZXMiOlsiTnVjbGlkZUh5cGVyY2xpY2tCcmlkZ2UiLCJjb25zdHJ1Y3RvciIsImxhbmd1YWdlQ2xpZW50IiwiX2xjIiwiZ2V0U3VnZ2VzdGlvbiIsImVkaXRvciIsInBvaW50IiwiZG9jdW1lbnRQb3NpdGlvblBhcmFtcyIsInRleHREb2N1bWVudCIsImVkaXRvclRvVGV4dERvY3VtZW50SWRlbnRpZmllciIsInBvc2l0aW9uIiwicG9pbnRUb1Bvc2l0aW9uIiwiZGVmaW5pdGlvbiIsImdvdG9EZWZpbml0aW9uIiwibGVuZ3RoIiwiaGlnaGxpZ2h0cyIsImRvY3VtZW50SGlnaGxpZ2h0IiwicmFuZ2UiLCJtYXAiLCJsc1JhbmdlVG9BdG9tUmFuZ2UiLCJoIiwiY2FsbGJhY2siLCJnb1RvTG9jYXRpb25JbkZpbGUiLCJ1cmlUb1BhdGgiLCJ1cmkiLCJwb3NpdGlvblRvUG9pbnQiLCJzdGFydCIsInBhdGgiLCJjdXJyZW50RWRpdG9yIiwiYXRvbSIsIndvcmtzcGFjZSIsImdldEFjdGl2ZVRleHRFZGl0b3IiLCJnZXRQYXRoIiwic2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24iLCJyb3ciLCJjb2x1bW4iLCJvcGVuIiwiaW5pdGlhbExpbmUiLCJpbml0aWFsQ29sdW1uIiwic2VhcmNoQWxsUGFuZXMiXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUE7O0FBQ0E7Ozs7Ozs7O0lBRXFCQSx1QixHQUFOLE1BQU1BLHVCQUFOLENBQThCOztBQUczQ0MsY0FBWUMsY0FBWixFQUE4QztBQUM1QyxTQUFLQyxHQUFMLEdBQVdELGNBQVg7QUFDRDs7QUFFS0UsZUFBTixDQUFvQkMsTUFBcEIsRUFBNkNDLEtBQTdDLEVBQXdHO0FBQUE7O0FBQUE7QUFDdEcsWUFBTUMseUJBQXlCO0FBQzdCQyxzQkFBYyxrQkFBUUMsOEJBQVIsQ0FBdUNKLE1BQXZDLENBRGU7QUFFN0JLLGtCQUFVLGtCQUFRQyxlQUFSLENBQXdCTCxLQUF4QjtBQUZtQixPQUEvQjs7QUFLQSxZQUFNTSxhQUFhLE1BQU0sTUFBS1QsR0FBTCxDQUFTVSxjQUFULENBQXdCTixzQkFBeEIsQ0FBekI7QUFDQSxVQUFJSyxjQUFjLElBQWQsSUFBc0JBLFdBQVdFLE1BQVgsS0FBc0IsQ0FBaEQsRUFBbUQsT0FBTyxJQUFQOztBQUVuRCxZQUFNQyxhQUFhLE1BQU0sTUFBS1osR0FBTCxDQUFTYSxpQkFBVCxDQUEyQlQsc0JBQTNCLENBQXpCOztBQUVBLGFBQU87QUFDTFUsZUFBT0YsV0FBV0csR0FBWCxDQUFlO0FBQUEsaUJBQUssa0JBQVFDLGtCQUFSLENBQTJCQyxFQUFFSCxLQUE3QixDQUFMO0FBQUEsU0FBZixDQURGO0FBRUxJLGtCQUFVLFlBQU07QUFDZCxnQkFBS0Msa0JBQUwsQ0FBd0Isa0JBQVFDLFNBQVIsQ0FBa0JYLFdBQVcsQ0FBWCxFQUFjWSxHQUFoQyxDQUF4QixFQUE4RCxrQkFBUUMsZUFBUixDQUF3QmIsV0FBVyxDQUFYLEVBQWNLLEtBQWQsQ0FBb0JTLEtBQTVDLENBQTlEO0FBQ0Q7QUFKSSxPQUFQO0FBWHNHO0FBaUJ2Rzs7QUFFS0osb0JBQU4sQ0FBeUJLLElBQXpCLEVBQXVDckIsS0FBdkMsRUFBd0U7QUFBQTtBQUN0RSxZQUFNc0IsZ0JBQWdCQyxLQUFLQyxTQUFMLENBQWVDLG1CQUFmLEVBQXRCO0FBQ0EsVUFBSUgsaUJBQWlCLElBQWpCLElBQXlCQSxjQUFjSSxPQUFkLE9BQTRCTCxJQUF6RCxFQUErRDtBQUM3REMsc0JBQWNLLHVCQUFkLENBQXNDLENBQUMzQixNQUFNNEIsR0FBUCxFQUFZNUIsTUFBTTZCLE1BQWxCLENBQXRDO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsY0FBTU4sS0FBS0MsU0FBTCxDQUFlTSxJQUFmLENBQW9CVCxJQUFwQixFQUEwQjtBQUM5QlUsdUJBQWEvQixNQUFNNEIsR0FEVztBQUU5QkkseUJBQWVoQyxNQUFNNkIsTUFGUztBQUc5QkksMEJBQWdCO0FBSGMsU0FBMUIsQ0FBTjtBQUtEO0FBVnFFO0FBV3ZFO0FBckMwQyxDO2tCQUF4QnZDLHVCIiwiZmlsZSI6Im51Y2xpZGUtaHlwZXJjbGljay1icmlkZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAZmxvd1xyXG5cclxuaW1wb3J0IHtMYW5ndWFnZUNsaWVudFYyfSBmcm9tICcuLi9wcm90b2NvbC9sYW5ndWFnZWNsaWVudC12Mic7XHJcbmltcG9ydCBDb252ZXJ0IGZyb20gJy4uL2NvbnZlcnQnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTnVjbGlkZUh5cGVyY2xpY2tCcmlkZ2Uge1xyXG4gIF9sYzogTGFuZ3VhZ2VDbGllbnRWMjtcclxuXHJcbiAgY29uc3RydWN0b3IobGFuZ3VhZ2VDbGllbnQ6IExhbmd1YWdlQ2xpZW50VjIpIHtcclxuICAgIHRoaXMuX2xjID0gbGFuZ3VhZ2VDbGllbnQ7XHJcbiAgfVxyXG5cclxuICBhc3luYyBnZXRTdWdnZXN0aW9uKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLCBwb2ludDogYXRvbSRQb2ludCk6IFByb21pc2U8P251Y2xpZGUkSHlwZXJjbGlja1N1Z2dlc3Rpb24+IHtcclxuICAgIGNvbnN0IGRvY3VtZW50UG9zaXRpb25QYXJhbXMgPSB7XHJcbiAgICAgIHRleHREb2N1bWVudDogQ29udmVydC5lZGl0b3JUb1RleHREb2N1bWVudElkZW50aWZpZXIoZWRpdG9yKSxcclxuICAgICAgcG9zaXRpb246IENvbnZlcnQucG9pbnRUb1Bvc2l0aW9uKHBvaW50KVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBkZWZpbml0aW9uID0gYXdhaXQgdGhpcy5fbGMuZ290b0RlZmluaXRpb24oZG9jdW1lbnRQb3NpdGlvblBhcmFtcyk7XHJcbiAgICBpZiAoZGVmaW5pdGlvbiA9PSBudWxsIHx8IGRlZmluaXRpb24ubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICBjb25zdCBoaWdobGlnaHRzID0gYXdhaXQgdGhpcy5fbGMuZG9jdW1lbnRIaWdobGlnaHQoZG9jdW1lbnRQb3NpdGlvblBhcmFtcyk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcmFuZ2U6IGhpZ2hsaWdodHMubWFwKGggPT4gQ29udmVydC5sc1JhbmdlVG9BdG9tUmFuZ2UoaC5yYW5nZSkpLFxyXG4gICAgICBjYWxsYmFjazogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuZ29Ub0xvY2F0aW9uSW5GaWxlKENvbnZlcnQudXJpVG9QYXRoKGRlZmluaXRpb25bMF0udXJpKSwgQ29udmVydC5wb3NpdGlvblRvUG9pbnQoZGVmaW5pdGlvblswXS5yYW5nZS5zdGFydCkpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZ29Ub0xvY2F0aW9uSW5GaWxlKHBhdGg6IHN0cmluZywgcG9pbnQ6YXRvbSRQb2ludCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgY3VycmVudEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcclxuICAgIGlmIChjdXJyZW50RWRpdG9yICE9IG51bGwgJiYgY3VycmVudEVkaXRvci5nZXRQYXRoKCkgPT09IHBhdGgpIHtcclxuICAgICAgY3VycmVudEVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbcG9pbnQucm93LCBwb2ludC5jb2x1bW5dKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aCwge1xyXG4gICAgICAgIGluaXRpYWxMaW5lOiBwb2ludC5yb3csXHJcbiAgICAgICAgaW5pdGlhbENvbHVtbjogcG9pbnQuY29sdW1uLFxyXG4gICAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=