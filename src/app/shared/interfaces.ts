/** Shared Interfaces */

export interface Response<T> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
}

interface ErrorResponse {
  description: string;
  type: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalResults: number;
}

/** Other Interfaces */

/** Balance interfaces */

export interface BalanceResponse {
  paid?: Amount;
  unpaid?: Amount;
}

export interface BalancePaid {
  paid: Amount;
}

export interface BalanceStatus {
  percent: number;
  hoursLeft: number;
  type: string;
}

export interface BalanceUnpaid {
  unpaid: Amount;
  status: BalanceStatus;
}

export interface Amount {
  USDT20: number;
  GMRX: number;
}

/** Withdrawal */

export interface WithdrawalData {
  amount: number;
  currencyCode: string;
  transactionHash: string;
  walletAddress: string;
  transactionStatus: string;
  verificationStatus: string;
  status: string;
  verificationIssuedAt: string;
  transactionExplorerUrl: string;
  createdOn: string;
  lastModifiedOn: string;
}

export interface MakeWithdrawal {
  amount: number;
  currency: string;
  walletAddress: string;
}

/** Nep interfaces */

export interface NepReferralNetwork {
  referralLevelTotals: [
    {
      level: number;
      numberOfReferrals: number;
    }
  ];
}

export interface NepLevel {
  level: number;
  numberOfReferrals: number;
  nep: Amount;
  progress: {
    percent: number;
    hoursLeft: number;
    type: string;
  };
}

export interface NepHistory {
  date: string;
  level1: number;
  level2: number;
  level3: number;
  total: number;
}

export interface NepTotal {
  total?: any;
  estimated?: any;
}

/** UI interfaces */

export interface Button {
  name?: string;
  icon?: string;
  type?: string;
  dataType?: string;
  classMod?: string;
  size?: string;
}

export interface MenuItemInterface {
  altText?: string;
  customClass?: string;
  icon?: any;
  isDisabled?: boolean;
  isToggleButton?: boolean;
  text?: string;
  url?: string;
  href?: string;
  showInTrayMenu?: boolean;
}

export interface RedirectData {
  redirectTitleName: string;
  redirectUrl: string;
}

/** Promotion */

export interface PromotionData {
  miningTimeH: number;
  rewards: {
    LEGS_OF_THE_FORMICIDAE: number;
    CHESTPLATE_OF_THE_ARTHROPOD: number;
    HELMET_OF_THE_COLEOPTERA: number;
  };
}

export interface ClaimPromotionRequest {
  walletAddress: string;
  promotionType: string;
}

/** Notification */

export interface Notification {
  title: string;
  message: string;
  time?: Date;
  critical?: boolean;
}

/** HelpRequest */

export interface HelpRequest {
  scopes: any[];
  subject: string;
  description: string;
  email: string;
  deviceToken: string;
  appVersion: string;
}

/** Venly interfaces */

export interface ProductInterface {
  id: string;
  name: string;
  amount: number;
  price: number;
  currency: string;
  description: string;
  imageUrl: string;
  maxBuyAmount: number;
  minBuyAmount: number;
}

export interface ProductItem extends ProductInterface {
  count: number;
}

export interface MarketOffers {
  offers: ProductInterface[];
  pagination: Pagination;
}

export interface MarketOffersBuy {
  data: [
    {
      id: string;
      status: string;
    }
  ];
}

export interface OffersList {
  offerId: string;
  amount: number;
}

export interface PurchaseDataRequest {
  offers: OffersList[];
  walletAddress: string;
}

/** Device interfaces */

export interface DeviceData {
  device: DeviceResponse;
  balance: BalanceResponse;
  systemInfo: DeviceSystemInfoResponse;
  lastOnline: string;
  averageHashrate: number;
}

export interface DeviceResponse {
  id: number;
  oktaId: string;
  userId: bigint;
}

export interface DeviceSystemInfoResponse {
  gpu: [
    {
      vendor: string;
      model: string;
      vram: number;
    }
  ];
  cpu: {
    manufacturer: string;
    brand: string;
    vendor: string;
    family: string;
    model: string;
    speed: number;
    speedInGHz: number;
    speedmin: number;
    speedmax: number;
    cores: number;
    physicalCores: number;
    processors: number;
  };
  os: {
    platform: string;
    distro: string;
    release: string;
  };
  createdOn: string;
  lastModifiedOn: string;
}

export interface DeviceInfo {
  deviceId?: number;
  systemInfo: DeviceSystemInfoResponse;
}

/** Minecraft token */

export interface MinecraftToken {
  token: string;
}

/** Wallet interfaces */

export interface WalletBalance {
  available: boolean;
  secretType: string;
  balance: number;
  gasBalance: number;
  symbol: string;
  gasSymbol: string;
  rawBalance: string;
  rawGasBalance: string;
  decimals: number;
}

export interface WalletData {
  id: string;
  address: string;
  walletType: string;
  secretType: string;
  createdAt: string;
  archived: boolean;
  alias: string;
  description: string;
  primary: boolean;
  hasCustomPin: boolean;
  identifier: any;
  balance: WalletBalance;
}

export interface WalletsResponse {
  success: boolean;
  result: WalletData[];
}

export enum SecretType {
  AETERNITY = 'AETERNITY',
  BITCOIN = 'BITCOIN',
  BSC = 'BSC',
  ETHEREUM = 'ETHEREUM',
  GOCHAIN = 'GOCHAIN',
  LITECOIN = 'LITECOIN',
  TRON = 'TRON',
  VECHAIN = 'VECHAIN',
  NEO = 'NEO',
  MATIC = 'MATIC'
}

export interface TransactionData {
  type: string;
  walletId: string;
  to: string;
  secretType: SecretType;
  value: BigInt;
}

/** User interfaces */

export interface UserInfo {
  login: string;
  avatarUrl: string;
  email: string;
  firstName: string;
  lastName: string;
  mobilePhone: string;
  nickName: string;
}

/** Miner interfaces */

export interface StartMiningRequest {
  miningMode: string;
  id?: any;
}

export interface StartMiningResponse {
  cryptoCode: string;
  walletId: string;
  workerName: string;
  poolUrl: string;
  useMinerStatistics: boolean;
}

export interface StartMiningEventResponse {
  id: number;
  deviceId: number;
  miningEventType: string;
}

export interface StartMinerData {
  ETH: CryptoToMinerName;
  RVN: CryptoToMinerName;
}

export interface SoftBenchmarkingData {
  isSoftBenchmarkingDone: boolean;
  minersAverageHashrate: MinersAverageHashRate;
}

export interface HardBenchmarkingData {
  ETH: Eth;
  RVN: Rvn;
  isHardBenchDone: boolean;
  isSoftBenchDone: boolean;
}

export interface MinersVersions {
  firstVersion: MinerData;
  secondVersion: MinerData;
  thirdVersion: MinerData;
}

export interface MinerData {
  minerVersion: string;
  isSupportedOnDevice: boolean;
  averageHashRate: number;
  isInProgress: boolean;
  isTheBest: boolean;
  benchmarkingDate: Date;
}

export interface CryptoToMinerName {
  minerName: string;
  minerVersion: string;
}

export interface MinersAverageHashRate {
  phoenix: number;
  trex: number;
  gminer: number;
}

export enum MinerVersion {
  firstVersion = 'firstVersion',
  secondVersion = 'secondVersion',
  thirdVersion = 'thirdVersion'
}

export interface Eth {
  phoenix: MinersVersions;
  trex: MinersVersions;
  gminer: MinersVersions;
}

export interface Rvn {
  trex: MinersVersions;
  gminer: MinersVersions;
}

export interface Aion {
  gminer: MinersVersions;
}

/** Games interfaces */

export enum COPY_TYPE {
  LOGIN_TOKEN = 'LOGIN_TOKEN',
  SERVER_ADDRESS = 'SERVER_ADDRESS'
}


export interface Games {
  name: string;
  navigateUrl: string;
  img: string;
  isComingSoon: boolean;
}


