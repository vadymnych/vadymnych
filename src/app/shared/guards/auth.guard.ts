import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';
import { LoginModalComponent } from '../components/modals/login-modal/login-modal.component';
import { AuthService } from '../services/auth.service';
import { CriticalUpdateModalComponent } from '../components/modals/critical-update-modal/critical-update-modal.component';
import { AutoUpdaterService } from '../services/auto-updater.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  isAuthenticated: boolean;
  isCritical: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService,
    private autoUpdateService: AutoUpdaterService
  ) {}

  canActivate(activatedRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    this.authService.isLoggedIn().subscribe((isLoggedIn) => (this.isAuthenticated = isLoggedIn));

    this.isCritical = this.autoUpdateService.isCritical$.getValue();

    switch (this.isAuthenticated) {
      case true:
        if (this.isCritical) {
          this.authService.logout();
        }
        return of(true);

      case false:
        if (!this.isCritical) {
          this.loginPopup();
        }
    }

    switch (this.isCritical) {
      case true:
        this.criticalUpdate();
    }
  }

  loginPopup() {
    this.router.navigateByUrl('/home');
    this.modalService.create('loginModal', LoginModalComponent).open();
    return of(false);
  }

  criticalUpdate() {
    this.authService.logout();
    this.router.navigateByUrl('/home');
    this.modalService.create('criticalUpdateModal', CriticalUpdateModalComponent, { dismissable: false }).open();
    return of(false);
  }
}
