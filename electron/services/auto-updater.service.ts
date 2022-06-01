import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { logIntoPlatform } from '../tools/logger';
import { Environment, LOG_TYPE } from '../tools/interfaces';
import * as path from 'path';
import * as fs from 'fs';
import { platformWindow } from '../main';
import { ipcMain } from 'electron';

export class AutoUpdaterService {
  private readonly CHECK_FOR_UPDATE_TIME = 1000 * 60 * 5; // 5 minutes

  constructor(private environmentService, private systemNotification) {
    autoUpdater.logger = log;
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = false;
    this.autoUpdaterEventListeners();
  }

  checkForPlatformUpdate() {
    if (
      this.environmentService.isWindows() &&
      this.environmentService.getEnvironment() !== Environment.LOCAL &&
      this.environmentService.getEnvironment() !== Environment.QA
    ) {
      logIntoPlatform(LOG_TYPE.AUTO_UPDATER, 'Checking for updates');
      autoUpdater
        .checkForUpdates()
        .then((result) => {
          logIntoPlatform(LOG_TYPE.AUTO_UPDATER, 'Update info' + JSON.stringify(result.updateInfo));
        })
        .catch((error) => {
          logIntoPlatform(LOG_TYPE.AUTO_UPDATER, 'Update error:' + JSON.stringify(error));
        });

      logIntoPlatform(
        LOG_TYPE.AUTO_UPDATER,
        `The next update check will be in ${this.CHECK_FOR_UPDATE_TIME / 60000} minutes`
      );
      setTimeout(this.checkForPlatformUpdate.bind(this), this.CHECK_FOR_UPDATE_TIME);
    }
  }

  private deleteFolderContent(directory) {
    fs.readdir(directory, (err, files) => {
      console.log('Error while reading directory');
      logIntoPlatform(LOG_TYPE.AUTO_UPDATER, 'Error while reading directory ' + err);

      for (const file of files) {
        fs.unlink(path.join(directory, file.trim().replace(/\//g, '\\\\')), (err) => {
          console.log('Error while deleting files');
          logIntoPlatform(LOG_TYPE.AUTO_UPDATER, 'Error while deleting files ' + err);
        });
      }
    });
  }

  private autoUpdaterEventListeners() {
    autoUpdater.on('checking-for-update', () => {
      logIntoPlatform(LOG_TYPE.AUTO_UPDATER, 'Checking for update event.');
    });

    autoUpdater.on('update-available', (ev, info) => {
      logIntoPlatform(LOG_TYPE.AUTO_UPDATER, 'Update available. ' + JSON.stringify(info));
      const pendingPath = `${process.env.LOCALAPPDATA}\\gaimin-platform-updater\\pending`;
      logIntoPlatform(LOG_TYPE.AUTO_UPDATER, 'Pending path ' + pendingPath);
      this.deleteFolderContent(pendingPath);
    });

    autoUpdater.on('update-not-available', (ev, info) => {
      logIntoPlatform(LOG_TYPE.AUTO_UPDATER, 'Update not available. ' + JSON.stringify(info));
    });

    autoUpdater.on('error', (ev, err) => {
      logIntoPlatform(LOG_TYPE.AUTO_UPDATER, 'Error in auto-updater. ' + JSON.stringify(err));
    });

    autoUpdater.on('update-downloaded', () => {
      logIntoPlatform(LOG_TYPE.AUTO_UPDATER, 'Update downloaded!');
      platformWindow?.webContents.send('init-update', { remind: true });
      this.systemNotification.showOkSystemNotification('New update ready to install', (res) => {
        logIntoPlatform(LOG_TYPE.AUTO_UPDATER, 'New update ready to install' + JSON.stringify(res));
      });
    });

    ipcMain.on('install-now', (event, arg) => {
      logIntoPlatform(LOG_TYPE.EVENT, 'Install now updates button clicked');
      autoUpdater.quitAndInstall(true, true);
    });
  }
}
