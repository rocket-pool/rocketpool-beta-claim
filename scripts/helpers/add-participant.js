// Dependencies
const Web3 = require('web3');

// Artifacts
const RocketBetaClaim = artifacts.require('./contract/RocketBetaClaim');

// Add participant
module.exports = async (done) => {

    // Get command-line arguments (remove args from truffle)
    let args = process.argv.splice(4);

    // Validate arguments
    if (args.length != 1) done('Incorrect number of arguments. Please enter: participant address.');
    if (!Web3.utils.isAddress(args[0])) done('Participant address is invalid.');

    // Parse arguments
    let [participantAddress] = args;

    // Get contract dependencies
    const rocketBetaClaim = await RocketBetaClaim.deployed();

    // Add participant
    await rocketBetaClaim.addParticipant(participantAddress);

    // Complete
    done('Participant added successfully: ' + args.join(', '));

};

