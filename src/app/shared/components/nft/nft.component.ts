import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nft',
  templateUrl: './nft.component.html',
  styleUrls: ['./nft.component.scss']
})
export class NftComponent implements OnInit {
  constructor(public userService: UserService, private authService: AuthService) {}

  ngOnInit() {
    this.userService.updatePromotionData();
    if (this.userService.updatePromotionInterval.length < 1) {
      this.userService.updatePromotionInterval.push(
        setInterval(() => {
          this.userService.updatePromotionData();
        }, 1000 * 60 * 10)
      );
    }

    this.authService.isLoggedIn().subscribe((isLogin) => {
      if (!isLogin) {
        this.userService.updatePromotionInterval.forEach((interval) => {
          clearInterval(interval);
        });
      }
    });
  }
}
