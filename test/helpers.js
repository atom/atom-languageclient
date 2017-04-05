// @flow

import sinon from 'sinon';
import {TextEditor} from 'atom';
import * as rpc from 'vscode-jsonrpc';

export function createSpyConnection(): rpc.connection {
  return {
    listen: sinon.spy(),
    onError: sinon.spy(),
    onUnhandledNotification: sinon.spy(),
    onNotification: sinon.spy(),
    dispose: sinon.spy(),
    sendRequest: sinon.spy(),
  };
}

export function createFakeEditor(path: ?string): TextEditor {
  const editor = new TextEditor();
  sinon.stub(editor, 'getSelectedBufferRange');
  sinon.spy(editor, 'setTextInBufferRange');
  editor.setTabLength(4);
  editor.setSoftTabs(true);
  editor.getBuffer().setPath(path || '/a/b/c/d.js');
  return editor;
}
