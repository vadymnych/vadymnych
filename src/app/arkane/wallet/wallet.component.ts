import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClipboardService } from 'ngx-clipboard';
import { ToastrService } from 'ngx-toastr';
import { ArkaneService } from '../arkane.service';
import { ElectronService } from '../../shared/services/electron.service';
import { ModalService } from '../../shared/services/modal.service';
import { SendFundsModalComponent } from '../../shared/components/modals/send-funds-modal/send-funds-modal.component';
import { Button } from '../../shared/interfaces';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit, OnDestroy {
  manageWalletUrl;

  buttonWallet: Button = {
    name: 'Manage Wallets',
    icon: 'icon-Withdraw'
  };

  buttonTransfer: Button = {
    name: 'Send Funds'
  };

  buttonRefresh: Button = {
    icon: 'icon-Refresh',
    classMod: 'dark'
  };

  constructor(
    public arkaneService: ArkaneService,
    private electronService: ElectronService,
    private modalService: ModalService,
    private clipboardService: ClipboardService,
    private toastrService: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {}

  onLogout() {
    this.arkaneService.logout();
    this.arkaneService.destroyServices();
    this.router.navigateByUrl('/wallet');
  }

  onCopy(walletAddress) {
    this.clipboardService.copy(walletAddress);
    this.toastrService.success(`The address "${walletAddress}" copied.`);
  }

  manageWallets() {
    this.arkaneService
      .createLinkTo('wallets/manage')
      .then((url) => {
        this.electronService.shell.openExternal(url);
        this.electronService.ipcRenderer.send('arkane-manage-wallets');
      })
      .then(() => this.router.navigateByUrl('/wallet'))
      .catch((error) => {
        this.toastrService.error(error);
      });
  }

  openSendFundsModal() {
    this.modalService.create('sendFundsModal', SendFundsModalComponent).open();
  }

  refreshData() {
    this.arkaneService.getData();
    this.toastrService.success('Wallet data refreshed.');
  }

  ngOnDestroy(): void {
    if (this.arkaneService.timerSubscription !== undefined) {
      this.arkaneService.timerSubscription.unsubscribe();
    }
  }
}
