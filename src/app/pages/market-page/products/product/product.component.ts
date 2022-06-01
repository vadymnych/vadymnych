import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { MarketService } from '../../../../shared/services/market.service';
import { ProductItem, ProductInterface, Button } from '../../../../shared/interfaces';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit, OnDestroy {
  id;
  recommendationData: ProductInterface[];
  button: Button = {
    icon: 'icon-Market-2',
    name: 'Add to cart'
  };

  constructor(public marketService: MarketService, private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      this.id = params.get('id');
    });
    this.marketService.getRecommendationsProducts(1, 10, true).subscribe((res) => {
      this.recommendationData = res.data.offers;
    });
  }

  ngOnDestroy() {
    //this.marketService.product = null;
  }

  backClicked() {
    window.history.back();
    this.marketService.getProduct(this.marketService.currentPage);
  }

  addToCart(product: ProductItem) {
    this.marketService.addProduct(product);
  }

  add(product: ProductItem) {
    this.marketService.productAmountAdd(product);
  }

  remove(product: ProductItem) {
    this.marketService.productAmountRemove(product);
  }
}
