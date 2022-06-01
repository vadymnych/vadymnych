import * as uuid from 'uuid';
import { UserService } from './user.service';
import { NavigationEnd, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { filter } from 'rxjs/operators';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {
  navEndEvents;
  clientId;

  constructor(private router: Router, private userService: UserService) {
    this.navEndEvents = this.router.events.pipe(filter((event) => event instanceof NavigationEnd));
    this.clientId = localStorage.getItem('cid') || uuid.v4();
    localStorage.setItem('cid', this.clientId);
  }

  pageView() {
    this.navEndEvents.subscribe((event: NavigationEnd) => {
      const payload_data = new URLSearchParams({
        v: '1',
        cid: this.clientId,
        email: this.userService.profile?.email,
        tid: 'UA-185675109-1',
        t: 'pageview',
        dp: event.urlAfterRedirects
      }).toString();
      axios.post('https://google-analytics.com/collect', payload_data);
      console.log('Send pageview', event.urlAfterRedirects);
    });
  }

  trackEvent(buttonName: string) {
    const event = new URLSearchParams({
      v: '1',
      cid: this.clientId,
      email: this.userService.profile?.email,
      tid: 'UA-185675109-1',
      t: 'event',
      ec: 'button_press',
      el: 'press',
      ea: `${buttonName} button `
    }).toString();
    axios.post('https://google-analytics.com/collect', event);

    console.log('Press ', buttonName, 'button');
  }
}
