import { Component, Input } from '@angular/core';
import { GoogleAnalyticsService } from './../../services/google-analytics.service';
import { Button } from '../../interfaces';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() buttonData: Button;
  @Input() disabled;

  constructor(public googleService: GoogleAnalyticsService) {}

  trackEvent() {
    this.googleService.trackEvent(this.buttonData.name || this.buttonData.dataType);
  }
}
