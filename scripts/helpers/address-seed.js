// Dependencies
const Web3 = require('web3');

// Artifacts
const DummyRocketPoolToken = artifacts.require('./contract/DummyRocketPoolToken');
const RocketBatchTransfer = artifacts.require('./contract/RocketBatchTransfer');

// Seed claim contract
module.exports = async (done) => {

    // Get command-line arguments (remove args from truffle)
    let args = process.argv.splice(4);

    // Validate arguments
    if (args.length != 2) done('Incorrect number of arguments. Please enter: to address, seed amount (RPL).');
    if (!Web3.utils.isAddress(args[0])) done('To address is invalid.');
    if (isNaN(args[1])) done('Seed amount (RPL) is invalid.');

    // Parse arguments
    let [toAddress, seedAmountRpl] = args;

    // Get contract dependencies
    const dummyRocketPoolToken = await DummyRocketPoolToken.deployed();
    const rocketBatchTransfer = await RocketBatchTransfer.deployed();

    // Get token amount in wei
    const seedAmountRplWei = Web3.utils.toWei(seedAmountRpl, 'ether');

    // Seed tokens to address
    await dummyRocketPoolToken.mint(toAddress, seedAmountRplWei);

    // Approve token spend
    await dummyRocketPoolToken.approve(rocketBatchTransfer.address, seedAmountRplWei, {from: toAddress});

    // Complete
    done('Address seeded successfully: ' + args.join(', '));

};

