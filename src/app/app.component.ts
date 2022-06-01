import { GoogleAnalyticsService } from './shared/services/google-analytics.service';
import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from './shared/services/auth.service';
import { UserService } from './shared/services/user.service';
import { DeviceService } from './shared/services/device.service';
import { BalanceService } from './shared/services/balance.service';
import { MiningProcessService } from './shared/services/miner-services/mining-process.service';
import { ModalService } from './shared/services/modal.service';
import { UnlinkedDeviceModalComponent } from './shared/components/modals/unlinked-device-modal/unlinked-device-modal.component';
import { ElectronService } from './shared/services/electron.service';
import { ElectronLogHandler } from './shared/services/electron-log-handler.service';
import { MenuService } from './shared/services/menu.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  styles: [
    `
      :host {
        display: flex;
        height: 100%;
        width: 100%;
      }
    `
  ]
})
export class AppComponent implements OnInit {
  constructor(
    private electronService: ElectronService,
    private userService: UserService,
    private authService: AuthService,
    private balanceService: BalanceService,
    private deviceService: DeviceService,
    private googleService: GoogleAnalyticsService,
    private miningProcessService: MiningProcessService,
    private modalService: ModalService,
    /**
     * DO NOT remove these injections!
     * electronLogHandler should be injected somewhere to show logs from electron.
     */
    private electronLogHandler: ElectronLogHandler,
    public menuService: MenuService
  ) {
    /** Disable browser fullscreen */
    document.addEventListener('keydown', (e) => {
      if (e.key == 'F11') e.preventDefault();
    });
  }

  ngOnInit() {
    this.authService.isLoggedIn().subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.userService.getUserInfo().subscribe(
          (response) => {
            console.log('Get user info:', response);
            if (response.success) {
              this.userService.profile = response.data;
              if (this.userService.profile) {
                this.deviceService.isDeviceLinkedToUser();
              }
            } else {
              this.userService.createNewUser().subscribe((response) => {
                if (response.success) {
                  this.userService.profile = response.data;
                  this.balanceService.refreshBalances();
                  if (this.userService.profile) {
                    this.deviceService.isDeviceLinkedToUser();
                  }
                } else {
                  console.log('Error while creating new user', response);
                }
              });
            }
          },
          (error) => {
            console.log(error);
          }
        );
      }
      this.balanceService.refreshBalances();
      this.deviceService.getDeviceAll();
    });

    this.deviceService.isDeviceLinked.subscribe((res) => {
      console.log('isDeviceLinked', res);

      if (!res) {
        this.modalService
          .create('deviceModal', UnlinkedDeviceModalComponent, { escapable: false, dismissable: false })
          .open();
      }
    });

    this.googleService.pageView();
  }

  /** This is Angular listener which detect when user leaves application or Angular application "die" */
  @HostListener('window:unload', ['$event'])
  unloadHandler(event) {
    this.miningProcessService.quitAppFlow();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target.innerWidth < 1440) {
      this.menuService.closeMenu();
    } else {
      this.menuService.openMenu();
    }
  }
}
