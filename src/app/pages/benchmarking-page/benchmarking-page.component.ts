import { ToastrService } from 'ngx-toastr';
import { Component, OnInit } from '@angular/core';
import { MiningProcessService } from '../../shared/services/miner-services/mining-process.service';

@Component({
  selector: 'app-benchmarking-page',
  templateUrl: './benchmarking-page.component.html',
  styleUrls: ['./benchmarking-page.component.scss']
})
export class BenchmarkingPageComponent implements OnInit {
  constructor(private toastrService: ToastrService, public miningProcessService: MiningProcessService) {}

  buttonTitle: string;
  isBenchmarkingActive: boolean = false;

  ngOnInit(): void {
    this.miningProcessService.isHardBenchmarkingActive$.subscribe((isOn) => {
      this.isBenchmarkingActive = isOn;
      if (isOn) {
        this.buttonTitle = 'Stop Benchmarking';
      } else {
        this.buttonTitle = 'Start Benchmarking';
      }
    });
  }

  startBench() {
    this.miningProcessService.hardBenchmarking();
    if (this.isBenchmarkingActive) {
      this.toastrService.warning('Benchmarking is started');
    } else {
      this.toastrService.success('Benchmarking is stopped');
    }
  }
}
