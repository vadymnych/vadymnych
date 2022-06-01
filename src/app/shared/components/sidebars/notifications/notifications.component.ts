import { Component, OnInit } from '@angular/core';
import { Notification } from '../../../interfaces';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[];

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notifications = this.notificationService.getNotifications();
  }

  hideNotification(notification: Notification) {
    this.notificationService.removeNotification(notification);
    this.notifications = this.notificationService.getNotifications();
  }

  clearNotifications() {
    this.notificationService.clearAllNotification();
    this.notifications = this.notificationService.getNotifications();
  }
}
