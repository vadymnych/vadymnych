import { Component, Input } from '@angular/core';
import { ModalService } from '../../services/modal.service';
import { NftModalComponent } from '../modals/nft-modal/nft-modal.component';

@Component({
  selector: 'app-nft-item',
  templateUrl: './nft-item.component.html',
  styleUrls: ['./nft-item.component.scss']
})
export class NftItemComponent {
  @Input() data;

  constructor(private modalService: ModalService) {}

  openPromotionModal(nftType) {
    this.modalService.bufferData = nftType;
    this.modalService.create('nftModal', NftModalComponent, { customClass: 'promotion-modal' }).open();
  }
}
