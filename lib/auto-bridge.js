// @flow

import * as cp from 'child_process';
import * as path from 'path';
import * as ls from './protocol/languageclient-v2';
import RunningServerV2 from './running-server';

export default class AutoBridge {
  _process: child_process$ChildProcess;
  _server: ?RunningServerV2;

  name: string = '';
  grammarScopes = [];

  activate(): void {
    if (this.name === '') {
      throw "Must set name field when extending AutoBridge";
    }
    if (this.grammarScopes == null || this.grammarScopes.length == 0) {
      throw "Must set grammarScopes field when extending AutoBridge";
    }

    this.startServer();
  }

  deactivate(): void {
    this.stopServer();
  }

  async startServer(): Promise<void> {
    if (this._server != null) return;

    this._process = await this.startServerProcess();
    this._server = new RunningServerV2(this.name, this._process);
    await this._server.start(this._getInitializeParams());
  }

  startServerProcess(): child_process$ChildProcess {
    throw "Must override startServerProcess to start the language server process when extending AutoBridge";
  }

  async stopServer(): Promise<void> {
    this._log('stopping');
    if (this._server != null) {
      await this._server.stop();
      this._server = null;
      this._process.kill();
    };
  }

  provideOutlines(): nuclide$OutlineProvider {
    return {
      name: this.name,
      grammarScopes: this.grammarScopes,
      priority: 1,
      getOutline: this.getOutline.bind(this)
    }
  }

  getOutline(editor: atom$TextEditor): Promise<?nuclide$Outline> {
    return this._server && this._server.symbolProvider ? this._server.symbolProvider.getOutline(editor) : Promise.resolve(null);
  }

  provideLinter(): linter$StandardLinter {
    return {
      name: this.name,
      scope: 'project',
      lintOnFly: true,
      grammarScopes: this.grammarScopes,
      lint: this.provideLinting.bind(this)
    };
  }

  provideLinting(editor: atom$TextEditor): ?Array<linter$Message> | Promise<?Array<linter$Message>> {
    return this._server && this._server.linter ? this._server.linter.provideDiagnostics() : Promise.resolve([]);
  }

  provideAutocomplete(): atom$AutocompleteProvider {
    return {
      selector: '.source',
      excludeLowerPriority: false,
      getSuggestions: this.provideSuggestions.bind(this),
    };
  }

  provideSuggestions(request: any): Promise<Array<atom$AutocompleteSuggestion>> {
    return this._server && this._server.autoComplete ? this._server.autoComplete.provideSuggestions(request) : Promise.resolve([]);
  }

  _getInitializeParams(): ls.InitializeParams {
    const rootDirs: Array<any> = atom.project.getDirectories();

    return {
      processId: process.pid,
      capabilities: { },
      rootPath: rootDirs.length > 0 ? rootDirs[0].path : null
    }
  }

  _log(message: string) {
    console.log(`${this.name} ${message}`);
  }
}
