import * as Sentry from '@sentry/electron';
import { getEnvironment } from './environment';
import { Environment } from './interfaces';
import { ipcMain } from 'electron';

(function () {
  ipcMain.on('sentry-scope', (event, arg) => {
    event.returnValue = getSentryScope();
  });
})();

export function setUpSentry(deviceToken: string) {
  Sentry.setExtra('deviceToken', deviceToken);
  Sentry.setExtra('platform', 'electron');
  switch (getEnvironment()) {
    case Environment.QA:
      Sentry.init({
        dsn: 'https://e65b02a4a4f74ac9a6fc0642a23382b8@o357378.ingest.sentry.io/5443690'
      });
      break;
    case Environment.PROD:
      Sentry.init({
        dsn: 'https://a47c489e61f4459cb1339e4de2f2d007@o455103.ingest.sentry.io/5446173'
      });
      break;
  }
  console.log('Sentry enabled for profile ' + getEnvironment());
}

export function getSentryScope() {
  return Sentry.getCurrentHub().getScope();
}
