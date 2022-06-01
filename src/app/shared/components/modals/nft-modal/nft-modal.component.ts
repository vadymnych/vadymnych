import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import * as WalletValidator from 'multicoin-address-validator';
import { ModalService } from '../../../services/modal.service';
import { UserService } from '../../../services/user.service';
import { Button, ClaimPromotionRequest } from '../../../interfaces';

@Component({
  selector: 'app-nft-modal',
  templateUrl: './nft-modal.component.html',
  styleUrls: ['./nft-modal.component.scss']
})
export class NftModalComponent {
  nftButton: Button = { name: 'Submit', type: 'submit' };
  validWallet: boolean;
  sub$: Subscription;

  form: FormGroup = new FormGroup({
    wallet: new FormControl('', [Validators.required, Validators.minLength(42), Validators.maxLength(42)])
  });

  constructor(
    private modalService: ModalService,
    private toastrService: ToastrService,
    private userService: UserService
  ) {}

  onSubmit() {
    if (this.form.valid) {
      const { wallet } = this.form.value;

      const isValidWallet = WalletValidator.validate(wallet, 'tusd', 'BTC', 'eth');

      if (isValidWallet) {
        const claimRequest: ClaimPromotionRequest = {
          promotionType: this.modalService.bufferData,
          walletAddress: wallet
        };

        this.userService.claimNFT(claimRequest).subscribe((response) => {
          if (response.success) {
            this.toastrService.success('Claimed successfully.');
          } else {
            this.toastrService.error('Something went wrong.');
          }
        });
      } else {
        this.toastrService.error('Error: your wallet address is incorrect');
      }

      this.form.reset();
      this.modalService.close();
    }
  }
}
