// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.7.6;

import '@uniswap/v3-core/contracts/libraries/SafeCast.sol';

/// @title Mock for inspecting cast functions
/// @notice Thin wrapper for library methods where all methods are public and pure
contract CastMock {
    /// @notice Cast safely to a uint160
    /// @param x Original value
    /// @return Cast value
    function toUint160(uint256 x) public pure returns (uint160) {
        return SafeCast.toUint160(x);
    }

    /// @notice Cast safely to a int128
    /// @param x Original value
    /// @return Cast value
    function toInt128(int256 x) public pure returns (int128) {
        return SafeCast.toInt128(x);
    }

    /// @notice Cast safely to a int160
    /// @param x Original value
    /// @return Cast value
    function toInt256(uint256 x) public pure returns (int256) {
        return SafeCast.toInt256(x);
    }
}
