import { Component, OnInit } from '@angular/core';
import { MarketService } from '../../../services/market.service';
import { ProductItem } from '../../../interfaces';

@Component({
  selector: 'app-cart-sidebar',
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.scss']
})
export class CartSidebarComponent implements OnInit {
  cartData: ProductItem[] = [];

  constructor(public marketService: MarketService) {}

  ngOnInit(): void {
    this.marketService.shoppingCart$.subscribe((shopCart) => {
      this.cartData = shopCart;
    });
  }
}
