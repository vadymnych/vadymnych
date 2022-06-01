import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import { ElectronService } from '../../../../services/electron.service';
import { MiningProcessService } from '../../../../services/miner-services/mining-process.service';
import { MiningApiService } from '../../../../services/miner-services/miner-api.service';

@Component({
  selector: 'app-mining-item',
  templateUrl: './mining-item.component.html',
  styleUrls: ['./mining-item.component.scss']
})
export class MiningItemComponent implements OnInit {
  @Input() isComingSoon: boolean;
  @Input() miningMode: string;
  avgDeviceHashrate: string = '0';
  miningCryptoCode: string;
  isTurnedOn: boolean;
  isDownloading: boolean;

  constructor(
    private electronService: ElectronService,
    public miningProcessService: MiningProcessService,
    private changeDetectorRef: ChangeDetectorRef,
    private miningApiService: MiningApiService
  ) {}

  ngOnInit(): void {
    this.miningApiService.miningHashRate$.subscribe((hashRate) => {
      this.avgDeviceHashrate = hashRate;
    });

    this.miningProcessService.miningCryptoCode$.subscribe((code) => {
      this.miningCryptoCode = code;
    });

    this.miningProcessService.isDownloading$.subscribe((isDownloading) => {
      this.isDownloading = isDownloading;
    });
  }

  onToggleChange(status, type: string) {
    this.isTurnedOn = status;
    this.miningProcessService.onStatusChanged(status, type);
  }
}
