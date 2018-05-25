export {};
declare module 'atom' {
  interface TextEditor {
    getNonWordCharacters(position: Point): string;
  }

  // Non-public Notification api
  interface NotificationExt extends Notification {
    isDismissed?: () => boolean;
    getOptions?: () => NotificationOptions | null;
  }
}
