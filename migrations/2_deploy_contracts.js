// Config
const config = require('../truffle.js');

// Artifacts
const DummyRocketPoolToken = artifacts.require('./DummyRocketPoolToken.sol');
const RocketBatchTransfer = artifacts.require('./RocketBatchTransfer.sol');

// Deploy
module.exports = function(deployer, network) {
    
    // Get network config
    let networkConfig = config.networks[network];

    // Deploying dummy Rocket Pool Token contract
    if (networkConfig.dummyRocketPoolToken) {
        return deployer.deploy(DummyRocketPoolToken).then(() => {
            return deployer.deploy(RocketBatchTransfer);
        });
    }

    // Using existing Rocket Pool Token contract
    else {
        return deployer.deploy(RocketBatchTransfer);
    }

};
