import { Component } from '@angular/core';
import { ArkaneService } from '../arkane.service';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent {
  constructor(public arkaneService: ArkaneService) {}
}
