import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MarketService } from '../../../shared/services/market.service';
import { ProductItem } from '../../../shared/interfaces';

@Component({
  selector: 'app-cart-item',
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.scss']
})
export class CartItemComponent implements OnInit {
  @Input() cartItem: ProductItem;
  isMenuActive: boolean = false;

  constructor(public marketService: MarketService, private router: Router) {}

  ngOnInit(): void {}

  add(cartItem: ProductItem) {
    this.marketService.productAmountAdd(cartItem);
  }

  remove(cartItem: ProductItem) {
    this.marketService.productAmountRemove(cartItem);
  }

  async navigateTo(data: ProductItem) {
    this.marketService.product = { ...data };
    this.marketService.product.count = data.minBuyAmount ? data.minBuyAmount : 1;
    this.router.navigateByUrl(`/market/product/${data.id}`);
  }

  removeProduct(id) {
    this.marketService.removeProduct(id);
    const shopList = this.marketService.shoppingCart$.getValue();
    console.log(shopList.length);
    if (shopList.length === 0) {
      this.router.navigate(['/wallet']);
    }
  }

  toggleMenu() {
    this.isMenuActive = !this.isMenuActive;
  }
}
