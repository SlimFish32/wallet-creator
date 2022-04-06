import Web3 from 'web3';
import ProgressBar from 'progress';
import {Account, TransactionReceipt} from 'web3-core';

import {AccountGenerator} from './account-generator';
import {MasterAccount} from './master-account';

export class WalletSeedProcess {
  private readonly splitValue: number = 0.02;
  private readonly masterAccount: MasterAccount;

  constructor(masterAccount: MasterAccount, splitValue = 0.02) {
    this.masterAccount = masterAccount;
    this.splitValue = splitValue;
  }

  public async seedWallets(web3: Web3): Promise<TransactionReceipt[]> {
    const accGenerator = new AccountGenerator(web3);
    const splits: number = await this.masterAccount.splitBalance(
      this.splitValue
    );

    if (splits <= 1) {
      console.info('Insufficient balance to seed wallets');
      return [];
    }

    console.log(`Seeding ${splits - 1} wallets with founds`);
    console.log(' ');

    const bar = new ProgressBar("[:bar] (:percent) ETA: :etas Target ':addr'", {
      total: splits,
      width: 40,
    });

    const txs: TransactionReceipt[] = [];

    // Skip one split, to leave enough balance to operate the source wallet
    for (let i = 1; i < splits; i++) {
      const account: Account = accGenerator.createNewAccount();
      const tx: TransactionReceipt = await this.masterAccount.send(
        account.address,
        String(this.splitValue)
      );

      bar.tick({
        value: this.splitValue,
        addr: account.address,
      });

      // console.log(`[${i}] - Sent ${this.splitValue} ETH to ${account.address}`);
      txs.push(tx);
    }

    return txs;
  }
}
