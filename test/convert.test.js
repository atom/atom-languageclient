import Convert from '../lib/convert';

let originalPlatform;
setProcessPlatform = platform => {
  Object.defineProperty(process, 'platform', { value: platform });
}

createFakeEditor = (uri) => ({ getURI: () => uri });

describe('Convert', () => {
  beforeEach(() => { originalPlatform = process.platform; })
  afterEach(() => { Object.defineProperty(process, 'platform', { value: originalPlatform }); })

  describe('pathToUri', () => {
    it('prefixes an absolute path with file://', () => {
      expect(Convert.pathToUri('/a/b/c/d.txt')).equals('file:///a/b/c/d.txt');
    })

    it('prefixes an relative path with file:///', () => {
      expect(Convert.pathToUri('a/b/c/d.txt')).equals('file:///a/b/c/d.txt');
    }) // TODO: Maybe don't do this in the function - should never be called with relative

    it('replaces backslashes with forward slashes', () => {
      expect(Convert.pathToUri('a\\b\\c\\d.txt')).equals('file:///a/b/c/d.txt');
    })

    it('does not encode Windows drive specifiers', () => {
      expect(Convert.pathToUri('d:\\ee\\ff.txt')).equals('file:///d:/ee/ff.txt');
    })

    it('URI encodes special characters', () => {
      expect(Convert.pathToUri('/a/sp ace/do$lar')).equals('file:///a/sp%20ace/do$lar');
    })
  })

  describe('uriToPath', () => {
    it('converts a file:// path to an absolute path', () => {
      setProcessPlatform('darwin');
      expect(Convert.uriToPath('file:///a/b/c/d.txt')).equals('/a/b/c/d.txt');
    })

    it('converts forward slashes to backslashes on Windows', () => {
      setProcessPlatform('win32');
      expect(Convert.uriToPath('file:///a/b/c/d.txt')).equals('a\\b\\c\\d.txt');
    })

    it('decodes Windows drive specifiers', () => {
      setProcessPlatform('win32');
      expect(Convert.uriToPath('file:///d:/ee/ff.txt')).equals('d:\\ee\\ff.txt');
    })

    it('URI decodes special characters', () => {
      setProcessPlatform('darwin');
      expect(Convert.uriToPath('file:///a/sp%20ace/do$lar')).equals('/a/sp ace/do$lar');
    })
  })

  describe('pointToPosition', () => {
    it('converts an Atom Point to a LSP position', () => {
      const point = { row: 1, column: 2 };
      const position = Convert.pointToPosition(point);
      expect(position.line).equals(point.row);
      expect(position.character).equals(point.column);
    })
  })

  describe('positionToPoint', () => {
    it('converts a LSP position to an Atom Point-array', () => {
      const position = { line: 3, character: 4 };
      const point = Convert.positionToPoint(position);
      expect(point.row).equals(position.line);
      expect(point.column).equals(position.character);
    })
  })

  describe('lsRangeToAtomRange', () => {
    it('converts a LSP range to an Atom Range-array', () => {
      const lspRange = {
        start: { character: 5, line: 6 },
        end: { line: 7, character: 8 }
      };
      const atomRange = Convert.lsRangeToAtomRange(lspRange);
      expect(atomRange.start.row).equals(lspRange.start.line);
      expect(atomRange.start.column).equals(lspRange.start.character);
      expect(atomRange.end.row).equals(lspRange.end.line);
      expect(atomRange.end.column).equals(lspRange.end.character);
    })
  })

  describe('atomRangeToLSRange', () => {
    it('converts an Atom range to a LSP Range-array', () => {
      const atomRange = {
        start: { column: 9, row: 10 },
        end: { row: 11, column: 12 }
      };
      const lspRange = Convert.atomRangeToLSRange(atomRange);
      expect(lspRange.start.line).equals(atomRange.start.row);
      expect(lspRange.start.character).equals(atomRange.start.column);
      expect(lspRange.end.line).equals(atomRange.end.row);
      expect(lspRange.end.character).equals(atomRange.end.column);
    })
  })

  describe('editorToTextDocumentIdentifier', () => {
    it('Uses getURI which returns a path to create the uri', () => {
      const uri = '/c/d/e/f/g/h/i/j.txt';
      const editor = createFakeEditor(uri);
      const tdi = Convert.editorToTextDocumentIdentifier(editor);
      expect(tdi.uri).equals('file://' + uri);
    })
  })
})
