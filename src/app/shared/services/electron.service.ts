import { Injectable } from '@angular/core';
import { ipcRenderer, shell } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';

/** Notes :
 * A NodeJS's dependency imported with 'window.require' MUST BE present in `dependencies` package.json`
 in order to make it work here in Electron's Renderer process (src folder)
 because it will loaded at runtime by Electron.
 * A NodeJS's dependency imported with TS module import (ex: import { Dropbox } from 'dropbox') CAN only be present
 in `dependencies` of `package.json (root folder)` because it is loaded during build phase and does not need to be
 in the final bundle. Reminder : only if not used in Electron's Main process (app folder)
 If you want to use a NodeJS 3rd party deps in Renderer process. */

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  readonly ipcRenderer: typeof ipcRenderer;
  readonly isPackaged: boolean;
  readonly appPath: string;
  readonly process: typeof process;
  readonly isWindows: boolean;
  readonly path: typeof path;
  readonly fs: typeof fs;
  readonly childProcess: typeof childProcess;
  readonly shell: typeof shell;

  constructor() {
    if (this.isElectronApp) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.isPackaged = ipcRenderer.sendSync('app-is-packaged');
      this.appPath = ipcRenderer.sendSync('app-path');
      this.process = window.require('process');
      this.isWindows = process.platform === 'win32';
      this.path = window.require('path');
      this.fs = window.require('fs');
      this.childProcess = window.require('child_process');
      this.shell = window.require('electron').shell;
    }
  }

  get isElectronApp(): boolean {
    return !!(window && window.process && window.process.type);
  }
}
