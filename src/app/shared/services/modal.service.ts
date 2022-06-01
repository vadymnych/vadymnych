import { Injectable } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { INgxSmartModalOptions } from 'ngx-smart-modal/src/config/ngx-smart-modal.config';
@Injectable({
  providedIn: 'root'
})
export class ModalService {
  bufferData;
  errorApi;

  constructor(private ngxSmartModalService: NgxSmartModalService) {}

  create(modalId, cmp, options: INgxSmartModalOptions = {}) {
    return this.ngxSmartModalService.create(modalId, cmp, options);
  }

  getModal(modalId) {
    return this.ngxSmartModalService.getModal(modalId);
  }

  close() {
    this.bufferData = null;
    this.ngxSmartModalService.closeLatestModal();
  }

  closeById(modalId) {
    this.bufferData = null;
    this.ngxSmartModalService.close(modalId);
  }

  closeAll() {
    this.bufferData = null;
    this.ngxSmartModalService.closeAll();
  }
}
