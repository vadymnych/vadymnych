import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { NepService } from '../../services/nep.service';
import { WithdrawalService } from '../../services/withdrawal.service';
import { BalanceService } from '../../services/balance.service';
import { ModalService } from '../../services/modal.service';
import { WithdrawModalComponent } from '../modals/withdraw-modal/withdraw-modal.component';
import { Button, WithdrawalData } from '../../interfaces';

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.scss']
})
export class WithdrawComponent implements OnInit {
  button: Button = {
    icon: 'icon-Withdraw',
    name: 'Withdraw'
  };

  withdrawals: WithdrawalData[];
  status;

  get isDisabled(): boolean {
    return this.withdrawalService.isPending;
  }

  constructor(
    private modalService: ModalService,
    public nepService: NepService,
    public balanceService: BalanceService,
    private withdrawalService: WithdrawalService,
    public userService: UserService
  ) {}

  ngOnInit() {
    this.withdrawalService.getUserWithdrawals();
  }

  onClick() {
    this.modalService.create('withdrawModal', WithdrawModalComponent).open();
  }
}
