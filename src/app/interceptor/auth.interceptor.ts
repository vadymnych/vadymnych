import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../shared/services/auth.service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor ( private authService: AuthService ) {
  }

  intercept ( request: HttpRequest<any>, next: HttpHandler ): Observable<HttpEvent<any>> {

    const accessToken = this.authService.getAccessToken();

    if ( accessToken == null ) {
      console.warn( 'User is not authenticated.' );
      return next.handle( request );
    }


    if ( request.headers?.get( 'Authorization' ) == null ) {
      request = request.clone( {
        setHeaders: {
          Authorization: `Bearer ${ accessToken }`
        }
      } );
    }

    return next.handle( request );
  }

}
