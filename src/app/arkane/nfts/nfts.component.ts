import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ArkaneService } from '../arkane.service';

@Component({
  selector: 'app-nfts',
  templateUrl: './nfts.component.html',
  styleUrls: ['./nfts.component.scss']
})
export class NftsComponent implements OnInit {
  nftsShowAll: boolean = false;
  paginationData = {
    currentPage: 1,
    itemsPerPage: 6,
    totalItems: this.arkaneService.nfts?.result.length
  };

  constructor(public arkaneService: ArkaneService, private router: Router) {}

  async navigateTo(data) {
    this.arkaneService.nft = await data;
    this.router.navigateByUrl(`/wallet/nfts/${data.id}`);
  }

  ngOnInit(): void {
    if (this.paginationData.totalItems === 0) {
      this.router.navigateByUrl(`/wallet`);
    }
  }

  toggleAll() {
    this.paginationData.itemsPerPage = !this.nftsShowAll ? this.arkaneService.nfts?.result.length : 6;
    this.nftsShowAll = !this.nftsShowAll;
  }
}
