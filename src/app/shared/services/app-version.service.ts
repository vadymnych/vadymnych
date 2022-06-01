import { Injectable } from '@angular/core';
import { ElectronService } from "./electron.service";

@Injectable( { providedIn: 'root' } )
export class AppVersionService {
  version: string;

  constructor ( private electronService: ElectronService ) {
    if ( electronService.ipcRenderer != null ) {
      this.version = this.electronService.ipcRenderer.sendSync( 'app-version' );
    }
  }

  getVersion () {
    return this.version;
  }
}
