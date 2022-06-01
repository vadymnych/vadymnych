import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MarketService } from '../../../shared/services/market.service';
import { ModalService } from '../../../shared/services/modal.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { AuthService } from '../../../shared/services/auth.service';
import { AutoUpdaterService } from '../../../shared/services/auto-updater.service';
import { ElectronService } from '../../../shared/services/electron.service';
import { MiningProcessService } from '../../../shared/services/miner-services/mining-process.service';
import { SidebarService } from '../../../shared/services/sidebar.service';
import { MenuService } from '../../../shared/services/menu.service';
import { MiningSidebarComponent } from '../../../shared/components/sidebars/mining-sidebar/mining-sidebar.component';
import { NotificationsComponent } from '../../../shared/components/sidebars/notifications/notifications.component';
import { CartSidebarComponent } from '../../../shared/components/sidebars/cart-sidebar/cart-sidebar.component';

@Component({
  selector: 'app-platform-header',
  templateUrl: './platform-header.component.html',
  styleUrls: ['./platform-header.component.scss']
})
export class PlatformHeaderComponent implements OnInit {
  titleGPU: string;
  isProcessorsWorks: boolean = false;
  cartProductCount: number = 0;

  constructor(
    private electronService: ElectronService,
    public notificationService: NotificationService,
    private toastrService: ToastrService,
    private modalService: ModalService,
    private authService: AuthService,
    public marketService: MarketService,
    public autoUpdateService: AutoUpdaterService,
    public miningProcessService: MiningProcessService,
    private sideBarService: SidebarService,
    public menuService: MenuService
  ) {}

  get isMaximized() {
    return this.electronService?.ipcRenderer.sendSync('is-maximize');
  }

  ngOnInit(): void {
    this.marketService.shoppingCart$.subscribe((data) => {
      this.cartProductCount = data.length;
    });

    this.miningProcessService.isHardBenchmarkingActive$.subscribe((isOn) => {
      this.isProcessorsWorks = isOn;
      if (isOn) {
        this.titleGPU = 'GPU Benchmarking';
      } else {
        this.titleGPU = 'GPU Monetization';
      }
    });
  }

  toggleMenu() {
    this.menuService.toggleMenu();
  }

  openGaiminWebsite() {
    if (this.electronService.isElectronApp) {
      this.electronService.shell.openExternal('https://gaimin.io/');
    }
  }

  close() {
    this.electronService.ipcRenderer.send('hide-platform-window');
  }

  maximize(): void {
    this.electronService.ipcRenderer.send('maximize-unmaximize', this.isMaximized);
  }

  minimizeToTaskbar() {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.send('minimize-to-taskbar');
    }
  }

  openMiningPlugins() {
    this.sideBarService.createSideBar(MiningSidebarComponent);
  }

  openNotification() {
    this.sideBarService.createSideBar(NotificationsComponent);
  }

  openCart() {
    const cartList = this.marketService.shoppingCart$.getValue();
    cartList.length > 0
      ? this.sideBarService.createSideBar(CartSidebarComponent)
      : this.toastrService.error('Cart is empty');
  }
}
