import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../../services/electron.service';
import { ModalService } from '../../../services/modal.service';
import { Button } from '../../../interfaces';

@Component({
  selector: 'app-update-modal',
  templateUrl: './update-modal.component.html',
  styleUrls: ['./update-modal.component.scss']
})
export class UpdateModalComponent implements OnInit {
  installNow: Button = { name: 'Install Now' };
  remindLater: Button = { name: 'Remind Later' };

  constructor(private electronService: ElectronService, private modalService: ModalService) {}

  ngOnInit(): void {}

  install() {
    this.electronService.ipcRenderer.send('install-now');
    this.modalService.close();
  }

  remind() {
    this.electronService.ipcRenderer.send('remind-to-install');
    this.modalService.close();
  }
}
