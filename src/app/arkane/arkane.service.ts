import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable, Subscription, timer } from 'rxjs';
import { WalletsResponse } from '../shared/interfaces';
import { switchMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';
import { AuthService } from '../shared/services/auth.service';
import { ElectronService } from '../shared/services/electron.service';

@Injectable({
  providedIn: 'root'
})
export class ArkaneService {
  private accessToken: any;
  loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  wallets: WalletsResponse;
  tokens;
  nfts;
  nft;
  activities;
  manageWalletUrl: string;
  walletId;
  chainBase64 = Buffer.from('{"chain":"matic"}').toString('base64');

  wallets$: Subscription;
  tokens$: Subscription;
  nfts$: Subscription;
  activities$: Subscription;

  timerSubscription: Subscription;
  refreshTime = {
    seconds: 0,
    minutes: 0,
    hours: 0
  };

  constructor(
    private electronService: ElectronService,
    private http: HttpClient,
    private authService: AuthService,
    private toastrService: ToastrService,
    private router: Router
  ) {
    localStorage.removeItem('walletAddress');

    if (this.electronService.ipcRenderer != null) {
      this.electronService.ipcRenderer.on('arkane-login-success', () => {
        console.log('\x1b[35mAuthentication on Venly successful!');
        this.loggedIn.next(true);
        this.getData();
      });
    }

    this.electronService.ipcRenderer.on('success-manage-wallet', () => {
      console.log('Success manage wallets');
      this.toastrService.success('Wallet data refreshed.');
      this.getData();
    });

    this.electronService.ipcRenderer.on('success-transfer-nfts', () => {
      console.log('Success transfer nfts');
      this.toastrService.success('Transferred successfully.');
      this.router.navigateByUrl('/wallet');
      this.getData();
    });
  }

  geAccestoken() {
    if (!this.loggedIn.value) {
      return null;
    }
    return (this.accessToken = this.electronService.ipcRenderer.sendSync('arkane-access-token'));
  }

  getData() {
    if (this.timerSubscription !== undefined) {
      this.resetTimer();
    } else {
      this.startTimer();
    }

    return (this.wallets$ = this.getWallets()?.subscribe(async (wallets) => {
      if (wallets.result[0]) {
        this.storeActiveUserWallet(wallets.result[0].address);
        this.wallets = await wallets;
        this.walletId = await this.wallets.result[0]?.id;

        this.tokens$ = this.getTokens().subscribe((tokens) => {
          if (tokens) {
            this.tokens = tokens;
          }
        });

        this.activities$ = this.getActivities().subscribe((activities) => {
          if (activities) {
            this.activities = activities;
          }
        });

        this.nfts$ = this.getNfts().subscribe((nfts) => {
          if (nfts) {
            this.nfts = nfts;
          }
        });
      }
    }));
  }

  startTimer() {
    this.timerSubscription = timer(0, 60900)
      .pipe(switchMap(() => interval(1000)))
      .subscribe((sec) => {
        this.refreshTime.seconds = sec;
        if (this.refreshTime.seconds >= 59) {
          this.refreshTime.minutes += 1;
        }
        if (this.refreshTime.minutes > 59) {
          this.refreshTime.hours += 1;
          this.refreshTime.minutes = 0;
        }
      });
  }

  resetTimer() {
    this.timerSubscription.unsubscribe();
    this.refreshTime.seconds = 0;
    this.refreshTime.minutes = 0;
    this.refreshTime.hours = 0;
    this.startTimer();
  }

  storeActiveUserWallet(walletAddress: string) {
    let prevWalletAddress = localStorage.getItem('walletAddress');

    if (prevWalletAddress !== walletAddress) {
      this.http
        .put(
          `${environment.gaiminApi}/users/me/wallet/active`,
          { wallet: walletAddress },
          {
            headers: new HttpHeaders({
              Authorization: `Bearer ${this.authService.getAccessToken()}`
            })
          }
        )
        .subscribe((response) => {
          console.log('Active wallet', response);
        });
      localStorage.setItem('walletAddress', walletAddress);
    }
  }

  getNfts() {
    return this.connectTo(`wallets/${this.walletId}/nonfungibles`);
  }

  getTokens() {
    return this.connectTo(`wallets/${this.walletId}/balance/tokens`);
  }

  getToken(tokkenAddress) {
    return this.connectTo(`wallets/${this.walletId}/balance/tokens/${tokkenAddress}`);
  }

  getActivities(): Observable<any> {
    return this.connectTo(`wallets/${this.walletId}/events`);
  }

  destroyServices() {
    this.wallets = null;
    this.tokens = null;
    this.nfts = null;
    this.wallets$?.unsubscribe();
    this.tokens$?.unsubscribe();
    this.nfts$.unsubscribe();
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  login() {
    this.electronService.ipcRenderer.send('arkane-login');
  }

  logout() {
    if (this.timerSubscription !== undefined) {
      this.timerSubscription.unsubscribe();
    }
    this.electronService.ipcRenderer.send('arkane-logout');
    this.loggedIn.next(false);
  }

  getWallets(): Observable<any> {
    return this.connectTo('wallets');
  }

  async createLinkTo(path: string) {
    this.accessToken = this.geAccestoken();

    const bearerToken = await `bearerToken=${this.accessToken}`;
    const redirectUri = 'redirectUri=http://localhost:8000';
    const data = `data=${this.chainBase64}`;
    const url = `${environment.venlyConnect}/${path}?${redirectUri}&${bearerToken}&${data}`;

    return url;
  }

  async createLinkToTransfer(path: string, to, tokenAdress, tokenId, gasPrice, amount) {
    this.accessToken = this.geAccestoken();
    const wallet = await this.walletId;
    const from = await this.wallets.result[0].address;

    const options = Buffer.from(
      `{
      "walletId":"${wallet}",
      "gasPrice":${gasPrice},
      "gas":200000,
      "tokenId":${tokenId},
      "amount":${amount},
      "to":"${to}",
      "from":"${from}",
      "tokenAddress":"${tokenAdress}",
      "type":"MATIC_ERC721_TRANSACTION",
      "secretType":"MATIC",
      "value":0}`
    ).toString('base64');

    const bearerToken = await `bearerToken=${this.accessToken}`;
    const redirectUri = 'redirectUri=http://localhost:8000';
    const data = `data=${options}`;
    const url = `${environment.venlyConnect}/${path}?${redirectUri}&${bearerToken}&${data}`;

    return url;
  }

  async createLinkToTransferToken(path: string, value, to, tokenAdress, gasPrice) {
    this.accessToken = this.geAccestoken();
    const wallet = await this.walletId;
    const from = await this.wallets.result[0].address;

    const options = Buffer.from(
      `{
      "walletId":"${wallet}",
      "gasPrice":${gasPrice},
      "gas":200000,
      "value":${value},
      "to":"${to}",
      "from":"${from}",
      "tokenAddress":"${tokenAdress}",
      "type":"MATIC_ERC20_TRANSACTION"}`
    ).toString('base64');

    const bearerToken = await `bearerToken=${this.accessToken}`;
    const redirectUri = 'redirectUri=http://localhost:8000';
    const data = `data=${options}`;
    const url = `${environment.venlyConnect}/${path}?${redirectUri}&${bearerToken}&${data}`;

    return url;
  }

  connectTo(path) {
    if (!this.geAccestoken()) {
      return;
    }
    const url = `${environment.venlyApi}/${path}`;

    const options = {
      params: {
        data: this.chainBase64
      },
      headers: {
        Authorization: `Bearer ${this.geAccestoken()}`
      }
    };

    if (url.match('arkane')) {
      return this.http.get(url, options);
    }
  }

  fetchGasPrice() {
    return fetch('https://gasstation-mainnet.matic.network').then((response) => response.json());
  }
}
