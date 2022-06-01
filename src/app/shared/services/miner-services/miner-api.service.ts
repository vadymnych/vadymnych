import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export enum MINER_TO_MINER_API {
  TREX = 'http://localhost:4067/summary',
  GMINER = 'http://localhost:20000/stat'
}

@Injectable({
  providedIn: 'root'
})
export class MiningApiService {
  private readonly refreshStatisticTimer = 10000; // 10 sec
  private timeOutIntervals: ReturnType<typeof setInterval>[] = [];

  public miningHashRate$: BehaviorSubject<string> = new BehaviorSubject<string>('0');

  averageHashRate: number = 0;
  hashRateList = [];

  constructor(private http: HttpClient) {
    this.miningHashRate$.subscribe(
      (hashRate) => {
        this.calculateAverageHashRate(hashRate);
        console.log('Average hash rate for this mining session:', this.averageHashRate);
      },
      (error) => {
        console.log('miningHashRate$', error);
      }
    );
  }

  private calculateAverageHashRate(hashRate) {
    if (hashRate == 0) {
      console.log('This hashrate is zero', hashRate);
      return;
    }

    this.hashRateList.push(Number.parseFloat(hashRate));
    console.log('hashRateList:', this.hashRateList);
    let total = 0,
      count = 0;
    this.hashRateList.forEach((item) => {
      total += item;
      count++;
    });
    this.averageHashRate = Number.parseFloat((total / count).toFixed(2));

    if (this.hashRateList.length >= 20) {
      this.hashRateList = [];
      this.hashRateList.push(this.averageHashRate);
    }
  }

  getMinersStats(activeMiner, isMiningOn) {
    console.log(`The mining ${activeMiner} is ${isMiningOn ? 'start' : 'stop'}`);
    if (isMiningOn) {
      switch (activeMiner) {
        case 'trex':
          this.timeOutIntervals.push(setInterval(this.getTRexMinerStats.bind(this), this.refreshStatisticTimer));
          break;
        case 'gminer':
          this.timeOutIntervals.push(setInterval(this.getGMinerStats.bind(this), this.refreshStatisticTimer));
          break;
        default:
          console.log('Active miner is:', activeMiner);
      }
    } else {
      this.timeOutIntervals.forEach((interval) => {
        clearInterval(interval);
      });
      this.timeOutIntervals = [];
      this.miningHashRate$.next('0');
    }
  }

  // error in this string (Eth: New job #c3f51d1e from eu1.ethermine.org:4444; diff: 4295MH Eth speed: 11.296 MH/s, shares: 0/0/0, time: 0:00)
  // Eth speed: 0.000 MH/s, shares: 0/0/0, time: 0:00 pars this string
  getPhoenixMinerStats(data) {
    console.log(`HERE Data from getPhoenixMinerStats here ${data}`);
    const specialPhrase = 'Eth speed: ';
    const regularExpressions = {
      toFirstComma: /^(.+?),/g,
      numbersFromString: /(-?[0-9]+(?:[,.][0-9]+)?)/g
    };
    const stringAfterSpecPhrase = data.toString().substr(data.indexOf(specialPhrase) + specialPhrase.length);
    const stringToFirstComma = regularExpressions.toFirstComma.exec(stringAfterSpecPhrase)[0];
    const numbersFromString: any = regularExpressions.numbersFromString.exec(stringToFirstComma)[0];
    console.log('Mining hashRate is:', numbersFromString, 'MH/s');
    this.miningHashRate$.next(numbersFromString);
  }

  private getTRexMinerStats() {
    this.http.get<any>(`${MINER_TO_MINER_API.TREX}`)?.subscribe(
      (response) => {
        console.log('mining stats response', response);
        let hashRate = (Number.parseInt(response.hashrate) / 1000000).toFixed(2);
        console.log('Mining hashRate is:', hashRate, 'MH/s');
        this.miningHashRate$.next(hashRate);
      },
      (error) => {
        console.log('Error while getting mining statistic (trex)', error);
      }
    );
  }

  private getGMinerStats() {
    this.http.get<any>(`${MINER_TO_MINER_API.GMINER}`)?.subscribe(
      (response) => {
        console.log('mining stats response', response);
        // if (response.algorithm === "Equihash 210,9 \"AION0PoW\"") {
        //   let hashRate = Number.parseInt(response.devices[0].speed).toFixed(2);
        //   console.log("Mining hashRate is:", hashRate, "H/s");
        //   this.miningHashRate$.next(hashRate.toString());
        //   return;
        // }
        let hashRate = (Number.parseInt(response.devices[0].speed) / 1000000).toFixed(2);
        console.log('Mining hashRate is:', hashRate, 'MH/s');
        this.miningHashRate$.next(hashRate.toString());
      },
      (error) => {
        console.log('Error while getting mining statistic (gminer)', error);
      }
    );
  }
}
