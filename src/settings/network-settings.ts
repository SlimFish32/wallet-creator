export interface NetworkSettings {
  swapAddress: string;
  stableCoinAddress: string;
  wrappedCoinAddress: string;
  rpcNode: string;
  name: string;
}

export const networkSettings: {[key: string]: NetworkSettings} = {
  'bsc-testnet': {
    swapAddress: '0x9ac64cc6e4415144c455bd8e4837fea55603e5c3',
    stableCoinAddress: '0x78867bbeef44f2326bf8ddd1941a4439382ef2a7',
    wrappedCoinAddress: '0xae13d989dac2f0debff460ac112a837c89baa7cd',
    rpcNode: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    name: 'BSC - Testnet',
  },
  'bsc-mainnet': {
    swapAddress: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    stableCoinAddress: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    wrappedCoinAddress: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    rpcNode: 'https://bsc-dataseed.binance.org/',
    name: 'BSC - Mainnet',
  },
};
