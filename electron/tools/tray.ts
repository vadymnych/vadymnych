import { app, Tray, Menu, ipcMain } from 'electron';
import * as path from 'path';
import { openPlatform } from '../main';

let mining = true;
ipcMain.on('mining-enabled', (event, arg) => {
  mining = true;
});

ipcMain.on('mining-disabled', (event, arg) => {
  mining = false;
});

export function createTray(platformWindow) {
  const tray = new Tray(getTrayIconPath(false));

  tray.setToolTip('Gaimin.io Monetization App');

  tray.on('right-click', (event) => {
    tray.popUpContextMenu(createMenu(platformWindow));
  });

  tray.on('double-click', (event) => {
    openPlatform('profile');
  });
  return tray;
}

let trayData;

ipcMain.on('tray-menu', (_, data) => {
  trayData = data;
});

function createMenu(platformWindow) {
  let miningToggleMenuItem = null;
  let { trayMenu, isAuthorized } = trayData;
  let menuItems = [];
  let menu;

  trayMenu.forEach(({ text, url }) => {
    menuItems.push({
      label: text,
      type: 'normal',
      click: () => openPlatform(url.replace('/', ''))
    });
  });

  if (mining) {
    miningToggleMenuItem = {
      label: 'Pause Monetization',
      type: 'normal',
      click: () => {
        platformWindow.webContents.send('mining-stop-from-tray', 'GPU');
        // platformWindow.webContents.send( 'mining-stop', 'CPU' );
      }
    };
  } else {
    miningToggleMenuItem = {
      label: 'Resume Monetization',
      type: 'normal',
      click: () => {
        platformWindow.webContents.send('mining-start-from-tray', 'GPU');
        // platformWindow.webContents.send( 'mining-start', 'CPU' );
      }
    };
  }

  if (isAuthorized) {
    menu = [
      // { label: 'Device Balance ' + getTotalBalance(BalancePoller.deviceBalance) + ' USDT', type: 'normal' },
      // { label: 'User Balance ' + getTotalBalance(BalancePoller.userBalance) + ' USDT', type: 'normal' },
      // { type: 'separator' },
      miningToggleMenuItem,
      ...menuItems,
      { type: 'separator' },
      { label: 'Quit', type: 'normal', click: () => app.quit() }
    ];

    return Menu.buildFromTemplate(menu);
  }

  menu = [...menuItems, { type: 'separator' }, { label: 'Quit', type: 'normal', click: () => app.quit() }];

  return Menu.buildFromTemplate(menu);
}

function getTrayIconPath(active: boolean) {
  const filename = active ? 'gaimin-icon-tray-active.png' : 'gaimin-icon-tray-inactive.png';
  return app.isPackaged
    ? path.join(process.resourcesPath, 'electron/resources/' + filename)
    : 'electron/resources/' + filename;
}

export function updateTrayIcon(tray: Tray, isMiningActive: boolean) {
  if (tray != null) {
    tray.setImage(getTrayIconPath(isMiningActive));
  }
}

export function checkingForMining(tray: Tray, obj) {
  if (!obj.CPU.isMining && !obj.GPU.isMining) {
    updateTrayIcon(tray, false);
  } else {
    updateTrayIcon(tray, true);
  }
}
