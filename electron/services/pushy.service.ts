import { logIntoPlatform } from '../tools/logger';
import { Response, LOG_TYPE, DeviceToken } from '../tools/interfaces';
import * as axios from 'axios';
import { GaiminSettingsHelper } from './settings.service';
import { app } from 'electron';

export class PushyService {
  Pushy = require('pushy-electron');

  constructor(private settings, private settingsHelper: GaiminSettingsHelper, private backendApi) {}

  pushySubscribeTopic() {
    if (this.Pushy.isRegistered()) {
      // Subscribe the user to a topic
      this.Pushy.subscribe('gaimin-all').catch(function (err) {
        // Handle subscription errors
        console.error('Subscribe failed:', err);
      });
    }
  }

  pushyRegister() {
    this.Pushy.register({ appId: '5f69ba0d291ae40f2441f2a0' })
      .then((token) => {
        // Display an alert with device token
        console.log('PushyService device token: ' + token);

        this.settings.pushyDeviceToken = token;
        logIntoPlatform(LOG_TYPE.INFO, `inside pushyRegister ${this.settings.pushyDeviceToken}`);
        this.settingsHelper.save(this.settings);

        const registerPushyDeviceToken: DeviceToken = {
          deviceToken: token
        };

        this.pushySubscribeTopic();

        axios.default
          .post<Response<DeviceToken>>(`${this.backendApi}/devices/me/notifications`, registerPushyDeviceToken, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: this.settings.deviceToken,
              'X-Client-Version': `platform/ ${app.getVersion()}`
            }
          })
          .then((response) => console.log('PushyService device token: ' + JSON.stringify(response.data)))
          .catch((error) => console.log('Failed to register pushy device token ' + error));
      })
      .catch((err) => {
        // Display error dialog
        this.Pushy.alert(window, 'PushyService registration error: ' + err.message);
      });
  }
}
