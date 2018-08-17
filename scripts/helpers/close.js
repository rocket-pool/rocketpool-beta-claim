// Dependencies
const Web3 = require('web3');

// Artifacts
const RocketBetaClaim = artifacts.require('./contract/RocketBetaClaim');

// Close beta claim contract
module.exports = async (done) => {

    // Get contract dependencies
    const rocketBetaClaim = await RocketBetaClaim.deployed();

    // Close beta claim contract
    await rocketBetaClaim.close();

    // Complete
    done('Claim contract closed successfully: ' + args.join(', '));

};

