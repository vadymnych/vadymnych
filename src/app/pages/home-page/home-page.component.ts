import { Component, OnInit } from '@angular/core';
import { MarketService } from '../../shared/services/market.service';
import { ProductInterface, RedirectData } from '../../shared/interfaces';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  trendingNfts: ProductInterface[];
  trendingNftsRedirectData: RedirectData = {
    redirectTitleName: 'See more',
    redirectUrl: 'market'
  };

  newItems: ProductInterface[];
  newItemsRedirectData: RedirectData = {
    redirectTitleName: 'See more',
    redirectUrl: 'market'
  };

  constructor(private marketService: MarketService) {}

  ngOnInit(): void {
    this.marketService.getRecommendationsProducts(1, 20, true).subscribe((res) => {
      this.trendingNfts = res.data.offers;
    });

    this.marketService.getRecommendationsProducts(1, 20, true).subscribe((res) => {
      this.newItems = res.data.offers;
    });
  }
}
