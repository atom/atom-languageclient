// @flow

import path from 'path';
import * as ls from './languageclient';

export default class Convert {
  static pathToUri(pathName: string): string {
	  pathName = pathName.replace(/\\/g, '/');
	  if (pathName[0] !== '/') pathName = `/${pathName}`;
	  return encodeURI(`file://${pathName}`).replace(/[?#]/g, encodeURIComponent);
  }

  static uriToPath(uri: string): string {
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

  static pointToPosition(point: atom$PointObject): ls.Position {
    return { line: point.row, character: point.column };
  }

  static positionToPoint(position: ls.Position): atom$PointObject {
    return { row: position.line, column: position.character };
  }

  static lsRangeToAtomRange(range: ls.Range): atom$RangeObject {
    return { start: Convert.positionToPoint(range.start), end: Convert.positionToPoint(range.end) };
  }

  static atomRangeToLSRange(range: atom$Range): ls.Range {
    return { start: Convert.pointToPosition(range.start), end: Convert.pointToPosition(range.end) };
  }

  static editorToTextDocumentIdentifier(editor: atom$TextEditor): ls.TextDocumentIdentifier {
    return { uri: Convert.pathToUri(editor.getURI() || '') };
  }
}
