import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-benchmarking-spinner',
  templateUrl: './benchmarking-spinner.component.html',
  styleUrls: ['./benchmarking-spinner.component.scss']
})
export class BenchmarkingSpinnerComponent implements OnInit {
  @Input() isActive: boolean = false;

  constructor() {}

  ngOnInit(): void {}
}
