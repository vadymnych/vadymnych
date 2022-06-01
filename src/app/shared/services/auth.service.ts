import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ElectronService } from './electron.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private electronService: ElectronService,
    private router: Router,
    private http: HttpClient,
    private ngZone: NgZone
  ) {
    if (this.electronService.ipcRenderer != null) {
      this.electronService.ipcRenderer.on('login-success', () => {
        console.log('\x1b[33mAuthentication success!');
        this.ngZone.run(() => {
          this.loggedIn.next(true);
        });
      });
    }
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  getAccessToken(): string {
    if (!this.loggedIn.value) {
      return null;
    }
    return this.electronService.ipcRenderer.sendSync('access-token');
  }

  login() {
    this.electronService.ipcRenderer.send('login');
  }

  logout() {
    this.electronService.ipcRenderer.send('logout');
    this.loggedIn.next(false);
    this.router.navigateByUrl('/dashboard');
  }
}
