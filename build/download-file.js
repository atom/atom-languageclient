Object.defineProperty(exports, "__esModule", {
  value: true
});

let streamWithProgress = (() => {
  var _ref2 = _asyncToGenerator(function* (length, reader, writer, progressCallback) {
    let bytesDone = 0;

    while (true) {
      const result = yield reader.read();
      if (result.done) {
        return;
      }

      const chunk = result.value;
      if (chunk == null) {
        throw Error('Empty chunk received during download');
      } else {
        writer.write(Buffer.from(chunk));
        if (progressCallback != null) {
          bytesDone += chunk.byteLength;
          const percent = length === 0 ? null : Math.floor(bytesDone / length * 100);
          progressCallback(bytesDone, percent);
        }
      }
    }

    if (progressCallback != null) {
      progressCallback(length, 100);
    }
  });

  return function streamWithProgress(_x5, _x6, _x7, _x8) {
    return _ref2.apply(this, arguments);
  };
})();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = (() => {
  var _ref = _asyncToGenerator(function* (sourceUrl, targetFile, progressCallback, length) {
    const request = new Request(sourceUrl, {
      headers: new Headers({ 'Content-Type': 'application/octet-stream' })
    });

    const response = yield fetch(request);
    if (!response.ok) {
      throw Error(`Unable to download, server returned ${response.status} ${response.statusText}`);
    }

    const body = response.body;
    if (body == null) {
      throw Error('No response body');
    }

    length = length || parseInt(response.headers.get('Content-Length' || '0'));
    const reader = body.getReader();
    const writer = _fs2.default.createWriteStream(targetFile);

    yield streamWithProgress(length, reader, writer, progressCallback);
    writer.end();
  });

  function downloadFile(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  }

  return downloadFile;
})();

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9kb3dubG9hZC1maWxlLmpzIl0sIm5hbWVzIjpbImxlbmd0aCIsInJlYWRlciIsIndyaXRlciIsInByb2dyZXNzQ2FsbGJhY2siLCJieXRlc0RvbmUiLCJyZXN1bHQiLCJyZWFkIiwiZG9uZSIsImNodW5rIiwidmFsdWUiLCJFcnJvciIsIndyaXRlIiwiQnVmZmVyIiwiZnJvbSIsImJ5dGVMZW5ndGgiLCJwZXJjZW50IiwiTWF0aCIsImZsb29yIiwic3RyZWFtV2l0aFByb2dyZXNzIiwic291cmNlVXJsIiwidGFyZ2V0RmlsZSIsInJlcXVlc3QiLCJSZXF1ZXN0IiwiaGVhZGVycyIsIkhlYWRlcnMiLCJyZXNwb25zZSIsImZldGNoIiwib2siLCJzdGF0dXMiLCJzdGF0dXNUZXh0IiwiYm9keSIsInBhcnNlSW50IiwiZ2V0IiwiZ2V0UmVhZGVyIiwiY3JlYXRlV3JpdGVTdHJlYW0iLCJlbmQiLCJkb3dubG9hZEZpbGUiXSwibWFwcGluZ3MiOiI7Ozs7O2dDQTJCQSxXQUFrQ0EsTUFBbEMsRUFBa0RDLE1BQWxELEVBQWdGQyxNQUFoRixFQUF3R0MsZ0JBQXhHLEVBQWdLO0FBQzlKLFFBQUlDLFlBQVksQ0FBaEI7O0FBRUEsV0FBTyxJQUFQLEVBQWE7QUFDWCxZQUFNQyxTQUFTLE1BQU1KLE9BQU9LLElBQVAsRUFBckI7QUFDQSxVQUFJRCxPQUFPRSxJQUFYLEVBQWlCO0FBQ2Y7QUFDRDs7QUFFRCxZQUFNQyxRQUFRSCxPQUFPSSxLQUFyQjtBQUNBLFVBQUlELFNBQVMsSUFBYixFQUFtQjtBQUNqQixjQUFNRSxNQUFNLHNDQUFOLENBQU47QUFDRCxPQUZELE1BRU87QUFDTFIsZUFBT1MsS0FBUCxDQUFhQyxPQUFPQyxJQUFQLENBQVlMLEtBQVosQ0FBYjtBQUNBLFlBQUlMLG9CQUFvQixJQUF4QixFQUE4QjtBQUM1QkMsdUJBQWFJLE1BQU1NLFVBQW5CO0FBQ0EsZ0JBQU1DLFVBQW1CZixXQUFXLENBQVgsR0FBZSxJQUFmLEdBQXNCZ0IsS0FBS0MsS0FBTCxDQUFXYixZQUFZSixNQUFaLEdBQXFCLEdBQWhDLENBQS9DO0FBQ0FHLDJCQUFpQkMsU0FBakIsRUFBNEJXLE9BQTVCO0FBQ0Q7QUFDRjtBQUNGOztBQUVELFFBQUlaLG9CQUFvQixJQUF4QixFQUE4QjtBQUM1QkEsdUJBQWlCSCxNQUFqQixFQUF5QixHQUF6QjtBQUNEO0FBQ0YsRzs7a0JBekJja0Isa0I7Ozs7O0FBekJmOzs7Ozs7Ozs7K0JBRWUsV0FBNEJDLFNBQTVCLEVBQStDQyxVQUEvQyxFQUFtRWpCLGdCQUFuRSxFQUE0R0gsTUFBNUcsRUFBNEk7QUFDekosVUFBTXFCLFVBQVUsSUFBSUMsT0FBSixDQUFZSCxTQUFaLEVBQXVCO0FBQ3JDSSxlQUFTLElBQUlDLE9BQUosQ0FBWSxFQUFDLGdCQUFnQiwwQkFBakIsRUFBWjtBQUQ0QixLQUF2QixDQUFoQjs7QUFJQSxVQUFNQyxXQUFXLE1BQU1DLE1BQU1MLE9BQU4sQ0FBdkI7QUFDQSxRQUFJLENBQUNJLFNBQVNFLEVBQWQsRUFBa0I7QUFDaEIsWUFBTWpCLE1BQU8sdUNBQXNDZSxTQUFTRyxNQUFPLElBQUdILFNBQVNJLFVBQVcsRUFBcEYsQ0FBTjtBQUNEOztBQUVELFVBQU1DLE9BQU9MLFNBQVNLLElBQXRCO0FBQ0EsUUFBSUEsUUFBUSxJQUFaLEVBQWtCO0FBQ2hCLFlBQU1wQixNQUFNLGtCQUFOLENBQU47QUFDRDs7QUFFRFYsYUFBU0EsVUFBVStCLFNBQVNOLFNBQVNGLE9BQVQsQ0FBaUJTLEdBQWpCLENBQXFCLG9CQUFvQixHQUF6QyxDQUFULENBQW5CO0FBQ0EsVUFBTS9CLFNBQVM2QixLQUFLRyxTQUFMLEVBQWY7QUFDQSxVQUFNL0IsU0FBUyxhQUFHZ0MsaUJBQUgsQ0FBcUJkLFVBQXJCLENBQWY7O0FBRUEsVUFBTUYsbUJBQW1CbEIsTUFBbkIsRUFBMkJDLE1BQTNCLEVBQW1DQyxNQUFuQyxFQUEyQ0MsZ0JBQTNDLENBQU47QUFDQUQsV0FBT2lDLEdBQVA7QUFDRCxHOztXQXJCNkJDLFk7Ozs7U0FBQUEsWSIsImZpbGUiOiJkb3dubG9hZC1maWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQGZsb3dcclxuXHJcbmltcG9ydCBmcyBmcm9tICdmcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBkb3dubG9hZEZpbGUoc291cmNlVXJsOiBzdHJpbmcsIHRhcmdldEZpbGU6IHN0cmluZywgcHJvZ3Jlc3NDYWxsYmFjazogP0J5dGVQcm9ncmVzc0NhbGxiYWNrLCBsZW5ndGg6ID9udW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcclxuICBjb25zdCByZXF1ZXN0ID0gbmV3IFJlcXVlc3Qoc291cmNlVXJsLCB7XHJcbiAgICBoZWFkZXJzOiBuZXcgSGVhZGVycyh7J0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nfSlcclxuICB9KTtcclxuXHJcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChyZXF1ZXN0KTtcclxuICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICB0aHJvdyBFcnJvcihgVW5hYmxlIHRvIGRvd25sb2FkLCBzZXJ2ZXIgcmV0dXJuZWQgJHtyZXNwb25zZS5zdGF0dXN9ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGJvZHkgPSByZXNwb25zZS5ib2R5O1xyXG4gIGlmIChib2R5ID09IG51bGwpIHtcclxuICAgIHRocm93IEVycm9yKCdObyByZXNwb25zZSBib2R5Jyk7XHJcbiAgfVxyXG5cclxuICBsZW5ndGggPSBsZW5ndGggfHwgcGFyc2VJbnQocmVzcG9uc2UuaGVhZGVycy5nZXQoJ0NvbnRlbnQtTGVuZ3RoJyB8fCAnMCcpKTtcclxuICBjb25zdCByZWFkZXIgPSBib2R5LmdldFJlYWRlcigpO1xyXG4gIGNvbnN0IHdyaXRlciA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKHRhcmdldEZpbGUpO1xyXG5cclxuICBhd2FpdCBzdHJlYW1XaXRoUHJvZ3Jlc3MobGVuZ3RoLCByZWFkZXIsIHdyaXRlciwgcHJvZ3Jlc3NDYWxsYmFjayk7XHJcbiAgd3JpdGVyLmVuZCgpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzdHJlYW1XaXRoUHJvZ3Jlc3MobGVuZ3RoOiBudW1iZXIsIHJlYWRlcjogUmVhZGFibGVTdHJlYW1SZWFkZXIsIHdyaXRlcjogZnMuV3JpdGVTdHJlYW0sIHByb2dyZXNzQ2FsbGJhY2s6ID9CeXRlUHJvZ3Jlc3NDYWxsYmFjayk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGxldCBieXRlc0RvbmUgPSAwO1xyXG5cclxuICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcclxuICAgIGlmIChyZXN1bHQuZG9uZSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY2h1bmsgPSByZXN1bHQudmFsdWU7XHJcbiAgICBpZiAoY2h1bmsgPT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBFcnJvcignRW1wdHkgY2h1bmsgcmVjZWl2ZWQgZHVyaW5nIGRvd25sb2FkJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB3cml0ZXIud3JpdGUoQnVmZmVyLmZyb20oY2h1bmspKTtcclxuICAgICAgaWYgKHByb2dyZXNzQ2FsbGJhY2sgIT0gbnVsbCkge1xyXG4gICAgICAgIGJ5dGVzRG9uZSArPSBjaHVuay5ieXRlTGVuZ3RoO1xyXG4gICAgICAgIGNvbnN0IHBlcmNlbnQ6ID9udW1iZXIgPSBsZW5ndGggPT09IDAgPyBudWxsIDogTWF0aC5mbG9vcihieXRlc0RvbmUgLyBsZW5ndGggKiAxMDApO1xyXG4gICAgICAgIHByb2dyZXNzQ2FsbGJhY2soYnl0ZXNEb25lLCBwZXJjZW50KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaWYgKHByb2dyZXNzQ2FsbGJhY2sgIT0gbnVsbCkge1xyXG4gICAgcHJvZ3Jlc3NDYWxsYmFjayhsZW5ndGgsIDEwMCk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgdHlwZSBCeXRlUHJvZ3Jlc3NDYWxsYmFjayA9IChieXRlc0RvbmU6IG51bWJlciwgcGVyY2VudDogP251bWJlcikgPT4ge307XHJcbiJdfQ==