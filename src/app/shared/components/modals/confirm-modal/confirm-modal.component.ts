import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MarketService } from '../../../services/market.service';
import { ModalService } from '../../../services/modal.service';
import { Button, ProductItem } from '../../../interfaces';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent implements OnInit, OnDestroy {
  checkout: Button = { name: 'Confirm payment' };
  totalPrice;
  subTotal: Subscription;
  cartList: ProductItem[];

  constructor(private modalService: ModalService, private router: Router, public marketService: MarketService) {}

  ngOnInit(): void {
    this.subTotal = this.marketService.shoppingCart$.subscribe((data) => {
      this.cartList = data;
    });
  }

  ngOnDestroy() {
    this.subTotal.unsubscribe();
  }

  closePopUp() {
    this.modalService.closeById('confirmPayment');
    this.marketService.cartDataToArkane();
    this.router.navigate(['/market']);
    if (this.router.url === '/cart') {
      this.router.navigate(['/wallet']);
    }
  }
}
