import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppVersionService } from './app-version.service';
import { AuthService } from './auth.service';
import { HeadersService } from './headers.service';
import { Response, WithdrawalData, MakeWithdrawal } from '../interfaces';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WithdrawalService {
  withdrawalIn: BehaviorSubject<WithdrawalData[]> = new BehaviorSubject<WithdrawalData[]>([]);

  get withdrawalObserver(): Observable<WithdrawalData[]> {
    return this.withdrawalIn.asObservable();
  }

  isPending: boolean = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private headersService: HeadersService,
    private appVersionService: AppVersionService
  ) {}

  getUserWithdrawals() {
    return this.http
      .get<Response<WithdrawalData[]>>(environment.gaiminApi + '/users/me/withdrawal')
      .subscribe((response) => {
        if (response.success) {
          this.withdrawalIn.next(response.data);
          this.isPending = false;
          response.data.map((response) => {
            if (response.status === 'PENDING_EMAIL_VERIFICATION') {
              this.isPending = true;
            }
          });
        }
      });
  }

  getMinimumWithdrawalAmount(currency: string): Observable<Response<number>> {
    return this.http.get<Response<number>>(environment.gaiminApi + '/withdrawal/minimum-amount?currency=' + currency, {
      headers: this.headersService.headersDevice()
    });
  }

  makeWithdrawal(data: MakeWithdrawal): Observable<Response<WithdrawalData[]>> {
    return this.http.post<Response<WithdrawalData[]>>(environment.gaiminApi + '/users/me/withdrawal', data);
  }

  cancelWithdrawal(): Observable<Response<WithdrawalData[]>> {
    return this.http.post<Response<WithdrawalData[]>>(environment.gaiminApi + '/users/me/withdrawal/cancel-all', {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.authService.getAccessToken()}`)
        .set('X-Client-Version', `platform/${this.appVersionService.getVersion()}`)
    });
  }
}
