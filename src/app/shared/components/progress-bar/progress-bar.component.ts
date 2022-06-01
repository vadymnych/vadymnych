import { Component, DoCheck, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent implements DoCheck {
  @Input() percent;

  constructor(private elementRef: ElementRef) {}

  progressBarWidth = 175;

  ngDoCheck() {
    if (this.progressBarWidth !== this.elementRef.nativeElement.clientWidth) {
      this.progressBarWidth = this.elementRef.nativeElement.clientWidth;
    }
  }
}
