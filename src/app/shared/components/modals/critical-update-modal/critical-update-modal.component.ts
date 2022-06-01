import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../../services/modal.service';
import { ElectronService } from '../../../services/electron.service';
import { AutoUpdaterService } from '../../../services/auto-updater.service';
import { Button } from '../../../interfaces';

@Component({
  selector: 'app-critical-update-modal',
  templateUrl: './critical-update-modal.component.html',
  styleUrls: ['./critical-update-modal.component.scss']
})
export class CriticalUpdateModalComponent implements OnInit {
  installNow: Button = { name: 'Install Now' };
  isDownloaded;

  constructor(
    private electronService: ElectronService,
    private modalService: ModalService,
    public autoUpdaterService: AutoUpdaterService
  ) {}

  ngOnInit() {
    this.autoUpdaterService.isDownloaded$.subscribe((isDownloaded) => (this.isDownloaded = isDownloaded));
  }

  install() {
    localStorage.removeItem('isCritical');
    this.electronService.ipcRenderer.send('install-now');
    this.modalService.close();
  }
}
