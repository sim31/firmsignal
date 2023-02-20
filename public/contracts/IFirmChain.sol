// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./FirmChainAbi.sol";

interface IFirmChain {

    // TODO: Document

    function confirm(BlockHeader calldata header) external returns(bool);

    // Confirmation from an external account
    // header has to contain a sign
    function extConfirm(
        BlockHeader calldata header,
        address signatory,
        uint8 sigIndex
    ) 
        external 
        returns(bool);

    /// Fails on failure to finalize
    function finalize(BlockHeader calldata header) external;
    function finalizeAndExecute(Block calldata bl) external;
    function execute(Block calldata bl) external;
}