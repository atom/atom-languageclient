// @flow

import {
  LanguageClientConnection,
} from './languageclient';
import {Range} from 'atom';
import {CancellationTokenSource} from 'vscode-jsonrpc';

export default class Utils {
  /**
   * Obtain the range of the word at the given editor position.
   * Uses the non-word characters from the position's grammar scope.
   */
  static getWordAtPosition(editor: TextEditor, position: atom$Point): Range {
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

  static escapeRegExp(string: string): string {
    // From atom/underscore-plus.
    return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  static _getRegexpRangeAtPosition(buffer: atom$TextBuffer, position: atom$Point, wordRegex: RegExp): ?Range {
    const {row, column} = position;
    const rowRange = buffer.rangeForRow(row);
    let matchData;
    // Extract the expression from the row text.
    buffer.scanInRange(wordRegex, rowRange, data => {
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
  static cancelAndRefreshCancellationToken(
    connection: LanguageClientConnection,
    cancellationTokens: WeakMap<LanguageClientConnection, CancellationTokenSource>): CancellationToken {

    let cancellationToken = cancellationTokens.get(connection);
    if (cancellationToken !== undefined) {
      cancellationToken.cancel();
    }

    cancellationToken = new CancellationTokenSource();
    cancellationTokens.set(connection, cancellationToken);
    return cancellationToken.token;
  }
}
