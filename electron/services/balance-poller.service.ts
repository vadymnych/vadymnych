import { app, WebContents } from 'electron';
import { interval } from 'rxjs';
import { getGaiminApi } from '../tools/environment';
import * as axios from 'axios';
import { AuthService } from './okta/auth';
import { BalanceResponse, GaiminSettings, LOG_TYPE, Response } from '../tools/interfaces';
import { logIntoConsole, logIntoPlatform } from '../tools/logger';

export class BalancePollerService {
  private readonly backendApi = getGaiminApi();

  constructor(
    private gaiminSettings: GaiminSettings,
    private renderers: WebContents[],
    private authService: AuthService
  ) {
    this.poll();
  }

  private poll(): void {
    interval(15000).subscribe((i) => {
      this.updateDeviceBalance();
      this.updateUserBalance();
    });
  }

  private updateDeviceBalance() {
    if (this.gaiminSettings.deviceToken != null) {
      axios.default
        .get<Response<BalanceResponse>>(`${this.backendApi}/devices/me/balance`, {
          headers: {
            Authorization: `Device ${this.gaiminSettings.deviceToken}`,
            'X-Client-Version': `platform/ ${app.getVersion()}`
          }
        })
        .then((response) => {
          if (response.data.success) {
            this.sendToRenderers('device-balance', response.data.data);
            logIntoPlatform(LOG_TYPE.BALANCE_POLLER, 'Device balance: ' + JSON.stringify(response.data.data));
          } else {
            logIntoPlatform(
              LOG_TYPE.BALANCE_POLLER,
              'Updated device balance error: ' + JSON.stringify(response.data.data)
            );
          }
        })
        .catch((error) => logIntoPlatform(LOG_TYPE.BALANCE_POLLER, 'Failed to get device balance: ' + error));
    } else {
      logIntoPlatform(
        LOG_TYPE.BALANCE_POLLER,
        'Updated device balance error, device token is: ' + JSON.stringify(this.gaiminSettings.deviceToken)
      );
    }
  }

  private updateUserBalance() {
    if (this.authService.isLoggedIn()) {
      this.authService
        .getAccessToken()
        .then((accessToken) => {
          if (accessToken != null) {
            axios.default
              .get<Response<BalanceResponse>>(`${this.backendApi}/users/me/balance`, {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'X-Client-Version': `platform/ ${app.getVersion()}`
                }
              })
              .then((response) => {
                if (response.data.success) {
                  this.sendToRenderers('user-balance', response.data.data);
                  logIntoPlatform(LOG_TYPE.BALANCE_POLLER, 'User balance: ' + JSON.stringify(response.data.data));
                } else {
                  logIntoPlatform(
                    LOG_TYPE.BALANCE_POLLER,
                    'Updated user balance error: ' + JSON.stringify(response.data.error)
                  );
                }
              });
          } else {
            logIntoPlatform(
              LOG_TYPE.BALANCE_POLLER,
              'Updated user balance error, access token is: ' + JSON.stringify(accessToken)
            );
          }
        })
        .catch((error) => logIntoPlatform(LOG_TYPE.BALANCE_POLLER, 'Failed to get user balance: ' + error));
    } else {
      logIntoConsole(LOG_TYPE.BALANCE_POLLER, 'Cannot update user balance, isLoggedIn = false.');
    }
  }

  private sendToRenderers(event: string, arg: any) {
    this.renderers.forEach((renderer) => {
      if (!renderer.isDestroyed()) {
        renderer.send(event, arg);
      }
    });
  }
}
