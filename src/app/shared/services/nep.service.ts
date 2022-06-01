import { AppVersionService } from './app-version.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { Response, NepHistory, NepTotal } from '../interfaces';
import { BehaviorSubject, Observable } from 'rxjs';
import { HeadersService } from './headers.service';

@Injectable({
  providedIn: 'root'
})
export class NepService {
  nepHistoryIn: BehaviorSubject<NepHistory[]> = new BehaviorSubject<NepHistory[]>([]);

  get nepHistoryObserver(): Observable<NepHistory[]> {
    return this.nepHistoryIn.asObservable();
  }

  totalReferrals: number = 0;
  totalRewards: number = 0;
  isLogged: boolean;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private headersService: HeadersService,
    private appVersionService: AppVersionService
  ) {
    this.authService.isLoggedIn().subscribe((loggedIn) => {
      this.isLogged = loggedIn;
    });
  }

  getReferralLink(): Observable<Response<string>> {
    return this.http.get<Response<string>>(environment.gaiminApi + '/referral-program', {
      headers: this.headersService.headersDevice()
    });
  }

  getNepTotal() {
    return this.http.get<Response<NepTotal>>(environment.gaiminApi + '/users/me/balance/nep-total', {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.authService.getAccessToken()}`)
        .set('X-Client-Version', `platform/${this.appVersionService.getVersion()}`)
    });
  }

  getNepHistory() {
    this.http
      .get<Response<NepHistory[]>>(environment.gaiminApi + '/users/me/balance/nep-history', {
        headers: new HttpHeaders()
          .set('Authorization', `Bearer ${this.authService.getAccessToken()}`)
          .set('X-Client-Version', `platform/${this.appVersionService.getVersion()}`)
      })
      .subscribe((response) => {
        if (response.success) {
          this.nepHistoryIn.next(response.data);
        }
      });
  }
}
