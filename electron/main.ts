import { app, BrowserWindow, dialog, ipcMain, powerSaveBlocker, WebContents, BrowserView } from 'electron';
import * as electronLocalshortcut from 'electron-localshortcut';
import * as path from 'path';
import { createTray } from './tools/tray';
import * as axios from 'axios';
import { GaiminSettingsHelper } from './services/settings.service';
import * as environmentService from './tools/environment';
import { isWindows } from './tools/environment';
import * as systemAnalyzer from './tools/system-analyzer';
import * as fs from 'fs';
import { BalancePollerService } from './services/balance-poller.service';
import { AuthService } from './services/okta/auth';
import { setUpSentry } from './tools/sentry';
import { SystemNotification } from './services/system-notification.service';
import { ArkaneAuth } from './services/arkane/ArkaneAuth';
import { MiningService } from './services/mining.service';
import { Response, Devices, LOG_TYPE } from './tools/interfaces';
import { logIntoConsole, logIntoPlatform } from './tools/logger';
import { PushyService } from './services/pushy.service';
import { AutoUpdaterService } from './services/auto-updater.service';

const AutoLaunch = require('auto-launch');

const MAIN_WINDOW_WIDTH = 1440;
const MAIN_WINDOW_HEIGHT = 860;
const MIN_MAIN_WINDOW_WIDTH = 1260;
const MIN_MAIN_WINDOW_HEIGHT = 860;
const SETTINGS_AUTOSAVE_INTERVAL_MILLIS = 5000;
const BACKGROUND_WINDOW_COLOR = '#101011';
const BROWSER_WINDOW_CONFIGURATION = {
  width: MAIN_WINDOW_WIDTH,
  height: MAIN_WINDOW_HEIGHT,
  show: true,
  frame: false,
  backgroundColor: BACKGROUND_WINDOW_COLOR,
  minHeight: MIN_MAIN_WINDOW_HEIGHT,
  minWidth: MIN_MAIN_WINDOW_WIDTH,
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false
  }
};

export let platformWindow: BrowserWindow;
export let tray = null;

const backendApi = environmentService.getGaiminApi();
const systemNotification: SystemNotification = new SystemNotification();
const settingsHelper = new GaiminSettingsHelper();
const settings = settingsHelper.get();
const pushyService = new PushyService(settings, settingsHelper, backendApi);
const autoUpdaterService = new AutoUpdaterService(environmentService, systemNotification);

let renderers: WebContents[];
let miningService: MiningService;
let balancePoller: BalancePollerService;
let authService: AuthService;
let arkaneAuth: ArkaneAuth;
let DEVICE_TOKEN = null;

let isApplicationQuiting = false; // ??

let activationBrowserWindow: BrowserWindow;

switchOnAutoLaunch();
setUpSingleInstanceApp();
setUpSentry(settings.deviceToken);

app.setAppUserModelId('gaimin-platform');

app.whenReady().then(() => {
  console.log(`App is ready with version ${app.getVersion()} !`);

  console.log('Checking if device already has device token.');

  if (settings.deviceToken == null) {
    logIntoPlatform(LOG_TYPE.INFO, 'Device token is null. Registration of new device...');
    systemAnalyzer
      .getSystemInfo()
      .then((systemInfo) => {
        registerNewDevice(nullValuesValidation(systemInfo));
      })
      .catch((error) => logIntoPlatform(LOG_TYPE.ERROR, 'Failed to retrieve device system info: ' + error));
  } else {
    logIntoPlatform(LOG_TYPE.INFO, 'DEVICE TOKEN EXIST');
    if (settings.pushyDeviceToken == null) {
      pushyService.pushyRegister();
    }

    platformWindow = createPlatformWindow();
    initializePlatformServices(platformWindow);

    console.log('Initiating Implicit Login');
    authService.implicitLogin();
    arkaneAuth.implicitLogin();
  }
});

function createActivationCodeWindow() {
  activationBrowserWindow = new BrowserWindow({
    width: 400,
    height: 500,
    resizable: false,
    show: true,
    frame: false,
    backgroundColor: BACKGROUND_WINDOW_COLOR,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  const filePath = app.isPackaged
    ? path.join(process.resourcesPath, 'electron/resources/' + 'activationCodeWindow/activationCodeWindow.html')
    : 'electron/resources/' + 'activationCodeWindow/activationCodeWindow.html';

  console.log('path:', filePath, ' !!!');
  activationBrowserWindow
    .loadFile(path.join(filePath))
    .then((res) => {
      console.log('loadFile res', res);
    })
    .catch((error) => {
      console.log('loadFile error', error);
    });

  activationBrowserWindow.show();
  activationBrowserWindow.focus();

  electronLocalshortcut.register(activationBrowserWindow, 'F12', () => {
    activationBrowserWindow.webContents.openDevTools({ mode: 'undocked' });
  });
}

/** Registration of a new device */

function registerNewDevice(systemInfo) {
  const installerName = getInstallerName();
  try {
    logIntoPlatform(LOG_TYPE.NEP, 'installerName ' + installerName);

    if (installerName.includes('deviceId')) {
      let deviceId = parseDeviceIdFromFileName(installerName);
      if (deviceId.includes('token')) {
        const regexBefore = /([^-]+)/;
        deviceId = regexBefore.exec(deviceId)[0];
      }
      logIntoPlatform(LOG_TYPE.NEP, 'deviceId ' + deviceId);
      createNewDevice(systemInfo, deviceId);
    } else if (installerName.includes('token')) {
      const token = parseTokenFromFileName(installerName);
      logIntoPlatform(LOG_TYPE.NEP, 'token ' + token);
      createNewDevice(systemInfo, null, token);
    } else {
      createNewDevice(systemInfo);
    }
  } catch (e) {
    logIntoPlatform(LOG_TYPE.NEP, 'Failed to read file with installer name: ' + e.toString() + ', ' + e);
  }
}

function createNewDevice(systemInfo, deviceId = null, referralToken = null) {
  Object.assign(systemInfo, { deviceId: deviceId });
  axios.default
    .post<Response<Devices>>(`${backendApi}/devices`, systemInfo, {
      headers: {
        'X-Client-Version': `platform/ ${app.getVersion()}`
      }
    })
    .then((response) => {
      logIntoPlatform(LOG_TYPE.NEP, 'Device registration response: ' + JSON.stringify(response.data));
      DEVICE_TOKEN = response.data.data.jwt;
      if (referralToken != null) {
        sendReferralToken(referralToken, response.data.data.jwt);
      }
      console.log('DATA HERE', response.data);
      if (response.data.success && response.data.data.active) {
        saveDeviceTokenFromDeviceResponse(DEVICE_TOKEN);
        console.log('settingsHelper.get().deviceToken', settingsHelper.get().deviceToken);
        pushyService.pushyRegister();
        platformWindow = createPlatformWindow();
        initializePlatformServices(platformWindow);
      } else {
        createActivationCodeWindow();
      }
    })
    .catch((error) => {
      logIntoPlatform(LOG_TYPE.NEP, `Error: ${JSON.stringify(error)}`);
      console.log('Error: ', error);
      const options = {
        title: 'Error',
        message: error.name,
        detail: error.message
      };
      dialog.showMessageBox(null, options);
    });
}

function sendReferralToken(referralToken: string, deviceToken: string) {
  logIntoPlatform(LOG_TYPE.NEP, 'Send referral token ' + referralToken + ' and device token ' + deviceToken);
  axios.default
    .post<Response<any>>(
      `${backendApi}/referral-program`,
      { referralToken, deviceToken },
      {
        headers: {
          'X-Client-Version': `platform/ ${app.getVersion()}`
        }
      }
    )
    .then((res) => {
      logIntoPlatform(LOG_TYPE.NEP, `Response: ${JSON.stringify(res)}`);
    })
    .catch((error) => {
      logIntoPlatform(LOG_TYPE.NEP, `Error: ${JSON.stringify(error)}`);
    });
}

function getFileNameFromPath(path: string): string {
  const regularExpression = /[^\\/:*?"<>|\r\n]+$/g;
  return regularExpression.exec(path)[0];
}

function parseTokenFromFileName(filename: string): string {
  logIntoPlatform(LOG_TYPE.NEP, 'Filename ' + filename);
  const prephrase = 'token=';
  const postphrase = '.exe';
  const startIndex = filename.indexOf(prephrase) + prephrase.length;
  return filename.substring(startIndex, filename.indexOf(postphrase, startIndex));
}

function parseDeviceIdFromFileName(filename: string) {
  logIntoPlatform(LOG_TYPE.NEP, 'Filename ' + filename);
  const prePhrase = 'deviceId=';
  let postPhrase = '.exe';
  if (filename.includes('(')) {
    postPhrase = '(';
  }
  const startIndex = filename.indexOf(prePhrase) + prePhrase.length;
  return filename.substring(startIndex, filename.indexOf(postPhrase, startIndex));
}

function sendDeviceSystemInfoToBackend(systemInfo) {
  logIntoPlatform(
    LOG_TYPE.SYSTEM_ANALYZER,
    'Sending device system info to backend: \n device token:' +
      settings.deviceToken +
      '\n system info: ' +
      JSON.stringify(systemInfo)
  );
  console.log('HERE IS SYSTEM INFO =', nullValuesValidation(systemInfo));

  axios.default
    .post<Response<any>>(`${backendApi}/devices/me/system-info`, nullValuesValidation(systemInfo), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Device ' + settings.deviceToken,
        'X-Client-Version': `platform/ ${app.getVersion()}`
      }
    })
    .then((response) => {
      logIntoPlatform(LOG_TYPE.SYSTEM_ANALYZER, 'Saved system info: ' + JSON.stringify(response.data.data));
      platformWindow.webContents.send('system-info-ready');
    })
    .catch((error) => logIntoPlatform(LOG_TYPE.ERROR, 'Failed to send device system info to backend: ' + error));
}

function saveDeviceTokenFromDeviceResponse(token) {
  const deviceToken = token;
  console.log('New device token generated: ' + deviceToken);
  settings.deviceToken = deviceToken;
  logIntoPlatform(
    LOG_TYPE.INFO,
    `settings before saving settings inside saveDeviceTokenFromDeviceResponse ${JSON.stringify(settings)}`
  );
  settingsHelper.save(settings);
  logIntoPlatform(
    LOG_TYPE.INFO,
    `settings after saving settings inside saveDeviceTokenFromDeviceResponse ${JSON.stringify(settings)}`
  );
}

/** extra func */

function initializePlatformServices(platformWindow) {
  autoUpdaterService.checkForPlatformUpdate();
  renderers = [platformWindow.webContents];
  miningService = new MiningService(systemNotification);
  authService = new AuthService(settings, settingsHelper, renderers);
  arkaneAuth = new ArkaneAuth(settings, settingsHelper, renderers);
  balancePoller = new BalancePollerService(settings, renderers, authService);

  systemAnalyzer
    .getSystemInfo()
    .then((systemInfo) => {
      platformWindow.webContents.send('get-system-info', systemInfo);
      sendDeviceSystemInfoToBackend(systemInfo);
    })
    .catch((error) => {
      logIntoPlatform(LOG_TYPE.ERROR, 'Failed to retrieve device system info: ' + error);
    });
}

function createPlatformWindow(page = '') {
  console.log('Opening new platform window');
  const window = new BrowserWindow(BROWSER_WINDOW_CONFIGURATION);

  window.loadURL(getIndexPath() + '#' + page);

  electronLocalshortcut.register(window, 'F12', () => {
    window.webContents.openDevTools({ mode: 'undocked' });
  });

  window.webContents.on('did-finish-load', () => {
    logIntoPlatform(LOG_TYPE.INFO, 'Platform window finished loading.');
    activationBrowserWindow?.close();
    pushyService.Pushy.listen();
  });

  systemNotification.showOkSystemNotification('Check out Gaimin Platform APP', () => {
    platformWindow.show();
    platformWindow.focus();
  });

  window.on('close', (event) => {
    platformWindow.hide();
    if (!isApplicationQuiting) {
      event.preventDefault();
    }
  });

  pushyService.Pushy.setNotificationListener((data) => {
    window.webContents.send('notification', data);
  });

  pushyService.pushySubscribeTopic();
  tray = createTray(window);

  setInterval(() => {
    if (!authService.isLoggedIn()) {
      systemNotification.showOkCancelSystemNotification(
        'You still have not created your Gaimin account. Click here to do it now.',
        () => {
          platformWindow.show();
          platformWindow.focus();
          authService.explicitLogin();
          arkaneAuth
            .explicitLoginArkane()
            .then((result) => logIntoConsole(LOG_TYPE.AUTH, 'explicitLogin result: ' + result))
            .catch((error) => logIntoConsole(LOG_TYPE.AUTH, 'explicitLogin error: ' + error));
        },
        () => {
          console.log('Cancel was pressed');
        }
      );
    }
  }, 1000 * 60 * 60 * 8);

  const preventAppSuspensionId = powerSaveBlocker.start('prevent-app-suspension');
  console.log('Is prevent app suspension on:', powerSaveBlocker.isStarted(preventAppSuspensionId));

  settingsHelper.autoSaveSettingsPeriodically(settings, SETTINGS_AUTOSAVE_INTERVAL_MILLIS);

  return window;
}

export function openPlatform(page) {
  if (platformWindow.isDestroyed()) {
    platformWindow = createPlatformWindow(page);
  } else {
    console.log('Restoring Platform Window');
    platformWindow.webContents.executeJavaScript("location.assign('#" + page + "');");
    platformWindow.show();
    platformWindow.focus();
  }
}

function nullValuesValidation(object) {
  return JSON.parse(
    JSON.stringify(object, (key, value) => {
      if (value === null || value === undefined) {
        return '';
      }
      return value;
    })
  );
}

function setUpSingleInstanceApp() {
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
  } else {
    app.on('second-instance', () => {
      if (platformWindow) {
        if (platformWindow.isMinimized() || platformWindow.isClosable()) {
          platformWindow.restore();
          openPlatform('profile');
        }
        platformWindow.focus();
      }
    });
  }
}

function switchOnAutoLaunch() {
  if (isWindows()) {
    const autoLaunch = new AutoLaunch({
      name: 'gaimin',
      path: app.getPath('exe')
    });

    autoLaunch.isEnabled().then((isEnabled) => {
      if (!isEnabled) {
        console.log('Autolaunch is disabled.');
        autoLaunch.enable();
      }
      console.log('Autolaunch is enabled.');
    });
  }
}

function getIndexPath() {
  return 'file://' + path.join(__dirname, '/../../dist/gaimin-platform/index.html');
}

function getInstallerName(): string {
  const fileWithInstallerName = 'gaimin_installer_name.txt';
  let appPath = app.getAppPath();
  if (!appPath.includes('gaimin-platform')) {
    logIntoPlatform(LOG_TYPE.NEP, 'Cannot get installer name! App path: ' + appPath);
    return 'Cannot get installer name! App path: ' + appPath;
  }
  appPath = appPath.substring(0, appPath.indexOf('gaimin-platform') + 'gaimin-platform'.length);
  const pathToFileWithInstallerName = appPath + '/' + fileWithInstallerName;

  if (fs.existsSync(pathToFileWithInstallerName)) {
    logIntoPlatform(LOG_TYPE.NEP, 'TXT File with installer name exists!');
    const fullInstallerName = fs.readFileSync(pathToFileWithInstallerName, 'utf8');
    const exeName = getFileNameFromPath(fullInstallerName);
    logIntoPlatform(LOG_TYPE.NEP, 'exeName ' + exeName);
    return exeName;
  } else {
    logIntoPlatform(LOG_TYPE.NEP, 'TXT File with installer name does not exist!');
    return 'TXT File with installer name does not exist!';
  }
}

/** Application events */

ipcMain.on('activation-minimize', () => {
  activationBrowserWindow.minimize();
});

ipcMain.on('activation-close', () => {
  app.quit();
});

ipcMain.on('activation-code', (event, activationCode) => {
  console.log('HERE activationCode: ', activationCode);
  axios.default
    .post<Response<any>>(
      `${backendApi}/devices/me/active`,
      { activationCode },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Device ' + DEVICE_TOKEN,
          'X-Client-Version': `platform/ ${app.getVersion()}`
        }
      }
    )
    .then((response) => {
      console.log('Response from activation code', response.data);
      if (response.data.success) {
        saveDeviceTokenFromDeviceResponse(DEVICE_TOKEN);
        console.log('settingsHelper.get().deviceToken', settingsHelper.get().deviceToken);
        pushyService.pushyRegister();
        platformWindow = createPlatformWindow();
        initializePlatformServices(platformWindow);
      } else {
        console.log('Active response is not valid!', response.data);
        activationBrowserWindow.webContents.send('activation-code-error', response.data);
      }
    })
    .catch((error) => {
      console.log('Error while sending activation code:', error);
    });
});

ipcMain.on('get-device-token', (event, arg) => {
  event.returnValue = settings.deviceToken;
});

ipcMain.on('app-version', (event, arg) => {
  event.returnValue = app.getVersion();
});

ipcMain.on('app-path', (event, arg) => {
  event.returnValue = app.getAppPath();
});

ipcMain.on('app-is-packaged', (event, arg) => {
  event.returnValue = app.isPackaged;
});

ipcMain.on('minimize-to-taskbar', () => {
  platformWindow.minimize();
});

ipcMain.on('maximize-unmaximize', (event, isMaximize: boolean) => {
  isMaximize ? platformWindow.unmaximize() : platformWindow.maximize();
});

ipcMain.on('hide-platform-window', () => {
  platformWindow.hide();
});

ipcMain.on('is-maximize', (event, arg) => {
  event.returnValue = platformWindow.isMaximized();
});

app.on('web-contents-created', (e, contents) => {
  contents.on('new-window', (e, url) => {
    e.preventDefault();
    require('open')(url);
  });
  contents.on('will-navigate', (e, url) => {
    if (url !== contents.getURL()) {
      e.preventDefault();
      require('open')(url);
    }
  });
});

app.on('before-quit', () => {
  miningService.minersQuittingFlow();

  isApplicationQuiting = true; // ??
});

app.on('quit', () => {
  console.log('Autosaving settings file on close');
  settingsHelper.save(settings);
});
