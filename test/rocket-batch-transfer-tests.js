import { printTitle, assertThrows } from './utils';


// Import artifacts
const DummyRocketPoolToken = artifacts.require('./contract/DummyRocketPoolToken.sol');
const RocketBatchTransfer = artifacts.require('./contract/RocketBatchTransfer.sol');


// Start the tests
contract('RocketBatchTransfer', (accounts) => {


    // The owner
    const owner = accounts[0];
    const random = accounts[9];

    // Token recipients
    const recipient1 = accounts[1];
    const recipient2 = accounts[2];
    const recipient3 = accounts[3];
    const recipient4 = accounts[4];
    const recipient5 = accounts[5];
    const recipient6 = accounts[6];
    const recipient7 = accounts[7];
    const recipient8 = accounts[8];

    // Contract dependencies
    let rocketBatchTransfer;
    let dummyRocketPoolToken;


    // Initialisation
    before(async () => {

        // Initialise contracts
        rocketBatchTransfer = await RocketBatchTransfer.deployed();
        dummyRocketPoolToken = await DummyRocketPoolToken.deployed();

        // Mint RPL token supply to owner address
        const tokenSupply = web3.utils.toWei('1000', 'ether');
        await dummyRocketPoolToken.mint(owner, tokenSupply, {from: owner});

    });


    it(printTitle('owner', 'cannot send the same amount of a token to multiple addresses without approval'), async () => {

        const recipients = [
            recipient1,
            recipient2,
            recipient3,
            recipient4,
            recipient5,
            recipient6,
            recipient7,
            recipient8,
        ];
        const amount = web3.utils.toBN(web3.utils.toWei('1', 'ether'));

        await assertThrows(
            rocketBatchTransfer.transferTokenAmount(dummyRocketPoolToken.address, recipients, amount, {from: owner}),
            'Transferred tokens without approval'
        );

        await dummyRocketPoolToken.approve(rocketBatchTransfer.address, amount.mul(web3.utils.toBN(recipients.length - 1)), {from: owner});
        await assertThrows(
            rocketBatchTransfer.transferTokenAmount(dummyRocketPoolToken.address, recipients, amount, {from: owner}),
            'Transferred tokens without approval of full amount'
        );

    });


    it(printTitle('random account', 'cannot send the same amount of a token to multiple addresses'), async () => {

        const recipients = [
            recipient1,
            recipient2,
            recipient3,
            recipient4,
            recipient5,
            recipient6,
            recipient7,
            recipient8,
        ];
        const amount = web3.utils.toBN(web3.utils.toWei('1', 'ether'));

        await dummyRocketPoolToken.approve(rocketBatchTransfer.address, amount.mul(web3.utils.toBN(recipients.length)), {from: owner});
        await assertThrows(
            rocketBatchTransfer.transferTokenAmount(dummyRocketPoolToken.address, recipients, amount, {from: random}),
            'Random account transferred tokens'
        );

    });


    it(printTitle('owner', 'can send the same amount of a token to multiple addresses'), async () => {

        const recipients = [
            recipient1,
            recipient2,
            recipient3,
            recipient4,
            recipient5,
            recipient6,
            recipient7,
            recipient8,
        ];
        const amount = web3.utils.toBN(web3.utils.toWei('1', 'ether'));

        await dummyRocketPoolToken.approve(rocketBatchTransfer.address, amount.mul(web3.utils.toBN(recipients.length)), {from: owner});
        await rocketBatchTransfer.transferTokenAmount(dummyRocketPoolToken.address, recipients, amount, {from: owner});

    });


    it(printTitle('owner', 'cannot send different amounts of a token to multiple addresses without approval'), async () => {

        const recipients = [
            recipient1,
            recipient2,
            recipient3,
            recipient4,
            recipient5,
            recipient6,
            recipient7,
            recipient8,
        ];
        const amounts = [
            web3.utils.toBN(web3.utils.toWei('1', 'ether')),
            web3.utils.toBN(web3.utils.toWei('2', 'ether')),
            web3.utils.toBN(web3.utils.toWei('4', 'ether')),
            web3.utils.toBN(web3.utils.toWei('8', 'ether')),
            web3.utils.toBN(web3.utils.toWei('16', 'ether')),
            web3.utils.toBN(web3.utils.toWei('32', 'ether')),
            web3.utils.toBN(web3.utils.toWei('64', 'ether')),
            web3.utils.toBN(web3.utils.toWei('128', 'ether')),
        ];
        const totalAmount = amounts.reduce((acc, val) => acc.add(val), web3.utils.toBN(0));

        await assertThrows(
            rocketBatchTransfer.transferTokenAmounts(dummyRocketPoolToken.address, recipients, amounts, {from: owner}),
            'Transferred tokens without approval'
        );

        await dummyRocketPoolToken.approve(rocketBatchTransfer.address, totalAmount.sub(web3.utils.toBN(web3.utils.toWei('1', 'ether'))), {from: owner});
        await assertThrows(
            rocketBatchTransfer.transferTokenAmounts(dummyRocketPoolToken.address, recipients, amounts, {from: owner}),
            'Transferred tokens without approval of full amount'
        );

    });


    it(printTitle('random account', 'cannot send different amounts of a token to multiple addresses'), async () => {

        const recipients = [
            recipient1,
            recipient2,
            recipient3,
            recipient4,
            recipient5,
            recipient6,
            recipient7,
            recipient8,
        ];
        const amounts = [
            web3.utils.toBN(web3.utils.toWei('1', 'ether')),
            web3.utils.toBN(web3.utils.toWei('2', 'ether')),
            web3.utils.toBN(web3.utils.toWei('4', 'ether')),
            web3.utils.toBN(web3.utils.toWei('8', 'ether')),
            web3.utils.toBN(web3.utils.toWei('16', 'ether')),
            web3.utils.toBN(web3.utils.toWei('32', 'ether')),
            web3.utils.toBN(web3.utils.toWei('64', 'ether')),
            web3.utils.toBN(web3.utils.toWei('128', 'ether')),
        ];
        const totalAmount = amounts.reduce((acc, val) => acc.add(val), web3.utils.toBN(0));

        await dummyRocketPoolToken.approve(rocketBatchTransfer.address, totalAmount, {from: owner});
        await assertThrows(
            rocketBatchTransfer.transferTokenAmounts(dummyRocketPoolToken.address, recipients, amounts, {from: random}),
            'Random account transferred tokens'
        );

    });


    it(printTitle('owner', 'can send different amounts of a token to multiple addresses'), async () => {

        const recipients = [
            recipient1,
            recipient2,
            recipient3,
            recipient4,
            recipient5,
            recipient6,
            recipient7,
            recipient8,
        ];
        const amounts = [
            web3.utils.toBN(web3.utils.toWei('1', 'ether')),
            web3.utils.toBN(web3.utils.toWei('2', 'ether')),
            web3.utils.toBN(web3.utils.toWei('4', 'ether')),
            web3.utils.toBN(web3.utils.toWei('8', 'ether')),
            web3.utils.toBN(web3.utils.toWei('16', 'ether')),
            web3.utils.toBN(web3.utils.toWei('32', 'ether')),
            web3.utils.toBN(web3.utils.toWei('64', 'ether')),
            web3.utils.toBN(web3.utils.toWei('128', 'ether')),
        ];
        const totalAmount = amounts.reduce((acc, val) => acc.add(val), web3.utils.toBN(0));

        await dummyRocketPoolToken.approve(rocketBatchTransfer.address, totalAmount, {from: owner});
        await rocketBatchTransfer.transferTokenAmounts(dummyRocketPoolToken.address, recipients, amounts, {from: owner});

    });


});

