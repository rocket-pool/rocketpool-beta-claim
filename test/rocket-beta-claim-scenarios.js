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
