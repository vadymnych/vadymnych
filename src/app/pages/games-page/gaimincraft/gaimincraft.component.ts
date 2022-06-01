import { Component, OnInit } from '@angular/core';
import { ProductInterface, RedirectData } from '../../../shared/interfaces';
import { MarketService } from '../../../shared/services/market.service';

@Component({
  selector: 'app-gaimincraft',
  templateUrl: './gaimincraft.component.html',
  styleUrls: ['./gaimincraft.component.scss']
})
export class GaimincraftComponent implements OnInit {
  recommendationData: ProductInterface[];
  redirectData: RedirectData = {
    redirectUrl: 'market',
    redirectTitleName: 'Go to Marketplace'
  };

  constructor(public marketService: MarketService) {}

  ngOnInit(): void {
    this.marketService.getRecommendationsProducts(1, 10, true).subscribe((res) => {
      this.recommendationData = res.data.offers;
    });
  }
}
