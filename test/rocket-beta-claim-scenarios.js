// Import artifacts
const DummyRocketPoolToken = artifacts.require('./contract/DummyRocketPoolToken.sol');
const RocketBetaClaim = artifacts.require('./contract/RocketBetaClaim.sol');


// Round values off by number of places
function round(value, places) {
    return Math.floor(value / Math.pow(10, places));
}


// Set the claim start time
export async function scenarioSetClaimStart({claimStart, fromAddress}) {
    const rocketBetaClaim = await RocketBetaClaim.deployed();

    // Set claim start time
    await rocketBetaClaim.setClaimStart(claimStart, {from: fromAddress});

    // Get the claim period & start and end times
    let claimPeriod = parseInt(await rocketBetaClaim.claimPeriod.call());
    let claimStartTime = parseInt(await rocketBetaClaim.claimStart.call());
    let claimEndTime = parseInt(await rocketBetaClaim.claimEnd.call());

    // Check claim start and end times
    assert.equal(claimStartTime, claimStart, 'Claim start time was not set correctly.');
    assert.equal(claimEndTime, claimStartTime + claimPeriod, 'Claim end time was not set correctly.');

}


// Set the RPL total claimable
export async function scenarioSetRplTotal({rplTotal, fromAddress}) {
    const rocketBetaClaim = await RocketBetaClaim.deployed();

    // Set rpl total claimable
    await rocketBetaClaim.setRplTotal(rplTotal, {from: fromAddress});

    // Get the rpl total claimable
    let rplTotalClaimable = parseInt(await rocketBetaClaim.rplTotal.call());

    // Check the rpl total claimable
    assert.equal(rplTotalClaimable, rplTotal, 'RPL total was not set correctly.');

}


// Add a participant
export async function scenarioAddParticipant({participantAddress, fromAddress}) {
    const rocketBetaClaim = await RocketBetaClaim.deployed();

    // Get participant info
    let participantCount1 = parseInt(await rocketBetaClaim.getParticipantCount.call());
    let participantExists1 = await rocketBetaClaim.getParticipantExists.call(participantAddress);

    // Add participant
    await rocketBetaClaim.addParticipant(participantAddress, {from: fromAddress});

    // Get participant info
    let participantCount2 = parseInt(await rocketBetaClaim.getParticipantCount.call());
    let participantExists2 = await rocketBetaClaim.getParticipantExists.call(participantAddress);

    // Check participant was added
    assert.isTrue(participantExists2, 'Participant was not added successfully.');
    assert.equal(participantCount2, participantCount1 + 1, 'Participant count was not updated successfully.');

}


// Remove a participant
export async function scenarioRemoveParticipant({participantAddress, fromAddress}) {
    const rocketBetaClaim = await RocketBetaClaim.deployed();

    // Get initial participant list
    let participants = [];
    let count = parseInt(await rocketBetaClaim.getParticipantCount.call());
    for (let pi = 0; pi < count; ++pi) participants.push(await rocketBetaClaim.getParticipantAddress.call(pi));

    // Get expected final participant list
    let expectedParticipants = participants.filter(el => (el != participantAddress));

    // Get participant info
    let participantCount1 = parseInt(await rocketBetaClaim.getParticipantCount.call());
    let participantExists1 = await rocketBetaClaim.getParticipantExists.call(participantAddress);

    // Remove participant
    await rocketBetaClaim.removeParticipant(participantAddress, {from: fromAddress});

    // Get participant info
    let participantCount2 = parseInt(await rocketBetaClaim.getParticipantCount.call());
    let participantExists2 = await rocketBetaClaim.getParticipantExists.call(participantAddress);

    // Check participant was removed
    assert.isFalse(participantExists2, 'Participant was not removed successfully.');
    assert.equal(participantCount2, participantCount1 - 1, 'Participant count was not updated successfully.');

    // Check other participants are unaffected
    for (let pi = 0; pi < expectedParticipants.length; ++pi) {
        let exists = await rocketBetaClaim.getParticipantExists.call(expectedParticipants[pi]);
        assert.isTrue(exists, 'Other participant was affected.');
    }

}


// Claim RPL
export async function scenarioClaimRpl({fromAddress}) {
    const rocketBetaClaim = await RocketBetaClaim.deployed();
    const dummyRocketPoolToken = await DummyRocketPoolToken.deployed();

    // Get claim amount
    let claimAmount = parseInt(await rocketBetaClaim.getClaimAmount.call());

    // Get participant & contract info
    let claimed1 = await rocketBetaClaim.getParticipantClaimed.call(fromAddress);
    let participantBalance1 = parseInt(await dummyRocketPoolToken.balanceOf(fromAddress));
    let claimBalance1 = parseInt(await dummyRocketPoolToken.balanceOf(rocketBetaClaim.address));

    // Claim
    await rocketBetaClaim.claimRpl({from: fromAddress});

    // Get participant & contract info
    let claimed2 = await rocketBetaClaim.getParticipantClaimed.call(fromAddress);
    let participantBalance2 = parseInt(await dummyRocketPoolToken.balanceOf(fromAddress));
    let claimBalance2 = parseInt(await dummyRocketPoolToken.balanceOf(rocketBetaClaim.address));

    // Check claim was successful
    assert.isTrue(claimed2, 'Participant was not recorded as having claimed.');
    assert.equal(round(participantBalance2, 6), round(participantBalance1 + claimAmount, 6), 'Participant\'s RPL balance was not updated correctly.');
    assert.equal(round(claimBalance2, 6), round(claimBalance1 - claimAmount, 6), 'Contract\'s RPL balance was not updated correctly.');

}


// Close beta claim contract
export async function scenarioClose({fromAddress}) {
    const rocketBetaClaim = await RocketBetaClaim.deployed();
    const dummyRocketPoolToken = await DummyRocketPoolToken.deployed();

    // Get contract & owner info
    let closed1 = await rocketBetaClaim.closed.call();
    let claimBalance1 = parseInt(await dummyRocketPoolToken.balanceOf(rocketBetaClaim.address));
    let ownerBalance1 = parseInt(await dummyRocketPoolToken.balanceOf(fromAddress));

    // Close
    await rocketBetaClaim.close({from: fromAddress});

    // Get contract & owner info
    let closed2 = await rocketBetaClaim.closed.call();
    let claimBalance2 = parseInt(await dummyRocketPoolToken.balanceOf(rocketBetaClaim.address));
    let ownerBalance2 = parseInt(await dummyRocketPoolToken.balanceOf(fromAddress));

    // Check close was successful
    assert.isTrue(closed2, 'Beta claim was not closed successfully.');
    assert.equal(claimBalance2, 0, 'Contract\'s RPL balance was not emptied.');
    assert.equal(round(ownerBalance2, 6), round(ownerBalance1 + claimBalance1, 6), 'Owner\'s RPL balance was not updated correctly.');

}

