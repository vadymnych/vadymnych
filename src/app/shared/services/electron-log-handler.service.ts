import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';

@Injectable({ providedIn: 'root' })
export class ElectronLogHandler {
  private loggerCounter: number = 0;
  private readonly SKIP_LOG_COUNT = 3;

  constructor(private electronService: ElectronService) {
    if (this.electronService.ipcRenderer != null) {
      this.electronService.ipcRenderer.on('electron-log', (event, args) => {
        if (args.includes('SYSTEM_UTILITY')) {
          console.log('%cElectron log: ' + args, 'color: #ff0000');
        } else if (args.includes('BALANCE_POLLER')) {
          this.balanceLoggerCounter(args);
        } else {
          console.log('%cElectron log: ' + args, 'color: #3437eb');
        }
      });
    }
  }

  private balanceLoggerCounter(args) {
    this.loggerCounter++;
    if (this.loggerCounter <= this.SKIP_LOG_COUNT) {
      return;
    } else {
      this.loggerCounter = 0;
      console.log('%cElectron log: ' + args, 'color: #3437eb');
    }
  }
}
