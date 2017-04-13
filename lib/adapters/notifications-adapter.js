// @flow

import {LanguageClientConnection, MessageType,
  type ShowMessageParams, type MessageActionItem, type ServerCapabilities} from '../languageclient';

export default class NotificationsAdapter {
  static canAdapt(serverCapabilities: ServerCapabilities): boolean {
    return true;
  }

  static attach(connection: LanguageClientConnection, name: string) {
    connection.onShowMessage(m => NotificationsAdapter.onShowMessage(m, name));
  }

  // TODO: Wire up onShowMessageRequest

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

  static actionItemToNotificationButton(actionItem: MessageActionItem): atom$NotificationButton {
    return {
      text: actionItem.title,
    }
  }
}
