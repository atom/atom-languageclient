// @flow

import {
  LanguageClientConnection,
  MessageType,
  type MessageActionItem,
  type ServerCapabilities,
  type ShowMessageParams
} from '../languageclient';

// Public: Adapts Atom's user notifications to those of the language server protocol.
export default class NotificationsAdapter {
  // Public: Attach to a {LanguageClientConnection} to recieve events indicating
  // when user notifications should be displayed.
  static attach(connection: LanguageClientConnection, name: string) {
    connection.onShowMessage(m => NotificationsAdapter.onShowMessage(m, name));
  }

  // TODO: Wire up onShowMessageRequest

  // Public: Show a notification message using the Atom notifications API.
  //
  // * `params` The {ShowMessageParams} received from the language server
  //            indicating the details of the notification to be displayed.
  // * `name`   The name of the language server so the user can identify the
  //            context of the message.
  static onShowMessage(params: ShowMessageParams, name: string): void {
    const options = {dismissable: true, detail: name};
    switch (params.type) {
      case MessageType.Error:
        atom.notifications.addError(params.message, options);
        return;
      case MessageType.Warning:
        atom.notifications.addWarning(params.message, options);
        return;
      case MessageType.Log:
        // console.log(params.message);
        return;
      case MessageType.Info:
      default:
        atom.notifications.addInfo(params.message, options);
    }
  }

  // Public: Convert a {MessageActionItem} from the language server into an
  // equivalent {NotificationButton} within Atom.
  //
  // * `actionItem` The {MessageActionItem} to be converted.
  //
  // Returns a {NotificationButton} equivalent to the {MessageActionItem} given.
  static actionItemToNotificationButton(actionItem: MessageActionItem): atom$NotificationButton {
    return {
      text: actionItem.title,
    }
  }
}
