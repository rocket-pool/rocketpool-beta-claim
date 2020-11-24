/**
  Rocketpool Beta Claim
  @author Jake Pospischil
  @email jake@rocketpool.net
  @version 0.1
*/

// Require correct Web3 version
const Web3 = require('web3');

// Import babel for ES6 imports
require('babel-register')({
  presets: [['env', {
    'targets': {
      'node': '8.0'
    }
  }]],
  retainLines: true,
});
require('babel-polyfill');

// Truffle config
module.exports = {
  web3: Web3,
  compilers: {
    solc: {
      version: "0.7.5",
    },
  },
  networks: {

    // Ganache
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // Match any network id
      rocketPoolTokenAddress: null, // Rocket Pool Token contract address
      dummyRocketPoolToken: true, // Deploy dummy Rocket Pool Token contract
      gas: 8000000,
    },

    // Local dev network
    dev: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // Match any network id
      rocketPoolTokenAddress: null, // Rocket Pool Token contract address
      dummyRocketPoolToken: true, // Deploy dummy Rocket Pool Token contract
    },

    // Rinkeby test network
    rinkeby: {
      host: 'localhost',
      port: 8545,
      network_id: '4', // Rinkeby
      rocketPoolTokenAddress: null, // Rocket Pool Token contract address
      dummyRocketPoolToken: true, // Deploy dummy Rocket Pool Token contract
    }

  },
};
