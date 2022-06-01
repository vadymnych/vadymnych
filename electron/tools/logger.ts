import { LOG_TYPE } from './interfaces';
import { platformWindow } from '../main';

let messagesQueue: Array<string> = new Array<string>();

export function logIntoConsole(logType: LOG_TYPE, message: string) {
  console.log(createLogMessage(logType, message));
}

export function logIntoPlatform(logType: LOG_TYPE, message: string) {
  const messageText = createLogMessage(logType, message);
  console.log(messageText);

  if (platformWindow != null) {
    if (messagesQueue.length > 0) {
      messagesQueue.forEach((m) =>
        platformWindow.webContents.send('electron-log', m)
      );
      messagesQueue = [];
      messagesQueue.length = 0;
    }

    platformWindow.webContents.send('electron-log', messageText);
  } else {
    messagesQueue.push(messageText);
  }
}

function createLogMessage(logType: LOG_TYPE, message: string): string {
  const currentDate = '[' + new Date().toLocaleTimeString() + '] ';
  return currentDate + logType + ': ' + message;
}
