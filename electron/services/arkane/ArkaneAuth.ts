import { TokenResponse } from '@openid/appauth/built/token_response';
import { AuthFlow, AuthStateEmitter } from './flow';
import { GaiminSettingsHelper } from '../settings.service';
import { ipcMain, WebContents } from 'electron';
import * as axios from 'axios';
import { platformWindow } from '../../main';
import { GaiminSettings, LOG_TYPE } from '../../tools/interfaces';
import { logIntoConsole } from '../../tools/logger';
import * as http from 'http';

export class ArkaneAuth {
  authFlow = new AuthFlow();
  tokenResponse: TokenResponse;
  tokenTime = null;
  server;

  constructor(
    private gaiminSettings: GaiminSettings,
    private gaiminSettingsHelper: GaiminSettingsHelper,
    private renderers: WebContents[]
  ) {
    this.authFlow.authStateEmitter.on(AuthStateEmitter.ON_ARKANE_TOKEN_RESPONSE, () => {
      console.log('Successfully signed in user in Venly');

      console.log('Send login-success to renderers');
      this.sendToRenderers('arkane-login-success');
    });

    ipcMain.on('arkane-login', (event, arg) => {
      this.explicitLoginArkane()
        .then((result) => logIntoConsole(LOG_TYPE.AUTH, 'explicitLogin result: ' + result))
        .catch((error) => logIntoConsole(LOG_TYPE.AUTH, 'explicitLogin error: ' + error));
    });

    ipcMain.on('arkane-logout', (event, arg) => {
      this.authFlow.signOut();

      this.gaiminSettings.arkaneRefreshToken = null;
      this.gaiminSettingsHelper.save(this.gaiminSettings);
      this.tokenResponse = null;
      this.tokenTime = null;

      this.sendToRenderers('arkane-logout');
    });

    ipcMain.on('arkane-access-token', (event, arg) => {
      this.getAccessToken()
        .then((token) => (event.returnValue = token))
        .catch((error) => console.error(error));
    });

    ipcMain.on('arkane-manage-wallets', () => {
      console.log('arkane-manage-wallets');
      this.server = this.createServer();
    });

    ipcMain.on('arkane-transfer-nfts', () => {
      console.log('success-transfer-nfts');
      this.server = this.createServer();
    });

    ipcMain.on('arkane-transfer-token', () => {
      console.log('success-transfer-token');
      this.server = this.createServer();
    });
  }

  getAccessToken(): Promise<string> {
    const now = new Date().getTime() / 1000;
    if (this.tokenResponse != null && this.tokenTime != null && now < this.tokenTime + this.tokenResponse.expiresIn) {
      return Promise.resolve(this.tokenResponse.accessToken);
    } else {
      console.log('Arkane access token is expired. Refreshing the token.');
      return this.authFlow
        .performWithFreshTokens()
        .then((token) => {
          this.tokenResponse = token;
          this.tokenTime = new Date().getTime() / 1000;

          if (this.gaiminSettings.arkaneRefreshToken == null) {
            this.gaiminSettings.arkaneRefreshToken = token.refreshToken;
            this.gaiminSettingsHelper.save(this.gaiminSettings);
          }
          return Promise.resolve(token.accessToken);
        })
        .catch((error) => Promise.reject('Failed to get access token from refresh token! ' + error));
    }
  }

  explicitLoginArkane(): Promise<any> {
    // We have to close the listener before the new login attempt if the previous attempt failed.
    return axios.default
      .get('http://localhost:8000/?code=close-listener')
      .then(() => {
        return Promise.resolve('Listener has been closed.');
      })
      .catch(() => {
        return Promise.reject("Listener doesn't exists.");
      })
      .finally(() => {
        return this.authFlow.fetchServiceConfiguration().then(() => this.authFlow.makeAuthorizationRequest());
      });
  }

  implicitLogin(): Promise<any> {
    if (this.gaiminSettings.arkaneRefreshToken) {
      console.log('Refresh token is present.');
      const refreshToken = this.gaiminSettings.arkaneRefreshToken;
      console.log('Using refresh token from settings: ' + refreshToken);
      this.authFlow.setRefreshToken(refreshToken);

      return this.authFlow
        .fetchServiceConfiguration()
        .then(() => {
          return this.authFlow.performWithFreshTokens();
        })
        .then((result) => {
          console.log('perform Arkane WithFresh Tokens response:', result);
        })
        .then((response) => {
          console.log(response);
          this.sendToRenderers('arkane-login-success');
        })
        .catch((error) => console.error(error));
    }

    return Promise.resolve();
  }

  isLoggedIn(): boolean {
    return this.authFlow.loggedIn();
  }

  private sendToRenderers(event: string, arg = null) {
    this.renderers.forEach((renderer) => {
      if (!renderer.isDestroyed()) {
        renderer.send(event, arg);
      }
    });
  }

  createServer() {
    const server = http
      .createServer((req, res) => {
        let responseUrl;

        res.end('You can continue to use the Gaimin app.');

        axios.default.get('http://localhost:8000/?status=SUCCESS').then(() => {
          responseUrl = JSON.stringify(req.url);

          if (responseUrl.includes('transactionHash')) {
            platformWindow.webContents.send('success-transfer-nfts');
          } else {
            platformWindow.webContents.send('success-manage-wallet');
          }
          server.close();
        });
      })
      .listen(8000);

    console.log('Server with port 8000 created.');
    return server;
  }
}
