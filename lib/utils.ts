import * as path from 'path';
import {
  Point,
  TextBuffer,
  TextEditor,
  Range,
  BufferScanResult,
} from 'atom';
import {
  CancellationToken,
  CancellationTokenSource,
} from 'vscode-jsonrpc';

export type ReportBusyWhile = <T>(
  title: string,
  f: () => Promise<T>,
) => Promise<T>;

/**
 * Obtain the range of the word at the given editor position.
 * Uses the non-word characters from the position's grammar scope.
 */
export function getWordAtPosition(editor: TextEditor, position: Point): Range {
  const nonWordCharacters = escapeRegExp(editor.getNonWordCharacters(position));
  const range = _getRegexpRangeAtPosition(
    editor.getBuffer(),
    position,
    new RegExp(`^[\t ]*$|[^\\s${nonWordCharacters}]+`, 'g'),
  );
  if (range == null) {
    return new Range(position, position);
  }
  return range;
}

export function escapeRegExp(string: string): string {
  // From atom/underscore-plus.
  return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function _getRegexpRangeAtPosition(buffer: TextBuffer, position: Point, wordRegex: RegExp): Range | null {
  const { row, column } = position;
  const rowRange = buffer.rangeForRow(row, false);
  let matchData: BufferScanResult | undefined | null;
  // Extract the expression from the row text.
  buffer.scanInRange(wordRegex, rowRange, (data) => {
    const { range } = data;
    if (
      position.isGreaterThanOrEqual(range.start) &&
      // Range endpoints are exclusive.
      position.isLessThan(range.end)
    ) {
      matchData = data;
      data.stop();
      return;
    }
    // Stop the scan if the scanner has passed our position.
    if (range.end.column > column) {
      data.stop();
    }
  });
  return matchData == null ? null : matchData.range;
}

/**
 * For the given connection and cancellationTokens map, cancel the existing
 * CancellationToken for that connection then create and store a new
 * CancellationToken to be used for the current request.
 */
export function cancelAndRefreshCancellationToken<T extends object>(
  key: T,
  cancellationTokens: WeakMap<T, CancellationTokenSource>): CancellationToken {

  let cancellationToken = cancellationTokens.get(key);
  if (cancellationToken !== undefined && !cancellationToken.token.isCancellationRequested) {
    cancellationToken.cancel();
  }

  cancellationToken = new CancellationTokenSource();
  cancellationTokens.set(key, cancellationToken);
  return cancellationToken.token;
}

export async function doWithCancellationToken<T1 extends object, T2>(
  key: T1,
  cancellationTokens: WeakMap<T1, CancellationTokenSource>,
  work: (token: CancellationToken) => Promise<T2>,
): Promise<T2> {
  const token = cancelAndRefreshCancellationToken(key, cancellationTokens);
  const result: T2 = await work(token);
  cancellationTokens.delete(key);
  return result;
}

export function assertUnreachable(_: never): never {
  return _;
}

export function promiseWithTimeout<T>(ms: number, promise: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    // create a timeout to reject promise if not resolved
    const timer = setTimeout(() => {
      reject(new Error(`Timeout after ${ms}ms`));
    }, ms);

    promise.then((res) => {
      clearTimeout(timer);
      resolve(res);
    }).catch((err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

export function normalizePath(p: string): string {
  return !p.endsWith(path.sep) ? path.join(p, path.sep) : p;
}
