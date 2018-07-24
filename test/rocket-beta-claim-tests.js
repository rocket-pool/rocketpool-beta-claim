import { printTitle, assertThrows, printEvent, soliditySha3, TimeController } from './utils';
import { scenarioSetClaimStart, scenarioSetRplTotal, scenarioAddParticipant, scenarioRemoveParticipant } from './rocket-beta-claim-scenarios';

// Import artifacts
const DummyRocketPoolToken = artifacts.require('./contract/DummyRocketPoolToken.sol');
const RocketBetaClaim = artifacts.require('./contract/RocketBetaClaim.sol');


// Debug participant list
async function debugParticipants() {
    const rocketBetaClaim = await RocketBetaClaim.deployed();

    // Get count
    let count = parseInt(await rocketBetaClaim.getParticipantCount.call());

    // Get and log participants
    console.log('-----');
    let participant, pi;
    for (pi = 0; pi < count; ++pi) {
        participant = await rocketBetaClaim.participants.call(pi);
        console.log(`participant ${pi}:`, participant);
    }
    console.log('-----');

}


// Start the tests
contract('RocketBetaClaim', (accounts) => {


    // The owner
    const owner = web3.eth.coinbase;

    // Participant accounts
    const participant1 = accounts[1];
    const participant2 = accounts[2];
    const participant3 = accounts[3];

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


    // Owner can add a participant
    it(printTitle('owner', 'can add a participant'), async () => {
        await scenarioAddParticipant({
            participantAddress: participant1,
            fromAddress: owner,
        });
        await scenarioAddParticipant({
            participantAddress: participant2,
            fromAddress: owner,
        });
    });


    // Owner cannot add a participant with a null address
    it(printTitle('owner', 'cannot add a participant with a null address'), async () => {
        await assertThrows(scenarioAddParticipant({
            participantAddress: '0x0000000000000000000000000000000000000000',
            fromAddress: owner,
        }), 'Owner added a participant with a null address.');
    });


    // Owner cannot add a participant who already exists
    it(printTitle('owner', 'cannot add a participant who already exists'), async () => {
        await assertThrows(scenarioAddParticipant({
            participantAddress: participant1,
            fromAddress: owner,
        }), 'Owner added a participant who already exists.');
    });


    // Random account cannot add a participant
    it(printTitle('random account', 'cannot add a participant'), async () => {
        await assertThrows(scenarioAddParticipant({
            participantAddress: participant3,
            fromAddress: accounts[1],
        }), 'Random account added a participant.');
    });


    // Owner can remove a participant
    it(printTitle('owner', 'can remove a participant'), async () => {

        // Participant count
        let count;

        // Remove from middle of list
        count = parseInt(await rocketBetaClaim.getParticipantCount.call());
        let remove1 = await rocketBetaClaim.participants.call(Math.floor((count - 1) / 2));
        await scenarioRemoveParticipant({
            participantAddress: remove1,
            fromAddress: owner,
        });

        // Remove from end of list
        count = parseInt(await rocketBetaClaim.getParticipantCount.call());
        let remove2 = await rocketBetaClaim.participants.call(count - 1);
        await scenarioRemoveParticipant({
            participantAddress: remove2,
            fromAddress: owner,
        });

        // Remove from start of list
        let remove3 = await rocketBetaClaim.participants.call(0);
        await scenarioRemoveParticipant({
            participantAddress: remove3,
            fromAddress: owner,
        });

    });


    // Owner cannot remove a participant who doesn't exist
    it(printTitle('owner', 'cannot remove a participant who doesn\'t exist'), async () => {
        await assertThrows(scenarioRemoveParticipant({
            participantAddress: participant3,
            fromAddress: owner,
        }), 'Random account added a participant.');
    });


    // Random account cannot remove a participant
    it(printTitle('random account', 'cannot remove a participant'), async () => {

        // Get first participant
        let remove = await rocketBetaClaim.participants.call(0);

        // Remove
        await assertThrows(scenarioAddParticipant({
            participantAddress: remove,
            fromAddress: accounts[1],
        }), 'Random account removed a participant.');

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


    // Owner cannot add a participant after claim start
    it(printTitle('owner', 'cannot add a participant after claim start'), async () => {
        await assertThrows(scenarioAddParticipant({
            participantAddress: participant3,
            fromAddress: owner,
        }), 'Owner added a participant after claim start.');
    });


    // Owner cannot remove a participant after claim start
    it(printTitle('owner', 'cannot remove a participant after claim start'), async () => {

        // Get first participant
        let remove = await rocketBetaClaim.participants.call(0);

        // Remove
        await assertThrows(scenarioRemoveParticipant({
            participantAddress: remove,
            fromAddress: owner,
        }), 'Owner removed a participant after claim start.');

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
