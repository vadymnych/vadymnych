import { Component, OnInit } from '@angular/core';
import { MiningProcessService } from "../../../shared/services/miner-services/mining-process.service";
import { HardBenchmarkingData } from "../../../shared/interfaces";

@Component({
  selector: 'app-benchmarking-list',
  templateUrl: './benchmarking-list.component.html',
  styleUrls: ['./benchmarking-list.component.scss']
})
export class BenchmarkingListComponent implements OnInit {
  hardBenchmarkingData: HardBenchmarkingData;

  constructor( public miningProcessService: MiningProcessService) { }

  ngOnInit(): void {
    this.miningProcessService.hardBenchmarkingData$.subscribe((data) => {
      console.log('hardBenchmarkingData', data);
      this.hardBenchmarkingData = data;
    });
  }

}
