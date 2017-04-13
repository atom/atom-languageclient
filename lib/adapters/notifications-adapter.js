// @flow

import {LanguageClientConnection, MessageType} from '../languageclient';
import type {ShowMessageParams, MessageActionItem} from '../languageclient';

export default class NotificationsAdapter {
  _name: string;

  constructor(connection: LanguageClientConnection, name: string) {
    this._name = name;
    connection.onShowMessage(this.onShowMessage.bind(this));
  }

  // TODO: Wire up onShowMessageRequest

  onShowMessage(params: ShowMessageParams): void {
    const options = {dismissable: true, detail: this._name};
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
    };
  }
}
