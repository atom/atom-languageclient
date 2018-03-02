import * as ls from '../lib/languageclient';
import Convert from '../lib/convert';
import { expect } from 'chai';
import {
  Point,
  ProjectFileEvent,
  Range,
  TextEditor,
} from 'atom';

let originalPlatform: NodeJS.Platform;
const setProcessPlatform = (platform: any) => {
  Object.defineProperty(process, 'platform', {value: platform});
};

const createFakeEditor = (path: string, text?: string): TextEditor => {
  const editor = new TextEditor();
  editor.getBuffer().setPath(path);
  if (text != null) {
    editor.setText(text);
  }
  return editor;
};

describe('Convert', () => {
  beforeEach(() => {
    originalPlatform = process.platform;
  });
  afterEach(() => {
    Object.defineProperty(process, 'platform', {value: originalPlatform});
  });

  describe('pathToUri', () => {
    it('prefixes an absolute path with file://', () => {
      expect(Convert.pathToUri('/a/b/c/d.txt')).equals('file:///a/b/c/d.txt');
    });

    it('prefixes an relative path with file:///', () => {
      expect(Convert.pathToUri('a/b/c/d.txt')).equals('file:///a/b/c/d.txt');
    }); // TODO: Maybe don't do this in the function - should never be called with relative

    it('replaces backslashes with forward slashes', () => {
      expect(Convert.pathToUri('a\\b\\c\\d.txt')).equals('file:///a/b/c/d.txt');
    });

    it('does not encode Windows drive specifiers', () => {
      expect(Convert.pathToUri('d:\\ee\\ff.txt')).equals('file:///d:/ee/ff.txt');
    });

    it('URI encodes special characters', () => {
      expect(Convert.pathToUri('/a/sp ace/do$lar')).equals('file:///a/sp%20ace/do$lar');
    });
  });

  describe('uriToPath', () => {
    it("does not convert http: and https: uri's", () => {
      setProcessPlatform('darwin');
      expect(Convert.uriToPath('http://atom.io/a')).equals('http://atom.io/a');
      expect(Convert.uriToPath('https://atom.io/b')).equals('https://atom.io/b');
    });

    it('converts a file:// path to an absolute path', () => {
      setProcessPlatform('darwin');
      expect(Convert.uriToPath('file:///a/b/c/d.txt')).equals('/a/b/c/d.txt');
    });

    it('converts forward slashes to backslashes on Windows', () => {
      setProcessPlatform('win32');
      expect(Convert.uriToPath('file:///a/b/c/d.txt')).equals('a\\b\\c\\d.txt');
    });

    it('decodes Windows drive specifiers', () => {
      setProcessPlatform('win32');
      expect(Convert.uriToPath('file:///d:/ee/ff.txt')).equals('d:\\ee\\ff.txt');
    });

    it('URI decodes special characters', () => {
      setProcessPlatform('darwin');
      expect(Convert.uriToPath('file:///a/sp%20ace/do$lar')).equals('/a/sp ace/do$lar');
    });

    it('parses URI without double slash in the beginning', () => {
      setProcessPlatform('darwin');
      expect(Convert.uriToPath('file:/a/b/c/d.txt')).equals('/a/b/c/d.txt');
    });

    it('parses URI without double slash in the beginning on Windows', () => {
      setProcessPlatform('win32');
      expect(Convert.uriToPath('file:/x:/a/b/c/d.txt')).equals('x:\\a\\b\\c\\d.txt');
    });
  });

  describe('pointToPosition', () => {
    it('converts an Atom Point to a LSP position', () => {
      const point = new Point(1, 2);
      const position = Convert.pointToPosition(point);
      expect(position.line).equals(point.row);
      expect(position.character).equals(point.column);
    });
  });

  describe('positionToPoint', () => {
    it('converts a LSP position to an Atom Point-array', () => {
      const position = {line: 3, character: 4};
      const point = Convert.positionToPoint(position);
      expect(point.row).equals(position.line);
      expect(point.column).equals(position.character);
    });
  });

  describe('lsRangeToAtomRange', () => {
    it('converts a LSP range to an Atom Range-array', () => {
      const lspRange = {
        start: {character: 5, line: 6},
        end: {line: 7, character: 8},
      };
      const atomRange = Convert.lsRangeToAtomRange(lspRange);
      expect(atomRange.start.row).equals(lspRange.start.line);
      expect(atomRange.start.column).equals(lspRange.start.character);
      expect(atomRange.end.row).equals(lspRange.end.line);
      expect(atomRange.end.column).equals(lspRange.end.character);
    });
  });

  describe('atomRangeToLSRange', () => {
    it('converts an Atom range to a LSP Range-array', () => {
      const atomRange = new Range(new Point(9, 10), new Point(11, 12));
      const lspRange = Convert.atomRangeToLSRange(atomRange);
      expect(lspRange.start.line).equals(atomRange.start.row);
      expect(lspRange.start.character).equals(atomRange.start.column);
      expect(lspRange.end.line).equals(atomRange.end.row);
      expect(lspRange.end.character).equals(atomRange.end.column);
    });
  });

  describe('editorToTextDocumentIdentifier', () => {
    it('uses getath which returns a path to create the URI', () => {
      const path = '/c/d/e/f/g/h/i/j.txt';
      const identifier = Convert.editorToTextDocumentIdentifier(createFakeEditor(path));
      expect(identifier.uri).equals('file://' + path);
    });
  });

  describe('editorToTextDocumentPositionParams', () => {
    it('uses the editor cursor position when none specified', () => {
      const path = '/c/d/e/f/g/h/i/j.txt';
      const editor = createFakeEditor(path, 'abc\ndefgh\nijkl');
      editor.setCursorBufferPosition(new Point(1, 2));
      const params = Convert.editorToTextDocumentPositionParams(editor);
      expect(params.textDocument.uri).equals('file://' + path);
      expect(params.position).deep.equals({line: 1, character: 2});
    });

    it('uses the cursor position parameter when specified', () => {
      const path = '/c/d/e/f/g/h/i/j.txt';
      const specifiedPoint = new Point(911, 112);
      const editor = createFakeEditor(path, 'abcdef\nghijkl\nmnopq');
      editor.setCursorBufferPosition(new Point(1, 1));
      const params = Convert.editorToTextDocumentPositionParams(editor, specifiedPoint);
      expect(params.textDocument.uri).equals('file://' + path);
      expect(params.position).deep.equals({line: 911, character: 112});
    });
  });

  describe('grammarScopesToTextEditorScopes', () => {
    it('converts a single grammarScope to an atom-text-editor scope', () => {
      const grammarScopes = ['abc.def'];
      const textEditorScopes = Convert.grammarScopesToTextEditorScopes(grammarScopes);
      expect(textEditorScopes).equals('atom-text-editor[data-grammar="abc def"]');
    });

    it('converts a multiple grammarScopes to a comma-seperated list of atom-text-editor scopes', () => {
      const grammarScopes = ['abc.def', 'ghi.jkl'];
      const textEditorScopes = Convert.grammarScopesToTextEditorScopes(grammarScopes);
      expect(textEditorScopes).equals(
        'atom-text-editor[data-grammar="abc def"], atom-text-editor[data-grammar="ghi jkl"]',
      );
    });

    it('converts grammarScopes containing HTML sensitive characters to escaped sequences', () => {
      const grammarScopes = ['abc<def', 'ghi"jkl'];
      const textEditorScopes = Convert.grammarScopesToTextEditorScopes(grammarScopes);
      expect(textEditorScopes).equals(
        'atom-text-editor[data-grammar="abc&lt;def"], atom-text-editor[data-grammar="ghi&quot;jkl"]',
      );
    });
  });

  describe('encodeHTMLAttribute', () => {
    it('encodes characters that are not safe inside a HTML attribute', () => {
      const stringToEncode = 'a"b\'c&d>e<f';
      const encoded = Convert.encodeHTMLAttribute(stringToEncode);
      expect(encoded).equals('a&quot;b&apos;c&amp;d&gt;e&lt;f');
    });
  });

  describe('atomFileEventToLSFileEvents', () => {
    it('converts a created event', () => {
      const source: ProjectFileEvent = {path: '/a/b/c/d.txt', action: 'created'};
      const converted = Convert.atomFileEventToLSFileEvents(source);
      expect(converted[0]).deep.equals({uri: 'file:///a/b/c/d.txt', type: ls.FileChangeType.Created});
    });

    it('converts a modified event', () => {
      const source: ProjectFileEvent = {path: '/a/b/c/d.txt', action: 'modified'};
      const converted = Convert.atomFileEventToLSFileEvents(source);
      expect(converted[0]).deep.equals({uri: 'file:///a/b/c/d.txt', type: ls.FileChangeType.Changed});
    });

    it('converts a deleted event', () => {
      const source: ProjectFileEvent = {path: '/a/b/c/d.txt', action: 'deleted'};
      const converted = Convert.atomFileEventToLSFileEvents(source);
      expect(converted[0]).deep.equals({uri: 'file:///a/b/c/d.txt', type: ls.FileChangeType.Deleted});
    });

    it('converts a renamed event', () => {
      const source: ProjectFileEvent = {path: '/a/b/c/d.txt', oldPath: '/a/z/e.lst', action: 'renamed'};
      const converted = Convert.atomFileEventToLSFileEvents(source);
      expect(converted[0]).deep.equals({uri: 'file:///a/z/e.lst', type: ls.FileChangeType.Deleted});
      expect(converted[1]).deep.equals({uri: 'file:///a/b/c/d.txt', type: ls.FileChangeType.Created});
    });
  });
});
