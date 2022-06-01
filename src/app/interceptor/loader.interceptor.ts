import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpInterceptor, HttpEvent } from '@angular/common/http';
import { LoaderService } from '../shared/services/loader.service';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  constructor(private loaderService: LoaderService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    Promise.resolve(null).then(() => this.loaderService.showLoader());
    return next.handle(request).pipe(
      finalize(() => {
        this.loaderService.hideLoader();
      })
    );
  }
}
