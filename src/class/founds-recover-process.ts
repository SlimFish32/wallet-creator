import Web3 from 'web3';
import {Account, TransactionReceipt} from 'web3-core';
import ProgressBar from 'progress';

import {NetworkSettings, networkSettings} from './../settings/network-settings';
import {AccountGenerator} from './account-generator';
import {MasterAccount} from './master-account';
import {TokenTrader} from './token-trader';

/**
 * Reads all the available wallets and tries to pull all the founds back to the master wallet.
 */
export class FoundsRecoverProcess {
  private readonly accountGenerator: AccountGenerator;

  constructor(
    private readonly masterAccount: MasterAccount,
    private readonly web3: Web3
  ) {
    this.accountGenerator = new AccountGenerator(web3);
  }

  public async recoverFounds(swapBack: boolean): Promise<TransactionReceipt[]> {
    const seededAccounts: Account[] =
      this.accountGenerator.loadAccountsFromLog();
    const txs: Promise<TransactionReceipt | null>[] = [];

    const bar = new ProgressBar(
      "[:bar](:percent) - :rate accounts/s - ETA: :etas - Recovered from ':addr'",
      {
        total: seededAccounts.length,
        width: 40,
      }
    );

    console.info(`Recovering founds from ${seededAccounts.length} accounts`);

    for (const account of seededAccounts) {
      txs.push(this.recoverFound(account, swapBack));
    }

    const results: TransactionReceipt[] = [];
    for (const atx of txs) {
      const tx = await atx;
      if (tx === null) {
        bar.tick({addr: 'N/A'});
        continue;
      }

      bar.tick({
        addr: tx.from,
      });
      results.push(tx);
    }

    return results;
  }

  private tokenTrader: TokenTrader;

  private async recoverFound(
    account: Account,
    swapBack: boolean
  ): Promise<TransactionReceipt | null> {
    if (swapBack) {
      const selectedNetwork: NetworkSettings = networkSettings['selected'];
      if (!this.tokenTrader) {
        this.tokenTrader = new TokenTrader(this.web3, selectedNetwork);
      }

      await this.tokenTrader.swapBackToBaseToken(account);
    }
    return await this.masterAccount.recoverFounds(account);
  }
}
