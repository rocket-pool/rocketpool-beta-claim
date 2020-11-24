pragma solidity 0.7.5;

// SPDX-License-Identifier: GPL-3.0-only

import "./interface/ERC20.sol";


/**
 * RocketBatchTransfer contract
 * Used to send tokens to multiple addresses within a single tx
 */
contract RocketBatchTransfer {


    /**
     * Construct
     */
    constructor() {}


    /**
     * Transfer the same amount of a token to multiple addresses
     */
    function transfer(address tokenAddress, address fromAddress, address[] calldata toAddresses, uint256 amount) public {
        ERC20 tokenContract = ERC20(tokenAddress);
        for (uint256 ai = 0; ai < toAddresses.length; ++ai) {
            require(tokenContract.transferFrom(fromAddress, toAddresses[ai], amount));
        }
    }


    /**
     * Transfer different amounts of a token to multiple addresses
     */
    function transfer(address tokenAddress, address fromAddress, address[] calldata toAddresses, uint256[] calldata amounts) public {
        ERC20 tokenContract = ERC20(tokenAddress);
        require(toAddresses.length == amounts.length);
        for (uint256 ai = 0; ai < toAddresses.length; ++ai) {
            require(tokenContract.transferFrom(fromAddress, toAddresses[ai], amounts[ai]));
        }
    }


}

