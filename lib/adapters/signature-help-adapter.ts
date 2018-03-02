import * as atomIde from 'atom-ide';
import assert = require('assert');
import Convert from '../convert';
import { ActiveServer } from '../server-manager';
import {
  CompositeDisposable,
  Point,
  TextEditor,
} from 'atom';
import {
  LanguageClientConnection,
  ServerCapabilities,
  SignatureHelp,
} from '../languageclient';

export default class SignatureHelpAdapter {
  private _disposables: CompositeDisposable = new CompositeDisposable();
  private _connection: LanguageClientConnection;
  private _capabilities: ServerCapabilities;
  private _grammarScopes: string[];

  constructor(server: ActiveServer, grammarScopes: string[]) {
    this._connection = server.connection;
    this._capabilities = server.capabilities;
    this._grammarScopes = grammarScopes;
  }

  // Returns a {Boolean} indicating this adapter can adapt the server based on the
  // given serverCapabilities.
  public static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return serverCapabilities.signatureHelpProvider != null;
  }

  public dispose() {
    this._disposables.dispose();
  }

  public attach(register: atomIde.SignatureHelpRegistry): void {
    const {signatureHelpProvider} = this._capabilities;
    assert(signatureHelpProvider != null);

    let triggerCharacters: Set<string> | undefined;
    if (signatureHelpProvider && Array.isArray(signatureHelpProvider.triggerCharacters)) {
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
  public getSignatureHelp(editor: TextEditor, point: Point): Promise<SignatureHelp | null> {
    return this._connection.signatureHelp(Convert.editorToTextDocumentPositionParams(editor, point));
  }
}
