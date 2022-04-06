import Web3 from 'web3';
import BN from 'bn.js';
import {Account} from 'web3-core';
import {Contract} from 'web3-eth-contract';

import {NetworkSettings} from './../settings/network-settings';
import {STABLE_TOKEN_ABI} from './../settings/stable-token-abi';
import {SWAP_ABI} from './../settings/swap-abi';

export class TokenTrader {
  private readonly tokenContract: Contract;
  private readonly swapContract: Contract;
  private readonly contracts: {[key: string]: Contract} = {};

  constructor(
    private readonly web3: Web3,
    private readonly networkSettings: NetworkSettings
  ) {
    this.tokenContract = new web3.eth.Contract(
      STABLE_TOKEN_ABI,
      networkSettings.stableCoinAddress
    );
    this.swapContract = new web3.eth.Contract(
      SWAP_ABI,
      networkSettings.swapAddress
    );
    this.contracts[networkSettings.stableCoinAddress] = this.tokenContract;
    this.contracts[networkSettings.swapAddress] = this.swapContract;
  }

  public async swapBackToBaseToken(account: Account): Promise<unknown> {
    const balance: string = await this.tokenContract.methods
      .balanceOf(account.address)
      .call();
    const allowance: string = await this.tokenContract.methods
      .allowance(account.address, this.swapContract.options.address)
      .call();

    const bnBalance: BN = this.web3.utils.toBN(balance);
    const bnAllowance: BN = this.web3.utils.toBN(allowance);

    if (balance === '0') {
      return;
    }

    if (bnAllowance.lt(bnBalance)) {
      await this.approveToken(account, bnBalance);
    }

    const path: string[] = [
      this.networkSettings.stableCoinAddress,
      this.networkSettings.wrappedCoinAddress,
    ];
    const amountOut: string = (
      await this.swapContract.methods.getAmountsOut(balance, path).call()
    )[1];

    const deadline: string = this.web3.utils.toHex(
      Math.round(Date.now() / 1000) + 60 * 20
    );
    const contractCall = this.swapContract.methods.swapExactTokensForETH(
      balance,
      amountOut,
      path,
      account.address,
      deadline
    );

    return await contractCall
      .estimateGas({from: account.address})
      .then((gas: number) => contractCall.send({from: account.address, gas}));
  }

  private async approveToken(account: Account, balance: BN): Promise<void> {
    return await this.tokenContract.methods
      .approve(this.networkSettings.swapAddress, balance.toString())
      .estimateGas({from: account.address})
      .then((gas: number) =>
        this.tokenContract.methods
          .approve(this.networkSettings.swapAddress, balance.toString())
          .send({from: account.address, gas})
      );
  }
}
