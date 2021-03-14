import OutlineViewAdapter from '../../lib/adapters/outline-view-adapter';
import * as ls from '../../lib/languageclient';
import { expect } from 'chai';
import { Point } from 'atom';

describe('OutlineViewAdapter', () => {
  const createRange = (a: any, b: any, c: any, d: any) => (
    { start: { line: a, character: b }, end: { line: c, character: d } }
  );

  const createLocation = (a: any, b: any, c: any, d: any) => ({
    uri: '',
    range: createRange(a, b, c, d),
  });

  describe('canAdapt', () => {
    it('returns true if documentSymbolProvider is supported', () => {
      const result = OutlineViewAdapter.canAdapt({ documentSymbolProvider: true });
      expect(result).to.be.true;
    });

    it('returns false if documentSymbolProvider not supported', () => {
      const result = OutlineViewAdapter.canAdapt({});
      expect(result).to.be.false;
    });
  });

  describe('createHierarchicalOutlineTrees', () => {
    it('creates an empty array given an empty array', () => {
      const result = OutlineViewAdapter.createHierarchicalOutlineTrees([]);
      expect(result).to.deep.equal([]);
    });

    it('converts symbols without the children field', () => {
      const sourceItem = {
        name: 'test',
        kind: ls.SymbolKind.Function,
        range: createRange(1, 1, 2, 2),
        selectionRange: createRange(1, 1, 2, 2),
      };

      const expected = [OutlineViewAdapter.hierarchicalSymbolToOutline(sourceItem)];
      const result = OutlineViewAdapter.createHierarchicalOutlineTrees([sourceItem]);

      expect(result).to.deep.equal(expected);
    });

    it('converts symbols with an empty children list', () => {
      const sourceItem = {
        name: 'test',
        kind: ls.SymbolKind.Function,
        range: createRange(1, 1, 2, 2),
        selectionRange: createRange(1, 1, 2, 2),
        children: [],
      };

      const expected = [OutlineViewAdapter.hierarchicalSymbolToOutline(sourceItem)];
      const result = OutlineViewAdapter.createHierarchicalOutlineTrees([sourceItem]);

      expect(result).to.deep.equal(expected);
    });

    it('sorts symbols by location', () => {
      const sourceA = {
        name: 'test',
        kind: ls.SymbolKind.Function,
        range: createRange(2, 2, 3, 3),
        selectionRange: createRange(2, 2, 3, 3),
      };

      const sourceB = {
        name: 'test',
        kind: ls.SymbolKind.Function,
        range: createRange(1, 1, 2, 2),
        selectionRange: createRange(1, 1, 2, 2),
      };

      const expected = [
        OutlineViewAdapter.hierarchicalSymbolToOutline(sourceB),
        OutlineViewAdapter.hierarchicalSymbolToOutline(sourceA),
      ];

      const result = OutlineViewAdapter.createHierarchicalOutlineTrees([
        sourceA,
        sourceB,
      ]);

      expect(result).to.deep.equal(expected);
    });

    it('converts symbols with children', () => {
      const sourceChildA = {
        name: 'childA',
        kind: ls.SymbolKind.Function,
        range: createRange(2, 2, 3, 3),
        selectionRange: createRange(2, 2, 3, 3),
      };

      const sourceChildB = {
        name: 'childB',
        kind: ls.SymbolKind.Function,
        range: createRange(1, 1, 2, 2),
        selectionRange: createRange(1, 1, 2, 2),
      };

      const sourceParent = {
        name: 'parent',
        kind: ls.SymbolKind.Function,
        range: createRange(1, 1, 3, 3),
        selectionRange: createRange(1, 1, 3, 3),
        children: [sourceChildA, sourceChildB],
      };

      const expectedParent = OutlineViewAdapter.hierarchicalSymbolToOutline(
        sourceParent);

      expectedParent.children = [
        OutlineViewAdapter.hierarchicalSymbolToOutline(sourceChildB),
        OutlineViewAdapter.hierarchicalSymbolToOutline(sourceChildA),
      ];

      const result = OutlineViewAdapter.createHierarchicalOutlineTrees([
        sourceParent,
      ]);

      expect(result).to.deep.equal([expectedParent]);
    });
  });

  describe('createOutlineTrees', () => {
    it('creates an empty array given an empty array', () => {
      const result = OutlineViewAdapter.createOutlineTrees([]);
      expect(result).to.deep.equal([]);
    });

    it('creates a single converted root item from a single source item', () => {
      const sourceItem = { kind: ls.SymbolKind.Namespace, name: 'R', location: createLocation(5, 6, 7, 8) };
      const expected = OutlineViewAdapter.symbolToOutline(sourceItem);
      const result = OutlineViewAdapter.createOutlineTrees([sourceItem]);
      expect(result).to.deep.equal([expected]);
    });

    it('creates an empty root container with a single source item when containerName missing', () => {
      const sourceItem: ls.SymbolInformation = {
        kind: ls.SymbolKind.Class,
        name: 'Program',
        location: createLocation(1, 2, 3, 4),
      };
      const expected = OutlineViewAdapter.symbolToOutline(sourceItem);
      sourceItem.containerName = 'missing';
      const result = OutlineViewAdapter.createOutlineTrees([sourceItem]);
      expect(result.length).to.equal(1);
      expect(result[0].representativeName).to.equal('missing');
      expect(result[0].startPosition.row).to.equal(0);
      expect(result[0].startPosition.column).to.equal(0);
      expect(result[0].children).to.deep.equal([expected]);
    });

    // tslint:disable-next-line:max-line-length
    it('creates an empty root container with a single source item when containerName is missing and matches own name', () => {
      const sourceItem: ls.SymbolInformation = {
        kind: ls.SymbolKind.Class,
        name: 'simple',
        location: createLocation(1, 2, 3, 4),
      };
      const expected = OutlineViewAdapter.symbolToOutline(sourceItem);
      sourceItem.containerName = 'simple';
      const result = OutlineViewAdapter.createOutlineTrees([sourceItem]);
      expect(result.length).to.equal(1);
      expect(result[0].representativeName).to.equal('simple');
      expect(result[0].startPosition.row).to.equal(0);
      expect(result[0].startPosition.column).to.equal(0);
      expect(result[0].children).to.deep.equal([expected]);
    });

    it('creates a simple named hierarchy', () => {
      const sourceItems = [
        { kind: ls.SymbolKind.Namespace, name: 'java.com', location: createLocation(1, 0, 10, 0) },
        {
          kind: ls.SymbolKind.Class,
          name: 'Program',
          location: createLocation(2, 0, 7, 0),
          containerName: 'java.com',
        },
        {
          kind: ls.SymbolKind.Function,
          name: 'main',
          location: createLocation(4, 0, 5, 0),
          containerName: 'Program',
        },
      ];
      const result = OutlineViewAdapter.createOutlineTrees(sourceItems);
      expect(result.length).to.equal(1);
      expect(result[0].children.length).to.equal(1);
      expect(result[0].children[0].representativeName).to.equal('Program');
      expect(result[0].children[0].children.length).to.equal(1);
      expect(result[0].children[0].children[0].representativeName).to.equal('main');
    });

    it('retains duplicate named items', () => {
      const sourceItems = [
        { kind: ls.SymbolKind.Namespace, name: 'duplicate', location: createLocation(1, 0, 5, 0) },
        { kind: ls.SymbolKind.Namespace, name: 'duplicate', location: createLocation(6, 0, 10, 0) },
        {
          kind: ls.SymbolKind.Function,
          name: 'main',
          location: createLocation(7, 0, 8, 0),
          containerName: 'duplicate',
        },
      ];
      const result = OutlineViewAdapter.createOutlineTrees(sourceItems);
      expect(result.length).to.equal(2);
      expect(result[0].representativeName).to.equal('duplicate');
      expect(result[1].representativeName).to.equal('duplicate');
    });

    it('disambiguates containerName based on range', () => {
      const sourceItems = [
        { kind: ls.SymbolKind.Namespace, name: 'duplicate', location: createLocation(1, 0, 5, 0) },
        { kind: ls.SymbolKind.Namespace, name: 'duplicate', location: createLocation(6, 0, 10, 0) },
        {
          kind: ls.SymbolKind.Function,
          name: 'main',
          location: createLocation(7, 0, 8, 0),
          containerName: 'duplicate',
        },
      ];
      const result = OutlineViewAdapter.createOutlineTrees(sourceItems);
      expect(result[1].children.length).to.equal(1);
      expect(result[1].children[0].representativeName).to.equal('main');
    });

    it("does not become it's own parent", () => {
      const sourceItems = [
        { kind: ls.SymbolKind.Namespace, name: 'duplicate', location: createLocation(1, 0, 10, 0) },
        {
          kind: ls.SymbolKind.Namespace,
          name: 'duplicate',
          location: createLocation(6, 0, 7, 0),
          containerName: 'duplicate',
        },
      ];

      const result = OutlineViewAdapter.createOutlineTrees(sourceItems);
      expect(result.length).to.equal(1);

      const outline = result[0];
      expect(outline.endPosition).to.not.be.undefined;
      if (outline.endPosition) {
        expect(outline.endPosition.row).to.equal(10);
        expect(outline.children.length).to.equal(1);

        const outlineChild = outline.children[0];
        expect(outlineChild.endPosition).to.not.be.undefined;
        if (outlineChild.endPosition) {
          expect(outlineChild.endPosition.row).to.equal(7);
        }
      }
    });

    it('parents to the innnermost named container', () => {
      const sourceItems = [
        { kind: ls.SymbolKind.Namespace, name: 'turtles', location: createLocation(1, 0, 10, 0) },
        {
          kind: ls.SymbolKind.Namespace,
          name: 'turtles',
          location: createLocation(4, 0, 8, 0),
          containerName: 'turtles',
        },
        { kind: ls.SymbolKind.Class, name: 'disc', location: createLocation(4, 0, 5, 0), containerName: 'turtles' },
      ];
      const result = OutlineViewAdapter.createOutlineTrees(sourceItems);
      expect(result.length).to.equal(1);

      const outline = result[0];
      expect(outline).to.not.be.undefined;
      if (outline) {
        expect(outline.endPosition).to.not.be.undefined;
        if (outline.endPosition) {
          expect(outline.endPosition.row).to.equal(10);
          expect(outline.children.length).to.equal(1);

          const outlineChild = outline.children[0];
          expect(outlineChild.endPosition).to.not.be.undefined;
          if (outlineChild.endPosition) {
            expect(outlineChild.endPosition.row).to.equal(8);
            expect(outlineChild.children.length).to.equal(1);

            const outlineGrandChild = outlineChild.children[0];
            expect(outlineGrandChild.endPosition).to.not.be.undefined;
            if (outlineGrandChild.endPosition) {
              expect(outlineGrandChild.endPosition.row).to.equal(5);
            }
          }
        }
      }
    });
  });

  describe('hierarchicalSymbolToOutline', () => {
    it('converts an individual item', () => {
      const sourceItem = {
        name: 'test',
        kind: ls.SymbolKind.Function,
        range: createRange(1, 1, 2, 2),
        selectionRange: createRange(1, 1, 2, 2),
      };

      const expected = {
        tokenizedText: [
          {
            kind: 'method',
            value: 'test',
          },
        ],
        icon: 'type-function',
        representativeName: 'test',
        startPosition: new Point(1, 1),
        endPosition: new Point(2, 2),
        children: [],
      };

      const result = OutlineViewAdapter.hierarchicalSymbolToOutline(sourceItem);

      expect(result).to.deep.equal(expected);
    });
  });

  describe('symbolToOutline', () => {
    it('converts an individual item', () => {
      const sourceItem = { kind: ls.SymbolKind.Class, name: 'Program', location: createLocation(1, 2, 3, 4) };
      const result = OutlineViewAdapter.symbolToOutline(sourceItem);
      expect(result.icon).to.equal('type-class');
      expect(result.representativeName).to.equal('Program');
      expect(result.children).to.deep.equal([]);
      expect(result.tokenizedText).to.not.be.undefined;
      if (result.tokenizedText) {
        expect(result.tokenizedText[0].kind).to.equal('type');
        expect(result.tokenizedText[0].value).to.equal('Program');
        expect(result.startPosition.row).to.equal(1);
        expect(result.startPosition.column).to.equal(2);
        expect(result.endPosition).to.not.be.undefined;
        if (result.endPosition) {
          expect(result.endPosition.row).to.equal(3);
          expect(result.endPosition.column).to.equal(4);
        }
      }
    });
  });
});
