// Dependencies
const Web3 = require('web3');

// Artifacts
const DummyRocketPoolToken = artifacts.require('./contract/DummyRocketPoolToken');
const RocketBetaClaim = artifacts.require('./contract/RocketBetaClaim');

// Seed RPD contract
module.exports = async (done) => {

    // Get command-line arguments (remove args from truffle)
    let args = process.argv.splice(4);

    // Validate arguments
    if (args.length != 1) done('Incorrect number of arguments. Please enter: seed amount (RPL).');
    if (isNaN(args[0])) done('Seed amount (RPL) is invalid.');

    // Parse arguments
    let [seedAmountRpl] = args;

    // Get contract dependencies
    const dummyRocketPoolToken = await DummyRocketPoolToken.deployed();
    const rocketBetaClaim = await RocketBetaClaim.deployed();

    // Initialise dummy rocket pool token supply
    let tokenSupply = Web3.utils.toWei(seedAmountRpl, 'ether');
    await dummyRocketPoolToken.mint(web3.eth.coinbase, tokenSupply, {from: web3.eth.coinbase});
    await dummyRocketPoolToken.transfer(rocketBetaClaim.address, tokenSupply, {from: web3.eth.coinbase});

    // Set claim contract RPL total
    await rocketBetaClaim.setRplTotal(tokenSupply);

    // Complete
    done('Claim contract seeded successfully: ' + args.join(', '));

};

