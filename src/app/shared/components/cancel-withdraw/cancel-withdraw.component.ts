import { Component, OnInit } from '@angular/core';
import { WithdrawalService } from '../../services/withdrawal.service';
import { ModalService } from '../../services/modal.service';
import { Button } from '../../interfaces';
import { CancelWithdrawModalComponent } from '../modals/cancel-withdraw-modal/cancel-withdraw-modal.component';

@Component({
  selector: 'app-cancel-withdraw',
  templateUrl: './cancel-withdraw.component.html',
  styleUrls: ['./cancel-withdraw.component.scss']
})
export class CancelWithdrawComponent implements OnInit {
  button: Button = {
    icon: 'icon-Withdraw',
    name: 'Cancel',
    size: 'small',
    classMod: 'dark'
  };

  pendingAmount;

  get isPending(): boolean {
    return this.withdrawalService.isPending;
  }

  isDisabled = false;

  constructor(private modalService: ModalService, private withdrawalService: WithdrawalService) {}

  ngOnInit() {
    this.withdrawalService.getUserWithdrawals();

    this.withdrawalService.withdrawalObserver.subscribe((response) => {
      response.map((withdrawal) => {
        if (withdrawal.status === 'PENDING_EMAIL_VERIFICATION') {
          this.pendingAmount = withdrawal.amount;
        }
      });
    });
  }

  onClick() {
    this.modalService.create('cancelModal', CancelWithdrawModalComponent).open();
  }
}
