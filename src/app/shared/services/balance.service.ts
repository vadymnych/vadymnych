import { AppVersionService } from './app-version.service';
import { HeadersService } from 'src/app/shared/services/headers.service';
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, interval, Observable, Subscription } from 'rxjs';
import { AuthService } from './auth.service';
import { Response, Amount, BalanceResponse, BalancePaid, BalanceUnpaid } from '../interfaces';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MiningApiService } from './miner-services/miner-api.service';
import { ElectronService } from './electron.service';

@Injectable({ providedIn: 'root' })
export class BalanceService {
  private readonly REFRESH_UNPAID_BALANCE_INTERVAL = 1000 * 60 * 15;
  private isLoggedIn: boolean;
  private subIntervals: Subscription[] = [];

  public paidBalance$: BehaviorSubject<Amount> = new BehaviorSubject<Amount>({
    USDT20: 0,
    GMRX: 0
  } as Amount);

  public unpaidBalance$: BehaviorSubject<Amount> = new BehaviorSubject<Amount>({
    USDT20: 0,
    GMRX: 0
  } as Amount);

  constructor(
    private authService: AuthService,
    private electronService: ElectronService,
    private http: HttpClient,
    private ngZone: NgZone,
    private miningApiService: MiningApiService,
    private headersService: HeadersService,
    private appVersionService: AppVersionService
  ) {
    this.authService.isLoggedIn().subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });

    if (this.electronService.ipcRenderer != null) {
      /** Don`t need to set unpaid balance value every 5 seconds, because unpaid the counter works approximately */
      this.electronService.ipcRenderer.on('device-balance', (event, deviceBalance: BalanceResponse) => {
        if (!this.isLoggedIn) {
          this.paidBalance$.next(deviceBalance.paid);
        }
      });

      this.electronService.ipcRenderer.on('user-balance', (event, userBalance: BalanceResponse) => {
        if (this.isLoggedIn) {
          this.paidBalance$.next(userBalance.paid);
        }
      });
    }

    setInterval(() => {
      this.refreshUnpaidBalance();
    }, this.REFRESH_UNPAID_BALANCE_INTERVAL);

    this.miningApiService.miningHashRate$.subscribe((hashRate) => {
      const numberHash = Number.parseInt(hashRate);
      if (numberHash > 0) {
        this.turnOnUnpaidIterator();
      } else {
        this.turnOffUnpaidIterator();
      }
    });
  }

  private turnOnUnpaidIterator() {
    if (this.subIntervals.length < 1) {
      this.subIntervals.push(
        interval(150).subscribe(() => {
          this.ngZone.run(() => {
            let iterateBalanceUSDT = this.unpaidBalance$.getValue().USDT20;
            iterateBalanceUSDT += 0.00000000001;
            this.unpaidBalance$.next({ USDT20: iterateBalanceUSDT, GMRX: this.unpaidBalance$.getValue().GMRX });
          });
        })
      );
    }
  }

  private turnOffUnpaidIterator() {
    this.subIntervals.forEach((sub) => {
      sub.unsubscribe();
    });
    this.subIntervals = [];
  }

  /** Refresh balance */

  refreshBalances() {
    this.refreshPaidBalance();
    this.refreshUnpaidBalance();
  }

  refreshPaidBalance() {
    if (this.isLoggedIn) {
      this.getUserBalancePaid().subscribe((response) => {
        if (response.success) {
          this.paidBalance$.next(response.data.paid);
        }
      });
    } else {
      this.getDeviceBalancePaid().subscribe((response) => {
        if (response.success) {
          this.paidBalance$.next(response.data.paid);
        }
      });
    }
  }

  private refreshUnpaidBalance() {
    if (this.isLoggedIn) {
      this.getUserBalanceUnpaid().subscribe((response) => {
        if (response.success) {
          this.unpaidBalance$.next(response.data.unpaid);
        }
      });
    } else {
      this.getDeviceBalanceUnpaid().subscribe((response) => {
        if (response.success) {
          this.unpaidBalance$.next(response.data.unpaid);
        }
      });
    }
  }

  /** Device balance requests */

  private getDeviceBalanceUnpaid(): Observable<Response<BalanceUnpaid>> {
    return this.http.get<Response<BalanceUnpaid>>(`${environment.gaiminApi}/devices/me/balance/unpaid`, {
      headers: this.headersService.headersDevice()
    });
  }

  private getDeviceBalancePaid(): Observable<Response<BalancePaid>> {
    return this.http.get<Response<BalancePaid>>(`${environment.gaiminApi}/devices/me/balance/paid`, {
      headers: this.headersService.headersDevice()
    });
  }

  /** User balance requests */

  private getUserBalanceUnpaid(): Observable<Response<BalanceUnpaid>> {
    return this.http.get<Response<BalanceUnpaid>>(`${environment.gaiminApi}/users/me/balance/unpaid`, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.authService.getAccessToken()}`)
        .set('X-Client-Version', `platform/${this.appVersionService.getVersion()}`)
    });
  }

  private getUserBalancePaid(): Observable<Response<BalancePaid>> {
    return this.http.get<Response<BalancePaid>>(`${environment.gaiminApi}/users/me/balance/paid`, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.authService.getAccessToken()}`)
        .set('X-Client-Version', `platform/${this.appVersionService.getVersion()}`)
    });
  }
}
