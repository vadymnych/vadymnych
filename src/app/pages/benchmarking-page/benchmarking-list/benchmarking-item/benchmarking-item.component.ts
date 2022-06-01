import { Component, Input, OnInit } from '@angular/core';
import { MinerData } from '../../../../shared/interfaces';

@Component({
  selector: 'app-benchmarking-item',
  templateUrl: './benchmarking-item.component.html',
  styleUrls: ['./benchmarking-item.component.scss']
})
export class BenchmarkingItemComponent implements OnInit {
  @Input() benchData: MinerData;
  @Input() isHardBenchDone: boolean;
  @Input() cryptoCode: string;
  @Input() minerName: string;

  coinsUrls = {
    ETH: 'benchmarking/eth.svg',
    RVN: 'benchmarking/raven.svg',
    AION: 'benchmarking/aion.svg'
  };

  constructor() {}

  ngOnInit(): void {}
}
