import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as Sentry from '@sentry/angular';
import { ToastrService } from 'ngx-toastr';
import { ModalService } from '../../../services/modal.service';
import { AuthService } from '../../../services/auth.service';
import { HelpService } from '../../../services/help.service';
import { AppVersionService } from '../../../services/app-version.service';
import { DeviceService } from '../../../services/device.service';
import { UserService } from '../../../services/user.service';
import { Button, HelpRequest } from '../../../interfaces';

@Component({
  selector: 'app-help-modal',
  templateUrl: './help-modal.component.html',
  styleUrls: ['./help-modal.component.scss']
})
export class HelpModalComponent {
  private readonly MAX_FILE_SIZE = 10485760; //  10mb in bytes
  private readonly MIN_FILE_SIZE = 6001; // 6kb in bytes , added one for easier comparison
  private readonly appVersion: string;
  form: FormGroup;
  @ViewChild('fileInput') inputVariable: ElementRef;
  uploadButton: Button = { name: 'Attach File', icon: 'icon-Upload', classMod: 'dark', size: 'medium' };
  private helpRequestData: HelpRequest;
  image: File;

  constructor(
    private appVersionService: AppVersionService,
    private deviceService: DeviceService,
    private helpService: HelpService,
    private modalService: ModalService,
    private authService: AuthService,
    private userService: UserService,
    private toastrService: ToastrService
  ) {
    this.appVersion = this.appVersionService.getVersion();
    this.form = new FormGroup({
      subject: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      description: new FormControl('', [Validators.required]),
      sendLogsCheckBox: new FormControl(false, [Validators.requiredTrue])
    });
    if (this.authService.loggedIn.getValue()) {
      this.form.get('email').setValue(this.userService.profile.email);
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.helpRequestData = this.form.value;
      this.helpRequestData.appVersion = this.appVersion;
      this.helpRequestData.deviceToken = this.deviceService.getDeviceToken();
      this.helpRequestData.scopes = JSON.parse(JSON.stringify([Sentry.getCurrentHub().getScope()]));
      console.log('this.helpRequestData', this.helpRequestData);
      console.log('Image', this.image);
      this.helpService.sendUserHelpRequest(this.helpRequestData, this.image).subscribe((res) => {
        console.log('Response:', res);
        if (res.success) {
          this.toastrService.success('Help request was send successfully');
        } else {
          this.toastrService.error(res.error?.description, `Error ${res.error?.type}`);
        }
      });
      this.onClose();
    }
  }

  onSelectImage(files: FileList) {
    if (files.item(0).type.includes('image')) {
      this.image = files.item(0);
    } else {
      this.onRemoveFile(this.inputVariable.nativeElement);
      this.toastrService.error('Attached file type is incorrect');
    }

    if (files.item(0).size > this.MAX_FILE_SIZE) {
      this.toastrService.error('Attached file max-size is incorrect');
      this.onRemoveFile(this.inputVariable.nativeElement);
    }

    if (files.item(0).size < this.MIN_FILE_SIZE) {
      this.toastrService.error('Attached file min-size is incorrect');
      this.onRemoveFile(this.inputVariable.nativeElement);
    }
  }

  onRemoveFile(target) {
    target.value = '';
    this.image = null;
  }

  private onClose() {
    this.modalService.close();
  }
}
