// @flow

import {LanguageClientV2, MessageType} from '../protocol/languageclient-v2';
import type {ShowMessageParams, ShowMessageRequestParams, MessageActionItem} from '../protocol/languageclient-v2';

export default class NotificationsBridge {
  _lc: LanguageClientV2;
  _name: string;

  constructor(languageClient: LanguageClientV2, name: string) {
    this._lc = languageClient;
    this._name = name;
    this._lc.onShowMessage(this.onShowMessage.bind(this));
  }

  dispose(): void {
  }

  // TODO: Wire up onShowMessageRequest

  onShowMessage(params: ShowMessageParams): void {
    const options = { dismissable: true, detail: this._name };
    switch(params.type) {
      case MessageType.Error:
        atom.notifications.addError(params.message, options);
        return;
      case MessageType.Warning:
        atom.notifications.addWarning(params.message, options);
        return;
      case MessageType.Log:
        console.log(params.message);
        return;
      case MessageType.Info:
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
