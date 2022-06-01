import { Component, DoCheck, Input, OnDestroy, OnInit } from '@angular/core';
import { NepReferralNetwork } from 'src/app/shared/interfaces';
import { NepService } from 'src/app/shared/services/nep.service';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-nep-table',
  templateUrl: './nep-table.component.html',
  styleUrls: ['./nep-table.component.scss']
})
export class NepTableComponent implements OnInit, DoCheck, OnDestroy {
  referralNetwork: NepReferralNetwork;
  nepLevels = [];
  referralNetworkChecked: boolean;

  constructor(public nepService: NepService, private userService: UserService) {}

  ngOnInit() {
    this.userService.getReferralNetwork().subscribe((response) => {
      this.referralNetwork = response.data;
      this.nepService.totalReferrals = response.data.referralLevelTotals.reduce(
        (sum, item) => sum + item.numberOfReferrals,
        0
      );
    });
  }

  ngDoCheck() {
    if (this.referralNetwork && !this.referralNetworkChecked) {
      this.getNepLevels();
      this.referralNetworkChecked = true;
    }
  }

  getNepLevels() {
    const levels = this.referralNetwork.referralLevelTotals;
    levels.forEach((item) => {
      if (item.numberOfReferrals) {
        this.userService.getNepLevel(item.level).subscribe((response) => {
          if (response.success) {
            this.nepLevels.push(response.data);
            this.nepService.totalRewards += response.data.nep.USDT20;
          }
        });
      } else {
        this.nepLevels.push({
          level: item.level,
          numberOfReferrals: 0,
          nep: { GMRX: 0, USDT20: 0 },
          progress: { percent: 0, hoursLeft: 0, type: 'DEFAULT' }
        });
      }
    });
  }

  ngOnDestroy() {
    this.nepService.totalRewards = 0;
  }
}
