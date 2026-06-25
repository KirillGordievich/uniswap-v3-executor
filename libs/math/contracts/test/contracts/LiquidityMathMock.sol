// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.7.6;

import '@uniswap/v3-core/contracts/libraries/LiquidityMath.sol';

/// @title Mock for inspecting liquidity math functions
/// @notice Thin wrapper for library methods where all methods are public and pure
contract LiquidityMathMock {
    /// @notice Add a liquidity delta to liquidity
    /// @param x Original liquidity
    /// @param y Liquidity delta
    /// @return Liquidity sum
    function addDelta(uint128 x, int128 y) public pure returns (uint128) {
        return LiquidityMath.addDelta(x, y);
    }
}
