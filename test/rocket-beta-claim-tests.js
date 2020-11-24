import { printTitle, assertThrows, printEvent, soliditySha3, TimeController } from './utils';
import { scenarioSetClaimStart, scenarioSetRplTotal, scenarioAddParticipant, scenarioAddParticipants, scenarioRemoveParticipant, scenarioClaimRpl, scenarioClose } from './rocket-beta-claim-scenarios';

// Import artifacts
const DummyRocketPoolToken = artifacts.require('./contract/DummyRocketPoolToken.sol');
const RocketBetaClaim = artifacts.require('./contract/RocketBetaClaim.sol');


// Debug participant list
async function debugParticipants() {
    const rocketBetaClaim = await RocketBetaClaim.deployed();

    // Get count
    let count = parseInt(await rocketBetaClaim.getParticipantCount.call());

    // Get and log participants
    console.log('-----');
    let participant, pi;
    for (pi = 0; pi < count; ++pi) {
        participant = await rocketBetaClaim.getParticipantAddress.call(pi);
        console.log(`participant ${pi}:`, participant);
    }
    console.log('-----');

}


// Participants
// Approx. 133 participants can be added per tx within the 12 million block gas limit
const participantAddresses = [
    "0x150985F838C456d4776Dc96774c647B87BF3a04a",
    "0xc14A6AEec328C0690d0387584b3f92348629917F",
    "0xbA8c8b04845822C5455Ef64A3618a13aB186cEf1",
    "0xB53eEe81f9934312C2e122495A3714c4572fee06",
    "0x2E5d207a4C0F7e7C52F6622DCC6EB44bC0fE1A13",
    "0x2a0b5075e2D0845BD9114E8F3102e7441960A24C",
    "0x77eCa535aF9121291E5051c684af83c16793cb2A",
    "0x05A8Dd4662feEc6b1b4c153368BDd8Ea30Db8Bbf",
    "0xB0A9d798f7c8028B0e467b913a02b547D0528C4A",
    "0xCFB58bB9F88a904Ec1046f7801ed1939A3025e7f",
    "0x12067596e80e57CdD96EB1E4E78Fa750c1888E91",
    "0xE1b2884FBC132238681E58649D741791a69eB452",
    "0x5F51bfF8DB90ed146b7a276C6adFEaF15CEFf24e",
    "0x24f32337f50D8038D035AFC399F68a38E026a484",
    "0x6AF473391253f510256Db55F32F6ec01D7c92675",
    "0x1AB59Baa137CAe2Ab4C3f47a365970f8893f9f53",
    "0x183CB88b8797C92C3F1D65365943ed7dE6e8b82f",
    "0xE9515AFA9FA2b7C879Cd3e550FBeF515BC541193",
    "0xDB8C2B41A46547C7A5075d2Fe1FdF87E94cebdCa",
    "0x046B390fa81167Dc741D34B6dfd68714C88C3537",
    "0xad29Cb97E916EC563961b0B174Fb4c14670de4f5",
    "0xA6A716c9d48851d15f24612fcCE42dAb3f873A4B",
    "0xC73cA270e6613ce58441a75f3853F0cF1b269b58",
    "0x4A7E3819330E11866e967Bab484dc37e577b2a64",
    "0xdE7adB6461cB7477eD3E89Cb2da37CcF9EF9f540",
    "0x1b43a6a07232e07C73BA62C483A805eC409E84fb",
    "0x6705B701F8BC3bEb1609E8ED5F6624A254C82681",
    "0xAaCafbb35aA6d753db974CdB19d31d022213fB31",
    "0xa325076Ab0e701eec54D0072974D0fD26B31612C",
    "0xce736d9D387215850871034467E790DC957DFAcA",
    "0xAC3f2bcd92C5c69EcF8507EF6c6C120D5abC229C",
    "0x45AcaE41f848d5b12b3408cCF06E64173D9BeB57",
    "0xbeb7f097D4D84708c030e7f7b880aa7cf8B72697",
    "0x98D91ac3F160E1c60a79430c8a8FE532c2bb1794",
    "0xA09a8a39Fc1e598BF98293cec2141c4c40dF99f0",
    "0x12E322Ef04da64246412536f8eB60D6A402a59f9",
    "0x68A6C2019eBdc637B053115Ed30F456aef2cb014",
    "0xf689d779d9108FAa0Ba447399Fb2477687923278",
    "0xdACC7E792DdeAC783a4A4b7Ae695e533bE40f81f",
    "0x76288BE212C272dd56dc9A73f1A25d2151Dbb2C8",
    "0x306c19BAd32f02039Ba5F5C0bf8b98AA0c5103DE",
    "0x8286231a520D5fAB49c307C182716a1f7264e186",
    "0xFA7513021002F7181333B773BF801DFD7fd91ce7",
    "0x9000EDc41750Ae0658390D044E7f2594142DB513",
    "0xdb6C18087cB71164f9B47981d684E68C697b319e",
    "0x099FD47A4b6cE483a108605515165618e0f0597A",
    "0xd63B87FA46652a28cB3FfCbc56F7721FC60943AD",
    "0x936B58B2f4BfC94318E9bB98e093EAEe8D7E103d",
    "0x719daFE0bE7abf7d2b6C67Eed4fa18D970D3Abb6",
    "0x2962Ff392B53Fd85e2910fA38063678AC5Dfb4FD",
    "0xE75D2DF8343dBf129Fb35e91b1E4585516a45685",
    "0x28A1C0886D516886D41c3a62842bC5c537dE50a5",
    "0x22E04Aa220CEEFe2Fc8A8A7A46Fa81c4733AA8E6",
    "0xebDD96641d30Fa90c8a32BaA96420cd53554D113",
    "0x18F589F4F42c9Fb947cA73FD4b7882Dca85c77ba",
    "0x73AB524557BbC3f98507A2856732F2caccF004A1",
    "0x1ff64762d84a30753c5991cfDAB206e514E3E8dD",
    "0x399e0Ae23663F27181Ebb4e66Ec504b3AAB25541",
    "0x33Af30C7a70f7039617FB3DC8F3030aBd3E3Fa2E",
    "0xe29C46AB8eF15AB1a82A4fa6599d319d60Af181D",
    "0x5bC661caF74BfBd1F679E261CD69E00B21A989C7",
    "0x75A1b53393fF40451c83603890b149Cecf15bd87",
    "0x4064c2C7cb7432E8f269Bd88DB778A0e7465559A",
    "0x2dc7e2689186154798CB850636C162a6aD15bBcb",
    "0x64Bd4b37cA20bFfe0Fa141656196594a05bA71f2",
    "0x87e4b35Ba4976f2690225Aa30c1beb2c64c9bDd9",
    "0x0852dA4Ae95dcD0d00b5f87D7798293c1081B58d",
    "0x7747Ecc4A8022b08c94FDe95ea4Fd41F0A38f586",
    "0xf2BaC2DDb120d40FF3C486Cc600838c46403d70d",
    "0x5FC5684B4d1Bc8066fb2253E106e6502121ccdAd",
    "0xA94A6A58dd1fc6a8a3E8E75D123f8e7F30026c00",
    "0xfFd69Df3EB15D33CAC3a897221b11a2909CD4A98",
    "0xF64573A34A2232968E54f4B4CBb47f0f852b925e",
    "0x0098254EeA64D4D33EaAA0f516792642824a5bc6",
    "0xd517535e148cf3848ddF1611AAF1750e788C6a0a",
    "0xA748b1e0e2d818f47f043f6C96AC77800C5C4B2D",
    "0xad0ae00CBF2fC0Bf53b33407eA92dcFcCE0391e5",
    "0x7e09997b8D678e0aE511bc225A68c2192ACc90a5",
    "0x64493c6BBAdCc634f44cf1accB852B1fcAE22902",
    "0x7E909f6d503Fcca5cF7dfB92e7610b1302F4331f",
    "0x24656b0D6c401d396cB3356e3089FE26eaB5A790",
    "0x9868968F331911F597aA72c058d972338144fE06",
    "0xce2DA19C5Faf3E04DC9AD62DEA802b2BC51Ebe2d",
    "0x59EDFdA34b7229aE069cDf00017C8493acd151F5",
    "0x6fB8215A5c623Bc236728f84a9924cD3160bf678",
    "0x216a1f7D76fA43c40B3dd79C37faa8e89Cc42472",
    "0xE0A237ECF45A814Fc3F55e079867b02512BaCDD4",
    "0x61AE567C612272314843565e0c410B20078cb4dF",
    "0xBc7efF17bd442745167f9C03466cDd1843d54bFA",
    "0x0ED26CDA5DdC3c6525768823a5A9757D002eA4cC",
    "0x3dA6AA5FbE819e169e31C24776974F6d38130F68",
    "0xD6740590298887CA0deC1FAec998d29c8874EB2a",
    "0x81Ba93B26bCe8cA5d649B6607DF15E6D45462D8F",
    "0x4f6ff44F18A02833D3AB285f8A74569D76877560",
    "0x8dC0877c2699A2B67994fa3379979369e60D0d6C",
    "0xa426B2E6987fEB52e1678e1f784f7580567D30DE",
    "0x137F34da6225f3a8cb27A5798C4478910e681DcB",
    "0x19aB054A7d7C7c341eb0baeb31849e9ff6f13Ff4",
    "0x9a3e75dcD12AB73e4C37d06c3A3D29b86C8B2b42",
    "0x9a16EAC96BA4dC676b6a64287a75E05530280feC",
    "0x25fADaFA9D620BC0070D2A12d23328b3095f762d",
    "0x95a2E60f86CB5A17ED3602Abb7CD14F217278315",
    "0xB6D9F3F9B7EE507a5497D70ea4eAfffF1BBa59Fe",
    "0xd3C61195B4dA3F59832Df875a658599ed355D474",
    "0xc40a05a2840b9B371278738DFE0e5aD8C14D4dD0",
    "0x992270b7CF6da54df52C2332D7FFA610B3697803",
    "0x87Ce4a830A1ba94D7a0C895AEE3828a07B653732",
    "0xa4932280B37de5fceC32232fB378Cbb24275E8f8",
    "0x46Bf0b140444F473208f25c43329d676720238a7",
    "0xC87efC9c71C422779F7dbeF14B2Fc4eef94b84fF",
    "0xC1efA7369A4B5c33dFEECDbbEb41FC82590720a8",
    "0x96e783AE6E7eD0b8D566273056e0D7aD08A634eF",
    "0xC16130695042906F5FC5283c14b2fB004dD403F2",
    "0x25Ab835A6a1765EcD151fd98652C3E66c67240b7",
    "0x5D31004D9584829211c2350218Ff417d81118a2E",
    "0x0B5FDdF66092332f3c8FeEd63B6600718991BC8a",
    "0x91f425d3f7F6C17f133d6379a0a8e3dfA9b269F1",
    "0x5893844d48b4Bb1737e3D5060901c054b8549014",
    "0xBf61dE2c62048c003008e94aAFE98bcE30eE6278",
    "0x9283165e815eB83c9C930Ac130e927348096eFBf",
    "0x2BFF28A82Bc4166d535bC9B803f77C09D47fB370",
    "0x4d4AC7416dA599e7FC282e59D3540831F1811812",
    "0x9f0B4598802bEbCc9AA3E61b6d85548B06a4B26B",
    "0x708C968fF19e04ad24f288609c083301C26127f3",
    "0xcBeeE365A73E015D3514bf59cAe07D121614dD56",
    "0xda956bcF5b7E416af3d954503910526109693291",
    "0xcaff17d5c7C349bE300E93cbAF56bc868ef75982",
    "0x23ED5A86351ABcB66a39e5bB9dfC068A2D50C1c4",
    "0x451Cd6494C90194F179B7F9A400838af5a37aAeA",
    "0xd3ff99116B35BF842eaa05B6bE98F55E57E86D97",
    "0x8760896c309ab534294091A9Ccce689126d64A1b",
    "0xc486D280317f77aEa8D642e3a313EB52A21fAe7F",
    "0x3Bb4D732dC162f1914509b6737A069641e3a37a7",
];


// Start the tests
contract('RocketBetaClaim', (accounts) => {


    // The owner
    const owner = accounts[0];

    // Participant accounts
    const participant1 = accounts[1];
    const participant2 = accounts[2];
    const participant3 = accounts[3];
    const participant4 = accounts[4];

    // Claim start time delay
    const day = (60 * 60 * 24); // seconds
    const claimStartDelay = (day * 7 * 3); // seconds

    // Contract dependencies
    let rocketBetaClaim;
    let dummyRocketPoolToken;


    // Initialisation
    before(async () => {

        // Initialise contracts
        rocketBetaClaim = await RocketBetaClaim.deployed();
        dummyRocketPoolToken = await DummyRocketPoolToken.deployed();

        // Initialise dummy rocket pool token supply
        let tokenSupply = web3.utils.toWei('500', 'ether');
        await dummyRocketPoolToken.mint(owner, tokenSupply, {from: owner});
        await dummyRocketPoolToken.transfer(rocketBetaClaim.address, tokenSupply, {from: owner});

    });


    //
    // Before claim period
    //


    // Owner can set the claim start time
    it(printTitle('owner', 'can set the claim start time'), async () => {

        // Get claim start time, 3 weeks in future
        let now = Math.floor((new Date()).getTime() / 1000);
        let start = now + claimStartDelay;

        // Set claim start time
        await scenarioSetClaimStart({
            claimStart: start,
            fromAddress: owner,
        });

    });


    // Random account cannot set the claim start time
    it(printTitle('random account', 'cannot set the claim start time'), async () => {

        // Get claim start time, 3 weeks in future
        let now = Math.floor((new Date()).getTime() / 1000);
        let start = now + (60 * 60 * 24 * 7 * 3);

        // Set claim start time
        await assertThrows(scenarioSetClaimStart({
            claimStart: start,
            fromAddress: accounts[1],
        }), 'Random account set the claim start time.');

    });


    // Owner can set the RPL total claimable
    it(printTitle('owner', 'can set the RPL total claimable'), async () => {

        // Get the claim contract's RPL balance
        let claimRplBalance = await dummyRocketPoolToken.balanceOf(rocketBetaClaim.address);

        // Set RPL total claimable
        await scenarioSetRplTotal({
            rplTotal: claimRplBalance,
            fromAddress: owner,
        });

    });


    // Owner cannot set the RPL total claimable higher than the beta claim's RPL balance
    it(printTitle('owner', 'cannot set the RPL total claimable higher than the beta claim\'s RPL balance'), async () => {

        // Get the claim contract's RPL balance
        let claimRplBalance = await dummyRocketPoolToken.balanceOf(rocketBetaClaim.address);

        // Set RPL total claimable
        await assertThrows(scenarioSetRplTotal({
            rplTotal: claimRplBalance.add(web3.utils.toBN(web3.utils.toWei('1', 'ether'))),
            fromAddress: owner,
        }), 'Owner set the RPL total claimable higher than the beta claim\'s RPL balance.');

    });


    // Random account cannot set the RPL total claimable
    it(printTitle('random account', 'cannot set the RPL total claimable'), async () => {

        // Get the claim contract's RPL balance
        let claimRplBalance = await dummyRocketPoolToken.balanceOf(rocketBetaClaim.address);

        // Set RPL total claimable
        await assertThrows(scenarioSetRplTotal({
            rplTotal: claimRplBalance,
            fromAddress: accounts[1],
        }), 'Random account set the RPL total claimable.');

    });


    // Owner can add a participant
    it(printTitle('owner', 'can add a participant'), async () => {

        // Add multiple participants
        await scenarioAddParticipants({
            participantAddresses: participantAddresses,
            fromAddress: owner,
        });

        // Add single participants
        await scenarioAddParticipant({
            participantAddress: participant1,
            fromAddress: owner,
        });
        await scenarioAddParticipant({
            participantAddress: participant2,
            fromAddress: owner,
        });

    });


    // Owner cannot add a participant with a null address
    it(printTitle('owner', 'cannot add a participant with a null address'), async () => {

        // Add multiple participants
        await assertThrows(scenarioAddParticipants({
            participantAddresses: [
                '0x0000000000000000000000000000000000000000',
                participant3,
            ],
            fromAddress: owner,
        }), 'Owner added a participant with a null address.');

        // Add single participant
        await assertThrows(scenarioAddParticipant({
            participantAddress: '0x0000000000000000000000000000000000000000',
            fromAddress: owner,
        }), 'Owner added a participant with a null address.');

    });


    // Owner cannot add a participant who already exists
    it(printTitle('owner', 'cannot add a participant who already exists'), async () => {

        // Add multiple participants - with existing participant
        await assertThrows(scenarioAddParticipants({
            participantAddresses: [
                participant1,
                participant3,
            ],
            fromAddress: owner,
        }), 'Owner added a participant who already exists.');

        // Add multiple participants - with duplicate participant
        await assertThrows(scenarioAddParticipants({
            participantAddresses: [
                participant3,
                participant3,
            ],
            fromAddress: owner,
        }), 'Owner added a participant who already exists.');

        // Add single participant
        await assertThrows(scenarioAddParticipant({
            participantAddress: participant1,
            fromAddress: owner,
        }), 'Owner added a participant who already exists.');

    });


    // Random account cannot add a participant
    it(printTitle('random account', 'cannot add a participant'), async () => {

        // Add multiple participants
        await assertThrows(scenarioAddParticipants({
            participantAddresses: [
                participant3,
                participant4,
            ],
            fromAddress: accounts[1],
        }), 'Random account added a participant.');

        // Add single participant
        await assertThrows(scenarioAddParticipant({
            participantAddress: participant3,
            fromAddress: accounts[1],
        }), 'Random account added a participant.');

    });


    // Owner can remove a participant
    it(printTitle('owner', 'can remove a participant'), async () => {

        // Participant count
        let count;

        // Remove from middle of list
        count = parseInt(await rocketBetaClaim.getParticipantCount.call());
        let remove1 = await rocketBetaClaim.getParticipantAddress.call(Math.floor((count - 1) / 2));
        await scenarioRemoveParticipant({
            participantAddress: remove1,
            fromAddress: owner,
        });

        // Remove from end of list
        count = parseInt(await rocketBetaClaim.getParticipantCount.call());
        let remove2 = await rocketBetaClaim.getParticipantAddress.call(count - 1);
        await scenarioRemoveParticipant({
            participantAddress: remove2,
            fromAddress: owner,
        });

        // Remove from start of list
        let remove3 = await rocketBetaClaim.getParticipantAddress.call(0);
        await scenarioRemoveParticipant({
            participantAddress: remove3,
            fromAddress: owner,
        });

    });


    // Owner cannot remove a participant who doesn't exist
    it(printTitle('owner', 'cannot remove a participant who doesn\'t exist'), async () => {
        await assertThrows(scenarioRemoveParticipant({
            participantAddress: participant3,
            fromAddress: owner,
        }), 'Random account added a participant.');
    });


    // Random account cannot remove a participant
    it(printTitle('random account', 'cannot remove a participant'), async () => {

        // Get first participant
        let remove = await rocketBetaClaim.getParticipantAddress.call(0);

        // Remove
        await assertThrows(scenarioRemoveParticipant({
            participantAddress: remove,
            fromAddress: accounts[1],
        }), 'Random account removed a participant.');

    });


    // Owner can add a participant who was removed
    it(printTitle('owner', 'can add a participant who was removed'), async () => {

        // Remove participants if not removed
        const removeParticipants = async (addresses) => {
            for (let ai = 0; ai < addresses.length; ++ai) {
                let address = addresses[ai];
                let exists = await rocketBetaClaim.getParticipantExists.call(address);
                if (exists) await scenarioRemoveParticipant({
                    participantAddress: address,
                    fromAddress: owner,
                });
            }
        };

        // Remove participant1 and participant2
        await removeParticipants([participant1, participant2]);

        // Add multiple participants
        await scenarioAddParticipants({
            participantAddresses: [
                participant1,
                participant2,
            ],
            fromAddress: owner,
        });

        // Remove participant1 and participant2
        await removeParticipants([participant1, participant2]);

        // Add single participants
        await scenarioAddParticipant({
            participantAddress: participant1,
            fromAddress: owner,
        });
        await scenarioAddParticipant({
            participantAddress: participant2,
            fromAddress: owner,
        });

    });


    // Participant cannot claim RPL before claim start
    it(printTitle('participant', 'cannot claim RPL before claim start'), async () => {
        await assertThrows(scenarioClaimRpl({
            fromAddress: participant1,
        }), 'Participant claimed RPL before claim start.');
    });


    //
    // During claim period
    //


    // Advance to claim period
    it(printTitle('-----', 'advance to claim period'), async () => {
        await TimeController.addSeconds(claimStartDelay + day);
    });


    // Owner cannot set the claim start time after claim start
    it(printTitle('owner', 'cannot set the claim start time after claim start'), async () => {

        // Get claim start time, 3 weeks in future
        let now = Math.floor((new Date()).getTime() / 1000);
        let start = now + (60 * 60 * 24 * 7 * 3);

        // Set claim start time
        await assertThrows(scenarioSetClaimStart({
            claimStart: start,
            fromAddress: owner,
        }), 'Owner set the claim start time after claim start.');

    });


    // Owner cannot set the RPL total claimable after claim start
    it(printTitle('owner', 'cannot set the RPL total claimable after claim start'), async () => {

        // Get the claim contract's RPL balance
        let claimRplBalance = await dummyRocketPoolToken.balanceOf(rocketBetaClaim.address);

        // Set RPL total claimable
        await assertThrows(scenarioSetRplTotal({
            rplTotal: claimRplBalance,
            fromAddress: owner,
        }), 'Owner set the RPL total claimable after claim start.');

    });


    // Owner cannot add a participant after claim start
    it(printTitle('owner', 'cannot add a participant after claim start'), async () => {

        // Add multiple participants
        await assertThrows(scenarioAddParticipants({
            participantAddresses: [
                participant3,
                participant4,
            ],
            fromAddress: owner,
        }), 'Owner added a participant after claim start.');

        // Add single participant
        await assertThrows(scenarioAddParticipant({
            participantAddress: participant3,
            fromAddress: owner,
        }), 'Owner added a participant after claim start.');

    });


    // Owner cannot remove a participant after claim start
    it(printTitle('owner', 'cannot remove a participant after claim start'), async () => {

        // Get first participant
        let remove = await rocketBetaClaim.getParticipantAddress.call(0);

        // Remove
        await assertThrows(scenarioRemoveParticipant({
            participantAddress: remove,
            fromAddress: owner,
        }), 'Owner removed a participant after claim start.');

    });


    // Participant can claim RPL
    it(printTitle('participant', 'can claim RPL'), async () => {
        await scenarioClaimRpl({
            fromAddress: participant1,
        });
    });


    // Participant cannot claim RPL twice
    it(printTitle('participant', 'cannot claim RPL twice'), async () => {
        await assertThrows(scenarioClaimRpl({
            fromAddress: participant1,
        }), 'Participant claimed RPL twice.');
    });


    // Random account cannot claim RPL
    it(printTitle('random account', 'cannot claim RPL'), async () => {
        await assertThrows(scenarioClaimRpl({
            fromAddress: accounts[9],
        }), 'Random account claimed RPL.');
    });


    // Owner cannot close the beta claim before claim end
    it(printTitle('owner', 'cannot close the beta claim before claim end'), async () => {
        await assertThrows(scenarioClose({
            fromAddress: owner,
        }), 'Owner closed the beta claim before claim end.');
    });


    //
    // After claim period
    //


    // Advance to after claim period
    it(printTitle('-----', 'advance to after claim period'), async () => {
        let claimPeriod = parseInt(await rocketBetaClaim.claimPeriod.call());
        await TimeController.addSeconds(claimPeriod);
    });


    // Random account cannot close the beta claim
    it(printTitle('random account', 'cannot close the beta claim'), async () => {
        await assertThrows(scenarioClose({
            fromAddress: accounts[1],
        }), 'Random account closed the beta claim.');
    });


    // Owner can close the beta claim
    it(printTitle('owner', 'can close the beta claim'), async () => {

        // Check for remaining RPL balance
        let rplBalance = await dummyRocketPoolToken.balanceOf(rocketBetaClaim.address);
        assert.isTrue(rplBalance.gt(web3.utils.toBN(0)), 'Pre-check failed - beta claim contract has no remaining RPL balance.');

        // Close
        await scenarioClose({
            fromAddress: owner,
        });

    });


    // Owner cannot close the beta claim twice
    it(printTitle('owner', 'cannot close the beta claim twice'), async () => {
        await assertThrows(scenarioClose({
            fromAddress: owner,
        }), 'Owner closed the beta claim twice.');
    });


    //
    // Closed
    //


    // Participant cannot claim RPL after the beta claim is closed
    it(printTitle('participant', 'cannot claim RPL after the beta claim is closed'), async () => {
        await assertThrows(scenarioClaimRpl({
            fromAddress: participant2,
        }), 'Participant claimed RPL after the beta claim closed.');
    });


});
