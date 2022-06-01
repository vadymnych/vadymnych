import { Component, OnInit } from '@angular/core';
import { WithdrawalData } from 'src/app/shared/interfaces';
import { UserService } from 'src/app/shared/services/user.service';
import { WithdrawalService } from 'src/app/shared/services/withdrawal.service';

@Component({
  selector: 'app-transactions-table',
  templateUrl: './transactions-table.component.html',
  styleUrls: ['./transactions-table.component.scss']
})
export class TransactionsTableComponent implements OnInit {
  withdrawals: WithdrawalData[];

  constructor(private withdrawalService: WithdrawalService) {}

  getStatusColor(status) {
    switch (status) {
      case 'COMPLETED':
      case 'VERIFIED':
        return '#01ECA5FF';
      case 'PENDING':
      case 'PENDING_EMAIL_VERIFICATION':
        return '#CFDB4AFF';
      case 'FAILED':
      case 'CANCELLED':
      case 'EXPIRED':
        return '#DB4D4DFF';
      default:
        console.log('Wrong status', status);
    }
  }

  ngOnInit() {
    this.withdrawalService.getUserWithdrawals();

    this.withdrawalService.withdrawalObserver.subscribe((response) =>
      (this.withdrawals = response).sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime())
    );
  }
}
