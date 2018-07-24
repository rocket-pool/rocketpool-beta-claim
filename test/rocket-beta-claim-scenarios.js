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
    for (let pi = 0; pi < count; ++pi) participants.push(await rocketBetaClaim.participants.call(pi));

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
