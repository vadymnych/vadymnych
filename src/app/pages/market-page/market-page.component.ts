import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MarketService } from '../../shared/services/market.service';

@Component({
  selector: 'app-market-page',
  templateUrl: './market-page.component.html',
  styleUrls: ['./market-page.component.scss']
})
export class MarketPageComponent implements OnInit {
  constructor(public marketService: MarketService, private router: Router) {}

  ngOnInit() {
    this.marketService.getProduct(1);
  }
}
