import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ModalService } from '../../../services/modal.service';
import { ArkaneService } from '../../../../arkane/arkane.service';
import { Button } from '../../../interfaces';

@Component({
  selector: 'app-logout-modal',
  templateUrl: './logout-modal.component.html',
  styleUrls: ['./logout-modal.component.scss']
})
export class LogoutModalComponent {
  logoutButton: Button = { name: 'Logout' };
  cancelButton: Button = { name: 'Cancel', classMod: 'secondary' };

  constructor(
    private modalService: ModalService,
    private authService: AuthService,
    private arkaneService: ArkaneService
  ) {}

  onCancel() {
    this.modalService.close();
  }

  onLogout() {
    this.authService.logout();
    this.arkaneService.logout();
    this.onCancel();
  }
}
