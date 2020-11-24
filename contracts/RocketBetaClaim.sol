pragma solidity 0.7.5;

// SPDX-License-Identifier: GPL-3.0-only

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
        uint256 index;
        bool exists;
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
    mapping(address => Participant) private participants;
    address[] private participantAddresses;

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
        require(participants[msg.sender].exists == true);
        _;
    }


    /**
     * Claim period modifiers
     */
    modifier onlyBeforeClaimStart() {
        require(block.timestamp < claimStart);
        _;
    }
    modifier onlyAfterClaimStart() {
        require(block.timestamp >= claimStart);
        _;
    }
    modifier onlyAfterClaimEnd() {
        require(block.timestamp >= claimEnd);
        _;
    }


    /**
     * Construct
     */
    constructor(address _tokenAddress) {

        // Assign contract owner to deployer
        owner = msg.sender;

        // Set claim period
        claimStart = block.timestamp + claimStartDelay;
        claimEnd = claimStart + claimPeriod;

        // Initialise the token contract
        tokenContract = ERC20(_tokenAddress);

    }


    /**
     * Check if a participant exists
     */
    function getParticipantExists(address _participant) public view returns (bool exists) {
        return (participants[_participant].exists == true);
    }


    /**
     * Check if a participant has already claimed their reward
     */
    function getParticipantClaimed(address _participant) public view returns (bool claimed) {
        return (participants[_participant].claimed == true);
    }


    /**
     * Get participant count
     */
    function getParticipantCount() public view returns (uint256 count) {
        return participantAddresses.length;
    }


    /**
     * Get participant address at index
     */
    function getParticipantAddress(uint256 _index) public view returns (address account) {
        return participantAddresses[_index];
    }


    /**
     * Get RPL claim amount per participant
     */
    function getClaimAmount() public view returns (uint256 amount) {
        if (participantAddresses.length == 0) return 0;
        return rplTotal / participantAddresses.length;
    }


    /**
     * Claim RPL
     * Only callable by participant address
     */
    function claimRpl() public onlyParticipant onlyAfterClaimStart {

        // Check claim period has not closed
        require(!closed);

        // Check participant has not already claimed
        require(participants[msg.sender].claimed == false);

        // Transfer RPL claim amount
        uint256 claimAmount = getClaimAmount();
        require(tokenContract.transfer(msg.sender, claimAmount) == true);

        // Mark participant as claimed
        participants[msg.sender].claimed = true;

        // Emit withdrawal event
        emit Withdrawal(msg.sender, claimAmount, block.timestamp);

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
     * Add multiple participants
     * Approx. 84 participants can be added per tx within the 8 million block gas limit
     */    
    function addParticipants(address[] memory addressList) public onlyOwner onlyBeforeClaimStart {

        // Add participants
        for (uint pi = 0; pi < addressList.length; ++pi) {

            // Check address is valid
            require(addressList[pi] != address(0x0));

            // Check not already added
            require(participants[addressList[pi]].exists == false);

            // Add participant and address
            participants[addressList[pi]] = Participant({
                account: addressList[pi],
                claimed: false,
                index: participantAddresses.length,
                exists: true
            });
            participantAddresses.push(addressList[pi]);

        }

    }


    /**
     * Add/remove participants
     */
    function addParticipant(address _participant) public onlyOwner onlyBeforeClaimStart {

        // Check address is valid
        require(_participant != address(0x0));

        // Check not already added
        require(participants[_participant].exists == false);

        // Add participant and address
        participants[_participant] = Participant({
            account: _participant,
            claimed: false,
            index: participantAddresses.length,
            exists: true
        });
        participantAddresses.push(_participant);

    }
    function removeParticipant(address _participant) public onlyOwner onlyBeforeClaimStart {

        // Check already added
        require(participants[_participant].exists == true);

        // Get current and last participant address indexes
        uint256 currentIndex = participants[_participant].index;
        uint256 lastIndex = participantAddresses.length - 1;

        // Get last participant address
        address lastAddress = participantAddresses[lastIndex];

        // Move last participant address to current index
        if (currentIndex != lastIndex) {
            participantAddresses[currentIndex] = participants[lastAddress].account;
            participants[lastAddress].index = currentIndex;
        }

        // Delete current participant and truncate address array
        participants[_participant].account = address(0x0);
        participants[_participant].claimed = false;
        participants[_participant].index = 0;
        participants[_participant].exists = false;
        participantAddresses.pop();

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
        emit Close(owner, rplBalance, block.timestamp);

    }


}
