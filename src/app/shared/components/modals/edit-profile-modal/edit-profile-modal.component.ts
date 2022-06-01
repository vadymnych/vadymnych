import { Component, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ModalService } from '../../../services/modal.service';
import { Button } from '../../../../shared/interfaces';

@Component({
  selector: 'app-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss']
})
export class EditProfileModalComponent implements OnDestroy {
  profile;
  form: FormGroup;
  saveButton: Button = { name: 'Save', type: 'submit' };

  constructor(
    private modalService: ModalService,
    private toastrService: ToastrService,
    public userService: UserService,
    private authService: AuthService
  ) {
    this.profile = this.userService.profile;
    this.form = new FormGroup({
      firstName: new FormControl(this.profile.firstName, [
        Validators.required,
        Validators.pattern('([A-Za-z\\- ]+)'),
        Validators.maxLength(30)
      ]),
      lastName: new FormControl(this.profile.lastName, [
        Validators.required,
        Validators.pattern('([A-Za-z\\- ]+)'),
        Validators.maxLength(30)
      ]),
      nickName: new FormControl(this.profile.nickName, [
        Validators.minLength(2),
        Validators.maxLength(30),
        Validators.pattern('^[a-zA-Z0-9]*$')
      ]),
      mobilePhone: new FormControl(this.profile.mobilePhone, [Validators.pattern('^\\+?[1-9]{1}[0-9]{1,14}$')])
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.modalService.close();

      const temp_profile = { ...this.userService.profile, ...this.form.value };

      this.userService.updateUserInfo(temp_profile).subscribe(
        (response) => {
          if (response.success) {
            this.userService.profile = response.data;
            this.toastrService.success('Profile updated successfully.');
          } else {
            this.handleError();
          }
        },
        () => {
          this.handleError();
        }
      );
    }
  }

  handleError() {
    this.toastrService.error('Unable to update the profile data.');
  }

  ngOnDestroy(): void {}
}
