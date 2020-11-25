const crypto = require('crypto');
import { printTitle, assertThrows } from './utils';


// Import artifacts
const DummyRocketPoolToken = artifacts.require('./contract/DummyRocketPoolToken.sol');
const RocketBatchTransfer = artifacts.require('./contract/RocketBatchTransfer.sol');


const recipientCount = 375;
const amountRecipientCount = 360;

const recipients = [];
for (let i = 0; i < recipientCount; ++i) {
    const addressBytes = crypto.randomBytes(20);
    recipients.push('0x' + addressBytes.toString('hex'));
}

const amountRecipients = [];
for (let i = 0; i < amountRecipientCount; ++i) {
    const addressBytes = crypto.randomBytes(20);
    amountRecipients.push('0x' + addressBytes.toString('hex'));
}

const recipientAmounts = [];
for (let i = 0; i < amountRecipientCount; ++i) {
    const ethAmount = Math.round(Math.random() * 500) / 100;
    recipientAmounts.push(web3.utils.toBN(web3.utils.toWei(ethAmount.toString(), 'ether')));
}
const totalrecipientAmount = recipientAmounts.reduce((acc, val) => acc.add(val), web3.utils.toBN(0));


// Start the tests
contract('RocketBatchTransfer', (accounts) => {


    // Addresses
    const owner = accounts[0];
    const random = accounts[1];

    // Contract dependencies
    let rocketBatchTransfer;
    let dummyRocketPoolToken;


    // Initialisation
    before(async () => {

        // Initialise contracts
        rocketBatchTransfer = await RocketBatchTransfer.deployed();
        dummyRocketPoolToken = await DummyRocketPoolToken.deployed();

        // Mint RPL token supply to owner address
        const tokenSupply = web3.utils.toWei('1000000', 'ether');
        await dummyRocketPoolToken.mint(owner, tokenSupply, {from: owner});

    });


    it(printTitle('owner', 'cannot send the same amount of a token to multiple addresses without approval'), async () => {

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

        const amount = web3.utils.toBN(web3.utils.toWei('1', 'ether'));

        await dummyRocketPoolToken.approve(rocketBatchTransfer.address, amount.mul(web3.utils.toBN(recipients.length)), {from: owner});
        await assertThrows(
            rocketBatchTransfer.transferTokenAmount(dummyRocketPoolToken.address, recipients, amount, {from: random}),
            'Random account transferred tokens'
        );

    });


    it(printTitle('owner', 'can send the same amount of a token to multiple addresses'), async () => {

        const amount = web3.utils.toBN(web3.utils.toWei('1', 'ether'));

        await dummyRocketPoolToken.approve(rocketBatchTransfer.address, amount.mul(web3.utils.toBN(recipients.length)), {from: owner});
        let result = await rocketBatchTransfer.transferTokenAmount(dummyRocketPoolToken.address, recipients, amount, {from: owner});

        console.log('-----');
        console.log('Recipients:', recipients.length);
        console.log('Gas used:', result.receipt.gasUsed);
        console.log('-----');

    });


    it(printTitle('owner', 'cannot send different amounts of a token to multiple addresses without approval'), async () => {

        await assertThrows(
            rocketBatchTransfer.transferTokenAmounts(dummyRocketPoolToken.address, amountRecipients, recipientAmounts, {from: owner}),
            'Transferred tokens without approval'
        );

        await dummyRocketPoolToken.approve(rocketBatchTransfer.address, totalrecipientAmount.sub(web3.utils.toBN(web3.utils.toWei('1', 'ether'))), {from: owner});
        await assertThrows(
            rocketBatchTransfer.transferTokenAmounts(dummyRocketPoolToken.address, amountRecipients, recipientAmounts, {from: owner}),
            'Transferred tokens without approval of full amount'
        );

    });


    it(printTitle('random account', 'cannot send different amounts of a token to multiple addresses'), async () => {

        await dummyRocketPoolToken.approve(rocketBatchTransfer.address, totalrecipientAmount, {from: owner});
        await assertThrows(
            rocketBatchTransfer.transferTokenAmounts(dummyRocketPoolToken.address, amountRecipients, recipientAmounts, {from: random}),
            'Random account transferred tokens'
        );

    });


    it(printTitle('owner', 'can send different amounts of a token to multiple addresses'), async () => {

        await dummyRocketPoolToken.approve(rocketBatchTransfer.address, totalrecipientAmount, {from: owner});
        let result = await rocketBatchTransfer.transferTokenAmounts(dummyRocketPoolToken.address, amountRecipients, recipientAmounts, {from: owner});

        console.log('-----');
        console.log('Recipients:', amountRecipients.length);
        console.log('Gas used:', result.receipt.gasUsed);
        console.log('-----');

    });


});

