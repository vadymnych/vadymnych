import { Component, Input, OnInit } from '@angular/core';
import { MarketService } from '../../../../services/market.service';
import { ProductItem } from '../../../../interfaces';

@Component({
  selector: 'app-cart-item-sidebar',
  templateUrl: './cart-item-sidebar.component.html',
  styleUrls: ['./cart-item-sidebar.component.scss']
})
export class CartItemSidebarComponent implements OnInit {
  @Input() cartItem: ProductItem;

  constructor(public marketService: MarketService) {}

  ngOnInit(): void {}

  add(cartItem: ProductItem) {
    this.marketService.productAmountAdd(cartItem);
  }

  remove(cartItem: ProductItem) {
    this.marketService.productAmountRemove(cartItem);
  }
}
