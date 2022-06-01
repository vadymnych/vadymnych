import { Component, Input, OnInit } from '@angular/core';
import { Notification } from '../../../../interfaces';
import { ElectronService } from '../../../../services/electron.service';
import { AutoUpdaterService } from '../../../../services/auto-updater.service';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-update-notification',
  templateUrl: './update-notification.component.html',
  styleUrls: ['./update-notification.component.scss']
})
export class UpdateNotificationComponent implements OnInit {
  @Input() notificationData: Notification;

  constructor(
    private electronService: ElectronService,
    public autoUpdaterService: AutoUpdaterService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {}

  updateNow() {
    this.notificationService.removeNotification(this.notificationData);
    this.electronService.ipcRenderer.send('install-now');
  }
}
