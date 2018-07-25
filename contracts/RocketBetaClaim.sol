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


    // Participant
    struct Participant {
        address account;
        bool claimed;
    }


    // Contract owner
    address public owner;

    // Claim settings
    uint256 public rplTotal;
    uint256 public claimStart;
    uint256 public claimEnd;
    uint256 public constant claimStartDelay = 2 weeks;
    uint256 public constant claimPeriod = 4 weeks;

    // Closed status
    bool public closed = false;

    // Participants
    Participant[] public participants;
    mapping(address => uint256) private participantIndexes; // Offset by +1

    // The RPL token contract
    ERC20 tokenContract = ERC20(0);


    // Amount withdrawn from contract
    event Withdrawal(address indexed to, uint256 value, uint256 created);

    // Beta claim closed
    event Close(address indexed balanceSentTo, uint256 balance, uint256 created);


    /**
     * Can only be called by the contract owner account
     */
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }


    /**
     * Can only be called by a participant
     */
    modifier onlyParticipant() {
        require(participantIndexes[msg.sender] != 0);
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
    constructor(address _tokenAddress, address[] participantAddresses) public {

        // Assign contract owner to deployer
        owner = msg.sender;

        // Set claim period
        claimStart = now + claimStartDelay;
        claimEnd = claimStart + claimPeriod;

        // Build participant array
        for (uint pi = 0; pi < participantAddresses.length; ++pi) {
            participantIndexes[participantAddresses[pi]] = participants.push(Participant({
                account: participantAddresses[pi],
                claimed: false
            }));
        }

        // Initialise the token contract
        tokenContract = ERC20(_tokenAddress);

    }


    /**
     * Check if a participant exists
     */
    function getParticipantExists(address _participant) public view returns (bool exists) {
        return (participantIndexes[_participant] != 0);
    }


    /**
     * Check if a participant has already claimed their reward
     */
    function getParticipantClaimed(address _participant) public view returns (bool claimed) {
        if (participantIndexes[_participant] == 0) return false;
        return (participants[participantIndexes[_participant] - 1].claimed == true);
    }


    /**
     * Get participant count
     */
    function getParticipantCount() public view returns (uint256 count) {
        return participants.length;
    }


    /**
     * Get participant address at index
     */
    function getParticipantAddress(uint256 _index) public view returns (address account) {
        return participants[_index].account;
    }


    /**
     * Get RPL claim amount per participant
     */
    function getClaimAmount() public view returns (uint256 amount) {
        if (participants.length == 0) return 0;
        return rplTotal / participants.length;
    }


    /**
     * Claim RPL
     * Only callable by participant address
     */
    function claimRpl() public onlyParticipant onlyAfterClaimStart {

        // Check claim period has not closed
        require(!closed);

        // Check participant has not already claimed
        require(participants[participantIndexes[msg.sender] - 1].claimed == false);

        // Transfer RPL claim amount
        uint256 claimAmount = getClaimAmount();
        require(tokenContract.transfer(msg.sender, claimAmount) == true);

        // Mark participant as claimed
        participants[participantIndexes[msg.sender] - 1].claimed = true;

        // Emit withdrawal event
        emit Withdrawal(msg.sender, claimAmount, now);

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

        // Check address is valid
        require(_participant != 0x0);

        // Cancel if already added
        require(participantIndexes[_participant] == 0);

        // Add and set index
        participantIndexes[_participant] = participants.push(Participant({
            account: _participant,
            claimed: false
        }));

    }
    function removeParticipant(address _participant) public onlyOwner onlyBeforeClaimStart {

        // Cancel if not added
        require(participantIndexes[_participant] != 0);

        // Get current and last participant indexes
        uint256 participantIndex = participantIndexes[_participant] - 1;
        uint256 lastIndex = participants.length - 1;

        // Get last participant
        Participant memory last = participants[lastIndex];

        // Move last participant to current index
        if (participantIndex != lastIndex) {
            participants[participantIndex] = last;
            participantIndexes[last.account] = participantIndex + 1;
        }

        // Unset current participant index and truncate array
        participantIndexes[_participant] = 0;
        participants.length -= 1;

    }


    /**
     * Close claim contract
     */
    function close() public onlyOwner onlyAfterClaimEnd {

        // Check not already closed
        require(!closed);

        // Transfer remaining RPL balance to owner
        uint256 rplBalance = tokenContract.balanceOf(address(this));
        if (rplBalance > 0) {
            require(tokenContract.transfer(owner, rplBalance) == true);
        }

        // Set closed flag
        closed = true;

        // Emit close event
        emit Close(owner, rplBalance, now);

    }


}
