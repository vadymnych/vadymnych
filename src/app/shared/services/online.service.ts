import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, Observable, Observer } from 'rxjs';
import { map, pairwise } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ElectronService } from "./electron.service";

@Injectable({
  providedIn: 'root'
})
export class OnlineService {
  private readonly ONLINE_CHECK_INTERVAL = 1000 * 30; // 30 sec
  private onlineSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private isInitiallyAppRun: boolean = true;

  public isAppOnline$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(private electronService: ElectronService, private toastrService: ToastrService) {
    this.isAppOnline$.subscribe((isOnline) => {
      console.log('Is App Online', isOnline);

      if (isOnline) {
        if (!this.isInitiallyAppRun) {
          this.toastrService.success('Internet connection is successful');
        }
        this.isInitiallyAppRun = false;
      } else {
        this.toastrService.warning('Lost internet connection');
      }
    });

    this.onlineSubject$.pipe(pairwise()).subscribe(([prev, current]) => {
      if (prev !== current) {
        this.isAppOnline$.next(current);
      }
    });

    this.onLineObserver$().subscribe((isOnline) => {
      this.onlineSubject$.next(isOnline);
    });

    setInterval(() => {
      this.onlineChecker();
    }, this.ONLINE_CHECK_INTERVAL);
  }

  private onLineObserver$() {
    return merge<any>(
      fromEvent(window, 'offline').pipe(map(() => false)),
      fromEvent(window, 'online').pipe(map(() => true)),
      new Observable((sub: Observer<boolean>) => {
        sub.next(navigator.onLine);
        sub.complete();
      })
    );
  }

  private onlineChecker() {
    const childProcess = this.electronService.childProcess;
    const command = 'ping -n 2 api.gaimin.gg >nul && echo 1 || echo 0';

    childProcess.exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      const isOnline = Number.parseInt(stdout);
      this.onlineSubject$.next(!!isOnline);
    });
  }
}
