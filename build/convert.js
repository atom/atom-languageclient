Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atom = require('atom');

var _languageclient = require('./languageclient');

var ls = _interopRequireWildcard(_languageclient);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let Convert = class Convert {
  static pathToUri(pathName) {
    pathName = pathName.replace(/\\/g, '/');
    if (pathName[0] !== '/') pathName = `/${pathName}`;
    return encodeURI(`file://${pathName}`).replace(/[?#]/g, encodeURIComponent);
  }

  static uriToPath(uri) {
    uri = decodeURIComponent(uri);
    if (uri.startsWith('file://')) uri = uri.substr(7);
    if (process.platform === 'win32') {
      if (uri[0] === '/') {
        uri = uri.substr(1);
      }
      return uri.replace(/\//g, '\\');
    }
    return uri;
  }

  static pointToPosition(point) {
    return { line: point.row, character: point.column };
  }

  static positionToPoint(position) {
    return new _atom.Point(position.line, position.character);
  }

  static lsRangeToAtomRange(range) {
    return new _atom.Range(Convert.positionToPoint(range.start), Convert.positionToPoint(range.end));
  }

  static atomRangeToLSRange(range) {
    return { start: Convert.pointToPosition(range.start), end: Convert.pointToPosition(range.end) };
  }

  static editorToTextDocumentIdentifier(editor) {
    return { uri: Convert.pathToUri(editor.getURI() || '') };
  }
};
exports.default = Convert;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9jb252ZXJ0LmpzIl0sIm5hbWVzIjpbImxzIiwiQ29udmVydCIsInBhdGhUb1VyaSIsInBhdGhOYW1lIiwicmVwbGFjZSIsImVuY29kZVVSSSIsImVuY29kZVVSSUNvbXBvbmVudCIsInVyaVRvUGF0aCIsInVyaSIsImRlY29kZVVSSUNvbXBvbmVudCIsInN0YXJ0c1dpdGgiLCJzdWJzdHIiLCJwcm9jZXNzIiwicGxhdGZvcm0iLCJwb2ludFRvUG9zaXRpb24iLCJwb2ludCIsImxpbmUiLCJyb3ciLCJjaGFyYWN0ZXIiLCJjb2x1bW4iLCJwb3NpdGlvblRvUG9pbnQiLCJwb3NpdGlvbiIsImxzUmFuZ2VUb0F0b21SYW5nZSIsInJhbmdlIiwic3RhcnQiLCJlbmQiLCJhdG9tUmFuZ2VUb0xTUmFuZ2UiLCJlZGl0b3JUb1RleHREb2N1bWVudElkZW50aWZpZXIiLCJlZGl0b3IiLCJnZXRVUkkiXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUE7Ozs7QUFDQTs7QUFDQTs7SUFBWUEsRTs7Ozs7O0lBRVNDLE8sR0FBTixNQUFNQSxPQUFOLENBQWM7QUFDM0IsU0FBT0MsU0FBUCxDQUFpQkMsUUFBakIsRUFBMkM7QUFDMUNBLGVBQVdBLFNBQVNDLE9BQVQsQ0FBaUIsS0FBakIsRUFBd0IsR0FBeEIsQ0FBWDtBQUNBLFFBQUlELFNBQVMsQ0FBVCxNQUFnQixHQUFwQixFQUF5QkEsV0FBWSxJQUFHQSxRQUFTLEVBQXhCO0FBQ3pCLFdBQU9FLFVBQVcsVUFBU0YsUUFBUyxFQUE3QixFQUFnQ0MsT0FBaEMsQ0FBd0MsT0FBeEMsRUFBaURFLGtCQUFqRCxDQUFQO0FBQ0E7O0FBRUQsU0FBT0MsU0FBUCxDQUFpQkMsR0FBakIsRUFBc0M7QUFDcENBLFVBQU1DLG1CQUFtQkQsR0FBbkIsQ0FBTjtBQUNBLFFBQUlBLElBQUlFLFVBQUosQ0FBZSxTQUFmLENBQUosRUFBK0JGLE1BQU1BLElBQUlHLE1BQUosQ0FBVyxDQUFYLENBQU47QUFDL0IsUUFBSUMsUUFBUUMsUUFBUixLQUFxQixPQUF6QixFQUFrQztBQUNoQyxVQUFJTCxJQUFJLENBQUosTUFBVyxHQUFmLEVBQW9CO0FBQ2xCQSxjQUFNQSxJQUFJRyxNQUFKLENBQVcsQ0FBWCxDQUFOO0FBQ0Q7QUFDRCxhQUFPSCxJQUFJSixPQUFKLENBQVksS0FBWixFQUFtQixJQUFuQixDQUFQO0FBQ0Q7QUFDRCxXQUFPSSxHQUFQO0FBQ0Q7O0FBRUQsU0FBT00sZUFBUCxDQUF1QkMsS0FBdkIsRUFBdUQ7QUFDckQsV0FBTyxFQUFFQyxNQUFNRCxNQUFNRSxHQUFkLEVBQW1CQyxXQUFXSCxNQUFNSSxNQUFwQyxFQUFQO0FBQ0Q7O0FBRUQsU0FBT0MsZUFBUCxDQUF1QkMsUUFBdkIsRUFBMEQ7QUFDeEQsV0FBTyxnQkFBVUEsU0FBU0wsSUFBbkIsRUFBeUJLLFNBQVNILFNBQWxDLENBQVA7QUFDRDs7QUFFRCxTQUFPSSxrQkFBUCxDQUEwQkMsS0FBMUIsRUFBdUQ7QUFDckQsV0FBTyxnQkFBVXRCLFFBQVFtQixlQUFSLENBQXdCRyxNQUFNQyxLQUE5QixDQUFWLEVBQWdEdkIsUUFBUW1CLGVBQVIsQ0FBd0JHLE1BQU1FLEdBQTlCLENBQWhELENBQVA7QUFDRDs7QUFFRCxTQUFPQyxrQkFBUCxDQUEwQkgsS0FBMUIsRUFBdUQ7QUFDckQsV0FBTyxFQUFFQyxPQUFPdkIsUUFBUWEsZUFBUixDQUF3QlMsTUFBTUMsS0FBOUIsQ0FBVCxFQUErQ0MsS0FBS3hCLFFBQVFhLGVBQVIsQ0FBd0JTLE1BQU1FLEdBQTlCLENBQXBELEVBQVA7QUFDRDs7QUFFRCxTQUFPRSw4QkFBUCxDQUFzQ0MsTUFBdEMsRUFBMEY7QUFDeEYsV0FBTyxFQUFFcEIsS0FBS1AsUUFBUUMsU0FBUixDQUFrQjBCLE9BQU9DLE1BQVAsTUFBbUIsRUFBckMsQ0FBUCxFQUFQO0FBQ0Q7QUFyQzBCLEM7a0JBQVI1QixPIiwiZmlsZSI6ImNvbnZlcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAZmxvd1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7UmFuZ2UsIFBvaW50fSBmcm9tICdhdG9tJztcbmltcG9ydCAqIGFzIGxzIGZyb20gJy4vbGFuZ3VhZ2VjbGllbnQnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb252ZXJ0IHtcbiAgc3RhdGljIHBhdGhUb1VyaShwYXRoTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcblx0ICBwYXRoTmFtZSA9IHBhdGhOYW1lLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcblx0ICBpZiAocGF0aE5hbWVbMF0gIT09ICcvJykgcGF0aE5hbWUgPSBgLyR7cGF0aE5hbWV9YDtcblx0ICByZXR1cm4gZW5jb2RlVVJJKGBmaWxlOi8vJHtwYXRoTmFtZX1gKS5yZXBsYWNlKC9bPyNdL2csIGVuY29kZVVSSUNvbXBvbmVudCk7XG4gIH1cblxuICBzdGF0aWMgdXJpVG9QYXRoKHVyaTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB1cmkgPSBkZWNvZGVVUklDb21wb25lbnQodXJpKTtcbiAgICBpZiAodXJpLnN0YXJ0c1dpdGgoJ2ZpbGU6Ly8nKSkgdXJpID0gdXJpLnN1YnN0cig3KTtcbiAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJykge1xuICAgICAgaWYgKHVyaVswXSA9PT0gJy8nKSB7XG4gICAgICAgIHVyaSA9IHVyaS5zdWJzdHIoMSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdXJpLnJlcGxhY2UoL1xcLy9nLCAnXFxcXCcpO1xuICAgIH1cbiAgICByZXR1cm4gdXJpO1xuICB9XG5cbiAgc3RhdGljIHBvaW50VG9Qb3NpdGlvbihwb2ludDogYXRvbSRQb2ludCk6IGxzLlBvc2l0aW9uIHtcbiAgICByZXR1cm4geyBsaW5lOiBwb2ludC5yb3csIGNoYXJhY3RlcjogcG9pbnQuY29sdW1uIH07XG4gIH1cblxuICBzdGF0aWMgcG9zaXRpb25Ub1BvaW50KHBvc2l0aW9uOiBscy5Qb3NpdGlvbik6IGF0b20kUG9pbnQge1xuICAgIHJldHVybiBuZXcgUG9pbnQocG9zaXRpb24ubGluZSwgcG9zaXRpb24uY2hhcmFjdGVyKTtcbiAgfVxuXG4gIHN0YXRpYyBsc1JhbmdlVG9BdG9tUmFuZ2UocmFuZ2U6IGxzLlJhbmdlKTogYXRvbSRSYW5nZSB7XG4gICAgcmV0dXJuIG5ldyBSYW5nZShDb252ZXJ0LnBvc2l0aW9uVG9Qb2ludChyYW5nZS5zdGFydCksIENvbnZlcnQucG9zaXRpb25Ub1BvaW50KHJhbmdlLmVuZCkpO1xuICB9XG5cbiAgc3RhdGljIGF0b21SYW5nZVRvTFNSYW5nZShyYW5nZTogYXRvbSRSYW5nZSk6IGxzLlJhbmdlIHtcbiAgICByZXR1cm4geyBzdGFydDogQ29udmVydC5wb2ludFRvUG9zaXRpb24ocmFuZ2Uuc3RhcnQpLCBlbmQ6IENvbnZlcnQucG9pbnRUb1Bvc2l0aW9uKHJhbmdlLmVuZCkgfTtcbiAgfVxuXG4gIHN0YXRpYyBlZGl0b3JUb1RleHREb2N1bWVudElkZW50aWZpZXIoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiBscy5UZXh0RG9jdW1lbnRJZGVudGlmaWVyIHtcbiAgICByZXR1cm4geyB1cmk6IENvbnZlcnQucGF0aFRvVXJpKGVkaXRvci5nZXRVUkkoKSB8fCAnJykgfTtcbiAgfVxufVxuIl19