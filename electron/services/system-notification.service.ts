export class SystemNotification {
  private notifier = require('node-notifier');
  private path = require('path');

  showOkCancelSystemNotification(
    textMessage: string,
    onOkFunction: any,
    onCancelFunction: any
  ) {
    this.showSystemNotification(
      textMessage,
      ['OK', 'Cancel'],
      onOkFunction,
      onCancelFunction
    );
  }

  showOkSystemNotification(textMessage: string, onOkFunction: any) {
    this.showSystemNotification(textMessage, ['OK'], onOkFunction, null);
  }

  private showSystemNotification(
    textMessage: string,
    action: any,
    onOkFunction: any,
    onCancelFunction: any
  ) {
    const notificationId = SystemNotification.getRandomInt(100000000);

    const properties = {
      title: 'Gaimin App',
      message: textMessage,
      icon: this.path.join(__dirname, 'resources/gaimin-icon-tray-active.png'),
      sound: true,
      appID: 'gaimin-platform',
      wait: true,
      actions: action,
      timeout: 60,
      id: notificationId
    };

    this.notifier.notify(properties, onOkFunction);

    if (onCancelFunction) {
      this.notifier.notify(properties, onCancelFunction);
    }
  }

  private static getRandomInt(max): number {
    return Math.floor(Math.random() * Math.floor(max));
  }
}
