// @flow

import invariant from 'assert';
import {CompositeDisposable} from 'atom';
import {LanguageClientConnection, type ServerCapabilities} from '../languageclient';
import Convert from '../convert';
import type {ActiveServer} from '../server-manager';

export default class SignatureHelpAdapter {
  _disposables: CompositeDisposable = new CompositeDisposable();
  _connection: LanguageClientConnection;
  _capabilities: ServerCapabilities;
  _grammarScopes: Array<string>;

  constructor(server: ActiveServer, grammarScopes: Array<string>) {
    this._connection = server.connection;
    this._capabilities = server.capabilities;
    this._grammarScopes = grammarScopes;
  }

  // Returns a {Boolean} indicating this adapter can adapt the server based on the
  // given serverCapabilities.
  static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.signatureHelpProvider != null;
  }

  dispose() {
    this._disposables.dispose();
  }

  attach(register: atomIde$SignatureHelpRegistry): void {
    const {signatureHelpProvider} = this._capabilities;
    invariant(signatureHelpProvider != null);

    let triggerCharacters = null;
    if (Array.isArray(signatureHelpProvider.triggerCharacters)) {
      triggerCharacters = new Set(signatureHelpProvider.triggerCharacters);
    }

    this._disposables.add(
      register({
        priority: 1,
        grammarScopes: this._grammarScopes,
        triggerCharacters,
        getSignatureHelp: this.getSignatureHelp.bind(this),
      }),
    );
  }

  // Public: Retrieves signature help for a given editor and position.
  getSignatureHelp(editor: atom$TextEditor, point: atom$Point): Promise<?atomIde$SignatureHelp> {
    return this._connection.signatureHelp(Convert.editorToTextDocumentPositionParams(editor, point));
  }
}
