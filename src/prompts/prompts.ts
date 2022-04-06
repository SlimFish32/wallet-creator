import * as Bip39 from 'bip39';

import {networkSettings} from './../settings/network-settings';

const prompts = require('prompts');
export const MasterAccountPrompt = async () =>
  await prompts([
    {
      type: 'text',
      name: 'mnemonic',
      message: 'Enter the seeding account mnemonic',
      validate: (value: string) => Bip39.validateMnemonic(value),
    },
  ]);

export const NetworkSelectionPrompt = async () => {
  const choices: {
    title: string;
    description: string;
    value: string;
  }[] = Object.entries(networkSettings)
    .filter(kvp => kvp[0] !== 'selected')

    .map(kvp => {
      return {
        title: kvp[1].name,
        description: `Node: ${kvp[1].rpcNode}`,
        value: kvp[0],
      };
    });

  return await prompts([
    {
      type: 'select',
      name: 'network',
      message: 'Select Network',
      choices: choices,
      initial: 0,
    },
  ]);
};

export const ModeSelectPrompt = async () => {
  return await prompts([
    {
      type: 'select',
      name: 'mode',
      message: 'Select functionality',
      choices: [
        {
          title: 'Seed Wallets',
          description: 'Seed wallets with small founds from master account',
          value: '1',
        },
        {
          title: 'Recover Founds',
          value: '2',
          description: 'Recover founds from seeded wallets',
        },
        {
          title: 'Show Accounts',
          value: '3',
          description: 'Shows stored account information',
        },
        //  { title: 'Test', value: '4', description: 'Test Entry, probably it wont do anything' },
      ],
      initial: 0,
    },
  ]);
};

export const WalletSeedPrompt = async () =>
  prompts([
    {
      type: 'number',
      name: 'seedValue',
      message: 'ETH/BNB to seed each wallet?',
      initial: 0.01,
      style: 'default',
      min: 0.01,
      round: 4,
      increment: 0.001,
    },
    {
      type: 'text',
      message: 'Confirm execution? type "yes" to confirm',
      name: 'execute',
      validate: (value: string) => String(value).toLowerCase() === 'yes',
    },
  ]);

export const FoundsRecoverPrompt = async () =>
  prompts([
    {
      type: 'toggle',
      name: 'doConversion',
      message: 'Convert StableCoin to ETH/BNB?',
      initial: true,
      active: 'yes',
      inactive: 'no',
    },
    {
      type: 'text',
      message: 'Confirm execution? type "yes" to confirm',
      name: 'execute',
      validate: (value: string) => String(value).toLowerCase() === 'yes',
    },
  ]);
