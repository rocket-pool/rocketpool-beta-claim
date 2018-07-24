import { printTitle, assertThrows, printEvent, soliditySha3, TimeController } from './utils';
//import {  } from './rocket-beta-claim-scenarios';

// Import artifacts
const DummyRocketPoolToken = artifacts.require('./contract/DummyRocketPoolToken.sol');
const RocketBetaClaim = artifacts.require('./contract/RocketBetaClaim.sol');

// Start the tests
contract('RocketBetaClaim', (accounts) => {


    // The owner
    const owner = web3.eth.coinbase;

    // Contract dependencies
    let rocketBetaClaim;
    let dummyRocketPoolToken;


    // Initialisation
    before(async () => {

        // Initialise contracts
        rocketBetaClaim = await RocketBetaClaim.deployed();
        dummyRocketPoolToken = await DummyRocketPoolToken.deployed();

        // Initialise dummy rocket pool token supply
        let tokenSupply = web3.toWei(5000, 'ether');
        await dummyRocketPoolToken.mint(owner, tokenSupply, {from: owner});
        await dummyRocketPoolToken.transfer(rocketBetaClaim.address, tokenSupply, {from: owner});

    });


    // Owner
    it(printTitle('owner', ''), async () => {
        
    });


});
