import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ModalService } from '../../services/modal.service';
import { EditAvatarModalComponent } from '../modals/edit-avatar-modal/edit-avatar-modal.component';
import { EditProfileModalComponent } from '../modals/edit-profile-modal/edit-profile-modal.component';
import { LogoutModalComponent } from '../modals/logout-modal/logout-modal.component';
import { Button } from '../../interfaces';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnDestroy {
  editButton: Button = { name: 'Edit Profile', icon: 'icon-Edit', classMod: 'secondary', size: 'small' };
  logoutButton: Button = { name: 'Logout', size: 'small' };

  constructor(private modalService: ModalService, public userService: UserService, private authService: AuthService) {}

  onAvatarEdit() {
    this.modalService.create('avatarEditModal', EditAvatarModalComponent).open();
  }

  onProfileEdit() {
    this.modalService.create('profileEditModal', EditProfileModalComponent).open();
  }

  ngOnDestroy() {}

  onLogout() {
    this.modalService.create('logoutModal', LogoutModalComponent).open();
  }
}
