import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ArkaneService } from '../../arkane.service';
import { ModalService } from '../../../shared/services/modal.service';
import { MarketService } from '../../../shared/services/market.service';
import { TransferNftModalComponent } from '../../../shared/components/modals/transfer-nft-modal/transfer-nft-modal.component';
import { ProductInterface } from '../../../shared/interfaces';

@Component({
  selector: 'app-nft-item',
  templateUrl: './nft-item.component.html',
  styleUrls: ['./nft-item.component.scss']
})
export class NftItemComponent implements OnDestroy, OnInit {
  recommendationData: ProductInterface[];

  constructor(
    public arkaneService: ArkaneService,
    public marketService: MarketService,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.marketService.getRecommendationsProducts(1, 10, true).subscribe((res) => {
      this.recommendationData = res.data.offers;
    });
  }

  backClicked() {
    this.router.navigateByUrl(`/wallet`);
    this.arkaneService.nft = null;
  }

  openTransferNftModal() {
    this.modalService.create('transferNftModal', TransferNftModalComponent).open();
  }

  ngOnDestroy() {
    //this.arkaneService.nft = null;
  }
}
