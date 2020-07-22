import * as atomIde from 'atom-ide';
import Convert from '../convert';
import {
  LanguageClientConnection,
  ApplyWorkspaceEditParams,
  ApplyWorkspaceEditResponse,
} from '../languageclient';
import {
  TextBuffer,
  TextEditor,
} from 'atom';

/** Public: Adapts workspace/applyEdit commands to editors. */
export default class ApplyEditAdapter {
  /** Public: Attach to a {LanguageClientConnection} to receive edit events. */
  public static attach(connection: LanguageClientConnection): void {
    connection.onApplyEdit((m) => ApplyEditAdapter.onApplyEdit(m));
  }

  /**
   * Tries to apply edits and reverts if anything goes wrong.
   * Returns the checkpoint, so the caller can revert changes if needed.
   */
  public static applyEdits(
    buffer: TextBuffer,
    edits: atomIde.TextEdit[],
  ): number {
    const checkpoint = buffer.createCheckpoint();
    try {
      // Sort edits in reverse order to prevent edit conflicts.
      edits.sort((edit1, edit2) => -edit1.oldRange.compare(edit2.oldRange));
      edits.reduce((previous: atomIde.TextEdit | null, current) => {
        ApplyEditAdapter.validateEdit(buffer, current, previous);
        buffer.setTextInRange(current.oldRange, current.newText);
        return current;
      }, null);
      buffer.groupChangesSinceCheckpoint(checkpoint);
      return checkpoint;
    } catch (err) {
      buffer.revertToCheckpoint(checkpoint);
      throw err;
    }
  }

  public static async onApplyEdit(params: ApplyWorkspaceEditParams): Promise<ApplyWorkspaceEditResponse> {

    let changes = params.edit.changes || {};

    if (params.edit.documentChanges) {
      changes = {};
      params.edit.documentChanges.forEach((change) => {
        if (change && "textDocument" in change && change.textDocument) {
          changes[change.textDocument.uri] = change.edits;
        }
      });
    }

    const uris = Object.keys(changes);

    // Keep checkpoints from all successful buffer edits
    const checkpoints: Array<{ buffer: TextBuffer, checkpoint: number }> = [];

    const promises = uris.map(async (uri) => {
      const path = Convert.uriToPath(uri);
      const editor = await atom.workspace.open(
        path, {
          searchAllPanes: true,
          // Open new editors in the background.
          activatePane: false,
          activateItem: false,
        },
      ) as TextEditor;
      const buffer = editor.getBuffer();
      // Get an existing editor for the file, or open a new one if it doesn't exist.
      const edits = Convert.convertLsTextEdits(changes[uri]);
      const checkpoint = ApplyEditAdapter.applyEdits(buffer, edits);
      checkpoints.push({ buffer, checkpoint });
    });

    // Apply all edits or fail and revert everything
    const applied = await Promise.all(promises)
      .then(() => true)
      .catch((err) => {
        atom.notifications.addError('workspace/applyEdits failed', {
          description: 'Failed to apply edits.',
          detail: err.message,
        });
        checkpoints.forEach(({ buffer, checkpoint }) => {
          buffer.revertToCheckpoint(checkpoint);
        });
        return false;
      });

    return { applied };
  }

  /** Private: Do some basic sanity checking on the edit ranges. */
  private static validateEdit(
    buffer: TextBuffer,
    edit: atomIde.TextEdit,
    prevEdit: atomIde.TextEdit | null,
  ): void {
    const path = buffer.getPath() || '';
    if (prevEdit && edit.oldRange.end.compare(prevEdit.oldRange.start) > 0) {
      throw Error(`Found overlapping edit ranges in ${path}`);
    }
    const startRow = edit.oldRange.start.row;
    const startCol = edit.oldRange.start.column;
    const lineLength = buffer.lineLengthForRow(startRow);
    if (lineLength == null || startCol > lineLength) {
      throw Error(`Out of range edit on ${path}:${startRow + 1}:${startCol + 1}`);
    }
  }
}
