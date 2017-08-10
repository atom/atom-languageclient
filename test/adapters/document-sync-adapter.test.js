// @flow

import {expect} from 'chai';
import {TextDocumentSyncKind} from '../../lib/languageclient';
import DocumentSyncAdapter from '../../lib/adapters/document-sync-adapter';

describe('DocumentSyncAdapter', () => {
  describe('canAdapt', () => {
    it('returns true if v2 incremental change notifications are supported', () => {
      const result = DocumentSyncAdapter.canAdapt({
        textDocumentSync: TextDocumentSyncKind.Incremental,
      });
      expect(result).to.be.true;
    });

    it('returns true if v2 full change notifications are supported', () => {
      const result = DocumentSyncAdapter.canAdapt({
        textDocumentSync: TextDocumentSyncKind.Full,
      });
      expect(result).to.be.true;
    });

    it('returns false if v2 none change notifications are supported', () => {
      const result = DocumentSyncAdapter.canAdapt({
        textDocumentSync: TextDocumentSyncKind.None,
      });
      expect(result).to.be.false;
    });

    it('returns true if v3 incremental change notifications are supported', () => {
      const result = DocumentSyncAdapter.canAdapt({
        textDocumentSync: {change: TextDocumentSyncKind.Incremental},
      });
      expect(result).to.be.true;
    });

    it('returns true if v3 full change notifications are supported', () => {
      const result = DocumentSyncAdapter.canAdapt({
        textDocumentSync: {change: TextDocumentSyncKind.Full},
      });
      expect(result).to.be.true;
    });

    it('returns false if v3 none change notifications are supported', () => {
      const result = DocumentSyncAdapter.canAdapt({
        textDocumentSync: {change: TextDocumentSyncKind.None},
      });
      expect(result).to.be.false;
    });
  });

  describe('constructor', () => {
    function create(textDocumentSync) {
      return new DocumentSyncAdapter((null: any), textDocumentSync, (null: any));
    }

    it('sets _documentSyncKind correctly Incremental for v2 capabilities', () => {
      const result = create(TextDocumentSyncKind.Incremental)._documentSyncKind;
      expect(result).equals(TextDocumentSyncKind.Incremental);
    });

    it('sets _documentSyncKind correctly Full for v2 capabilities', () => {
      const result = create(TextDocumentSyncKind.Full)._documentSyncKind;
      expect(result).equals(TextDocumentSyncKind.Full);
    });

    it('sets _documentSyncKind correctly Incremental for v3 capabilities', () => {
      const result = create({change: TextDocumentSyncKind.Incremental})._documentSyncKind;
      expect(result).equals(TextDocumentSyncKind.Incremental);
    });

    it('sets _documentSyncKind correctly Full for v3 capabilities', () => {
      const result = create({change: TextDocumentSyncKind.Full})._documentSyncKind;
      expect(result).equals(TextDocumentSyncKind.Full);
    });
  });
});
