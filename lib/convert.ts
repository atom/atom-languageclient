
import * as ls from './languageclient';
import * as URL from 'url';
import {
  Point,
  ProjectFileEvent,
  Range,
  TextEditor,
} from 'atom';
import {
  Diagnostic,
  DiagnosticType,
  TextEdit,
} from 'atom-ide';

// Public: Class that contains a number of helper methods for general conversions
// between the language server protocol and Atom/Atom packages.
export default class Convert {
  // Public: Convert a path to a Uri.
  //
  // * `filePath` A file path to convert to a Uri.
  //
  // Returns the Uri corresponding to the path. e.g. file:///a/b/c.txt
  public static pathToUri(filePath: string): string {
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
  // If the Uri does not begin file: then it is returned as-is to allow Atom
  // to deal with http/https sources in the future.
  public static uriToPath(uri: string): string {
    const url = URL.parse(uri);
    if (url.protocol !== 'file:' || url.path === undefined) {
      return uri;
    }

    let filePath = decodeURIComponent(url.path);
    if (process.platform === 'win32') {
      // Deal with Windows drive names
      if (filePath[0] === '/') {
        filePath = filePath.substr(1);
      }
      return filePath.replace(/\//g, '\\');
    }
    return filePath;
  }

  // Public: Convert an Atom {Point} to a language server {Position}.
  //
  // * `point` An Atom {Point} to convert from.
  //
  // Returns the {Position} representation of the Atom {PointObject}.
  public static pointToPosition(point: Point): ls.Position {
    return {line: point.row, character: point.column};
  }

  // Public: Convert a language server {Position} into an Atom {PointObject}.
  //
  // * 'position' A language server {Position} to convert from.
  //
  // Returns the Atom {PointObject} representation of the given {Position}.
  public static positionToPoint(position: ls.Position): Point {
    return new Point(position.line, position.character);
  }

  // Public: Convert a language server {Range} into an Atom {Range}.
  //
  // * 'range' A language server {Range} to convert from.
  //
  // Returns the Atom {Range} representation of the given language server {Range}.
  public static lsRangeToAtomRange(range: ls.Range): Range {
    return new Range(Convert.positionToPoint(range.start), Convert.positionToPoint(range.end));
  }

  // Public: Convert an Atom {Range} into an language server {Range}.
  //
  // * 'range' An Atom {Range} to convert from.
  //
  // Returns the language server {Range} representation of the given Atom {Range}.
  public static atomRangeToLSRange(range: Range): ls.Range {
    return {
      start: Convert.pointToPosition(range.start),
      end: Convert.pointToPosition(range.end),
    };
  }

  // Public: Create a {TextDocumentIdentifier} from an Atom {TextEditor}.
  //
  // * `editor` A {TextEditor} that will be used to form the uri property.
  //
  // Returns a {TextDocumentIdentifier} that has a `uri` property with the Uri for the
  // given editor's path.
  public static editorToTextDocumentIdentifier(editor: TextEditor): ls.TextDocumentIdentifier {
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
  public static editorToTextDocumentPositionParams(
    editor: TextEditor,
    point?: Point,
  ): ls.TextDocumentPositionParams {
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
  public static grammarScopesToTextEditorScopes(grammarScopes: string[]): string {
    return grammarScopes
      .map((g) => `atom-text-editor[data-grammar="${Convert.encodeHTMLAttribute(g.replace(/\./g, ' '))}"]`)
      .join(', ');
  }

  // Public: Encode a string so that it can be safely used within a HTML attribute - i.e. replacing all quoted
  // values with their HTML entity encoded versions.  e.g. `Hello"` becomes `Hello&quot;`
  //
  // * 's' A string to be encoded.
  //
  // Returns a string that is HTML attribute encoded by replacing &, <, >, " and ' with their HTML entity
  // named equivalents.
  public static encodeHTMLAttribute(s: string): string {
    const attributeMap: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;',
    };
    return s.replace(/[&<>'"]/g, (c) => attributeMap[c]);
  }

  // Public: Convert an Atom File Event as received from atom.project.onDidChangeFiles and convert
  // it into an Array of Language Server Protocol {FileEvent} objects. Normally this will be a 1-to-1
  // but renames will be represented by a deletion and a subsequent creation as LSP does not know about
  // renames.
  //
  // * 'fileEvent' An {atom$ProjectFileEvent} to be converted.
  //
  // Returns an array of LSP {ls.FileEvent} objects that equivalent conversions to the fileEvent parameter.
  public static atomFileEventToLSFileEvents(fileEvent: ProjectFileEvent): ls.FileEvent[] {
    switch (fileEvent.action) {
      case 'created':
        return [{uri: Convert.pathToUri(fileEvent.path), type: ls.FileChangeType.Created}];
      case 'modified':
        return [{uri: Convert.pathToUri(fileEvent.path), type: ls.FileChangeType.Changed}];
      case 'deleted':
        return [{uri: Convert.pathToUri(fileEvent.path), type: ls.FileChangeType.Deleted}];
      case 'renamed': {
        const results: Array<{ uri: string, type: ls.FileChangeType }> = [];
        if (fileEvent.oldPath) {
          results.push({uri: Convert.pathToUri(fileEvent.oldPath), type: ls.FileChangeType.Deleted});
        }
        if (fileEvent.path) {
          results.push({uri: Convert.pathToUri(fileEvent.path), type: ls.FileChangeType.Created});
        }
        return results;
      }
      default:
        return [];
    }
  }

  public static atomIdeDiagnosticToLSDiagnostic(diagnostic: Diagnostic): ls.Diagnostic {
    return {
      range: Convert.atomRangeToLSRange(diagnostic.range),
      severity: Convert.diagnosticTypeToLSSeverity(diagnostic.type),
      source: diagnostic.providerName,
      message: diagnostic.text || '',
    };
  }

  public static diagnosticTypeToLSSeverity(type: DiagnosticType): ls.DiagnosticSeverity {
    switch (type) {
      case 'Error':
        return ls.DiagnosticSeverity.Error;
      case 'Warning':
        return ls.DiagnosticSeverity.Warning;
      case 'Info':
        return ls.DiagnosticSeverity.Information;
      default:
        throw Error(`Unexpected diagnostic type ${type}`);
    }
  }

  // Public: Convert an array of language server protocol {TextEdit} objects to an
  // equivalent array of Atom {TextEdit} objects.
  //
  // * `textEdits` The language server protocol {TextEdit} objects to convert.
  //
  // Returns an {Array} of Atom {TextEdit} objects.
  public static convertLsTextEdits(textEdits: ls.TextEdit[]): TextEdit[] {
    return (textEdits || []).map(Convert.convertLsTextEdit);
  }

  // Public: Convert a language server protocol {TextEdit} object to the
  // Atom equivalent {TextEdit}.
  //
  // * `textEdits` The language server protocol {TextEdit} objects to convert.
  //
  // Returns an Atom {TextEdit} object.
  public static convertLsTextEdit(textEdit: ls.TextEdit): TextEdit {
    return {
      oldRange: Convert.lsRangeToAtomRange(textEdit.range),
      newText: textEdit.newText,
    };
  }
}
