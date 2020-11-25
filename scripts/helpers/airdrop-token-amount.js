// Dependencies
const Web3 = require('web3');

// Artifacts
const RocketBatchTransfer = artifacts.require('./contract/RocketBatchTransfer');

// Seed claim contract
module.exports = async (done) => {

    // Get command-line arguments (remove args from truffle)
    let args = process.argv.splice(4);

    // Validate arguments
    if (args.length != 5) done('Incorrect number of arguments. Please enter: token address, from address, to addresses (JSON), token amount (ETH), gas price (wei).');
    if (!Web3.utils.isAddress(args[0])) done('Token address is invalid.');
    if (!Web3.utils.isAddress(args[1])) done('From address is invalid.');
    if (isNaN(args[3])) done('Token amount is invalid.');
    if (isNaN(args[4])) done('Gas price is invalid.');

    // Parse arguments
    let [tokenAddress, fromAddress, toAddressesJSON, tokenAmount, gasPrice] = args;
    let toAddresses = JSON.parse(toAddressesJSON);
    if (!Array.isArray(toAddresses)) done('To address list is invalid.');
    toAddresses.forEach((address, index) => {
        if (!Web3.utils.isAddress(address)) done('To address at index ' + index + ' is invalid.');
    });

    // Get contract dependencies
    const rocketBatchTransfer = await RocketBatchTransfer.deployed();

    // Transfer tokens
    await rocketBatchTransfer.transferTokenAmount(tokenAddress, toAddresses, Web3.utils.toWei(tokenAmount, 'ether'), {from: fromAddress, gasPrice: gasPrice});

    // Complete
    done('Tokens (address: ' + tokenAddress + '; amount: ' + tokenAmount + ') successfully transferred from ' + fromAddress + ' to ' + toAddresses.length + ' recipients.');

};

