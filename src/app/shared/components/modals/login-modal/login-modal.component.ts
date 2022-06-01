import { Component } from '@angular/core';
import { Button } from '../../../../shared/interfaces';
import { ModalService } from '../../../../shared/services/modal.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss']
})
export class LoginModalComponent {
  loginButton: Button = { name: 'Login' };
  cancelButton: Button = { name: 'Cancel', classMod: 'secondary' };

  constructor(private modalService: ModalService, private authService: AuthService) {}

  onCancel() {
    this.modalService.close();
  }

  onLogin() {
    this.authService.login();
    this.onCancel();
  }
}
