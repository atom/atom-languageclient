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

// Public: Adapts workspace/applyEdit commands to editors.
export default class ApplyEditAdapter {
  // Public: Attach to a {LanguageClientConnection} to receive edit events.
  public static attach(connection: LanguageClientConnection) {
    connection.onApplyEdit((m) => ApplyEditAdapter.onApplyEdit(m));
  }

  public static async onApplyEdit(params: ApplyWorkspaceEditParams): Promise<ApplyWorkspaceEditResponse> {

    let changes = params.edit.changes || {};

    if (params.edit.documentChanges) {
      changes = {};
      params.edit.documentChanges.forEach((change) => {
        if (change && change.textDocument) {
          changes[change.textDocument.uri] = change.edits;
        }
      });
    }

    const uris = Object.keys(changes);
    const paths = uris.map(Convert.uriToPath);
    const editors = await Promise.all(
      paths.map((path) => {
        return atom.workspace.open(path, {
          searchAllPanes: true,
          // Open new editors in the background.
          activatePane: false,
          activateItem: false,
        });
      }),
    );

    const checkpoints: Array<{ buffer: TextBuffer, checkpoint: number}> = [];
    try {
      for (let i = 0; i < editors.length; i++) {
        const editor = editors[i] as TextEditor;
        const uri = uris[i];
        // Get an existing editor for the file, or open a new one if it doesn't exist.
        const edits = Convert.convertLsTextEdits(changes[uri]);
        // Sort edits in reverse order to prevent edit conflicts.
        edits.sort((edit1, edit2) => -edit1.oldRange.compare(edit2.oldRange));
        const buffer = editor.getBuffer();
        const checkpoint = buffer.createCheckpoint();
        checkpoints.push({buffer, checkpoint});
        let prevEdit: atomIde.TextEdit | null = null;
        for (const edit of edits) {
          ApplyEditAdapter.validateEdit(buffer, edit, prevEdit);
          buffer.setTextInRange(edit.oldRange, edit.newText);
          prevEdit = edit;
        }
        buffer.groupChangesSinceCheckpoint(checkpoint);
      }
      return {applied: true};
    } catch (e) {
      atom.notifications.addError('workspace/applyEdits failed', {
        description: 'Failed to apply edits.',
        detail: e.message,
      });
      checkpoints.forEach(({buffer, checkpoint}) => {
        buffer.revertToCheckpoint(checkpoint);
      });
      return {applied: false};
    }
  }

  // Private: Do some basic sanity checking on the edit ranges.
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
