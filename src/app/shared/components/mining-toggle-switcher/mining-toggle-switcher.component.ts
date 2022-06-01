import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import { ElectronService } from '../../services/electron.service';
import { MiningProcessService } from '../../services/miner-services/mining-process.service';
import { MiningApiService } from '../../services/miner-services/miner-api.service';

@Component({
  selector: 'app-mining-toggle-switcher',
  templateUrl: './mining-toggle-switcher.component.html',
  styleUrls: ['./mining-toggle-switcher.component.scss']
})
export class MiningToggleSwitcherComponent implements OnInit {
  @Output() turnedOnStatus = new EventEmitter<boolean>();
  @Input() miningMode: string;
  @Input() id: string;
  isTurnedOn: boolean;
  isDownloading: boolean;
  isBenchmarkingActive: boolean;
  isMiningToggleEnable: boolean;

  constructor(
    private electronService: ElectronService,
    private miningProcessService: MiningProcessService,
    private changeDetectorRef: ChangeDetectorRef,
    private miningApiService: MiningApiService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.isTurnedOn = this.miningProcessService.miningStatuses[this.miningMode];

    this.miningProcessService.isDownloading$.subscribe((status) => {
      this.isDownloading = status;
    });

    this.miningProcessService.isHardBenchmarkingActive$.subscribe((isOn) => {
      this.isBenchmarkingActive = isOn;
    });

    this.miningProcessService.isMiningToggleEnable$.subscribe((isEnable) => {
      this.isMiningToggleEnable = isEnable;
    });

    if (this.electronService.ipcRenderer != null) {
      this.electronService.ipcRenderer.on('mining-enabled', (event, args) => {
        if (this.miningMode === args) {
          console.log('MiningToggleSwitch received `mining-enabled` event');
          this.ngZone.run(() => {
            this.toggleOnView();
          });
        }
      });

      this.electronService.ipcRenderer.on('mining-disabled', (event, args) => {
        if (this.miningMode === args) {
          console.log('MiningToggleSwitch received `mining-disabled` event');
          this.ngZone.run(() => {
            this.toggleOffView();
          });
        }
      });
    }
  }

  onToggleChange() {
    if (this.isTurnedOn) {
      this.turnOff();
    } else {
      this.turnOn();
    }
  }

  private turnOn() {
    if (!this.electronService.isElectronApp) return;
    this.miningProcessService.start('GPU');
    this.toggleOnView();
  }

  private turnOff() {
    if (!this.electronService.isElectronApp) return;
    this.miningProcessService.stop('GPU');
    this.toggleOffView();
  }

  private toggleOnView() {
    this.isTurnedOn = true;
    this.turnedOnStatus.emit(true);
    this.changeDetectorRef.detectChanges();
  }

  private toggleOffView() {
    this.isTurnedOn = false;
    this.turnedOnStatus.emit(false);
    this.changeDetectorRef.detectChanges();
  }
}
