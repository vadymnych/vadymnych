import { ApplicationRef, Injectable } from '@angular/core';
import { Notification } from '../interfaces';
import { ElectronService } from './electron.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  notifications: Notification[] = [];

  constructor(
    private electronService: ElectronService,
    private toastrService: ToastrService,
    private appRef: ApplicationRef
  ) {
    if (this.electronService.ipcRenderer != null) {
      this.electronService.ipcRenderer.on('notification', (event, args) => {
        if (args.title != null && args.message != null) {
          const notification: Notification = {
            title: args.title,
            message: args.message,
            time: new Date(),
            critical: args.critical
          };

          this.addNotification(notification);

          this.toastrService
            .success(args.message, args.title, {
              closeButton: true
            })
            .onShown.subscribe(() => this.appRef.tick());
        }
      });
    }

    this.notifications = this.getNotificationFromLocalStorage();
    if (this.notifications == null) {
      this.notifications = [];
    }
  }

  addNotification(notification: Notification) {
    this.notifications.push(notification);
    this.saveNotificationsToLocalStorage();
  }

  getNotifications(): Notification[] {
    return this.notifications.sort((n1, n2) => {
      if (new Date(n1.time) > new Date(n2.time)) {
        return -1;
      }
      if (new Date(n1.time) < new Date(n2.time)) {
        return 1;
      }
      return 0;
    });
  }

  clearAllNotification() {
    this.notifications = [];
    this.saveNotificationsToLocalStorage();
  }

  checkUpdateNotification() {
    if (this.notifications.length === 0) {
      this.addNotification({
        title: 'New version!',
        message: 'New version of the application has been released',
        time: new Date(),
        critical: false
      });
    }
  }

  removeNotification(notification: Notification) {
    this.notifications = this.notifications.filter((n) => n !== notification);
    this.saveNotificationsToLocalStorage();
  }

  getNotificationFromLocalStorage(): Notification[] {
    try {
      return JSON.parse(localStorage.getItem('notifications'));
    } catch (e) {
      console.error('Error getting data from localStorage', e);
      return [];
    }
  }

  saveNotificationsToLocalStorage() {
    try {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }
}
