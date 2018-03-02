import * as sinon from 'sinon';
import * as rpc from 'vscode-jsonrpc';
import { TextEditor } from 'atom';

export function createSpyConnection(): rpc.MessageConnection {
  return {
    listen: sinon.spy(),
    onClose: sinon.spy(),
    onError: sinon.spy(),
    onDispose: sinon.spy(),
    onUnhandledNotification: sinon.spy(),
    onRequest: sinon.spy(),
    onNotification: sinon.spy(),
    dispose: sinon.spy(),
    sendRequest: sinon.spy(),
    sendNotification: sinon.spy(),
    trace: sinon.spy(),
    inspect: sinon.spy(),
  };
}

export function createFakeEditor(path?: string): TextEditor {
  const editor = new TextEditor();
  sinon.stub(editor, 'getSelectedBufferRange');
  sinon.spy(editor, 'setTextInBufferRange');
  editor.setTabLength(4);
  editor.setSoftTabs(true);
  editor.getBuffer().setPath(path || '/a/b/c/d.js');
  return editor;
}
