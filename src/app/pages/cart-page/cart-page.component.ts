import { Component, OnInit } from '@angular/core';
import { ProductItem, ProductInterface } from '../../shared/interfaces';
import { MarketService } from '../../shared/services/market.service';

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.scss']
})
export class CartPageComponent implements OnInit {
  shopList: ProductItem[] = [];
  recommendationData: ProductInterface[];

  constructor(public marketService: MarketService) {}

  ngOnInit() {
    this.marketService.shoppingCart$.subscribe((data) => {
      this.shopList = data;
    });

    this.marketService.getRecommendationsProducts(1, 10, true).subscribe((res) => {
      this.recommendationData = res.data.offers;
    });
  }
}
