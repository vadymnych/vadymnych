import { AppVersionService } from './app-version.service';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  NepReferralNetwork,
  NepLevel,
  DeviceData,
  PromotionData,
  ClaimPromotionRequest,
  UserInfo,
  Response
} from '../interfaces';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { HeadersService } from './headers.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  nftData = [];
  userDataUpdated: boolean;
  profile: UserInfo;
  readonly defaultAvatarTemplate: string = './assets/icons/placeholders/default-user-image.png';

  updatePromotionInterval: ReturnType<typeof setInterval>[] = [];

  constructor(
    private http: HttpClient,
    private toastrService: ToastrService,
    private headersService: HeadersService,
    private authService: AuthService,
    private appVersionService: AppVersionService
  ) {}

  getReferralNetwork(): Observable<Response<NepReferralNetwork>> {
    return this.http.get<Response<NepReferralNetwork>>(`${environment.gaiminApi}/users/me/referral-network`, {
      headers: this.headersService.appVersion()
    });
  }

  getNepLevel(levelId): Observable<Response<NepLevel>> {
    return this.http.get<Response<NepLevel>>(`${environment.gaiminApi}/users/me/balance/nep?level=${levelId}`, {
      headers: this.headersService.appVersion()
    });
  }

  getUserDevices(details = true): Observable<Response<DeviceData[]>> {
    const params = details
      ? {
          withBalances: 'true',
          withSystemInfo: 'true'
        }
      : {};
    return this.http.get<Response<DeviceData[]>>(environment.gaiminApi + '/users/me/devices', {
      headers: this.headersService.appVersion(),
      params: params
    });
  }

  private getPromotion(): Observable<Response<PromotionData>> {
    return this.http.get<Response<PromotionData>>(`${environment.gaiminApi}/users/me/promotion`, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.authService.getAccessToken()}`)
        .set('X-Client-Version', `platform/${this.appVersionService.getVersion()}`)
    });
  }

  updatePromotionData() {
    this.getPromotion().subscribe((response) => {
      if (response.success) {
        let miningTimeH = response.data.miningTimeH;
        let rewards = response.data.rewards;
        this.nftData[0] = {
          type: 'LEGS_OF_THE_FORMICIDAE',
          imageSrc: './assets/icons/nft/nft-reward-1.jpg',
          title: 'Legs of the Formicidae',
          description: 'Careful, those ants love crawling up your pants!',
          progress: {
            maxTime: rewards.LEGS_OF_THE_FORMICIDAE,
            time: miningTimeH < rewards.LEGS_OF_THE_FORMICIDAE ? miningTimeH : rewards.LEGS_OF_THE_FORMICIDAE,
            percent: miningTimeH / rewards.LEGS_OF_THE_FORMICIDAE
          }
        };

        this.nftData[1] = {
          type: 'CHESTPLATE_OF_THE_ARTHROPOD',
          imageSrc: './assets/icons/nft/nft-reward-2.jpg',
          title: 'Chestplate of the Arthropod',
          description:
            'Do you ever get the feeling something’s crawling on your skin? With this Chestplate, that won’t happen again!',
          progress: {
            maxTime: rewards.CHESTPLATE_OF_THE_ARTHROPOD,
            time: miningTimeH < rewards.CHESTPLATE_OF_THE_ARTHROPOD ? miningTimeH : rewards.CHESTPLATE_OF_THE_ARTHROPOD,
            percent: miningTimeH / rewards.CHESTPLATE_OF_THE_ARTHROPOD
          }
        };

        this.nftData[2] = {
          type: 'HELMET_OF_THE_COLEOPTERA',
          imageSrc: './assets/icons/nft/nft-reward-3.png',
          title: 'Helmet of the Coleoptera',
          description: 'Bug’s are pesky, but with this helmet, you’ll be able to delete them from any server!',
          progress: {
            maxTime: rewards.HELMET_OF_THE_COLEOPTERA,
            time: miningTimeH < rewards.HELMET_OF_THE_COLEOPTERA ? miningTimeH : rewards.HELMET_OF_THE_COLEOPTERA,
            percent: miningTimeH / rewards.HELMET_OF_THE_COLEOPTERA
          }
        };
      }
    });
  }

  claimNFT(data: ClaimPromotionRequest): Observable<Response<any>> {
    return this.http.post<Response<any>>(`${environment.gaiminApi}/users/me/promotion/claim`, data, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.authService.getAccessToken()}`)
        .set('X-Client-Version', `platform/${this.appVersionService.getVersion()}`)
    });
  }

  getUserInfo(): Observable<Response<UserInfo>> {
    return this.http.get<Response<UserInfo>>(environment.gaiminApi + '/users/me-db', {
      headers: this.headersService.appVersion()
    });
  }

  createNewUser(): Observable<Response<UserInfo>> {
    return this.http.post<Response<UserInfo>>(
      `${environment.gaiminApi}/users/me`,
      {},
      {
        headers: new HttpHeaders()
          .set('Authorization', `Bearer ${this.authService.getAccessToken()}`)
          .set('X-Client-Version', `platform/${this.appVersionService.getVersion()}`)
      }
    );
  }

  updateUserInfo(data: UserInfo): Observable<Response<UserInfo>> {
    this.userDataUpdated = true;
    return this.http.put<Response<UserInfo>>(environment.gaiminApi + '/users/me-db', data, {
      headers: this.headersService.appVersion()
    });
  }

  errorHandler(event) {
    console.debug(event);
    this.toastrService.warning('You can change default avatar image');
    this.profile.avatarUrl = this.defaultAvatarTemplate;
  }
}
