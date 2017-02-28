// @flow

import path from 'path';
import {Range, Point} from 'atom';
import * as ls from './protocol/languageclient-v2';

export default class Convert
{
  static pathToUri(pathName: string): string {
	  pathName = pathName.replace(/\\/g, '/');
	  if (pathName[0] !== '/') pathName = `/${pathName}`;
	  return encodeURI(`file://${pathName}`).replace(/[?#]/g, encodeURIComponent);
  }

  static uriToPath(uri: string): string {
    uri = decodeURIComponent(uri);
    if (uri.startsWith('file:///')) uri = uri.substr(8);
    if (uri.startsWith('file://')) uri = uri.substr(7);
    return uri.replace(/\//g, '\\');
  }

  static pointToPosition(point: atom$Point): ls.Position {
    return { line: point.row, character: point.column };
  }

  static positionToPoint(position: ls.Position): atom$Point {
    return new Point(position.line, position.character);
  }

  static lsRangeToAtomRange(range: ls.Range): atom$Range {
    return new Range(Convert.positionToPoint(range.start), Convert.positionToPoint(range.end));
  }

  static atomRangeToLSRange(range: atom$Range): ls.Range {
    return { start: Convert.pointToPosition(range.start), end: Convert.pointToPosition(range.end) };
  }

  static editorToTextDocumentIdentifier(editor: atom$TextEditor): ls.TextDocumentIdentifier {
    return { uri: Convert.pathToUri(editor.getURI() || '') };
  }
}
