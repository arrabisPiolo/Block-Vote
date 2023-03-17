const HDWalletProvider = require('@truffle/hdwallet-provider');
const infuraKey = "fj4jll3k.....";

const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();

const path = require("path");


module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    testnet: {
      networkCheckTimeout: 10000,
      provider: () => new HDWalletProvider(mnemonic, "https://data-seed-prebsc-2-s1.binance.org:8545/"),
      network_id: 97,
      gas: 4500000,
      gasPrice: 10000000000,
      confirmations: 10,
      timeoutBlocks: 2000,
      skipDryRun: true
    },
  },
  mocha: {

  },

  compilers: {
    solc: {
      settings: {
        optimizer: {
          enabled: true, 
          runs: 1000
        },
        evmVersion: "homestead"
      }
    }
  }
};
