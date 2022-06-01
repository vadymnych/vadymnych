import { TokenResponse } from '@openid/appauth/built/token_response';
import { AuthFlow, AuthStateEmitter } from './flow';
import { GaiminSettingsHelper } from '../settings.service';
import { app, ipcMain, WebContents } from 'electron';
import * as axios from 'axios';
import { Response, GaiminSettings, LOG_TYPE } from '../../tools/interfaces';
import * as environmentService from '../../tools/environment';
import { logIntoConsole, logIntoPlatform } from '../../tools/logger';

const backendApi = environmentService.getGaiminApi();

export class AuthService {
  authFlow = new AuthFlow();
  tokenResponse: TokenResponse;
  tokenTime = null;

  constructor(
    private settings: GaiminSettings,
    private gaiminSettingsHelper: GaiminSettingsHelper,
    private renderers: WebContents[]
  ) {
    this.authFlow.authStateEmitter.on(AuthStateEmitter.ON_TOKEN_RESPONSE, () => {
      console.log('Successfully signed in user in OKTA');

      console.log('Send login-success to renderers');
      this.sendToRenderers('login-success');
    });

    ipcMain.on('login', (event, arg) => {
      this.explicitLogin()
        .then((result) => logIntoConsole(LOG_TYPE.AUTH, 'explicitLogin result: ' + result))
        .catch((error) => logIntoConsole(LOG_TYPE.AUTH, 'explicitLogin error: ' + error));
    });

    ipcMain.on('logout', (event, arg) => {
      this.authFlow.signOut();

      this.settings.oktaRefreshToken = null;
      this.gaiminSettingsHelper.save(this.settings);
      this.tokenResponse = null;
      this.tokenTime = null;

      this.sendToRenderers('logout');
    });

    ipcMain.on('access-token', (event, arg) => {
      this.getAccessToken()
        .then((token) => (event.returnValue = token))
        .catch((error) => console.error(error));
    });
  }

  getAccessToken(): Promise<string> {
    const now = new Date().getTime() / 1000;
    if (this.tokenResponse != null && this.tokenTime != null && now < this.tokenTime + this.tokenResponse.expiresIn) {
      return Promise.resolve(this.tokenResponse.accessToken);
    } else {
      console.log('Access token is expired. Refreshing the token.');
      return this.authFlow
        .performWithFreshTokens()
        .then((token) => {
          this.tokenResponse = token;
          this.tokenTime = new Date().getTime() / 1000;

          if (this.settings.oktaRefreshToken == null) {
            this.settings.oktaRefreshToken = token.refreshToken;
            logIntoPlatform(LOG_TYPE.INFO, `inside getAccess token ${JSON.stringify(this.settings)}`);
            this.gaiminSettingsHelper.save(this.settings);
          }
          return Promise.resolve(token.accessToken);
        })
        .catch((error) => Promise.reject('Failed to get access token from refresh token! ' + error));
    }
  }

  explicitLogin(): Promise<any> {
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
    if (this.settings.oktaRefreshToken) {
      console.log('Refresh token is present.');
      const refreshToken = this.settings.oktaRefreshToken;
      console.log('Using refresh token from settings: ' + refreshToken);
      this.authFlow.setRefreshToken(refreshToken);

      return this.authFlow
        .fetchServiceConfiguration()
        .then(() => {
          return this.authFlow.performWithFreshTokens();
        })
        .then((result) => {
          console.log('perform Okta WithFresh Tokens response:', result);
        })
        .then((response) => {
          console.log(response);
          this.sendToRenderers('login-success');
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
}
