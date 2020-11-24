pragma solidity 0.7.5;

// SPDX-License-Identifier: GPL-3.0-only

import "./interface/ERC20.sol";


/**
 * RocketBatchTransfer contract
 * Used to send tokens to multiple addresses within a single tx
 */
contract RocketBatchTransfer {


    // The RPL token contract
    ERC20 tokenContract = ERC20(0);


    /**
     * Construct
     */
    constructor(address _tokenAddress) {
        tokenContract = ERC20(_tokenAddress);
    }


    /**
     * Transfer a single amount of tokens to multiple addresses
     */
    function transfer(address fromAddress, address[] calldata toAddresses, uint256 amount) public {
        for (uint256 ai = 0; ai < toAddresses.length; ++ai) {
            require(tokenContract.transferFrom(fromAddress, toAddresses[ai], amount));
        }
    }


    /**
     * Transfer different amounts of tokens to multiple addresses
     */
    function transfer(address fromAddress, address[] calldata toAddresses, uint256[] calldata amounts) public {
        require(toAddresses.length == amounts.length);
        for (uint256 ai = 0; ai < toAddresses.length; ++ai) {
            require(tokenContract.transferFrom(fromAddress, toAddresses[ai], amounts[ai]));
        }
    }


}

