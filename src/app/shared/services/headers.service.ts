import { ElectronService } from './electron.service';
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppVersionService } from './app-version.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HeadersService {
  deviceToken;
  accessToken;

  constructor(
    private appVersionService: AppVersionService,
    private electronService: ElectronService,
    private authService: AuthService
  ) {
    if (this.electronService.ipcRenderer != null) {
      this.deviceToken = this.electronService.ipcRenderer.sendSync('get-device-token');
      this.authService.isLoggedIn().subscribe((isLoggedIn) => {
        if (isLoggedIn) {
          this.accessToken = this.electronService.ipcRenderer.sendSync('access-token');
        }
      });
    }
  }

  headersUser() {
    return new HttpHeaders()
      .set('Authorization', `Bearer ${this.accessToken}`)
      .set('X-Client-Version', `platform ${this.appVersionService.getVersion()}`);
  }

  headersDevice() {
    return new HttpHeaders()
      .set('Authorization', `Device ${this.deviceToken}`)
      .set('X-Client-Version', `platform/${this.appVersionService.getVersion()}`);
  }

  appVersion() {
    return new HttpHeaders().set('X-Client-Version', `platform/${this.appVersionService.getVersion()}`);
  }
}
