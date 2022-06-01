import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ArkaneService } from '../arkane.service';

@Component({
  selector: 'app-updated-time',
  templateUrl: './updated-time.component.html',
  styleUrls: ['./updated-time.component.scss']
})
export class UpdatedTimeComponent implements OnInit {
  refreshTime;

  constructor(private arkaneService: ArkaneService) {}

  ngOnInit(): void {
    this.refreshTime = this.arkaneService.refreshTime;
  }
}
