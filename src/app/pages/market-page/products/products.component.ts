import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { MarketService } from '../../../shared/services/market.service';
import { LoaderService } from '../../../shared/services/loader.service';
import { Button, ProductItem } from '../../../shared/interfaces';
// @ts-ignore
import sadYoda from '../../../../assets/icons/market/baby-yoda-bg.png';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  isLoading: boolean;

  buttonAll: Button = {
    name: 'All',
    size: 'medium'
  };
  buttonGaimin: Button = {
    name: 'GAIMIN',
    size: 'medium'
  };

  constructor(public marketService: MarketService, private router: Router, public loaderService: LoaderService) {}

  ngOnInit() {
    this.loaderService.isLodading.subscribe((isLoading) => (this.isLoading = isLoading));

    this.buttonAll.classMod = this.marketService.isGaiminNFTs ? 'dark' : '';
    this.buttonGaimin.classMod = this.marketService.isGaiminNFTs ? '' : 'dark';
  }

  showAllNFTs() {
    if (this.marketService.isGaiminNFTs) {
      this.marketService.isGaiminNFTs = false;
      this.buttonAll.classMod = '';
      this.buttonGaimin.classMod = 'dark';
      this.marketService.getProduct(1);
    }
  }

  showGaiminNFTs() {
    if (!this.marketService.isGaiminNFTs) {
      this.marketService.isGaiminNFTs = true;
      this.buttonAll.classMod = 'dark';
      this.buttonGaimin.classMod = '';
      this.marketService.getProduct(1);
    }
  }

  async navigateTo(data) {
    this.marketService.product = (await data) as ProductItem;
    this.marketService.product.count = data.minBuyAmount ? data.minBuyAmount : 1;
    this.router.navigateByUrl(`/market/product/${data.id}`);
  }

  pageChanged(event) {
    this.marketService.getProduct(event);
    this.marketService.currentPage = event;
  }
}
