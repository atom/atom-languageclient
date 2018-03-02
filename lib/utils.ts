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

export default class Utils {
  /**
   * Obtain the range of the word at the given editor position.
   * Uses the non-word characters from the position's grammar scope.
   */
  public static getWordAtPosition(editor: TextEditor, position: Point): Range {
    const scopeDescriptor = editor.scopeDescriptorForBufferPosition(position);
    const nonWordCharacters = Utils.escapeRegExp(editor.getNonWordCharacters(scopeDescriptor));
    const range = Utils._getRegexpRangeAtPosition(
      editor.getBuffer(),
      position,
      new RegExp(`^[\t ]*$|[^\\s${nonWordCharacters}]+`, 'g'),
    );
    if (range == null) {
      return new Range(position, position);
    }
    return range;
  }

  public static escapeRegExp(string: string): string {
    // From atom/underscore-plus.
    return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  private static _getRegexpRangeAtPosition(buffer: TextBuffer, position: Point, wordRegex: RegExp): Range | null {
    const {row, column} = position;
    const rowRange = buffer.rangeForRow(row, false);
    let matchData: BufferScanResult | undefined | null;
    // Extract the expression from the row text.
    buffer.scanInRange(wordRegex, rowRange, (data) => {
      const {range} = data;
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
  public static cancelAndRefreshCancellationToken<T extends object>(
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

  public static async doWithCancellationToken<T1 extends object, T2>(
    key: T1,
    cancellationTokens: WeakMap<T1, CancellationTokenSource>,
    work: (token: CancellationToken) => Promise<T2>,
  ): Promise<T2> {
    const token = Utils.cancelAndRefreshCancellationToken(key, cancellationTokens);
    const result: T2 = await work(token);
    cancellationTokens.delete(key);
    return result;
  }

  public static assertUnreachable(_: never): never {
    return _;
  }
}
