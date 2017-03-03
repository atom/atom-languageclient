// @flow

import {LanguageClientV2, MessageType} from '../protocol/languageclient-v2';
import type {ShowMessageParams, ShowMessageRequestParams, MessageActionItem} from '../protocol/languageclient-v2';
import Convert from '../convert';

export default class MessageNotificationsBridge {
  _lc: LanguageClientV2;

  constructor(languageClient: LanguageClientV2) {
    this._lc = languageClient;
    this._lc.onShowMessage((p) => this.onShowMessage(p));
  }

  dispose(): void {
  }

  // TODO: Wire up onShowMessageRequest

  onShowMessage(params: ShowMessageParams): void {
    const options = { dismissable: true };
    switch(params.type) {
      case MessageType.Error:
        atom.notifications.addError(params.message, options);
        return;
      case MessageType.Warning:
        atom.notifications.addWarning(params.message, options);
        return;
      default:
        atom.notifications.addInfo(params.message, options);
        return;
    }
  }

  static actionItemToNotificationButton(actionItem: MessageActionItem): atom$NotificationButton {
    return {
      text: actionItem.title
    }
  }
}

type notificationFunction = (message: string, options?: atom$NotificationOptions) => atom$Notification;
