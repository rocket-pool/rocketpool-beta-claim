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
