import { printTitle, assertThrows } from './utils';


// Import artifacts
const DummyRocketPoolToken = artifacts.require('./contract/DummyRocketPoolToken.sol');
const RocketBatchTransfer = artifacts.require('./contract/RocketBatchTransfer.sol');


// Start the tests
contract('RocketBatchTransfer', (accounts) => {


    // The owner
    const owner = accounts[0];

    // Contract dependencies
    let rocketBetaClaim;
    let dummyRocketPoolToken;


    // Initialisation
    before(async () => {

        // Initialise contracts
        rocketBetaClaim = await RocketBetaClaim.deployed();
        dummyRocketPoolToken = await DummyRocketPoolToken.deployed();

        // Mint RPL token supply to owner address
        const tokenSupply = web3.utils.toWei('1000', 'ether');
        await dummyRocketPoolToken.mint(owner, tokenSupply, {from: owner});

    });


});

