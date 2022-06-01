import { Injectable } from '@angular/core';
import { UpdateModalComponent } from '../components/modals/update-modal/update-modal.component';
import { ModalService } from 'src/app/shared/services/modal.service';
import { BehaviorSubject } from 'rxjs';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';
import { ElectronService } from './electron.service';

@Injectable({
  providedIn: 'root'
})
export class AutoUpdaterService {
  private shownDialog: boolean = false;

  public isCritical$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isDownloaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isCritical;

  constructor(
    private electronService: ElectronService,
    private modalService: ModalService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
    if (localStorage.getItem('isCritical') != null) {
      console.log("JSON.parse(localStorage.getItem('isCritical'))", JSON.parse(localStorage.getItem('isCritical')));
      if (JSON.parse(localStorage.getItem('isCritical'))) {
        this.isCritical$.next(JSON.parse(localStorage.getItem('isCritical')));
      }
    }

    this.notificationService.getNotificationFromLocalStorage()?.forEach((notification) => {
      if (notification?.critical) {
        this.isCritical$.next(notification?.critical);
      }
    });

    if (this.electronService.ipcRenderer != null) {
      this.electronService.ipcRenderer.on('notification', (event, args) => {
        if (args?.critical) {
          this.isCritical$.next(args.critical);
        }
      });
    }

    this.isCritical$.subscribe((isCritical) => {
      console.log('is critical sub', isCritical);
      this.isCritical = isCritical;
      if (isCritical) {
        localStorage.setItem('isCritical', JSON.stringify(isCritical));
        this.authService.logout();
      }
    });

    this.checkUpdate();
  }

  private checkUpdate() {
    this.electronService.ipcRenderer.on('init-update', (event, { remind }) => {
      this.notificationService.checkUpdateNotification();
      this.isDownloaded$.next(true);
      if (remind) {
        !this.isCritical ? this.updateModal() : this.authService.logout();
      }
    });
  }

  private updateModal() {
    this.modalService
      .create('updateModal', UpdateModalComponent, {
        closable: false,
        dismissable: false
      })
      .open();
  }
}
