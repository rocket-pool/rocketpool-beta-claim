// Dependencies
const Web3 = require('web3');

// Artifacts
const RocketBetaClaim = artifacts.require('./contract/RocketBetaClaim');

// Set claim start time
module.exports = async (done) => {

    // Get command-line arguments (remove args from truffle)
    let args = process.argv.splice(4);

    // Validate arguments
    if (args.length != 1) done('Incorrect number of arguments. Please enter: claim start timestamp (in seconds).');
    if (isNaN(args[0])) done('Claim start timestamp is invalid.');

    // Parse arguments
    let [startTime] = args;

    // Get contract dependencies
    const rocketBetaClaim = await RocketBetaClaim.deployed();

    // Set claim start time
    await rocketBetaClaim.setClaimStart(startTime);

    // Complete
    done('Claim start time set successfully: ' + args.join(', '));

};

