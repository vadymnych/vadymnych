import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConfirmModalComponent } from '../modals/confirm-modal/confirm-modal.component';
import { ArkaneService } from '../../../arkane/arkane.service';
import { MarketService } from '../../services/market.service';
import { ModalService } from '../../services/modal.service';
import { SidebarService } from '../../services/sidebar.service';
import { AuthService } from '../../services/auth.service';
import { BalanceService } from '../../services/balance.service';
import { ProductItem } from '../../interfaces';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.scss']
})
export class OrderSummaryComponent implements OnInit {
  @Input() cartData: ProductItem[];
  balanceGMRX: number;
  private balanceSubscription$: Subscription;

  constructor(
    public marketService: MarketService,
    public arkaneService: ArkaneService,
    public authService: AuthService,
    private modalService: ModalService,
    private router: Router,
    private sideBarService: SidebarService,
    private balanceService: BalanceService
  ) {}

  ngOnInit(): void {
    if (this.authService.loggedIn.getValue()) {
      this.balanceSubscription$ = this.balanceService.paidBalance$.subscribe((balances) => {
        this.balanceGMRX = balances.GMRX;
      });
    }
  }

  toCart() {
    this.sideBarService.closeSideBar();
    this.router.navigate(['cart']);
  }

  toCheckout() {
    this.sideBarService.closeSideBar(); //323
    this.modalService.create('confirmPayment', ConfirmModalComponent).open();
  }
}
