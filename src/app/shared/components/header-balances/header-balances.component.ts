import { Component, OnInit } from '@angular/core';
import { NepService } from '../../services/nep.service';
import { BalanceService } from '../../services/balance.service';

@Component({
  selector: 'app-header-balances',
  templateUrl: './header-balances.component.html',
  styleUrls: ['./header-balances.component.scss']
})
export class HeaderBalancesComponent implements OnInit {
  constructor(public nepService: NepService, public balanceService: BalanceService) {}

  ngOnInit(): void {}
}
