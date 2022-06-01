import { ErrorModalComponent } from '../shared/components/modals/error-modal/error-modal.component';
import { ModalService } from '../shared/services/modal.service';
import { Injectable, Injector } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private modalService: ModalService) {}

  isAuthenticated: boolean;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const logFormat = 'background: maroon; color: white';

    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse && event.url.includes(environment.gaiminApi)) {
          if (event.url.includes('mining-event-stop')) return;
          if (
            !event.body.success &&
            event.body?.error?.description === 'The device is already assigned to another user!'
          ) {
            return;
          }
          if (event.body.success !== undefined && !event.body.success) {
            this.modalService.bufferData = event.body?.error?.description;
            this.modalService.errorApi = event.url;
            this.modalService.create('errorModal', ErrorModalComponent).open();
            console.error(`%c Response error ${event.body?.error?.description}`, logFormat);
          }
        }
      }),

      catchError((error: HttpErrorResponse) => {
        this.modalService.bufferData = error;
        if (error.error?.includes('Validation failed.')) {
          return throwError(error);
        }
        if (error.status <= 400 && error.status !== 401) {
          this.modalService.create('errorModal', ErrorModalComponent).open();
          console.error('%c Client Error  400', logFormat);
        }
        if (error.status >= 500) {
          this.modalService.create('errorModal', ErrorModalComponent).open();
          console.error('%c Server Error  500', logFormat);
        }

        return throwError(error);
      })
    );
  }
}
