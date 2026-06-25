import '@nomiclabs/hardhat-ethers';

export default {
  solidity: {
    version: '0.7.6',
  },
  paths: {
    root: './test',
  },
  networks: {
    hardhat: {
      blockGasLimit: 1_000_000_000_000,
    },
  },
};
