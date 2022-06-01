import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ModalService } from '../../../services/modal.service';
import { UserService } from '../../../services/user.service';
import { WithdrawalService } from '../../../services/withdrawal.service';
import { BalanceService } from '../../../services/balance.service';
import { Button } from '../../../interfaces';

@Component({
  selector: 'app-withdraw-modal',
  templateUrl: './withdraw-modal.component.html',
  styleUrls: ['./withdraw-modal.component.scss']
})
export class WithdrawModalComponent implements OnInit {
  withdrawButton: Button = { name: 'Withdrawal', type: 'submit' };
  cancelButton: Button = { name: 'Cancel', classMod: 'secondary' };

  WAValidator = require('multicoin-address-validator');

  availableBalance: number;
  minimumAmountToWithdraw: number;
  form: FormGroup = new FormGroup({
    amount: new FormControl('', [Validators.required]),
    wallet: new FormControl('', [Validators.required, Validators.minLength(42), Validators.maxLength(42)])
  });

  constructor(
    private modalService: ModalService,
    private toastrService: ToastrService,
    private userService: UserService,
    private withdrawalService: WithdrawalService,
    public balanceService: BalanceService
  ) {}

  ngOnInit() {
    this.withdrawalService
      .getMinimumWithdrawalAmount('USDT20')
      .subscribe((response) => (this.minimumAmountToWithdraw = response.data));
  }

  onCancel() {
    this.modalService.close();
  }

  onChange(value) {
    if (value < this.minimumAmountToWithdraw) {
      this.form.controls['amount'].setErrors({ minimum: true });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const { amount, wallet } = this.form.value;
      const validateWallet = this.WAValidator.validate(wallet, 'tusd', 'BTC', 'eth');
      if (validateWallet) {
        this.form.reset();
        this.withdrawalService.makeWithdrawal({ amount: amount, currency: 'USDT20', walletAddress: wallet }).subscribe(
          (response) => {
            console.log('Withdrawal response: ' + response + '\n' + JSON.stringify(response));
            this.toastrService.success('Please confirm withdrawal in your email.');
            this.balanceService.refreshPaidBalance();
            this.withdrawalService.getUserWithdrawals();
          },
          (error) => {
            console.error('Withdrawal error: ' + error + '\n ' + JSON.stringify(error));
            let errorMessage = 'Sorry, something went wrong.';

            if (error !== undefined && error.error !== undefined) {
              errorMessage = 'Error: ' + error.error;
            }
            this.toastrService.error(errorMessage);
          }
        );
        this.onCancel();
      } else {
        this.toastrService.error('Error: your wallet address is incorrect');
      }
    }
  }
}
