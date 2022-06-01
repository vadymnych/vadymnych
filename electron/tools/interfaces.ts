// Shared Interfaces
export interface Response<T> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
}

interface ErrorResponse {
  description: string;
  type: string;
}

// Other Interfaces

export interface GaiminSettings {
  deviceToken: string;
  oktaRefreshToken: string;
  arkaneRefreshToken: any;
  pushyDeviceToken: string;
}

export interface Devices {
  oktaId: string;
  jwt: string;
  active: boolean;
}

export interface DeviceToken {
  deviceToken: string;
}

export interface BalanceResponse {
  unpaid: Amount;
  paid: Amount;
}

interface Amount {
  GMRX: number;
  USDT20: number;
}

export enum Environment {
  LOCAL = '--local',
  QA = '--dev',
  PROD = ''
}

export enum LOG_TYPE {
  AUTO_UPDATER = 'AUTO_UPDATER',
  NEP = 'NEP',
  MINER = 'MINER',
  SYSTEM_UTILITY = 'SYSTEM_UTILITY',
  SYSTEM_ANALYZER = 'SYSTEM_ANALYZER',
  BALANCE_POLLER = 'BALANCE_POLLER',
  AUTH = 'AUTH',
  EVENT = 'EVENT',
  INFO = 'INFO',
  ERROR = 'ERROR'
}
