import * as Bip39 from 'bip39';
import {ethers} from 'ethers';
import * as fs from 'fs';
import ProgressBar from 'progress';
import Web3 from 'web3';
import {Account} from 'web3-core';

export class AccountGenerator {
  private readonly accountLogFilePath: string = `./accounts.csv`;

  constructor(private readonly web3: Web3) {}

  public createNewAccount(): Account {
    this.createAccountLogFile();

    const mnemonic: string = Bip39.generateMnemonic(128);
    const account: Account = this.buildAccountFromMnemonic(mnemonic);

    this.logAccount(account, mnemonic);
    return account;
  }

  public loadAccountsFromLog(): Account[] {
    return this.loadAccountsWithMnemonicFromLog().map(acc => acc.account);
  }

  public loadAccountsWithMnemonicFromLog(): {
    account: Account;
    mnemonic: String;
  }[] {
    console.info('Loading accounts from log file');
    if (!this.logFileExists()) {
      console.info("Log file doesn't exist");
      return [];
    }

    const results: {account: Account; mnemonic: String}[] = [];
    const lines: string[] = fs
      .readFileSync(this.accountLogFilePath)
      .toString()
      .split('\n');

    const bar = new ProgressBar(
      "[:bar](:percent) - :rate accounts/s - ETA: :etas - Loading ':addr'",
      {
        total: lines.length - 1,
        width: 40,
      }
    );

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const accFields: string[] = line.split(';');
      if (accFields[0] === 'address') {
        continue;
      }

      const mnemonic: string = accFields.slice(1).join(' ');
      const account: Account = this.buildAccountFromMnemonic(mnemonic);

      results.push({account, mnemonic});

      bar.tick({
        addr: account.address,
      });
      if (bar.complete) {
        console.info('Accounts loaded correctly');
      }
    }
    return results;
  }

  private buildAccountFromMnemonic(mnemonic: string): Account {
    const account: Account = this.web3.eth.accounts.privateKeyToAccount(
      ethers.Wallet.fromMnemonic(mnemonic).privateKey
    );
    this.web3.eth.accounts.wallet.add(account);
    return account;
  }

  private createAccountLogFile(): void {
    if (!this.logFileExists()) {
      fs.writeFileSync(
        this.accountLogFilePath,
        'address;w1;w2;w3;w4;w5;w6;w7;w8;w9;w10;w11;w12'
      );
    }
  }

  private logAccount(account: Account, mnemonic: string): void {
    const accountLog = `${account.address};${mnemonic.split(' ').join(';')}`;
    fs.appendFileSync(this.accountLogFilePath, `\n${accountLog}`);
  }

  private logFileExists(): boolean {
    return fs.existsSync(this.accountLogFilePath);
  }
}
