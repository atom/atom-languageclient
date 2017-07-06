// @flow

import * as ls from './languageclient';
import {Point, Range} from 'atom';

// Public: Class that contains a number of helper methods for general conversions
// between the language server protocol and Atom/Atom packages.
export default class Convert {

  // Public: Convert a path to a Uri.
  //
  // * `filePath` A file path to convert to a Uri.
  //
  // Returns the Uri corresponding to the path. e.g. file:///a/b/c.txt
  static pathToUri(filePath: string): string {
    let newPath = filePath.replace(/\\/g, '/');
    if (newPath[0] !== '/') {
      newPath = `/${newPath}`;
    }
    return encodeURI(`file://${newPath}`).replace(/[?#]/g, encodeURIComponent);
  }

  // Public: Convert a Uri to a path.
  //
  // * `uri` A Uri to convert to a file path.
  //
  // Returns a file path corresponding to the Uri. e.g. /a/b/c.txt
  static uriToPath(uri: string): string {
    let filePath = decodeURIComponent(uri);
    if (filePath.startsWith('file://')) {
      filePath = filePath.substr(7);
    }
    if (process.platform === 'win32') {
      // Deal with Windows drive names
      if (filePath[0] === '/') {
        filePath = filePath.substr(1);
      }
      return filePath.replace(/\//g, '\\');
    }
    return filePath;
  }

  // Public: Convert an Atom {PointObject} to a language server {Position}.
  //
  // * `point` An Atom {PointObject} to convert from.
  //
  // Returns the {Position} representation of the Atom {PointObject}.
  static pointToPosition(point: atom$PointObject): ls.Position {
    return {line: point.row, character: point.column};
  }

  // Public: Convert a language server {Position} into an Atom {PointObject}.
  //
  // * 'position' A language server {Position} to convert from.
  //
  // Returns the Atom {PointObject} representation of the given {Position}.
  static positionToPoint(position: ls.Position): atom$Point {
    return new Point(position.line, position.character);
  }

  // Public: Convert a language server {Range} into an Atom {Range}.
  //
  // * 'range' A language server {Range} to convert from.
  //
  // Returns the Atom {Range} representation of the given language server {Range}.
  static lsRangeToAtomRange(range: ls.Range): atom$Range {
    return new Range(Convert.positionToPoint(range.start), Convert.positionToPoint(range.end));
  }

  // Public: Convert an Atom {Range} into an language server {Range}.
  //
  // * 'range' An Atom {Range} to convert from.
  //
  // Returns the language server {Range} representation of the given Atom {Range}.
  static atomRangeToLSRange(range: atom$Range): ls.Range {
    return {start: Convert.pointToPosition(range.start), end: Convert.pointToPosition(range.end)};
  }

  // Public: Create a {TextDocumentIdentifier} from an Atom {TextEditor}.
  //
  // * `editor` A {TextEditor} that will be used to form the uri property.
  //
  // Returns a {TextDocumentIdentifier} that has a `uri` property with the Uri for the
  // given editor's path.
  static editorToTextDocumentIdentifier(editor: atom$TextEditor): ls.TextDocumentIdentifier {
    return {uri: Convert.pathToUri(editor.getPath() || '')};
  }

  // Public: Create a {TextDocumentPositionParams} from a {TextEditor} and optional {Point}.
  //
  // * `editor` A {TextEditor} that will be used to form the uri property.
  // * `point`  An optional {Point} that will supply the position property. If not specified
  //            the current cursor position will be used.
  //
  // Returns a {TextDocumentPositionParams} that has textDocument property with the editors {TextDocumentIdentifier}
  // and a position property with the supplied point (or current cursor position when not specified).
  static editorToTextDocumentPositionParams(editor: atom$TextEditor, point: ?atom$Point): ls.TextDocumentPositionParams {
    return {
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      position: Convert.pointToPosition(point != null ? point : editor.getCursorBufferPosition()),
    };
  }

  // Public: Create a string of scopes for the atom text editor using the data-grammar selector from an
  // {Array} of grammarScope strings.
  //
  // * `grammarScopes` An {Array} of grammar scope string to convert from.
  //
  // Returns a single comma-separated list of CSS selectors targetting the grammars of Atom text editors.
  // e.g. `['c', 'cpp']` => `'atom-text-editor[data-grammar='c'], atom-text-editor[data-grammar='cpp']`
  static grammarScopesToTextEditorScopes(grammarScopes: Array<string>): string {
    return grammarScopes.map(g =>
      `atom-text-editor[data-grammar="${Convert.encodeHTMLAttribute(g.replace(/\./g, ' '))}"]`).join(', ');
  }

  // Public: Encode a string so that it can be safely used within a HTML attribute - i.e. replacing all quoted
  // values with their HTML entity encoded versions.  e.g. `Hello"` becomes `Hello&quot;`
  //
  // * 's' A string to be encoded.
  //
  // Returns a string that is HTML attribute encoded by replacing &, <, >, " and ' with their HTML entity
  // named equivalents.
  static encodeHTMLAttribute(s: string): string {
    const attributeMap = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'};
    return s.replace(/[&<>'"]/g, c => attributeMap[c]);
  }
}
