// Print pretty test title
export function printTitle(user, desc) {
    return '\x1b[33m' + user + '\u001b[00m: \u001b[01;34m' + desc;
}

// Assert that an error is thrown
export async function assertThrows(promise, err) {
    try {
        await promise;
        assert.isNotOk(true, err);
    } catch (e) {
        assert.include(e.message, 'VM Exception');
    }
}

// Print the event to console
export function printEvent(type, result, colour) {
    console.log('\n');
    console.log(
        colour,
        '*** ' + type.toUpperCase() + ' EVENT: ' + result.event + ' *******************************'
    );
    console.log('\n');
    console.log(result.args);
    console.log('\n');
};

// The newer version of Web3 is used for hashing, the old one that comes with truffle does it incorrectly. Waiting for them to upgrade truffles web3.
const web3New = require('web3');
export function soliditySha3() {
    return web3New.utils.soliditySha3.apply(web3New, Array.prototype.slice.call(arguments));
}

// EVM time controller
export const TimeController = (() => {

    const addSeconds = (seconds) => new Promise((resolve, reject) =>
        web3.currentProvider.sendAsync({
        jsonrpc: "2.0",
        method: "evm_increaseTime",
        params: [seconds],
        id: new Date().getTime()
    }, (error, result) => error ? reject(error) : resolve(result.result)));

    const addDays = (days) => addSeconds(days * 24 * 60 * 60);
    const addWeeks = (weeks) => addSeconds(weeks * 7 * 24 * 60 * 60);
    const addMonths = (months) => addSeconds(months * 28 * 24 * 60 * 60);
    const addYears = (years) => addSeconds(years * 365 * 24 * 60 * 60);

    return {
        addSeconds,
        addDays,
        addWeeks,
        addMonths,
        addYears,
    };

})();
