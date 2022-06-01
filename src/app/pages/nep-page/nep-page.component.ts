import { Component, OnDestroy, OnInit } from '@angular/core';
import { NepService } from '../../shared/services/nep.service';
import { NepTotal } from '../../shared/interfaces';

@Component({
  selector: 'app-nep-page',
  templateUrl: './nep-page.component.html',
  styleUrls: ['./nep-page.component.scss']
})
export class NepPageComponent implements OnInit, OnDestroy {
  data = {
    totalRewards: {
      name: 'Lifetime NEP Rewards',
      currency: 'USDT'
    },
    estimatedRewards: {
      name: 'Estimated Pending Rewards',
      currency: 'USDT'
    },
    totalReferals: {
      name: 'Total referrals'
    }
  };

  referralLink: string;
  nepTotal: NepTotal;
  estimatedNep = 0;
  estimatedInterval;

  constructor(public nepService: NepService) {}

  ngOnInit() {
    this.nepService.getReferralLink().subscribe((response) => {
      if (response.success) {
        this.referralLink = response.data;
      }
    });

    this.nepService.getNepTotal().subscribe((response) => {
      this.nepTotal = response.data;
      this.estimatedNep = response.data.estimated;
      this.estimatedInterval = setInterval(() => {
        if (this.estimatedNep !== 0) {
          this.estimatedNep += 0.0000000001; // 10 after dot
        }
      }, 100);
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.estimatedInterval);
  }
}
