// @flow

import {expect} from 'chai';
import {TextDocumentSyncKind} from '../../lib/languageclient';
import DocumentSyncAdapter from '../../lib/adapters/document-sync-adapter';

describe('DocumentSyncAdapter', () => {
  describe('canAdapt', () => {
    it('returns true if v2 incremental change notifications are supported', () => {
      const result = DocumentSyncAdapter.canAdapt({ textDocumentSync: TextDocumentSyncKind.Incremental });
      expect(result).to.be.true;
    });

    it('returns true if v2 full change notifications are supported', () => {
      const result = DocumentSyncAdapter.canAdapt({ textDocumentSync: TextDocumentSyncKind.Full });
      expect(result).to.be.true;
    });

    it('returns false if v2 none change notifications are supported', () => {
      const result = DocumentSyncAdapter.canAdapt({ textDocumentSync: TextDocumentSyncKind.None });
      expect(result).to.be.false;
    });

    it('returns true if v3 incremental change notifications are supported', () => {
      const result = DocumentSyncAdapter.canAdapt({ textDocumentSync: { change: TextDocumentSyncKind.Incremental } });
      expect(result).to.be.true;
    });

    it('returns true if v3 full change notifications are supported', () => {
      const result = DocumentSyncAdapter.canAdapt({ textDocumentSync: { change: TextDocumentSyncKind.Full } });
      expect(result).to.be.true;
    });

    it('returns false if v3 none change notifications are supported', () => {
      const result = DocumentSyncAdapter.canAdapt({ textDocumentSync: { change: TextDocumentSyncKind.None } });
      expect(result).to.be.false;
    });
  });
});
