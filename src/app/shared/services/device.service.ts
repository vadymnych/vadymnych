import { AppVersionService } from './app-version.service';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, forkJoin } from 'rxjs';
import { DeviceInfo, DeviceData, Response } from '../interfaces';
import { environment } from '../../../environments/environment';
import { ElectronService } from './electron.service';
import { HeadersService } from './headers.service';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  isLogged: boolean;
  devices = [];
  isDeviceLinked: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(
    private http: HttpClient,
    private electronService: ElectronService,
    private authService: AuthService,
    private userService: UserService,
    private headersService: HeadersService,
    private appVersionService: AppVersionService
  ) {
    if (this.electronService.ipcRenderer != null) {
      this.electronService.ipcRenderer.on('system-info-ready', () => {
        this.getDeviceAll();
      });
    }
  }

  getDeviceToken(): string {
    if (this.electronService.ipcRenderer != null) {
      return this.electronService.ipcRenderer.sendSync('get-device-token');
    } else {
      console.warn('ipcRenderer is null');
      return null;
    }
  }

  getDevices(): Observable<Response<DeviceData>> {
    return this.http.get<Response<DeviceData>>(environment.gaiminApi + '/devices/me', {
      headers: this.headersService.headersDevice(),
      params: {
        withBalances: 'true',
        withSystemInfo: 'true'
      }
    });
  }

  getDeviceAll() {
    this.authService.isLoggedIn().subscribe((isLogg) => {
      this.isLogged = isLogg;
    });

    if (this.isLogged) {
      this.userService.getUserDevices().subscribe((userDevices) => (this.devices = userDevices.data));
    } else {
      this.getDevices().subscribe((device) => {
        this.devices = [device.data];
      });
    }
  }

  getDeviceInfo(): Observable<Response<DeviceInfo>> {
    return this.http.get<Response<DeviceInfo>>(`${environment.gaiminApi}/devices/me/system-info`, {
      headers: this.headersService.headersDevice()
    });
  }

  private assignDeviceToUser() {
    this.http
      .post<Response<any>>(
        `${environment.gaiminApi}/users/me/devices`,
        {
          jwt: this.getDeviceToken()
        },
        {
          headers: new HttpHeaders()
            .set('Authorization', `Bearer ${this.authService.getAccessToken()}`)
            .set('X-Client-Version', `platform/${this.appVersionService.getVersion()}`)
        }
      )
      .subscribe((response) => {
        if (response.success) {
          console.log('Device successfully assigned to user');
        } else {
          if (response.error?.description === 'The device is already assigned to another user!') {
            this.isDeviceLinked.next(false);
          }
        }
      });
  }

  isDeviceLinkedToUser() {
    forkJoin(this.getDeviceInfo(), this.userService.getUserDevices(false)).subscribe(([deviceInfo, deviceList]) => {
      const deviceId = deviceInfo.data.deviceId ? deviceInfo.data.deviceId : null;
      const currentDevice = deviceList.data.find((obj) => {
        return obj.device.id == deviceId;
      });
      if (!currentDevice) {
        this.assignDeviceToUser();
      } else {
        this.isDeviceLinked.next(true);
      }
    });
  }
}
