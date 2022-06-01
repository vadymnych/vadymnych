import { StartMiningResponse } from '../../interfaces';

const ETH_ALTERNATIVE_POOL = 'eu1.ethermine.org:4444';

export interface MinerArguments {
  cryptoCode: string;
  minerName: string;

  getMinerArguments(startMiningResponse: StartMiningResponse, system: string): any[];
}

export namespace MinerArguments {
  interface Constructor<T> {
    new (...args: any[]): T;

    readonly prototype: T;
  }

  const implementations: MinerArguments[] = [];

  export function getImplementations(): MinerArguments[] {
    return implementations;
  }

  export function register<T extends Constructor<MinerArguments>>(ctor: T) {
    implementations.push(new ctor());
    return ctor;
  }
}

// add aterative pools
/** Phoenix-miner **/

/** ETH **/
// phoenix.exe -pool eu1.ethermine.org:4444 -wal 0x9Ae8c8280480dAa70e38801f5d1b289ECB31B5aF.d9a5223b -proto 3 -clKernel 0
@MinerArguments.register
class EthPhoenixMinerArguments {
  cryptoCode = 'ETH';
  minerName = 'phoenix';

  getMinerArguments(startMiningResponse: StartMiningResponse, system: string): any[] {
    return [
      `-pool ${startMiningResponse.poolUrl} -wal ${startMiningResponse.walletId}.${startMiningResponse.workerName} -proto 3 -clKernel 0 -log 0 -pool2 ${ETH_ALTERNATIVE_POOL}`
    ];
  }
}

/** T-rex **/

/** ETH **/
// trex.exe -a ethash -o stratum+tcp://eu1.ethermine.org:4444 -u 0x9Ae8c8280480dAa70e38801f5d1b289ECB31B5aF -p x -w d9a5223b
@MinerArguments.register
class EthTrexMinerArguments {
  cryptoCode = 'ETH';
  minerName = 'trex';

  getMinerArguments(startMiningResponse: StartMiningResponse, system: string): any[] {
    const connection: string = 'stratum+tcp://' + startMiningResponse.poolUrl;
    return [
      `--algo ethash --url ${connection} --user ${startMiningResponse.walletId}.${startMiningResponse.workerName} --pass x --url stratum+tcp://${ETH_ALTERNATIVE_POOL} --user ${startMiningResponse.walletId}.${startMiningResponse.workerName} --pass x --worker ${startMiningResponse.workerName}`
    ];
  }
}

/** RVN **/
// trex.exe -a kawpow -o stratum+tcp://rvn.2miners.com:6060 -u R9goYTQJdzrDqzEDoQ1uiyXCrN6y3D5KiT.d9a5223b -p x
@MinerArguments.register
class RvnTrexMinerArguments {
  cryptoCode = 'RVN';
  minerName = 'trex';

  getMinerArguments(startMiningResponse: StartMiningResponse, system: string): any[] {
    const connection: string = 'stratum+tcp://' + startMiningResponse.poolUrl;
    return [`-a kawpow -o ${connection} -u ${startMiningResponse.walletId}.${startMiningResponse.workerName} -p x`];
  }
}

/** Gminer **/

/** RVN **/
// gminer.exe --algo kawpow --server rvn.2miners.com:6060 --user R9goYTQJdzrDqzEDoQ1uiyXCrN6y3D5KiT.d9a5223b --api 20000
@MinerArguments.register
class RvnGMinerArguments {
  cryptoCode = 'RVN';
  minerName = 'gminer';

  getMinerArguments(startMiningResponse: StartMiningResponse, system: string): any[] {
    return [
      `--algo kawpow --server ${startMiningResponse.poolUrl} --user ${startMiningResponse.walletId}.${startMiningResponse.workerName} --api 20000`
    ];
  }
}

/** ETH **/
// gminer.exe --algo ethash --server eth.2miners.com:2020 --user 0x9Ae8c8280480dAa70e38801f5d1b289ECB31B5aF.d9a5223b --api 20000
@MinerArguments.register
class EthGMinerArguments {
  cryptoCode = 'ETH';
  minerName = 'gminer';

  getMinerArguments(startMiningResponse: StartMiningResponse, system: string): any[] {
    return [
      `--algo ethash --server ${startMiningResponse.poolUrl} --user ${startMiningResponse.walletId}.${startMiningResponse.workerName} --api 20000 --server ${ETH_ALTERNATIVE_POOL}`
    ];
  }
}
