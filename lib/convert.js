// @flow

import path from 'path';
import * as ls from './languageclient';
import {Point, Range} from 'atom';

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
    return { uri: Convert.pathToUri(editor.getPath() || '') };
  }

  static editorToTextDocumentPositionParams(editor: atom$TextEditor, point: ?atom$Point): ls.TextDocumentPositionParams {
    return {
      textDocument: Convert.editorToTextDocumentIdentifier(editor),
      position: Convert.pointToPosition(point != null ? point : editor.getCursorBufferPosition())
    };
  }

  static grammarScopesToTextEditorScopes(grammarScopes: Array<string>): string {
    return grammarScopes.map(g => `atom-text-editor[data-grammar="${Convert.encodeHTMLAttribute(g.replace(/\./g, ' '))}"]`).join(', ');
  }

  static encodeHTMLAttribute(s: string): string {
    const attributeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
    return s.replace(/[&<>'"]/g, c => attributeMap[c]);
  }
}
