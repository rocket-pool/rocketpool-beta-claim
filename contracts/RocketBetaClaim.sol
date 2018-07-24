pragma solidity ^0.4.23;

import "./interface/ERC20.sol";
import './lib/SafeMath.sol';


/**
 * RocketBetaClaim contract
 * Allows participant accounts to withdraw a share of the contract's RPL balance
 * RPL deposits to the contract can be made by any account
 */
contract RocketBetaClaim {


    // Libs
    using SafeMath for uint;


    // Contract owner
    address public owner;

    // Claim settings
    uint256 public rplTotal;
    uint256 public claimStart;
    uint256 public claimEnd;
    uint256 public constant claimStartDelay = 2 weeks;
    uint256 public constant claimPeriod = 4 weeks;

    // Participants
    address[] public participants;
    mapping(address => uint256) private participantIndexes; // Offset by +1

    // The RPL token contract
    ERC20 tokenContract = ERC20(0);


    // Amount deposited into contract
    event Deposit(address indexed from, uint256 value, uint256 created);

    // Amount withdrawn from contract
    event Withdrawal(address indexed to, uint256 value, uint256 created);


    /**
     * Can only be called by the contract owner account
     */
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }


    /**
     * Claim period modifiers
     */
    modifier onlyBeforeClaimStart() {
        require(now < claimStart);
        _;
    }
    modifier onlyAfterClaimStart() {
        require(now >= claimStart);
        _;
    }
    modifier onlyAfterClaimEnd() {
        require(now >= claimEnd);
        _;
    }


    /**
     * Construct
     */
    constructor(address _tokenAddress, address[] participantList) public {

        // Assign contract owner to deployer
        owner = msg.sender;

        // Set claim period
        claimStart = now + claimStartDelay;
        claimEnd = claimStart + claimPeriod;

        // Build participant array
        for (uint pi = 0; pi < participantList.length; ++pi) {
            participantIndexes[participantList[pi]] = participants.push(participantList[pi]);
        }

        // Initialise the token contract
        tokenContract = ERC20(_tokenAddress);

    }


    /**
     * Claim RPL
     * Only callable by participant address
     */
    function claimRpl() public onlyAfterClaimStart {

        // Cancel if not sent from participant address
        require(participantIndexes[msg.sender] != 0);

        // Transfer RPL
        // :TODO: implement

    }


    /**
     * Get RPL claim amount
     */
    function getClaimAmount() public view returns (uint256 amount) {
        if (participants.length == 0) return 0;
        return rplTotal / participants.length;
    }


    /**
     * Set claim start date
     */
    function setClaimStart(uint256 _claimStart) public onlyOwner onlyBeforeClaimStart {
        claimStart = _claimStart;
        claimEnd = claimStart + claimPeriod;
    }


    /**
     * Set RPL total claimable
     */
    function setRplTotal(uint256 _rplTotal) public onlyOwner onlyBeforeClaimStart {

        // Check total is covered by contract balance
        uint256 rplBalance = tokenContract.balanceOf(address(this));
        require(_rplTotal <= rplBalance);

        // Set total
        rplTotal = _rplTotal;

    }


    /**
     * Add/remove participants
     */
    function addParticipant(address _participant) public onlyOwner onlyBeforeClaimStart {

        // Cancel if already added
        require(participantIndexes[_participant] == 0);

        // Add and set index
        participantIndexes[_participant] = participants.push(_participant);

    }
    function removeParticipant(address _participant) public onlyOwner onlyBeforeClaimStart {

        // Cancel if not added
        require(participantIndexes[_participant] != 0);

        // Get current and last participant indexes
        uint256 participantIndex = participantIndexes[_participant] - 1;
        uint256 lastIndex = participants.length - 1;

        // Get last participant
        address last = participants[lastIndex];

        // Move last participant to current index
        if (participantIndex != lastIndex) {
            participants[participantIndex] = last;
            participantIndexes[last] = participantIndex + 1;
        }

        // Unset current participant index and truncate array
        participantIndexes[_participant] = 0;
        participants.length -= 1;

    }


    /**
     * Close claim contract
     */
    function close() public onlyOwner onlyAfterClaimEnd {

        // Transfer RPL to owner
        // :TODO: implement

    }


}
