import { Component, OnInit } from '@angular/core';
import { HelpModalComponent } from '../help-modal/help-modal.component';
import { ModalService } from '../../../services/modal.service';
import { Button } from '../../../interfaces';

@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss']
})
export class ErrorModalComponent implements OnInit {
  helpButton: Button = { name: 'Open help center' };
  cancelButton: Button = { name: 'Cancel', classMod: 'secondary' };
  errorData;

  constructor(public modalService: ModalService) {}

  onHelpCenter() {
    this.modalService.close();
    this.modalService.create('helpModalComponent', HelpModalComponent).open();
  }

  onCancel() {
    this.modalService.close();
  }

  ngOnInit(): void {
    this.errorData = JSON.stringify(this.modalService.errorApi);
  }
}
