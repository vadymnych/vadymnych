import * as systemInformation from 'systeminformation';
import { logIntoPlatform } from './logger';
import { LOG_TYPE } from './interfaces';
import { ipcMain } from 'electron';

interface SystemInfo {
  gpu: systemInformation.Systeminformation.GraphicsControllerData[];
  cpu: systemInformation.Systeminformation.CpuData | Object;
  os: systemInformation.Systeminformation.OsData | Object;
  macAddress: string;
}

const systemStatusUtilityInfo = {
  gpu: {},
  ram: {}
};

const systemInfo: SystemInfo = {
  gpu: [],
  cpu: {},
  os: {},
  macAddress: ''
};

let intervals: ReturnType<typeof setInterval>[] = [];

const SYSTEM_UTILITY_TIMER = 1000 * 90; // 90 sec

export async function getSystemInfo() {
  await Promise.all([
    (systemInfo.macAddress = (await systemInformation.uuid())['macs'][0]),
    (systemInfo.os = await systemInformation.osInfo()),
    (systemInfo.cpu = await systemInformation.cpu()),
    (systemInfo.gpu = (await systemInformation.graphics()).controllers)
  ]);
  return systemInfo;
}

export function turnOnSystemStatusUtilityInfo() {
  getSystemStatusUtilityInfo().then((info) => {
    logIntoPlatform(LOG_TYPE.SYSTEM_UTILITY, 'System status utility info: ' + JSON.stringify(info));
    intervals.push(setTimeout(turnOnSystemStatusUtilityInfo, SYSTEM_UTILITY_TIMER));
  });
}

export function turnOffSystemStatusUtilityInfo() {
  intervals.forEach((interval) => {
    clearInterval(interval);
  });
  intervals = [];
  console.log('System status utility off!');
}

ipcMain.on('get-system-status-utility-info', (event, arg) => {
  event.returnValue = systemStatusUtilityInfo;
});

async function getSystemStatusUtilityInfo() {
  const ram = await systemInformation.mem();
  const gpu = await systemInformation.graphics();

  const bestController = findBestGpuController(gpu.controllers);

  Object.assign(systemStatusUtilityInfo, {
    gpu: {
      memoryTotal: bestController?.vram,
      memoryUsed: bestController?.memoryUsed,
      memoryFree: bestController?.memoryFree,
      temperatureGpu: bestController?.temperatureGpu
    },
    ram: {
      totalRam: byteIntoMb(ram?.total),
      usedRam: byteIntoMb(ram?.used),
      available: byteIntoMb(ram?.available)
    }
  });

  return systemStatusUtilityInfo;
}

function findBestGpuController(controllers) {
  let maxVram = 0;
  let bestController;
  controllers.forEach((obj) => {
    if (obj.vram > maxVram) {
      maxVram = obj.vram;
      bestController = obj;
    }
  });
  return bestController;
}

function byteIntoMb(byte) {
  return Math.round(byte / 1024 / 1024);
}
