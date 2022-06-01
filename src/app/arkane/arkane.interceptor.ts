import { ArkaneService } from 'src/app/arkane/arkane.service';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable()
export class ArkaneInterceptor implements HttpInterceptor {

    constructor ( private arkaneService: ArkaneService ) { }

    intercept ( req: HttpRequest<any>, next: HttpHandler ): Observable<HttpEvent<any>> {
        const accessToken = this.arkaneService.geAccestoken()
        if ( accessToken == null ) {
            console.warn( '\x1b[36m User is not authenticated on Arkane.' )
            return next.handle( req )
        }

        if ( req.headers.get( 'Authorization' ) == null ) {
            req = req.clone( {
                setHeaders: {
                    Authorization: `Bearer ${ accessToken }`
                }
            } );
        }

        return next.handle( req );


    }
}
