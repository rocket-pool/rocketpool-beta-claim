import { printTitle, assertThrows, printEvent, soliditySha3, TimeController } from './utils';
import { scenarioSetClaimStart } from './rocket-beta-claim-scenarios';

// Import artifacts
const DummyRocketPoolToken = artifacts.require('./contract/DummyRocketPoolToken.sol');
const RocketBetaClaim = artifacts.require('./contract/RocketBetaClaim.sol');


// Debugging
async function debugParticipants() {
    const rocketBetaClaim = await RocketBetaClaim.deployed();
    console.log('-----');
    let participant, participantIndex = 0, err = false;
    do {
        try { participant = await rocketBetaClaim.participants.call(participantIndex++); }
        catch (e) { err = true; }
        if (!err) console.log(`participant ${participantIndex}:`, participant);
    }
    while (!err);
    console.log('-----');
}


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


    // Owner can set the claim start time
    it(printTitle('owner', 'can set the claim start time'), async () => {

        // Get claim start time, 3 weeks in future
        let now = Math.floor((new Date()).getTime() / 1000);
        let start = now + (60 * 60 * 24 * 7 * 3);

        // Set claim start time
        await scenarioSetClaimStart({
            claimStart: start,
            fromAddress: owner,
        });

    });


    // Random account cannot set the claim start time
    it(printTitle('random account', 'cannot set the claim start time'), async () => {

        // Get claim start time, 3 weeks in future
        let now = Math.floor((new Date()).getTime() / 1000);
        let start = now + (60 * 60 * 24 * 7 * 3);

        // Set claim start time
        await assertThrows(scenarioSetClaimStart({
            claimStart: start,
            fromAddress: accounts[1],
        }), 'Random account set the claim start time.');

    });


});
