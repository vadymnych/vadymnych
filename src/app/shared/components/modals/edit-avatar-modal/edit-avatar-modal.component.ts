import { Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AppVersionService } from '../../../services/app-version.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ModalService } from '../../../services/modal.service';
import { Button, Response } from '../../../../shared/interfaces';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-edit-avatar-modal',
  templateUrl: './edit-avatar-modal.component.html',
  styleUrls: ['./edit-avatar-modal.component.scss']
})
export class EditAvatarModalComponent implements OnDestroy {
  profile;
  avatarPath: string;
  imageUrl: string;
  avatarUpdated: boolean = false;
  uploadButton: Button = { name: 'Upload Image', icon: 'icon-Upload', classMod: 'dark', size: 'medium' };
  saveButton: Button = { name: 'Save', type: 'submit' };
  cancelButton: Button = { name: 'Cancel', classMod: 'secondary' };
  isSaveButtonPressed: boolean = false;
  image: File;
  private maxFileSize = 10485760; // 10mb in bytes

  @ViewChild('fileInput')
  inputVariable: ElementRef;

  constructor(
    private modalService: ModalService,
    private toastrService: ToastrService,
    public userService: UserService,
    private authService: AuthService,
    private http: HttpClient,
    private appVersionService: AppVersionService
  ) {
    this.profile = this.userService.profile;
    this.avatarPath = this.profile.avatarUrl;
  }

  onChange(files) {
    if (files.length === 0) {
      return;
    }

    this.image = files[0];

    if (this.image.type.match('image/jpeg|image/png') == null) {
      this.avatarUpdated = false;
      this.toastrService.error('Attached file type is incorrect');
    } else if (this.image.size > this.maxFileSize) {
      this.avatarUpdated = false;
      this.toastrService.error('Attached file max-size is 10MB');
    } else {
      var fileReader = new FileReader();
      fileReader.readAsDataURL(this.image);
      fileReader.onload = () => {
        this.avatarUpdated = true;
        this.imageUrl = this.image.name;
        this.profile.avatarUrl = fileReader.result;
      };
    }
  }

  onSave() {
    this.modalService.close();
    if (this.avatarUpdated) {
      this.isSaveButtonPressed = true;

      let formData = new FormData();
      formData.append('image', this.image);

      this.http
        .post<Response<string>>(`${environment.gaiminApi}/images`, formData, {
          headers: new HttpHeaders()
            .set('Authorization', `Bearer ${this.authService.getAccessToken()}`)
            .set('X-Client-Version', `platform/${this.appVersionService.getVersion()}`)
        })
        .subscribe(
          (response) => {
            if (response.success) {
              this.profile.avatarUrl = response.data;
              this.userService.updateUserInfo(this.profile).subscribe(
                (response) => {
                  if (response.success) {
                    this.userService.profile = response.data;
                    this.toastrService.success('Profile photo updated successfully.');
                  } else {
                    this.handleError();
                  }
                },
                () => {
                  this.handleError();
                }
              );
            } else {
              this.handleError();
            }
          },
          () => {
            this.handleError();
          }
        );
    }
    this.avatarUpdated = false;
  }

  onRemove() {
    this.avatarUpdated = false;
    this.imageUrl = '';
    this.inputVariable.nativeElement.value = '';
    this.profile.avatarUrl = this.avatarPath;
  }

  onCancel() {
    this.profile.avatarUrl = this.avatarPath;
    this.modalService.close();
  }

  handleError() {
    this.onRemove();
    this.toastrService.error('Unable to update the profile photo.');
  }

  ngOnDestroy(): void {
    setTimeout(() => {
      if (!this.isSaveButtonPressed) {
        this.profile.avatarUrl = this.avatarPath;
      }
    }, 500);
  }
}
