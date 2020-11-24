// Import artifacts
const DummyRocketPoolToken = artifacts.require('./contract/DummyRocketPoolToken.sol');
const RocketBetaClaim = artifacts.require('./contract/RocketBetaClaim.sol');


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
    let rplTotalClaimable = await rocketBetaClaim.rplTotal.call();

    // Check the rpl total claimable
    assert.isTrue(rplTotalClaimable.eq(rplTotal), 'RPL total was not set correctly.');

}


// Add multiple participants
export async function scenarioAddParticipants({participantAddresses, fromAddress}) {
    const rocketBetaClaim = await RocketBetaClaim.deployed();

    // Get participant info
    let participantCount1 = parseInt(await rocketBetaClaim.getParticipantCount.call());
    let participant0Exists1 = await rocketBetaClaim.getParticipantExists.call(participantAddresses[0]);
    let participantNExists1 = await rocketBetaClaim.getParticipantExists.call(participantAddresses[participantAddresses.length - 1]);

    // Add participants
    await rocketBetaClaim.addParticipants(participantAddresses, {from: fromAddress});

    // Get participant info
    let participantCount2 = parseInt(await rocketBetaClaim.getParticipantCount.call());
    let participant0Exists2 = await rocketBetaClaim.getParticipantExists.call(participantAddresses[0]);
    let participantNExists2 = await rocketBetaClaim.getParticipantExists.call(participantAddresses[participantAddresses.length - 1]);

    // Check participants were added
    assert.isTrue(participant0Exists2, 'First participant was not added successfully.');
    assert.isTrue(participantNExists2, 'Last participant was not added successfully.');
    assert.equal(participantCount2, participantCount1 + participantAddresses.length, 'Participant count was not updated successfully.');

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
    let claimAmount = await rocketBetaClaim.getClaimAmount.call();

    // Get participant & contract info
    let claimed1 = await rocketBetaClaim.getParticipantClaimed.call(fromAddress);
    let participantBalance1 = await dummyRocketPoolToken.balanceOf(fromAddress);
    let claimBalance1 = await dummyRocketPoolToken.balanceOf(rocketBetaClaim.address);

    // Claim
    await rocketBetaClaim.claimRpl({from: fromAddress});

    // Get participant & contract info
    let claimed2 = await rocketBetaClaim.getParticipantClaimed.call(fromAddress);
    let participantBalance2 = await dummyRocketPoolToken.balanceOf(fromAddress);
    let claimBalance2 = await dummyRocketPoolToken.balanceOf(rocketBetaClaim.address);

    // Check claim was successful
    assert.isTrue(claimed2, 'Participant was not recorded as having claimed.');
    assert.isTrue(participantBalance2.eq(participantBalance1.add(claimAmount)), 'Participant\'s RPL balance was not updated correctly.');
    assert.isTrue(claimBalance2.eq(claimBalance1.sub(claimAmount)), 'Contract\'s RPL balance was not updated correctly.');

}


// Close beta claim contract
export async function scenarioClose({fromAddress}) {
    const rocketBetaClaim = await RocketBetaClaim.deployed();
    const dummyRocketPoolToken = await DummyRocketPoolToken.deployed();

    // Get contract & owner info
    let closed1 = await rocketBetaClaim.closed.call();
    let claimBalance1 = await dummyRocketPoolToken.balanceOf(rocketBetaClaim.address);
    let ownerBalance1 = await dummyRocketPoolToken.balanceOf(fromAddress);

    // Close
    await rocketBetaClaim.close({from: fromAddress});

    // Get contract & owner info
    let closed2 = await rocketBetaClaim.closed.call();
    let claimBalance2 = await dummyRocketPoolToken.balanceOf(rocketBetaClaim.address);
    let ownerBalance2 = await dummyRocketPoolToken.balanceOf(fromAddress);

    // Check close was successful
    assert.isTrue(closed2, 'Beta claim was not closed successfully.');
    assert.isTrue(claimBalance2.eq(web3.utils.toBN(0)), 'Contract\'s RPL balance was not emptied.');
    assert.isTrue(ownerBalance2.eq(ownerBalance1.add(claimBalance1)), 'Owner\'s RPL balance was not updated correctly.');

}

