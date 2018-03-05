import * as atomIde from 'atom-ide';
import {
  LanguageClientConnection,
  LogMessageParams,
} from '../languageclient';

// Public: Adapts Atom's user notifications to those of the language server protocol.
export default class LoggingConsoleAdapter {
  private _consoles: Map<LanguageClientConnection, Console> = new Map();

  // Public: Attach to a {LanguageClientConnection} to recieve events indicating
  // when user notifications should be displayed.
  public attach(connection: LanguageClientConnection, name: string, projectPath: string): void {
    connection.onLogMessage((m) => LoggingConsoleAdapter.onLogMessage(m, name, projectPath));
  }

  public detach(connection: LanguageClientConnection): void {
  }

  // Public: Log a message using the Atom IDE UI Console API.
  //
  // * `params` The {LogMessageParams} received from the language server
  //            indicating the details of the message to be loggedd.
  // * `name`   The name of the language server so the user can identify the
  //            context of the message.
  public static onLogMessage(params: LogMessageParams, name: string, projectPath: string): void {

  }
}
