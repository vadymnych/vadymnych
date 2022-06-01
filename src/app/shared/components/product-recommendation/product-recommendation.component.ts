import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MarketService } from '../../services/market.service';
import { ProductInterface, ProductItem, RedirectData, Button } from '../../interfaces';

@Component({
  selector: 'app-product-recommendation',
  templateUrl: './product-recommendation.component.html',
  styleUrls: ['./product-recommendation.component.scss']
})
export class ProductRecommendationComponent implements OnInit {
  constructor(private marketService: MarketService, public router: Router) {}

  @Input() recommendationData: ProductInterface[];
  @Input() headerText: string;
  @Input() redirectData: RedirectData | null;
  @Input() cartButton: boolean = false;

  button: Button = {
    icon: 'icon-Market-2',
    classMod: 'cart',
    size: 'medium'
  };

  ngOnInit(): void {}

  async navigateTo(data: ProductInterface) {
    this.marketService.product = (await data) as ProductItem;
    this.marketService.product.count = data.minBuyAmount ? data.minBuyAmount : 1;
    this.router.navigateByUrl(`/market/product/${data.id}`);
  }

  async addToCart(data: ProductInterface, event) {
    event.stopPropagation();
    const product = (await data) as ProductItem;
    product.count = data.minBuyAmount ? data.minBuyAmount : 1;
    this.marketService.addProduct(product);
  }
}
