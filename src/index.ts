#!/usr/bin/env node

import Web3 from 'web3';

import {AccountGenerator} from './class/account-generator';
import {FoundsRecoverProcess} from './class/founds-recover-process';
import {MasterAccount} from './class/master-account';
import {WalletSeedProcess} from './class/seed-process';
import {PrintLogo} from './prompts/logo';
import {
  FoundsRecoverPrompt,
  MasterAccountPrompt,
  ModeSelectPrompt,
  NetworkSelectionPrompt,
  WalletSeedPrompt,
} from './prompts/prompts';
import {networkSettings} from './settings/network-settings';

class Execution {
  private web3: Web3;
  private masterAccount: MasterAccount;

  public async execute() {
    const startTime: Date = new Date();
    PrintLogo();

    await this.commonPrompts();
    const selectedModule = await ModeSelectPrompt();
    switch (selectedModule.mode) {
      case '1':
        await this.masterAccountPrompt();
        await this.seedModule();
        break;
      case '2':
        await this.masterAccountPrompt();
        await this.foundRecoverModule();
        break;
      case '3':
        await this.displayAccounts();
        break;
      case '4':
        await this.doTest();
        break;
    }
    const finalTime: Date = new Date();
    console.info('Process Finished');
    console.info(
      `Time elapsed ${
        (finalTime.getTime() - startTime.getTime()) / 1000
      } seconds`
    );
  }

  private async commonPrompts() {
    const selectedNetwork: string = (await NetworkSelectionPrompt()).network;

    if (!selectedNetwork) {
      throw new Error('No network selected');
    }

    networkSettings['selected'] = networkSettings[selectedNetwork];
    this.web3 = new Web3(networkSettings['selected'].rpcNode);
  }

  private async masterAccountPrompt() {
    const mnemonic: string = (await MasterAccountPrompt()).mnemonic;
    this.masterAccount = new MasterAccount(mnemonic, this.web3);
  }

  private async seedModule(): Promise<void> {
    const seedOptions = await WalletSeedPrompt();
    const seedProcess = new WalletSeedProcess(
      this.masterAccount,
      seedOptions.seedValue
    );

    if (seedOptions.execute !== 'yes') {
      return;
    }
    return await seedProcess
      .seedWallets(this.web3)
      .then(() => console.log('Wallets seeded'));
  }

  private async displayAccounts() {
    const accGenerator: AccountGenerator = new AccountGenerator(this.web3);
    const accounts = accGenerator.loadAccountsWithMnemonicFromLog();

    if (accounts.length === 0) {
      console.info('No accounts found');
      return;
    }

    console.info(
      '________________________________________________________________________________________________________________________________________________________________________'
    );
    console.info(
      '              Account                      |                            Private Key                             | Mnemonic'
    );
    console.info(
      '________________________________________________________________________________________________________________________________________________________________________'
    );
    accounts.forEach(x => {
      console.info(
        `${x.account.address} | ${x.account.privateKey} | ${x.mnemonic}`
      );
    });
    console.info(
      '________________________________________________________________________________________________________________________________________________________________________'
    );
  }

  private async foundRecoverModule(): Promise<void> {
    const foundRecoverProcess: FoundsRecoverProcess = new FoundsRecoverProcess(
      this.masterAccount,
      this.web3
    );

    const promptOptions = await FoundsRecoverPrompt();
    if (promptOptions.execute !== 'yes') {
      return;
    }
    await foundRecoverProcess
      .recoverFounds(promptOptions.doConversion)
      .then(() => console.log('Founds recovered'));
  }

  private async doTest(): Promise<void> {}
}

new Execution().execute();
