import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItemInterface, Button } from '../../../shared/interfaces';
import { AuthService } from '../../../shared/services/auth.service';
import { ElectronService } from '../../../shared/services/electron.service';
import { AutoUpdaterService } from '../../../shared/services/auto-updater.service';
import { MenuService } from '../../../shared/services/menu.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit {
  @Output() collapseStatus: EventEmitter<boolean> = new EventEmitter<boolean>();

  isLoggedIn: boolean = false;
  loginButton: Button = { name: 'Login', size: 'small' };

  mainMenu: MenuItemInterface[] = [
    { icon: 'icon-Home', text: 'Home', url: '/home', isDisabled: false },
    { icon: 'icon-Games', text: 'Games', url: '/games', showInTrayMenu: true },
    { icon: 'icon-Market', text: 'Marketplace', url: '/market', showInTrayMenu: true },
    { icon: 'icon-Dashboard', text: 'Dashboard', url: '/dashboard', showInTrayMenu: true },
    { icon: 'icon-Collection', text: 'Collection', url: '/#', isDisabled: true },
    { icon: 'icon-Wallet', text: 'Wallet', url: '/wallet' },
    { icon: 'icon-Nep-Squad', text: 'NEP Squad', url: '/nep' }
  ];

  bottomMenu: MenuItemInterface[] = [
    { text: 'Benchmarking', url: '/benchmarking' },
    { text: 'Profile', url: '/profile' },
    { text: 'Support', url: '/#', isDisabled: false },
    { text: 'App Settings', url: '/#', isDisabled: true }
  ];

  constructor(
    private electronService: ElectronService,
    private authService: AuthService,
    private router: Router,
    public autoUpdateService: AutoUpdaterService,
    public menuService: MenuService
  ) {}

  ngOnInit() {
    if (!this.electronService.isElectronApp) return;

    this.authService.isLoggedIn().subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;
    });

    this.electronService.ipcRenderer.on('login-success', () => {
      this.updateTrayMenu(true);
    });

    this.electronService.ipcRenderer.on('logout', () => {
      this.updateTrayMenu();
    });

    this.updateTrayMenu();
  }

  updateTrayMenu(loggedIn?: boolean) {
    let trayMenu;
    let isAuthorized;

    if (loggedIn) {
      trayMenu = this.mainMenu.filter((menuItem) => {
        return !menuItem.isDisabled && !menuItem.isToggleButton;
      });
      isAuthorized = true;
    } else {
      trayMenu = this.mainMenu.filter((menuItem) => {
        return menuItem.showInTrayMenu && !menuItem.isDisabled && !menuItem.isToggleButton;
      });
      isAuthorized = false;
    }

    this.electronService.ipcRenderer.send('tray-menu', {
      trayMenu,
      isAuthorized
    });
  }

  onLogin() {
    this.authService.login();
  }

  openProfile() {
    this.router.navigateByUrl('/profile');
  }
}
