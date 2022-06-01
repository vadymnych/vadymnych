import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { LoaderService } from '../../shared/services/loader.service';
import { WithdrawalData } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit {
  isAuthenticated: boolean;
  isPending = false;
  withdrawals: WithdrawalData[];
  pendingAmount;
  status: string;

  constructor(private authService: AuthService, private loaderService: LoaderService) {}

  ngOnInit() {
    this.authService.isLoggedIn().subscribe((isLoggedIn) => (this.isAuthenticated = isLoggedIn));
  }
}
