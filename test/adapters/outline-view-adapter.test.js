// @flow

import OutlineViewAdapter from '../../lib/adapters/outline-view-adapter';
import * as ls from '../../lib/languageclient';
import sinon from 'sinon';
import {expect} from 'chai';

describe('OutlineViewAdapter', () => {
  const sourceItem = {
    kind: ls.SymbolKind.Class,
    name: 'Program',
    location: {
      range: {
        start: {line: 1, character: 2},
        end: {line: 3, character: 4},
      },
    },
  };

  beforeEach(() => {
    global.sinon = sinon.sandbox.create();
  });
  afterEach(() => {
    global.sinon.restore();
  });

  describe('canAdapt', () => {
    it('returns true if documentSymbolProvider is supported', () => {
      const result = OutlineViewAdapter.canAdapt({documentSymbolProvider: true});
      expect(result).to.be.true;
    });

    it('returns false if documentSymbolProvider not supported', () => {
      const result = OutlineViewAdapter.canAdapt({});
      expect(result).to.be.false;
    });
  });

  describe('createOutlineTree', () => {
    it('creates an empty array given an empty array', () => {
      const result = OutlineViewAdapter.createOutlineTrees([]);
      expect(result).to.deep.equal([]);
    });

    it('creates a single converted item from a single source item', () => {
      const expected = OutlineViewAdapter.symbolToOutline(sourceItem);
      const result = OutlineViewAdapter.createOutlineTrees([sourceItem]);
      expect(result).to.deep.equal([expected]);
    });
  });

  describe('symbolToOutline', () => {
    it('converts an individual item', () => {
      const result = OutlineViewAdapter.symbolToOutline(sourceItem);
      expect(result.icon).to.equal('type-class');
      expect(result.representativeName).to.equal('Program');
      expect(result.tokenizedText[0].kind).to.equal('type');
      expect(result.tokenizedText[0].value).to.equal('Program');
      expect(result.startPosition.row).to.equal(1);
      expect(result.startPosition.column).to.equal(2);
      expect(result.endPosition.row).to.equal(3);
      expect(result.endPosition.column).to.equal(4);
      expect(result.children).to.deep.equal([]);
    });
  });
});
