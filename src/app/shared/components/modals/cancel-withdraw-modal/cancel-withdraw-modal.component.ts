import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ModalService } from '../../../services/modal.service';
import { WithdrawalService } from '../../../services/withdrawal.service';
import { BalanceService } from '../../../services/balance.service';
import { Button } from '../../../interfaces';

@Component({
  selector: 'app-cancel-withdraw-modal',
  templateUrl: './cancel-withdraw-modal.component.html',
  styleUrls: ['./cancel-withdraw-modal.component.scss']
})
export class CancelWithdrawModalComponent {
  okButton: Button = { name: 'Yes' };
  cancelButton: Button = { name: 'No', classMod: 'secondary' };

  constructor(
    private withdrawalService: WithdrawalService,
    private modalService: ModalService,
    private toastrService: ToastrService,
    private balanceService: BalanceService
  ) {}

  onCancel() {
    this.modalService.close();
  }

  cancelWithdraw() {
    this.modalService.close();
    this.withdrawalService.cancelWithdrawal().subscribe(() => {
      this.balanceService.refreshPaidBalance();
      this.withdrawalService.getUserWithdrawals();
      this.toastrService.success('Transaction was cancelled');
    });
  }
}
