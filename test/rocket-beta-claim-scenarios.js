// Import artifacts
const DummyRocketPoolToken = artifacts.require('./contract/DummyRocketPoolToken.sol');
const RocketBetaClaim = artifacts.require('./contract/RocketBetaClaim.sol');


//
export async function _____({toAddress, fromAddress}) {
    const rocketBetaClaim = await RocketBetaClaim.deployed();
    const dummyRocketPoolToken = await DummyRocketPoolToken.deployed();



}
