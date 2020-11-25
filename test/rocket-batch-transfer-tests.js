import { printTitle, assertThrows } from './utils';


// Import artifacts
const DummyRocketPoolToken = artifacts.require('./contract/DummyRocketPoolToken.sol');
const RocketBatchTransfer = artifacts.require('./contract/RocketBatchTransfer.sol');


// Start the tests
contract('RocketBatchTransfer', (accounts) => {


    // The owner
    const owner = accounts[0];

    // Token recipients
    const recipient1 = accounts[1];
    const recipient2 = accounts[2];
    const recipient3 = accounts[3];
    const recipient4 = accounts[4];
    const recipient5 = accounts[5];
    const recipient6 = accounts[6];
    const recipient7 = accounts[7];
    const recipient8 = accounts[8];

    // Contract dependencies
    let rocketBatchTransfer;
    let dummyRocketPoolToken;


    // Initialisation
    before(async () => {

        // Initialise contracts
        rocketBatchTransfer = await RocketBatchTransfer.deployed();
        dummyRocketPoolToken = await DummyRocketPoolToken.deployed();

        // Mint RPL token supply to owner address
        const tokenSupply = web3.utils.toWei('1000', 'ether');
        await dummyRocketPoolToken.mint(owner, tokenSupply, {from: owner});

    });


    it(printTitle('-----', 'can send the same amount of a token to multiple addresses'), async () => {

        const amount = web3.utils.toBN(web3.utils.toWei('1', 'ether'));

        const recipients = [
            recipient1,
            recipient2,
            recipient3,
            recipient4,
            recipient5,
            recipient6,
            recipient7,
            recipient8,
        ];

        await dummyRocketPoolToken.approve(rocketBatchTransfer.address, amount.mul(web3.utils.toBN(recipients.length)), {from: owner});

        await rocketBatchTransfer.transferTokenAmount(dummyRocketPoolToken.address, recipients, amount, {from: owner});

    });


});

