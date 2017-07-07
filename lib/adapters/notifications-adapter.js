// @flow

import {
  LanguageClientConnection,
  MessageType,
  type MessageActionItem,
  type ServerCapabilities,
  type ShowMessageParams,
  type ShowMessageRequestParams
} from '../languageclient';

// Public: Adapts Atom's user notifications to those of the language server protocol.
export default class NotificationsAdapter {
  // Public: Attach to a {LanguageClientConnection} to recieve events indicating
  // when user notifications should be displayed.
  static attach(connection: LanguageClientConnection, name: string) {
    connection.onShowMessage(m => NotificationsAdapter.onShowMessage(m, name));
    connection.onShowMessageRequest(m => NotificationsAdapter.onShowMessageRequest(m, name));
  }

  static onShowMessageRequest(params: ShowMessageRequestParams, name: string): Promise<?MessageActionItem> {
    return new Promise((resolve, reject) => {
      let notification: ?atom$Notification;
      const options: atom$NotificationOptions = {dismissable: true, detail: name};
      if (params.actions) {
        options.buttons = params.actions.map(a => ({
          text: a.title,
          onDidClick: () => {
            resolve(a);
            if (notification != null) {
              notification.dismiss()
            }
          },
        }));
      }

      notification = addNotificationForMessage(params.type, params.message, {
        dismissable: true,
        detail: name
      });

      if (notification != null) {
        notification.onDidDismiss(() => { resolve(null) });
      }
    });
  }

  // Public: Show a notification message using the Atom notifications API.
  //
  // * `params` The {ShowMessageParams} received from the language server
  //            indicating the details of the notification to be displayed.
  // * `name`   The name of the language server so the user can identify the
  //            context of the message.
  static onShowMessage(params: ShowMessageParams, name: string): void {
    addNotificationForMessage(params.type, params.message, {
      dismissable: true,
      detail: name
    });
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

function addNotificationForMessage(messageType: number, message: string, options: atom$NotificationOptions): ?atom$Notification {
  switch (messageType) {
    case MessageType.Error:
      return atom.notifications.addError(message, options);
    case MessageType.Warning:
      return atom.notifications.addWarning(message, options);
    case MessageType.Log:
      // console.log(params.message);
      return;
    case MessageType.Info:
    default:
      return atom.notifications.addInfo(message, options);
  }
}
