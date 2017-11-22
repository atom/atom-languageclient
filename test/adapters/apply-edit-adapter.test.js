// @flow

import {expect} from 'chai';
import path from 'path';
import sinon from 'sinon';
import ApplyEditAdapter from '../../lib/adapters/apply-edit-adapter';
import Convert from '../../lib/convert';

const TEST_PATH1 = path.join(__dirname, 'test.txt');
const TEST_PATH2 = path.join(__dirname, 'test2.txt');
const TEST_PATH3 = path.join(__dirname, 'test3.txt');
const TEST_PATH4 = path.join(__dirname, 'test4.txt');

describe('ApplyEditAdapter', () => {
  describe('onApplyEdit', () => {
    beforeEach(() => {
      sinon.spy(atom.notifications, 'addError');
    });

    afterEach(() => {
      atom.notifications.addError.restore();
    });

    it('works for open files', async () => {
      const editor = await atom.workspace.open(TEST_PATH1);
      editor.setText('abc\ndef\n');

      const result = await ApplyEditAdapter.onApplyEdit({
        edit: {
          changes: {
            [Convert.pathToUri(TEST_PATH1)]: [
              {
                range: {
                  start: {line: 0, character: 0},
                  end: {line: 0, character: 3},
                },
                newText: 'def',
              },
              {
                range: {
                  start: {line: 1, character: 0},
                  end: {line: 1, character: 3},
                },
                newText: 'ghi',
              },
            ],
          },
        },
      });

      expect(result.applied).to.equal(true);
      expect(editor.getText()).to.equal('def\nghi\n');

      // Undo should be atomic.
      editor.getBuffer().undo();
      expect(editor.getText()).to.equal('abc\ndef\n');
    });

    it('works with TextDocumentEdits', async () => {
      const editor = await atom.workspace.open(TEST_PATH1);
      editor.setText('abc\ndef\n');

      const result = await ApplyEditAdapter.onApplyEdit({
        edit: {
          documentChanges: [{
            textDocument: {
              version: 1,
              uri: Convert.pathToUri(TEST_PATH1),
            },
            edits: [
              {
                range: {
                  start: {line: 0, character: 0},
                  end: {line: 0, character: 3},
                },
                newText: 'def',
              },
              {
                range: {
                  start: {line: 1, character: 0},
                  end: {line: 1, character: 3},
                },
                newText: 'ghi',
              },
            ],
          }],
        },
      });

      expect(result.applied).to.equal(true);
      expect(editor.getText()).to.equal('def\nghi\n');

      // Undo should be atomic.
      editor.getBuffer().undo();
      expect(editor.getText()).to.equal('abc\ndef\n');
    });

    it('opens files that are not already open', async () => {
      const result = await ApplyEditAdapter.onApplyEdit({
        edit: {
          changes: {
            [TEST_PATH2]: [
              {
                range: {
                  start: {line: 0, character: 0},
                  end: {line: 0, character: 0},
                },
                newText: 'abc',
              },
            ],
          },
        },
      });

      expect(result.applied).to.equal(true);
      const editor = await atom.workspace.open(TEST_PATH2);
      expect(editor.getText()).to.equal('abc');
    });

    it('fails with overlapping edits', async () => {
      const editor = await atom.workspace.open(TEST_PATH3);
      editor.setText('abcdef\n');

      const result = await ApplyEditAdapter.onApplyEdit({
        edit: {
          changes: {
            [TEST_PATH3]: [
              {
                range: {
                  start: {line: 0, character: 0},
                  end: {line: 0, character: 3},
                },
                newText: 'def',
              },
              {
                range: {
                  start: {line: 0, character: 2},
                  end: {line: 0, character: 4},
                },
                newText: 'ghi',
              },
            ],
          },
        },
      });

      expect(result.applied).to.equal(false);
      expect(
        atom.notifications.addError.calledWith('workspace/applyEdits failed', {
          description: 'Failed to apply edits.',
          detail: `Found overlapping edit ranges in ${TEST_PATH3}`,
        }),
      ).to.equal(true);
      // No changes.
      expect(editor.getText()).to.equal('abcdef\n');
    });

    it('fails with out-of-range edits', async () => {
      const result = await ApplyEditAdapter.onApplyEdit({
        edit: {
          changes: {
            [TEST_PATH4]: [
              {
                range: {
                  start: {line: 0, character: 1},
                  end: {line: 0, character: 2},
                },
                newText: 'def',
              },
            ],
          },
        },
      });

      expect(result.applied).to.equal(false);
      const errorCalls = atom.notifications.addError.getCalls();
      expect(errorCalls.length).to.equal(1);
      expect(errorCalls[0].args[1].detail).to.equal(`Out of range edit on ${TEST_PATH4}:1:2`);
    });
  });
});
