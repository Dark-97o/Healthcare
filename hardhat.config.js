/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require('@nomiclabs/hardhat-ethers');
require("@nomiclabs/hardhat-waffle");

const { PrivateKey } = require('./secret.json');

module.exports = {
   defaultNetwork: 'testnet',

   networks: {
      hardhat: {},
      testnet: {
         url: 'https://rpc.test2.btcs.network',
         accounts: ['c5f3accd7ca66fc2c3012acc8ff66bc6b5ee32e60afdaef5b763f28c17739dc2'], // Use your private key from secret.json
         chainId: 1114, // Core Testnet2 chain ID
      }
   },
   solidity: {
      compilers: [
        {
           version: '0.8.24', // Latest supported by Core
           settings: {
              evmVersion: 'shanghai', // Use 'shanghai' for Testnet2
              optimizer: {
                 enabled: true,
                 runs: 200,
              },
           },
        },
      ],
   },
   paths: {
      sources: './contracts',
      cache: './cache',
      artifacts: './artifacts',
   },
   mocha: {
      timeout: 20000,
   },
};