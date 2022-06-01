import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MinerArguments } from './miner-arguments.service';
import { MinerRequestsService } from './miner-requests.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { MiningApiService } from './miner-api.service';
import {
  HardBenchmarkingData,
  MinerVersion,
  SoftBenchmarkingData,
  StartMinerData,
  StartMiningResponse
} from '../../interfaces';
import { environment } from '../../../../environments/environment';
import { OnlineService } from '../online.service';
import { ElectronService } from '../electron.service';

/** "firstVersion" this is the last version of miner */

@Injectable({
  providedIn: 'root'
})
export class MiningProcessService {
  private readonly os: string = this.electronService.isWindows ? 'win' : 'mac';
  private readonly HARD_BENCHMARKING_TIME_FOR_MINER = 1000 * 60 * 10; // 10 min
  private readonly NEXT_MINER_START_TIMER: number = 1000 * 60 * 7; // 7 min
  private readonly FAILURE_TIME_LIMIT: number = 1000 * 60; //1 minute
  private readonly START_MINING_DELAY: number = 1000 * 4; // 4 sec
  private readonly FAILURE_NUMBER_LIMIT: number = 2;

  private readonly cryptoCodeToMiner = {
    ETH: ['phoenix', 'trex', 'gminer'],
    RVN: ['trex', 'gminer']
  };

  private readonly minerRunMemory = {
    ETH: 4575,
    RVN: 3103
  };

  private miningFailureCounter: number = 0;
  private isMiningTurnedOn: boolean = false;
  private activeMiner: string;
  private isGpuAmd: boolean = false;
  private isMiningWorkBeforeConnectionLoss: boolean = false;
  private isBenchmarkingWorkBeforeConnectionLoss: boolean = false;
  private miningProcess;
  private checkZeroHashRateInterval;
  private hardBenchTimeout;
  private startMiningAfterLosingInternetTimer;
  private startBenchmarkingAfterLosingInternetTimer;
  private startMiningDelayTimer;
  private gpuInfo;
  private failureTimer;
  private startBenchmarkingAfterDownload: boolean = false;

  miningStatuses = {
    GPU: false,
    CPU: false
  };

  readonly isMiningInitiallyTurnedOn = {
    GPU: true,
    CPU: false
  };

  isMiningDownloaded: boolean = false;

  private softBenchmarkingData: SoftBenchmarkingData = {
    isSoftBenchmarkingDone: false,
    minersAverageHashrate: {
      phoenix: 0,
      trex: 0,
      gminer: 0
    }
  };

  private readonly SOFT_BENCHMARKING_DATA_ZERO: SoftBenchmarkingData = JSON.parse(
    JSON.stringify(this.softBenchmarkingData)
  );

  private hardBenchmarkingData: HardBenchmarkingData = {
    ETH: {
      phoenix: {
        firstVersion: {
          minerVersion: '',
          isSupportedOnDevice: false,
          averageHashRate: 0,
          isInProgress: false,
          isTheBest: false,
          benchmarkingDate: new Date(Date.now())
        },
        secondVersion: {
          minerVersion: '',
          isSupportedOnDevice: false,
          averageHashRate: 0,
          isInProgress: false,
          isTheBest: false,
          benchmarkingDate: new Date(Date.now())
        },
        thirdVersion: {
          minerVersion: '',
          isSupportedOnDevice: false,
          averageHashRate: 0,
          isInProgress: false,
          isTheBest: false,
          benchmarkingDate: new Date(Date.now())
        }
      },
      trex: {
        firstVersion: {
          minerVersion: '',
          isSupportedOnDevice: false,
          averageHashRate: 0,
          isInProgress: false,
          isTheBest: false,
          benchmarkingDate: new Date(Date.now())
        },
        secondVersion: {
          minerVersion: '',
          isSupportedOnDevice: false,
          averageHashRate: 0,
          isInProgress: false,
          isTheBest: false,
          benchmarkingDate: new Date(Date.now())
        },
        thirdVersion: {
          minerVersion: '',
          isSupportedOnDevice: false,
          averageHashRate: 0,
          isInProgress: false,
          isTheBest: false,
          benchmarkingDate: new Date(Date.now())
        }
      },
      gminer: {
        firstVersion: {
          minerVersion: '',
          isSupportedOnDevice: false,
          averageHashRate: 0,
          isInProgress: false,
          isTheBest: false,
          benchmarkingDate: new Date(Date.now())
        },
        secondVersion: {
          minerVersion: '',
          isSupportedOnDevice: false,
          averageHashRate: 0,
          isInProgress: false,
          isTheBest: false,
          benchmarkingDate: new Date(Date.now())
        },
        thirdVersion: {
          minerVersion: '',
          isSupportedOnDevice: false,
          averageHashRate: 0,
          isInProgress: false,
          isTheBest: false,
          benchmarkingDate: new Date(Date.now())
        }
      }
    },
    RVN: {
      trex: {
        firstVersion: {
          minerVersion: '',
          isSupportedOnDevice: false,
          averageHashRate: 0,
          isInProgress: false,
          isTheBest: false,
          benchmarkingDate: new Date(Date.now())
        },
        secondVersion: {
          minerVersion: '',
          isSupportedOnDevice: false,
          averageHashRate: 0,
          isInProgress: false,
          isTheBest: false,
          benchmarkingDate: new Date(Date.now())
        },
        thirdVersion: {
          minerVersion: '',
          isSupportedOnDevice: false,
          averageHashRate: 0,
          isInProgress: false,
          isTheBest: false,
          benchmarkingDate: new Date(Date.now())
        }
      },
      gminer: {
        firstVersion: {
          minerVersion: '',
          isSupportedOnDevice: false,
          averageHashRate: 0,
          isInProgress: false,
          isTheBest: false,
          benchmarkingDate: new Date(Date.now())
        },
        secondVersion: {
          minerVersion: '',
          isSupportedOnDevice: false,
          averageHashRate: 0,
          isInProgress: false,
          isTheBest: false,
          benchmarkingDate: new Date(Date.now())
        },
        thirdVersion: {
          minerVersion: '',
          isSupportedOnDevice: false,
          averageHashRate: 0,
          isInProgress: false,
          isTheBest: false,
          benchmarkingDate: new Date(Date.now())
        }
      }
    },
    isHardBenchDone: false,
    isSoftBenchDone: false
  };

  private readonly HARD_BENCHMARKING_DATA_ZERO: HardBenchmarkingData = JSON.parse(
    JSON.stringify(this.hardBenchmarkingData)
  );

  startMiningData: StartMinerData = {
    ETH: {
      minerName: 'phoenix',
      minerVersion: 'firstVersion'
    },
    RVN: {
      minerName: 'trex',
      minerVersion: 'firstVersion'
    }
  };

  private DEFAULT_START_MINING_DATA: StartMinerData = JSON.parse(JSON.stringify(this.startMiningData));

  private readonly responseTemplate = {
    templateETH: {
      cryptoCode: 'ETH',
      walletId: '0x9Ae8c8280480dAa70e38801f5d1b289ECB31B5aF',
      workerName: 'd9a5223b',
      poolUrl: 'eu1.ethermine.org:14444',
      useMinerStatistics: false
    },
    templateRVN: {
      cryptoCode: 'RVN',
      walletId: 'R9goYTQJdzrDqzEDoQ1uiyXCrN6y3D5KiT',
      workerName: 'd9a5223b',
      poolUrl: 'rvn.2miners.com:6060',
      useMinerStatistics: false
    }
  };

  public miningCryptoCode$: BehaviorSubject<string> = new BehaviorSubject<string>('RVN');
  public isDownloading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public hardBenchmarkingData$: BehaviorSubject<HardBenchmarkingData> = new BehaviorSubject<HardBenchmarkingData>(
    this.hardBenchmarkingData
  );
  public isHardBenchmarkingActive$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isMiningToggleEnable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(
    private electronService: ElectronService,
    private minerRequestsService: MinerRequestsService,
    private toastrService: ToastrService,
    private miningApiService: MiningApiService,
    private onlineService: OnlineService,
    private http: HttpClient
  ) {
    const fs = this.electronService.fs;
    if (!fs.existsSync(this.getMinersPath())) {
      this.downloadMiners();
    } else {
      this.isMiningDownloaded = true;
      if (this.isMiningDownloaded) {
        this.updateMinerVersion(fs, this.getMinersPath());
      }
    }
    this.initDataFromLocalStorage();
    if (this.electronService.ipcRenderer != null) {
      this.electronService.ipcRenderer.on('get-system-info', (event, args) => {
        console.log('GPU Controllers:', args);
        console.log('GPU info:', this.findBestGpuController(args.gpu));
        this.gpuInfo = this.findBestGpuController(args.gpu);
        // this.gpuInfo.vendor = 'Advanced Micro Devices, Inc.';
        // this.gpuInfo.model = 'Radeon(TM) RX 550';

        if (this.gpuInfo?.vendor.includes('Advanced Micro Devices') || this.gpuInfo?.model.includes('Radeon')) {
          this.isGpuAmd = true;
          console.log('AMD gpu detected!');
          this.startMiningData.RVN.minerName = 'gminer';
          this.cryptoCodeToMiner.ETH = this.deleteFromArrayItemByValue(this.cryptoCodeToMiner.ETH, 'trex');
          this.cryptoCodeToMiner.RVN = this.deleteFromArrayItemByValue(this.cryptoCodeToMiner.RVN, 'trex');

          console.log('NEW cryptoCodeToMiner', this.cryptoCodeToMiner);
          console.log('NEW startMiningData', this.startMiningData);
        }
        if (this.isMiningInitiallyTurnedOn.GPU && this.isMiningDownloaded) {
          this.start('GPU');
        }
      });

      this.electronService.ipcRenderer.on('install-miners-complete', (event, args) => {
        console.log('Miners install here:', args);
        this.updateMinerVersion(fs, this.getMinersPath());
        this.isDownloading$.next(false);
        this.toastrService.success('Miners was successfully installed');
        this.isMiningDownloaded = true;
        if (this.startBenchmarkingAfterDownload) {
          this.hardBenchmarking();
          return;
        }
        this.start('GPU');
      });

      this.electronService.ipcRenderer.on('install-miners-error', (event, args) => {
        console.log('Mining extract error', args);
        this.toastrService.error('Something went wrong while installing miners');
      });

      this.electronService.ipcRenderer.on('mining-start-from-tray', (event, args) => {
        this.start(args);
      });

      this.electronService.ipcRenderer.on('mining-stop-from-tray', (event, args) => {
        if (this.isHardBenchmarkingActive$.getValue()) {
          this.hardBenchmarking();
          return;
        }
        this.stop(args);
      });
    }

    this.hardBenchmarkingData$.subscribe((data) => {
      localStorage.setItem('hardBenchmarkingData', JSON.stringify(data));
    });

    this.onlineService.isAppOnline$.subscribe(
      (isOnline) => {
        clearTimeout(this.startMiningAfterLosingInternetTimer);
        clearTimeout(this.startBenchmarkingAfterLosingInternetTimer);
        if (!isOnline && this.isMiningTurnedOn) {
          if (this.isHardBenchmarkingActive$.getValue()) {
            this.hardBenchmarking();
            this.isBenchmarkingWorkBeforeConnectionLoss = true;
            return;
          }
          this.stop('GPU');
          console.log('this.isMiningTurnedOn', this.isMiningTurnedOn);
          this.isMiningWorkBeforeConnectionLoss = true;
        } else if (this.isBenchmarkingWorkBeforeConnectionLoss) {
          this.continueBenchmarkingAfterLosingInternet();
          return;
        } else {
          if (this.isMiningWorkBeforeConnectionLoss) {
            this.continueMiningAfterLosingInternet();
          }
        }
      },
      (error) => {
        console.log('Error while isAppOnline$', error);
      }
    );
  }

  onStatusChanged(status, type: string) {
    this.miningStatuses[type.toUpperCase()] = status;
  }

  start(miningMode: string = 'GPU', cryptoCode: string = 'default') {
    if (this.isMiningTurnedOn) {
      return;
    }
    this.isMiningTurnedOn = true;
    this.isMiningToggleEnable$.next(false);
    clearTimeout(this.startMiningAfterLosingInternetTimer);
    clearTimeout(this.startBenchmarkingAfterLosingInternetTimer);
    this.minerRequestsService.sendStartMiningRequest(miningMode)?.subscribe(
      (response) => {
        let responseTemplate: StartMiningResponse = response.data;
        console.log('StartMiningResponse:', responseTemplate);

        // responseTemplate = this.responseTemplate.templateETH;

        if (cryptoCode !== 'default') {
          switch (cryptoCode) {
            case 'ETH':
              responseTemplate = JSON.parse(JSON.stringify(this.responseTemplate.templateETH));
              break;
            case 'RVN':
              responseTemplate = JSON.parse(JSON.stringify(this.responseTemplate.templateRVN));
              break;
            default:
              console.log('Invalid crypto code', cryptoCode);
          }
          responseTemplate.workerName = response.data.workerName;
        }
        this.miningCryptoCode$.next(responseTemplate.cryptoCode);
        this.activeMiner = this.startMiningData[this.miningCryptoCode$.getValue()].minerName;
        console.log('Start mining data:', this.startMiningData);
        this.startMining(responseTemplate, miningMode);
      },
      (error) => {
        this.isMiningTurnedOn = false;
        this.isMiningToggleEnable$.next(true);
        clearTimeout(this.failureTimer);
        this.isMiningWorkBeforeConnectionLoss = true;
        if (this.isHardBenchmarkingActive$.getValue()) {
          this.hardBenchmarking();
          this.continueBenchmarkingAfterLosingInternet(1000 * 30);
        } else {
          this.continueMiningAfterLosingInternet(1000 * 30);
        }
        this.checkZeroHashRate(false);
        console.error('Start Mining error: \n' + error + '\n' + JSON.stringify(error));
        this.electronService.ipcRenderer.send('mining-disabled', miningMode);
        if (error.status === 400) {
          this.toastrService.error(
            'If the issue continues, please report the following error:\n' + error.error,
            'Unable to start the miner!'
          );
        } else {
          this.toastrService.error(
            'Please check your internet connection and try again.',
            'Unable to start the miner!'
          );
        }
      }
    );
  }

  private startMining(startMiningResponse: StartMiningResponse, miningMode: string = 'GPU') {
    const fs = this.electronService.fs;
    const childProcess = this.electronService.childProcess;
    this.isMiningToggleEnable$.next(true);
    this.miningApiService.hashRateList = [];
    this.miningApiService.averageHashRate = 0;
    this.checkZeroHashRate(true);
    clearTimeout(this.failureTimer);

    this.minerRequestsService.sendStartMiningEvent(miningMode);

    const minerPath = this.getMinerExecutablePath(
      startMiningResponse.cryptoCode,
      miningMode,
      this.startMiningData[startMiningResponse.cryptoCode].minerName,
      this.startMiningData[startMiningResponse.cryptoCode].minerVersion
    );
    console.log('The miner executable path is: ' + minerPath);

    if (!fs.existsSync(minerPath) && !fs.existsSync(minerPath + '.exe')) {
      console.error(`Miner for ${startMiningResponse.cryptoCode} was not found by path ${minerPath}.`);
      this.downloadMiners();
      this.customAntivirusToast();
      return;
    }

    let args = [];
    for (const minerArgsImpl of MinerArguments.getImplementations()) {
      if (
        minerArgsImpl.cryptoCode === startMiningResponse.cryptoCode &&
        minerArgsImpl.minerName === this.startMiningData[startMiningResponse.cryptoCode].minerName
      ) {
        args.push(minerArgsImpl.getMinerArguments(startMiningResponse, this.os));
        console.log('This is start mining args: ' + args);
        break;
      }
    }

    if (args.length === 0) {
      console.error('No arguments for miner process!');
      this.failedToStartMining(miningMode);
      return;
    }

    this.electronService.ipcRenderer.send('mining-enabled', miningMode);

    if (miningMode === 'GPU') {
      try {
        this.miningProcess = childProcess.spawn('cmd.exe', ['/c', `"${minerPath}"`, ...args], { shell: true });
      } catch (error) {
        console.log('Error while running the miner', error);
        this.stop('GPU');
        this.toastrService.error('Error while running the miner');
        return;
      }
    }

    console.log('Spawned child process with process id: ' + this.miningProcess.pid);

    const miningProcessStartTime = Date.now();

    this.miningProcess.stdout.on('data', (data) => {
      console.log(`%c [Miner] Child process stdout: ${data} `, 'color: #7302F3');
      this.minersLogChecker(data);
    });

    /** start miners API **/
    this.miningApiService.getMinersStats(this.activeMiner, this.isMiningTurnedOn);

    this.miningProcess.stderr.on('data', (data) => {
      console.error(`Child process stderr: ${data}`);
      this.failedToStartMining('GPU');
    });

    this.miningProcess.on('close', (code) => {
      console.log(`%c [Miner] Child process exited with code ${code}`, 'color: #7302F3');
      this.calculateNumberOfFailuresAndRestartIfMiningTurnedOn(miningProcessStartTime, miningMode);
    });
  }

  stop(miningMode: string = 'GPU') {
    this.checkZeroHashRate(false);

    clearTimeout(this.failureTimer);
    clearTimeout(this.startMiningAfterLosingInternetTimer);
    clearTimeout(this.startBenchmarkingAfterLosingInternetTimer);

    this.isMiningTurnedOn = false;
    this.isMiningWorkBeforeConnectionLoss = false;
    this.miningApiService.getMinersStats(this.activeMiner, this.isMiningTurnedOn);
    this.electronService.ipcRenderer.send('mining-disabled', miningMode);

    this.minerRequestsService.sendStopMiningEvent(miningMode)?.subscribe(
      (response) => {
        if (response.success) {
          console.log(
            'The mining event stop with id',
            this.minerRequestsService.miningEventsData[miningMode].miningEventId,
            'and response',
            response
          );
          this.minerRequestsService.miningEventsData[miningMode].miningEventId = 0;
        }
      },
      (error) => {
        console.log('Error in stop mining event', error);
      }
    );

    this.stopMiningProcess(miningMode);
  }

  private stopMiningProcess(miningMode: string = 'GPU') {
    if (!this.miningProcess) {
      console.log('Cannot stop null process');
      return;
    }
    this.miningFailureCounter = 0;

    console.log('Killing(SIGTERM) child process with pid ' + this.miningProcess.pid);
    const killed = this.miningProcess.kill('SIGTERM');

    this.killAllMiningProcess();

    if (!killed) {
      console.log('Killing(SIGKILL) child process with pid ' + this.miningProcess.pid);
      this.miningProcess.kill('SIGKILL');
      if (miningMode === 'GPU') {
        this.miningProcess = null;
      } else if (miningMode === 'CPU') {
        this.miningProcess = null;
      }
    }
  }

  private minersLogChecker(data) {
    if (this.activeMiner === 'phoenix' && data.includes('Eth speed:')) {
      this.miningApiService.getPhoenixMinerStats(data);
    }
    if (data.includes('out of memory') || data.includes('not enough free memory')) {
      this.toastrService.warning(
        `[${this.activeMiner}] You don\'t have enough memory to mine. Check your free GPU memory`,
        'Out of memory'
      );
      this.failureStop();
    }
    if (data.includes('Can\'t find nonce with device')) {
      this.failureStop();
    }
    if (data.includes('No device found')) {
      this.failureStop();
    }
    if (data.includes('Anti-hacking system detected modification of the miner memory')) {
      console.log();
      this.failureStop();
      this.customAntivirusToast();
    }
  }

  private calculateNumberOfFailuresAndRestartIfMiningTurnedOn(miningProcessStartTime: number, miningMode: string) {
    if (this.isHardBenchmarkingActive$.getValue()) {
      this.miningApiService.getMinersStats(this.activeMiner, false);
      this.checkZeroHashRate(false);
      return;
    }

    clearTimeout(this.failureTimer);
    if (this.isMiningTurnedOn) {
      this.isMiningTurnedOn = false;
      this.calculateNumberOfFailedMiningAttempts(miningProcessStartTime);
      if (this.miningFailureCounter < this.FAILURE_NUMBER_LIMIT) {
        setTimeout(() => {
          this.toastrService.error('There is some issue with monetization, will try to restart it shortly.');
          this.checkZeroHashRate(false);
          this.miningApiService.getMinersStats(this.activeMiner, false);
          this.electronService.ipcRenderer.send('mining-disabled', miningMode);
        }, 3000);

        this.failureTimer = setTimeout(() => {
          console.log('Restarting mining');
          this.start();
        }, this.FAILURE_TIME_LIMIT);
      } else {
        console.log('Mining restart failed. Only ' + this.FAILURE_NUMBER_LIMIT + ' attempts allowed.');
        this.stop();

        if (this.isPossibleToStartNextMiner()) {
          this.softBench();
          this.toastrService.error(
            'There is some issue with monetization, will try to restart it shortly with new miner'
          );
          setTimeout(() => {
            this.start();
          }, 2000);
        } else {
          this.toastrService.error('Unable to start the mining process on this PC :(');
          if (!this.hardBenchmarkingData.isHardBenchDone) {
            this.toastrService.warning('Try to make Benchmarking');
          }
        }
        this.miningApiService.getMinersStats(this.activeMiner, false);
      }
    } else {
      this.miningFailureCounter = 0;
    }
  }

  private calculateNumberOfFailedMiningAttempts(miningProcessStartTime: number) {
    if (Date.now() - miningProcessStartTime < this.FAILURE_TIME_LIMIT) {
      this.miningFailureCounter++;
      console.log('Mining failed in less than a minute ' + this.miningFailureCounter + ' times');
    } else {
      this.miningFailureCounter = 0;
    }
  }

  private failureStop() {
    this.miningProcess.kill('SIGTERM');
    this.miningProcess.kill('SIGKILL');
  }

  private failedToStartMining(miningMode: string = 'GPU') {
    setTimeout(() => {
      this.stop();
    }, 500);
  }

  /** Hard benchmarking **/

  hardBenchmarking() {
    try {
      if (this.isMiningTurnedOn) {
        this.stop();
        this.isBenchmarkingWorkBeforeConnectionLoss = false;
      }
      this.isHardBenchmarkingActive$.next(!this.isHardBenchmarkingActive$.getValue());
      console.log('GPU memory', this.gpuInfo.vram);
      // this.gpuInfo.vram = 2096;

      if (this.isHardBenchmarkingActive$.getValue()) {
        console.log('Bench is on', this.hardBenchmarkingData);
        this.checkZeroHashRate(false);
        this.hardBenchmarkingData = this.changeObjectKeyByValue(this.hardBenchmarkingData, 'isTheBest', false);
        this.hardBenchmarkingData$.next(this.hardBenchmarkingData);
        if (this.gpuInfo.vram > this.minerRunMemory.ETH) {
          console.log('Start mining from ETH');
          this.startMiningFromETH();
        } else if (this.gpuInfo.vram > this.minerRunMemory.RVN && this.gpuInfo.vram <= this.minerRunMemory.ETH) {
          console.log('Start mining from RVN');
          this.startMiningFromRVN();
        } else {
          console.log('Something went wrong');
          this.isHardBenchmarkingActive$.next(false);
          this.toastrService.warning(`You dont have enough GPU memory. Your GPU memory is:${this.gpuInfo.vram}.`);
        }
      } else {
        this.hardBenchmarkingData = this.changeObjectKeyByValue(this.hardBenchmarkingData, 'isInProgress', false);
        this.hardBenchmarkingData$.next(this.hardBenchmarkingData);
        this.findBestForETH();
        this.findBestForRVN();
        clearTimeout(this.hardBenchTimeout);
        clearTimeout(this.startMiningDelayTimer);
      }
    } catch (error) {
      console.log('Something went wrong while start benchmarking');
      this.toastrService.error('Something went wrong while hard benchmarking');
      if (this.isHardBenchmarkingActive$.getValue()) {
        this.hardBenchmarking();
      }
      if (this.isMiningTurnedOn) {
        this.stop();
      }
    }
  }

  private startMinerForATime(cryptoCode: string, minerName: string, minerVersion: string) {
    if (this.isGpuAmd && minerName === 'trex') {
      return new Promise((resolve, reject) => {
        this.hardBenchmarkingData[cryptoCode][minerName][minerVersion].isInProgress = false;
        this.hardBenchmarkingData[cryptoCode][minerName][minerVersion].averageHashRate = 0;
        this.hardBenchmarkingData[cryptoCode][minerName][minerVersion].benchmarkingDate = new Date(Date.now());
        resolve('Benchmarking ' + cryptoCode + ' on ' + this.activeMiner + ' is end');
      });
    }
    this.startMiningDelayTimer = setTimeout(() => {
      console.log('Start mining', cryptoCode, 'by', minerName, 'miner', minerVersion, 'version');
      this.startMiningData[cryptoCode].minerName = minerName;
      this.startMiningData[cryptoCode].minerVersion = minerVersion;
      this.start('GPU', cryptoCode);
      this.hardBenchmarkingData[cryptoCode][minerName][minerVersion].isInProgress = true;
    }, this.START_MINING_DELAY);

    return new Promise((resolve, reject) => {
      try {
        this.hardBenchTimeout = setTimeout(() => {
          this.stop();
          this.hardBenchmarkingData[cryptoCode][minerName][minerVersion].isInProgress = false;
          this.hardBenchmarkingData[cryptoCode][minerName][minerVersion].averageHashRate =
            this.miningApiService.averageHashRate;
          this.hardBenchmarkingData[cryptoCode][minerName][minerVersion].benchmarkingDate = new Date(Date.now());
          this.hardBenchmarkingData$.next(this.hardBenchmarkingData);

          resolve('Benchmarking ' + cryptoCode + ' on ' + this.activeMiner + ' is end');
        }, this.HARD_BENCHMARKING_TIME_FOR_MINER);
      } catch (error) {
        this.toastrService.error('Something went wrong while hard benchmarking');
        this.isHardBenchmarkingActive$.next(false);
        if (this.isMiningTurnedOn) {
          this.stop();
        }
        reject(error);
      }
    });
  }

  private startMiningFromETH() {
    this.startMinerForATime('ETH', 'phoenix', MinerVersion.firstVersion)
      .then((res) => {
        console.log(res);
        this.startMinerForATime('ETH', 'phoenix', MinerVersion.secondVersion).then((res) => {
          console.log(res);
          this.startMinerForATime('ETH', 'phoenix', MinerVersion.thirdVersion).then((res) => {
            console.log(res);
            this.startMinerForATime('ETH', 'trex', MinerVersion.firstVersion).then((res) => {
              console.log(res);
              this.startMinerForATime('ETH', 'trex', MinerVersion.secondVersion).then((res) => {
                console.log(res);
                this.startMinerForATime('ETH', 'trex', MinerVersion.thirdVersion).then((res) => {
                  console.log(res);
                  this.startMinerForATime('ETH', 'gminer', MinerVersion.firstVersion).then((res) => {
                    console.log(res);
                    this.startMinerForATime('ETH', 'gminer', MinerVersion.secondVersion).then((res) => {
                      console.log(res);
                      this.startMinerForATime('ETH', 'gminer', MinerVersion.thirdVersion).then((res) => {
                        console.log(res);
                        console.log('Start benchmarking RVN');
                        this.findBestForETH();
                        this.startMiningFromRVN();
                      });
                    });
                  });
                });
              });
            });
          });
        });
      })
      .catch((error) => {
        console.log('Something went wrong while start benchmarking:', error);
        this.toastrService.error('Something went wrong while hard benchmarking');
        if (this.isHardBenchmarkingActive$.getValue()) {
          this.hardBenchmarking();
        }
        if (this.isMiningTurnedOn) {
          this.stop();
        }
      });
  }

  private startMiningFromRVN() {
    this.startMinerForATime('RVN', 'trex', MinerVersion.firstVersion)
      .then((res) => {
        console.log(res);
        this.startMinerForATime('RVN', 'trex', MinerVersion.secondVersion).then((res) => {
          console.log(res);
          this.startMinerForATime('RVN', 'trex', MinerVersion.thirdVersion).then((res) => {
            console.log(res);
            this.startMinerForATime('RVN', 'gminer', MinerVersion.firstVersion).then((res) => {
              console.log(res);
              this.startMinerForATime('RVN', 'gminer', MinerVersion.secondVersion).then((res) => {
                console.log(res);
                this.startMinerForATime('RVN', 'gminer', MinerVersion.thirdVersion).then((res) => {
                  console.log(res);
                  this.hardBenchmarkingData.isHardBenchDone = true;
                  this.findBestForRVN();
                  this.hardBenchmarkingData$.next(this.hardBenchmarkingData);
                  this.isHardBenchmarkingActive$.next(false);
                  this.toastrService.success('Hard benchmarking is complete');
                  setTimeout(() => {
                    this.start();
                  }, 2000);
                });
              });
            });
          });
        });
      })
      .catch((error) => {
        console.log('Something went wrong while start benchmarking:', error);
        this.toastrService.error('Something went wrong while hard benchmarking');
        if (this.isHardBenchmarkingActive$.getValue()) {
          this.hardBenchmarking();
        }
        if (this.isMiningTurnedOn) {
          this.stop();
        }
      });
  }

  /** Soft benchmarking  **/

  private softBench() {
    if (!this.hardBenchmarkingData.isHardBenchDone) {
      if (!this.softBenchmarkingData.isSoftBenchmarkingDone) {
        this.softBenchmarkingData.minersAverageHashrate[this.activeMiner] = this.miningApiService.averageHashRate;
        localStorage.setItem('softBenchmarkingData', JSON.stringify(this.softBenchmarkingData));
        if (this.isPossibleToStartNextMiner()) {
          this.changeStartMiningDataForNextMiner(
            this.startMiningData[this.miningCryptoCode$.getValue()].minerName,
            this.miningCryptoCode$.getValue()
          );
          localStorage.setItem('startMiningData', JSON.stringify(this.startMiningData));
        } else {
          if (this.softBenchmarkingData.minersAverageHashrate[this.calculateBestMinerInSoftBench()] === 0) {
            return;
          } // add count of fail and go circle if last
          this.softBenchmarkingData.isSoftBenchmarkingDone = true;
          this.startMiningData[this.miningCryptoCode$.getValue()].minerName = this.calculateBestMinerInSoftBench();
          localStorage.setItem('startMiningData', JSON.stringify(this.startMiningData));
          localStorage.setItem('softBenchmarkingData', JSON.stringify(this.softBenchmarkingData));
          /** need to set data into table **/
          this.showSoftBenchResult(this.calculateBestMinerInSoftBench());
        }
      } else {
        console.log('Soft bench done');
      }
    }
  }

  private showSoftBenchResult(bestMinerName: string) {
    this.hardBenchmarkingData.isSoftBenchDone = true;
    const availableMinersForCrypto = this.cryptoCodeToMiner[this.miningCryptoCode$.getValue()];
    availableMinersForCrypto.forEach((el) => {
      this.hardBenchmarkingData[this.miningCryptoCode$.getValue()][el].firstVersion.averageHashRate =
        this.softBenchmarkingData.minersAverageHashrate[el];
    });
    this.hardBenchmarkingData[this.miningCryptoCode$.getValue()][bestMinerName].firstVersion.isTheBest = true;
    this.hardBenchmarkingData$.next(this.hardBenchmarkingData);
  }

  private calculateBestMinerInSoftBench() {
    return Object.keys(this.softBenchmarkingData.minersAverageHashrate).reduce((a, b) =>
      this.softBenchmarkingData.minersAverageHashrate[a] > this.softBenchmarkingData.minersAverageHashrate[b] ? a : b
    );
  }

  /** Check zero hash rate */

  private checkZeroHashRate(isMiningOn, timer = this.NEXT_MINER_START_TIMER) {
    if (isMiningOn) {
      this.checkZeroHashRateInterval = setInterval(() => {
        if (this.miningApiService.averageHashRate === 0 && this.isPossibleToStartNextMiner()) {
          this.runNextMiner(
            this.startMiningData[this.miningCryptoCode$.getValue()].minerName,
            this.miningCryptoCode$.getValue()
          );
        } else if (this.miningApiService.averageHashRate === 0 && !this.isPossibleToStartNextMiner()) {
          console.log('The mining was failed with different miners on your PC');
          this.toastrService.warning('The mining was failed with 0 hashrate and different miners on your PC :(');
          this.stop('GPU');
        }
      }, timer);
    } else {
      clearInterval(this.checkZeroHashRateInterval);
    }
  }

  private changeStartMiningDataForNextMiner(currentMiner, currentCryptoCode) {
    console.log('Current miner', currentMiner, 'current crypto code', currentCryptoCode);
    let indexOfCurrentMiner = this.cryptoCodeToMiner[currentCryptoCode].indexOf(currentMiner);
    indexOfCurrentMiner++;
    this.startMiningData[this.miningCryptoCode$.getValue()].minerName =
      this.cryptoCodeToMiner[this.miningCryptoCode$.getValue()][indexOfCurrentMiner];
    this.startMiningData[this.miningCryptoCode$.getValue()].minerVersion = MinerVersion.firstVersion;
    console.log('new start mining data', this.startMiningData);
  }

  private runNextMiner(currentMiner, currentCryptoCode) {
    this.stop();
    console.log('Current miner', currentMiner, 'current crypto code', currentCryptoCode);
    this.changeStartMiningDataForNextMiner(currentMiner, currentCryptoCode);
    setTimeout(() => {
      this.start();
    }, 3000);
  }

  private isPossibleToStartNextMiner(): boolean {
    const currentMinerName = this.startMiningData[this.miningCryptoCode$.getValue()].minerName;
    const maxIndexForCurrentMiner = this.cryptoCodeToMiner[this.miningCryptoCode$.getValue()].length - 1;
    const indexOfCurrentMiner = this.cryptoCodeToMiner[this.miningCryptoCode$.getValue()].indexOf(currentMinerName);

    if (indexOfCurrentMiner >= maxIndexForCurrentMiner) {
      console.log('Cant start next miner');
      return false;
    } else {
      console.log('Ready to start next miner');
      return true;
    }
  }

  /** miners -> miner_name -> miner_versions -> miner_exe **/

  private getMinersPath() {
    const isPackaged = this.electronService.isPackaged;
    const path = this.electronService.path;

    let minersPath = null;
    if (isPackaged) {
      const appPath = this.electronService.appPath;
      minersPath = path.join(path.dirname(appPath), '..', './miners');
    } else {
      const root = this.electronService.process.cwd();
      minersPath = path.join(root, './miners', this.os);
    }

    return minersPath;
  }

  private getMinerVersionLocalPath() {
    const isPackaged = this.electronService.isPackaged;
    const path = this.electronService.path;

    let minerVersionLocal = null;
    if (isPackaged) {
      const appPath = this.electronService.appPath;
      minerVersionLocal = path.join(path.dirname(appPath), '..', './resources/electron/resources');
    } else {
      const root = this.electronService.process.cwd();
      minerVersionLocal = path.join(root, './electron/resources');
    }

    return minerVersionLocal;
  }

  private getMinerExecutablePath(cryptoCode, miningMode, minerName, minerVersion = 'firstVersion') {
    const path = this.electronService.path;
    const pathToMinersFolder = this.getMinersPath();

    if (minerName == null) {
      console.error('Executable was not found by crypto code ' + cryptoCode);
      this.failedToStartMining(miningMode);
      this.customAntivirusToast();
      return pathToMinersFolder;
    }
    return path.resolve(path.join(pathToMinersFolder, minerName, minerVersion, minerName));
  }

  private customAntivirusToast() {
    this.toastrService.error(
      '<div class="toast-custom">Missing miner, could not start mining. Please reinstall. If this issue continues, please check our antivirus guides at:<br> ' +
        '<a href="https://gaimin.gg/help/antivirus/">https://gaimin.gg/help/antivirus</a></div>',
      '',
      {
        enableHtml: true,
        extendedTimeOut: 5000
      }
    );
  }

  quitAppFlow() {
    if (this.isMiningTurnedOn) {
      this.stop('GPU');
    }
    this.softBench();
    this.killAllMiningProcess();
  }

  private killAllMiningProcess() {
    const childProcess = this.electronService.childProcess;
    const minerNames = ['gminer.exe', 'phoenix.exe', 'trex.exe'];
    minerNames.forEach((el) => {
      childProcess.exec(`taskkill /IM "${el}" /T /F`);
    });
  }

  private findBestGpuController(controllers) {
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

  private deleteFromArrayItemByValue(array, value) {
    const index = array.indexOf(value);
    if (index !== -1) {
      array.splice(index, 1);
    }
    return array;
  }

  private downloadMiners() {
    if (this.electronService.isWindows) {
      if (this.isHardBenchmarkingActive$.getValue()) {
        this.hardBenchmarking();
        this.startBenchmarkingAfterDownload = true;
      }
      console.log('Miners download start');
      this.cleanBenchmarkingData();
      this.toastrService.success('Miners download start');
      this.isDownloading$.next(true);
      this.electronService.ipcRenderer.send('miner-download', environment.minersDownloadLink);
    }
  }

  private initDataFromLocalStorage() {
    if (localStorage.getItem('startMiningData') == null) {
      localStorage.setItem('startMiningData', JSON.stringify(this.startMiningData));
    }
    this.startMiningData = JSON.parse(localStorage.getItem('startMiningData'));
    console.log('Initial startMiningData:', this.startMiningData);

    if (localStorage.getItem('softBenchmarkingData') == null) {
      localStorage.setItem('softBenchmarkingData', JSON.stringify(this.softBenchmarkingData));
    }
    this.softBenchmarkingData = JSON.parse(localStorage.getItem('softBenchmarkingData'));
    console.log('Initial softBenchmarkingData:', this.softBenchmarkingData);

    if (localStorage.getItem('hardBenchmarkingData') == null) {
      localStorage.setItem('hardBenchmarkingData', JSON.stringify(this.hardBenchmarkingData));
    }
    this.hardBenchmarkingData = JSON.parse(localStorage.getItem('hardBenchmarkingData'));
    console.log('Initial hardBenchmarkingData:', this.hardBenchmarkingData);
    this.hardBenchmarkingData$.next(this.hardBenchmarkingData);
  }

  private cleanBenchmarkingData() {
    localStorage.removeItem('startMiningData');
    this.startMiningData = JSON.parse(JSON.stringify(this.DEFAULT_START_MINING_DATA));
    localStorage.setItem('startMiningData', JSON.stringify(this.startMiningData));
    console.log('startMiningData set to default:', this.startMiningData);
    localStorage.removeItem('softBenchmarkingData');
    this.softBenchmarkingData = JSON.parse(JSON.stringify(this.SOFT_BENCHMARKING_DATA_ZERO));
    localStorage.setItem('softBenchmarkingData', JSON.stringify(this.softBenchmarkingData));
    console.log('Empty soft benchmarking data:', this.softBenchmarkingData);
    localStorage.removeItem('hardBenchmarkingData');
    this.hardBenchmarkingData = JSON.parse(JSON.stringify(this.HARD_BENCHMARKING_DATA_ZERO));
    this.hardBenchmarkingData$.next(this.hardBenchmarkingData);
  }

  private continueMiningAfterLosingInternet(restartTime: number = 1000 * 10) {
    if (!this.isMiningTurnedOn) {
      this.toastrService.success('The mining will continue in a few seconds');
      this.startMiningAfterLosingInternetTimer = setTimeout(() => {
        console.log('continue Mining After Losing Internet');
        this.start('GPU');
      }, restartTime);
    }
  }

  private continueBenchmarkingAfterLosingInternet(restartTime: number = 1000 * 10) {
    if (!this.isMiningTurnedOn) {
      this.toastrService.success('The benchmarking will continue in a few seconds');
      this.startBenchmarkingAfterLosingInternetTimer = setTimeout(() => {
        console.log('continue Benchmarking After Losing Internet');
        this.hardBenchmarking();
      }, restartTime);
    }
  }

  private findBestForETH() {
    const tmpTheBest = {
      ETH: {
        phoenix: this.findBestVersionForMiner('ETH', 'phoenix'),
        trex: this.findBestVersionForMiner('ETH', 'trex'),
        gminer: this.findBestVersionForMiner('ETH', 'gminer')
      }
    };
    console.log('tmpTheBest', tmpTheBest);
    const bestMinerName = Object.keys(tmpTheBest.ETH).reduce((a, b) => {
      return tmpTheBest.ETH[a].averageHashRate > tmpTheBest.ETH[b].averageHashRate ? a : b;
    });
    const bestMinerVersion = this.findBestVersionForMiner('ETH', bestMinerName).bestVersionName;
    if (this.hardBenchmarkingData.ETH[bestMinerName][bestMinerVersion].averageHashRate === 0) {
      return;
    }
    this.hardBenchmarkingData.ETH[bestMinerName][bestMinerVersion].isTheBest = true;
    this.hardBenchmarkingData$.next(this.hardBenchmarkingData);
    this.startMiningData.ETH.minerName = bestMinerName;
    this.startMiningData.ETH.minerVersion = bestMinerVersion;
    localStorage.setItem('startMiningData', JSON.stringify(this.startMiningData));
  }

  private findBestForRVN() {
    const tmpTheBest = {
      RVN: {
        trex: this.findBestVersionForMiner('RVN', 'trex'),
        gminer: this.findBestVersionForMiner('RVN', 'gminer')
      }
    };
    console.log('tmpTheBest', tmpTheBest);
    const bestMinerName = Object.keys(tmpTheBest.RVN).reduce((a, b) => {
      return tmpTheBest.RVN[a].averageHashRate > tmpTheBest.RVN[b].averageHashRate ? a : b;
    });
    const bestMinerVersion = this.findBestVersionForMiner('RVN', bestMinerName).bestVersionName;
    if (this.hardBenchmarkingData.RVN[bestMinerName][bestMinerVersion].averageHashRate === 0) {
      return;
    }
    this.hardBenchmarkingData.RVN[bestMinerName][bestMinerVersion].isTheBest = true;
    this.hardBenchmarkingData$.next(this.hardBenchmarkingData);
    this.startMiningData.RVN.minerName = bestMinerName;
    this.startMiningData.RVN.minerVersion = bestMinerVersion;
    localStorage.setItem('startMiningData', JSON.stringify(this.startMiningData));
  }

  private findBestVersionForMiner(cryptoCode: string, minerName: string) {
    const averageHashRate = {
      firstVersion: this.hardBenchmarkingData[cryptoCode][minerName].firstVersion.averageHashRate,
      secondVersion: this.hardBenchmarkingData[cryptoCode][minerName].secondVersion.averageHashRate,
      thirdVersion: this.hardBenchmarkingData[cryptoCode][minerName].thirdVersion.averageHashRate
    };
    console.log('averageHashRate', averageHashRate);
    const bestVersionName = Object.keys(averageHashRate).reduce((a, b) => {
      return averageHashRate[a] > averageHashRate[b] ? a : b;
    });
    console.log('bestVersion', bestVersionName);
    return {
      averageHashRate: this.hardBenchmarkingData[cryptoCode][minerName][bestVersionName].averageHashRate,
      bestVersionName
    };
  }

  private changeObjectKeyByValue(object, changeKey, changeValue) {
    return JSON.parse(
      JSON.stringify(object, (key, value) => {
        if (key === changeKey) {
          return changeValue;
        }
        return value;
      })
    );
  }

  private updateMinerVersion(fs, minerVersionPath) {
    let minerVersions;
    fs.readFile(minerVersionPath + '/minerVersion.json', 'utf8', (err, minerVersionjson) => {
      if (err) {
        console.log('minerVersion.json read failed:', err);
      }
      minerVersions = JSON.parse(minerVersionjson);

      this.hardBenchmarkingData.ETH.gminer.firstVersion.minerVersion = minerVersions.gminer.firstVersion;
      this.hardBenchmarkingData.ETH.gminer.secondVersion.minerVersion = minerVersions.gminer.secondVersion;
      this.hardBenchmarkingData.ETH.gminer.thirdVersion.minerVersion = minerVersions.gminer.thirdVersion;
      this.hardBenchmarkingData.RVN.gminer.firstVersion.minerVersion = minerVersions.gminer.firstVersion;
      this.hardBenchmarkingData.RVN.gminer.secondVersion.minerVersion = minerVersions.gminer.secondVersion;
      this.hardBenchmarkingData.RVN.gminer.thirdVersion.minerVersion = minerVersions.gminer.thirdVersion;

      this.hardBenchmarkingData.ETH.trex.firstVersion.minerVersion = minerVersions.trex.firstVersion;
      this.hardBenchmarkingData.ETH.trex.secondVersion.minerVersion = minerVersions.trex.secondVersion;
      this.hardBenchmarkingData.ETH.trex.thirdVersion.minerVersion = minerVersions.trex.thirdVersion;
      this.hardBenchmarkingData.RVN.trex.firstVersion.minerVersion = minerVersions.trex.firstVersion;
      this.hardBenchmarkingData.RVN.trex.secondVersion.minerVersion = minerVersions.trex.secondVersion;
      this.hardBenchmarkingData.RVN.trex.thirdVersion.minerVersion = minerVersions.trex.thirdVersion;

      this.hardBenchmarkingData.ETH.phoenix.firstVersion.minerVersion = minerVersions.phoenix.firstVersion;
      this.hardBenchmarkingData.ETH.phoenix.secondVersion.minerVersion = minerVersions.phoenix.secondVersion;
      this.hardBenchmarkingData.ETH.phoenix.thirdVersion.minerVersion = minerVersions.phoenix.thirdVersion;

      console.log('MinerVersions is parsed', minerVersions);
      console.log('Miner version parsed from', minerVersionPath);
    });
  }
}
