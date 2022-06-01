import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ArkaneService } from '../../../../arkane/arkane.service';
import { ElectronService } from '../../../services/electron.service';
import { ModalService } from '../../../services/modal.service';
import { Button } from '../../../interfaces';

@Component({
  selector: 'app-transfer-nft-modal',
  templateUrl: './transfer-nft-modal.component.html',
  styleUrls: ['./transfer-nft-modal.component.scss']
})
export class TransferNftModalComponent implements OnDestroy, OnInit {
  tokenAdress;
  tokkenId;
  gasPrice;
  form: FormGroup;
  button: Button = { name: 'Send', type: 'submit' };

  constructor(
    private modalService: ModalService,
    private toastrService: ToastrService,
    public arkaneService: ArkaneService,
    private electronService: ElectronService
  ) {
    this.form = new FormGroup({
      addressTo: new FormControl('', [Validators.required]),
      amount: new FormControl('')
    });
  }

  ngOnInit() {
    this.tokenAdress = this.arkaneService.nft.contract.address;
    this.tokkenId = this.arkaneService.nft.id;
    this.arkaneService.fetchGasPrice().then((response) => {
      this.gasPrice = response.fast * Math.pow(10, 9);
      this.gasPrice.toString();
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.modalService.close();
      const addressTo = this.form.value['addressTo'];
      const amount = this.form.value['amount'] || 1;
      const path = 'transaction/execute/matic_erc721_transaction';
      const transferLink = this.arkaneService.createLinkToTransfer(
        path,
        addressTo,
        this.tokenAdress,
        this.tokkenId,
        this.gasPrice,
        amount
      );

      transferLink
        .then((url) => {
          this.electronService.shell.openExternal(url);
          this.electronService.ipcRenderer.send('arkane-transfer-nfts');
        })
        .catch(() => {
          this.toastrService.error('Unable to transfer NFT.');
        });
    }
  }

  ngOnDestroy(): void {}
}
