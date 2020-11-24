pragma solidity 0.7.5;

// SPDX-License-Identifier: GPL-3.0-only


/**
 * @title ERC20 interface
 *
 * Contract source taken from Open Zeppelin: https://github.com/OpenZeppelin/zeppelin-solidity/blob/v1.4.0/contracts/token/ERC20.sol
 */
interface ERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function approve(address spender, uint256 value) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}
