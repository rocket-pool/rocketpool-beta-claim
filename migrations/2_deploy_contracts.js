// Config
const config = require('../truffle.js');

// Artifacts
const DummyRocketPoolToken = artifacts.require('./DummyRocketPoolToken.sol');
const RocketBetaClaim = artifacts.require('./RocketBetaClaim.sol');

// Participants
const participants = [
    '0xbA8c8b04845822C5455Ef64A3618a13aB186cEf1',
    '0x0edb39cb15f738D26B9b250Da6aec2e044ACeBA5',
    '0x1f1ba48A96Fe8268C3d30348D4AC80a32D0Ae5C5',
];

// Deploy
module.exports = function(deployer, network) {
    
    // Get network config
    let networkConfig = config.networks[network];

    // Deploying dummy Rocket Pool Token contract
    if (networkConfig.dummyRocketPoolToken) {
        return deployer.deploy(DummyRocketPoolToken).then(() => {
            return deployer.deploy(RocketBetaClaim, DummyRocketPoolToken.address, participants);
        });
    }

    // Using existing Rocket Pool Token contract
    else {
        return deployer.deploy(RocketBetaClaim, networkConfig.rocketPoolTokenAddress, participants);
    }

};
