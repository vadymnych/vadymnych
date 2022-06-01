import { app, ipcMain } from 'electron';
import { checkingForMining } from '../tools/tray';
import { platformWindow, tray } from '../main';
import * as path from 'path';
import * as fs from 'fs';
import * as electronDl from 'electron-dl';
import { SystemNotification } from './system-notification.service';
import { exec } from 'child_process';
import { LOG_TYPE } from '../tools/interfaces';
import { logIntoPlatform } from '../tools/logger';
import { turnOffSystemStatusUtilityInfo, turnOnSystemStatusUtilityInfo } from '../tools/system-analyzer';

const DecompressZip = require('decompress-zip');

export class MiningService {
  private miningStatus = {
    GPU: {
      isMining: true
    },
    CPU: {
      isMining: false
    }
  };

  private archiveAddress: string;
  private isMiningOn: boolean;

  constructor(private systemNotification: SystemNotification) {
    this.miningEventListener();

    setInterval(() => {
      if (!this.isMiningOn) {
        systemNotification.showOkCancelSystemNotification(
          'Click OK. To reactivate your passive monetization.',
          () => {
            platformWindow.show();
            platformWindow.focus();
          },
          () => {
            console.log('Cancel was pressed');
          }
        );
      }
    }, 1000 * 60 * 60 * 4);
  }

  private miningEventListener() {
    ipcMain.on('mining-enabled', (event, arg) => {
      this.isMiningOn = true;
      logIntoPlatform(LOG_TYPE.MINER, 'Mining enabled event');
      this.systemNotification.showOkSystemNotification(`${arg} monetization started`, null);
      this.miningStatus[arg].isMining = true;
      checkingForMining(tray, this.miningStatus);
      turnOnSystemStatusUtilityInfo();

      platformWindow.webContents.send('mining-enabled', arg);
    });

    ipcMain.on('mining-disabled', (event, arg) => {
      this.isMiningOn = false;
      logIntoPlatform(LOG_TYPE.MINER, 'Mining disabled event');
      this.miningStatus[arg].isMining = false;
      turnOffSystemStatusUtilityInfo();
      checkingForMining(tray, this.miningStatus);

      platformWindow.webContents.send('mining-disabled', arg);
    });

    ipcMain.on('miner-download', (event, args) => {
      const exePath = path.dirname(app.getPath('exe'));
      const minersArchivePath = exePath + '\\miners.zip';

      let minersDownloadLink = 'https://storage.googleapis.com/gaimin_miners_prod/miners.zip';
      if (args != null) {
        minersDownloadLink = args;
      }
      logIntoPlatform(LOG_TYPE.MINER, 'Miners download link ' + minersDownloadLink);

      if (fs.existsSync(minersArchivePath)) {
        logIntoPlatform(LOG_TYPE.MINER, 'miners.zip is exist ' + minersArchivePath);
        this.unZipArchive(minersArchivePath, exePath);
      } else {
        electronDl
          .download(platformWindow, minersDownloadLink, { directory: exePath })
          .then((downloadItem) => {
            this.archiveAddress = downloadItem.getSavePath();
            this.unZipArchive(this.archiveAddress, exePath);
          })
          .catch((err) => {
            console.log('Error while downloading miners', err);
            logIntoPlatform(LOG_TYPE.ERROR, 'Error while downloading miners ' + JSON.stringify(err));
            platformWindow.webContents.send('install-miners-error', this.archiveAddress);
          });
      }
    });
  }

  private unZipArchive(archivePath: string, unArchiveFolder: string) {
    const unZipper = new DecompressZip(archivePath);
    unZipper.extract({ path: unArchiveFolder });

    unZipper.on('extract', () => {
      console.log('Extract finished');
      platformWindow.webContents.send('install-miners-complete', this.archiveAddress);
    });

    unZipper.on('error', () => {
      platformWindow.webContents.send('install-miners-error', this.archiveAddress);
    });
  }

  private deleteFolder() {
    if (this.archiveAddress != null) {
      logIntoPlatform(LOG_TYPE.MINER, 'Delete file by ' + path + ' path');
      fs.unlink(this.archiveAddress, (err) => {
        if (err) {
          logIntoPlatform(LOG_TYPE.MINER, 'Error while deleting file by ' + path + ' path');
          console.log('Error while deleting zip file', err);
        }
        logIntoPlatform(LOG_TYPE.MINER, 'Successfully deleted file by ' + path + ' path');
      });
    }
  }

  private killAllMiningProcess() {
    const minerNames = ['gminer.exe', 'phoenix.exe', 'trex.exe'];
    minerNames.forEach((el) => {
      exec(`taskkill /IM "${el}" /T /F`);
    });
  }

  minersQuittingFlow() {
    this.deleteFolder();
    this.killAllMiningProcess();
  }
}
