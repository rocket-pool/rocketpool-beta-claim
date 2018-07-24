import { printTitle, assertThrows, printEvent, soliditySha3, TimeController } from './utils';
import { scenarioSetClaimStart, scenarioSetRplTotal } from './rocket-beta-claim-scenarios';

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

    // Claim start time delay
    const day = (60 * 60 * 24); // seconds
    const claimStartDelay = (day * 7 * 3); // seconds

    // Contract dependencies
    let rocketBetaClaim;
    let dummyRocketPoolToken;


    // Initialisation
    before(async () => {

        // Initialise contracts
        rocketBetaClaim = await RocketBetaClaim.deployed();
        dummyRocketPoolToken = await DummyRocketPoolToken.deployed();

        // Initialise dummy rocket pool token supply
        let tokenSupply = web3.toWei('500', 'ether');
        await dummyRocketPoolToken.mint(owner, tokenSupply, {from: owner});
        await dummyRocketPoolToken.transfer(rocketBetaClaim.address, tokenSupply, {from: owner});

    });


    //
    // Before claim period
    //


    // Owner can set the claim start time
    it(printTitle('owner', 'can set the claim start time'), async () => {

        // Get claim start time, 3 weeks in future
        let now = Math.floor((new Date()).getTime() / 1000);
        let start = now + claimStartDelay;

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


    // Owner can set the RPL total claimable
    it(printTitle('owner', 'can set the RPL total claimable'), async () => {

        // Get the claim contract's RPL balance
        let claimRplBalance = parseInt(await dummyRocketPoolToken.balanceOf(rocketBetaClaim.address));

        // Set RPL total claimable
        await scenarioSetRplTotal({
            rplTotal: claimRplBalance,
            fromAddress: owner,
        });

    });


    // Owner cannot set the RPL total claimable higher than the beta claim's RPL balance
    it(printTitle('owner', 'cannot set the RPL total claimable higher than the beta claim\'s RPL balance'), async () => {

        // Get the claim contract's RPL balance
        let claimRplBalance = parseInt(await dummyRocketPoolToken.balanceOf(rocketBetaClaim.address));

        // Set RPL total claimable
        await assertThrows(scenarioSetRplTotal({
            rplTotal: claimRplBalance + parseInt(web3.toWei('1', 'ether')),
            fromAddress: owner,
        }), 'Owner set the RPL total claimable higher than the beta claim\'s RPL balance.');

    });


    // Random account cannot set the RPL total claimable
    it(printTitle('random account', 'cannot set the RPL total claimable'), async () => {

        // Get the claim contract's RPL balance
        let claimRplBalance = parseInt(await dummyRocketPoolToken.balanceOf(rocketBetaClaim.address));

        // Set RPL total claimable
        await assertThrows(scenarioSetRplTotal({
            rplTotal: claimRplBalance,
            fromAddress: accounts[1],
        }), 'Random account set the RPL total claimable.');

    });


    //
    // During claim period
    //


    // Advance to claim period
    it(printTitle('-----', 'advance to claim period'), async () => {
        await TimeController.addSeconds(claimStartDelay + day);
    });


    // Owner cannot set the claim start time after claim start
    it(printTitle('owner', 'cannot set the claim start time after claim start'), async () => {

        // Get claim start time, 3 weeks in future
        let now = Math.floor((new Date()).getTime() / 1000);
        let start = now + (60 * 60 * 24 * 7 * 3);

        // Set claim start time
        await assertThrows(scenarioSetClaimStart({
            claimStart: start,
            fromAddress: owner,
        }), 'Owner set the claim start time after claim start.');

    });


    // Owner cannot set the RPL total claimable after claim start
    it(printTitle('owner', 'cannot set the RPL total claimable after claim start'), async () => {

        // Get the claim contract's RPL balance
        let claimRplBalance = parseInt(await dummyRocketPoolToken.balanceOf(rocketBetaClaim.address));

        // Set RPL total claimable
        await assertThrows(scenarioSetRplTotal({
            rplTotal: claimRplBalance,
            fromAddress: owner,
        }), 'Owner set the RPL total claimable after claim start.');

    });


    //
    // After claim period
    //


    // Advance to after claim period
    it(printTitle('-----', 'advance to after claim period'), async () => {
        let claimPeriod = parseInt(await rocketBetaClaim.claimPeriod.call());
        await TimeController.addSeconds(claimPeriod);
    });


});
