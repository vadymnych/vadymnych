import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ArkaneService } from '../../../../arkane/arkane.service';
import { ElectronService } from '../../../services/electron.service';
import { ModalService } from '../../../services/modal.service';
import { Button, TransactionData } from '../../../interfaces';

@Component({
  selector: 'app-send-funds-modal',
  templateUrl: './send-funds-modal.component.html',
  styleUrls: ['./send-funds-modal.component.scss']
})
export class SendFundsModalComponent implements OnDestroy, OnInit {
  transactionConfig: TransactionData;
  form: FormGroup;
  symbol;
  tokenAdress;
  tokkenId;
  gasPrice;
  value;
  button: Button = { name: 'Send', type: 'submit' };

  constructor(
    private modalService: ModalService,
    private toastrService: ToastrService,
    public arkaneService: ArkaneService,
    private electronService: ElectronService
  ) {}

  async ngOnInit() {
    this.tokenAdress = await this.arkaneService.tokens.result[0].tokenAddress;
    this.symbol = await this.arkaneService.tokens.result[0].symbol;

    this.form = new FormGroup({
      addressTo: new FormControl('', [Validators.required]),
      amount: new FormControl('', [Validators.required]),
      currency: new FormControl(this.symbol)
    });

    this.arkaneService.fetchGasPrice().then((response) => {
      this.gasPrice = response.fast * Math.pow(10, 9);
      this.gasPrice.toString();
    });
  }

  async onSubmit() {
    if (this.form.valid) {
      this.modalService.close();
      const to = this.form.value['addressTo'];
      const value = this.form.value['amount'] * Math.pow(10, 19);
      const path = 'transaction/execute/matic_erc20_transaction';
      const transferLink = this.arkaneService.createLinkToTransferToken(
        path,
        value,
        to,
        this.tokenAdress,
        this.gasPrice
      );
      transferLink
        .then((url) => {
          this.electronService.shell.openExternal(url);
          this.electronService.ipcRenderer.send('arkane-transfer-token');
        })
        .catch(() => {
          this.toastrService.error('Unable to transfer funds.');
        });

      this.form.reset({
        currency: this.symbol
      });
    }
  }

  ngOnDestroy(): void {}
}

// { "walletId": "7c280404-2490-4533-8105-80c4436442c3", "gasPrice": 92400000000, "gas": 200000, "value": 5000000000000000000, "to": "0xF49A713580f57d77e7Cf390A647Be73f4AE3bdE0", "tokenAddress": "0xA7cE868f6490186Ac57fA12174dF770672EC0950", "type": "ETHEREUM_ERC20_TRANSACTION" }
