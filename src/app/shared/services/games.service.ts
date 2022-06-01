import { AppVersionService } from './app-version.service';
import { HeadersService } from 'src/app/shared/services/headers.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { MinecraftToken, Response } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private headersService: HeadersService,
    private appVersionService: AppVersionService
  ) {}

  getUserGaiminCraftToken() {
    return this.http.get<Response<MinecraftToken>>(`${environment.gaiminApi}/games/minecraft/token`, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${this.authService.getAccessToken()}`)
        .set('X-Client-Version', `platform/${this.appVersionService.getVersion()}`)
    });
  }
}
