# Gaimin Platform
---
## _Miners usage_

#### Gaimin platform use 3 GPU miners:

- [phoenix-miner](https://bitcointalk.org/index.php?topic=2647654.0)
- [t-rex](https://github.com/trexminer/T-Rex)
- [gminer](https://github.com/develsoftware/GMinerRelease)

## Strart mining flow
---
### Aftrer the user switch on miner we have next flow:

1. We make `sendStartMiningRequest` on this URL `gaiminApi + '/devices/me/start-mining'` in which we send `miningMode`(GPU or CPU) and device token 
in headers, this request returns to us object with next keys:
`cryptoCode`, `walletId`, `workerName`, `poolUrl`, `useMinerStatistics`.
        - `cryptoCode`(ETH, XMR, RVN, etc) use for choosing miner (watch  CRYPTO_CODE_TO_MINER_CODE) witch we need to execute.
```js
const CRYPTO_CODE_TO_MINER_CODE = {
  ETH: 'phoenix-miner',
  RVN: 't-rex',
  AION: 'gminer'
};
```
2. After getting `cryptoCode`, using `getMinerArguments` we have arguments with which miners are running. 
For example `Phoenix miner` use `  phoenix-miner.exe -pool eu1.ethermine.org:4444 -wal YourEthWalletAddress.WorkerName -proto 3`.
 `-pool` <host:port> Ethash pool address (prepend the host name with ssl:// for SSL pool, or http:// for solo mining);
 `-wal` <wallet> Ethash wallet (some pools require appending of user name and/or worker);
 `WorkerName` <name> Ethash worker name (most pools accept it as part of wallet);
`-proto` <n> Selects the kind of stratum protocol for the ethash pool:
     1: miner-proxy stratum spec (e.g. coinotron)
     2: eth-proxy (e.g. dwarfpool, nanopool) - this is the default, works for most pools
     3: qtminer (e.g. ethpool)
     4: EthereumStratum/1.0.0 (e.g. nicehash)
     5: EthereumStratum/2.0.0

### Miners statistic api supporting:
- Gminer [+] (http://127.0.0.1:20000/stat)
- T-rex miner [+] (http://localhost:4067/summary)
- Phoenix miner [+-] (https://github.com/osmankuzucu/claymore-phoenixminer-web-stats)


### The statistic and configuration of mining PC and different coins are showing below.
#### _The configuration of mining PC:_

- #### CPU: Intel® Xeon® , 2.2 GHz
- #### GPU: NVIDIA Tesla T4 - 15.00 GB
- #### RAM: 8 GB


| Miners/Coins | `Phoenix miner` | `T-rex miner` | `Gminer` |
| :---:  |     :---:             |     :---:     |   :---:  |
|  _ETH_ |      ~25,7 MH/s       |~23,8-25,7 Mh/s|  ~22-25,7 MH/s  |
|  _RVN_ |      not support      | ~8,8-9,1 MH/s |     ~9,1 MH/s   |
| _AION_ |      not support      |  not support  |    ~124 Sol/s   |









