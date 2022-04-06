import * as BN from 'bn.js';
import {ethers} from 'ethers';
import Web3 from 'web3';
import {Account, TransactionConfig, TransactionReceipt} from 'web3-core';
import Utils from 'web3-utils';

export class MasterAccount {
  private readonly acc: Account;
  private cachedGasPrice = '0';

  constructor(mnemonic: string, private readonly web3: Web3) {
    this.acc = web3.eth.accounts.privateKeyToAccount(
      ethers.Wallet.fromMnemonic(mnemonic).privateKey
    );
    web3.eth.accounts.wallet.add(this.acc);
  }

  public async loadBalance(): Promise<number> {
    return this.web3.eth
      .getBalance(this.acc.address)
      .then(x => Number(this.web3.utils.fromWei(x, 'ether')));
  }

  public async splitBalance(minValue: number): Promise<number> {
    return this.loadBalance().then(x => Math.floor(x / minValue));
  }

  public async send(to: string, value: string): Promise<TransactionReceipt> {
    const tx: TransactionConfig = {
      from: this.acc.address,
      to,
      value: this.web3.utils.toWei(value, 'ether'),
    };
    tx.gas = (await this.estimateGas(tx)).toString();
    return this.web3.eth.sendTransaction(tx);
  }

  public async recoverFounds(
    from: Account
  ): Promise<TransactionReceipt | null> {
    const balance: string = await this.web3.eth.getBalance(from.address);
    const tx: TransactionConfig = {
      from: from.address,
      to: this.acc.address,
      value: balance,
    };

    const estimatedGas: BN = await this.estimateGas(tx);
    const gasPrice: BN = Utils.toBN(await this.getGasPrice());

    const finalValue: BN = Utils.toBN(balance).sub(estimatedGas.mul(gasPrice));

    tx.gas = estimatedGas.toString();
    tx.value = finalValue.toString();

    if (finalValue.lt(Utils.toBN(0))) {
      console.log(
        `Account ${
          from.address
        } has not enough funds to recover, actual founds: ${this.web3.utils.fromWei(
          finalValue.toString(),
          'ether'
        )}`
      );
      return null;
    }
    return this.web3.eth.sendTransaction(tx);
  }

  public getAccount(): Account {
    return this.acc;
  }

  private async getGasPrice(): Promise<string> {
    if (this.cachedGasPrice === '0') {
      this.cachedGasPrice = await this.web3.eth.getGasPrice();
    }
    return this.cachedGasPrice;
  }
  private async estimateGas(tx: TransactionConfig): Promise<BN> {
    return Utils.toBN(await this.web3.eth.estimateGas(tx));
  }
}
