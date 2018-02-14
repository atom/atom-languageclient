import {
  LanguageClientConnection,
  MessageType,
  MessageActionItem,
  ShowMessageParams,
  ShowMessageRequestParams,
} from '../languageclient';
import { Notification, NotificationOptions } from 'atom';
import { NotificationButton } from 'atom2';

// Public: Adapts Atom's user notifications to those of the language server protocol.
export default class NotificationsAdapter {
  // Public: Attach to a {LanguageClientConnection} to recieve events indicating
  // when user notifications should be displayed.
  public static attach(connection: LanguageClientConnection, name: string) {
    connection.onShowMessage((m) => NotificationsAdapter.onShowMessage(m, name));
    connection.onShowMessageRequest((m) => NotificationsAdapter.onShowMessageRequest(m, name));
  }

  public static onShowMessageRequest(
    params: ShowMessageRequestParams,
    name: string,
  ): Promise<MessageActionItem | null> {
    return new Promise((resolve, reject) => {
      const options: NotificationOptions = {
        dismissable: true,
        detail: name,
      };
      if (params.actions) {
        options.buttons = params.actions.map((a) => ({
          text: a.title,
          onDidClick: () => {
            resolve(a);
            if (notification != null) {
              notification.dismiss();
            }
          },
        }));
      }

      const notification = addNotificationForMessage(params.type, params.message, {
        dismissable: true,
        detail: name,
      });

      if (notification != null) {
        notification.onDidDismiss(() => {
          resolve(null);
        });
      }
    });
  }

  // Public: Show a notification message using the Atom notifications API.
  //
  // * `params` The {ShowMessageParams} received from the language server
  //            indicating the details of the notification to be displayed.
  // * `name`   The name of the language server so the user can identify the
  //            context of the message.
  public static onShowMessage(params: ShowMessageParams, name: string): void {
    addNotificationForMessage(params.type, params.message, {
      dismissable: true,
      detail: name,
    });
  }

  // Public: Convert a {MessageActionItem} from the language server into an
  // equivalent {NotificationButton} within Atom.
  //
  // * `actionItem` The {MessageActionItem} to be converted.
  //
  // Returns a {NotificationButton} equivalent to the {MessageActionItem} given.
  public static actionItemToNotificationButton(actionItem: MessageActionItem): NotificationButton {
    return {
      text: actionItem.title,
    };
  }
}

function addNotificationForMessage(
  messageType: number,
  message: string,
  options: NotificationOptions,
): Notification | null {
  switch (messageType) {
    case MessageType.Error:
      return atom.notifications.addError(message, options);
    case MessageType.Warning:
      return atom.notifications.addWarning(message, options);
    case MessageType.Log:
      // console.log(params.message);
      return null;
    case MessageType.Info:
    default:
      return atom.notifications.addInfo(message, options);
  }
}
