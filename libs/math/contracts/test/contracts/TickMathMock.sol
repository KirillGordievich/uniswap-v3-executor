// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.7.6;

import '@uniswap/v3-core/contracts/libraries/TickMath.sol';

/// @title Mock for inspecting tick math functions
/// @notice Thin wrapper for library methods where all methods are public
contract TickMathMock {
    /// @notice Get sqrt price corresponding to a tick value
    /// @param tick Tick value
    /// @return Corresponding sqrt price
    function getSqrtPriceAtTick(int24 tick) public pure returns (uint160) {
        return TickMath.getSqrtRatioAtTick(tick);
    }

    /// @notice Get tick value corresponding to a sqrt price
    /// @param sqrtPrice Sqrt price
    /// @return Corresponding tick value

    function getTickAtSqrtPrice(uint160 sqrtPrice) public pure returns (int24) {
        return TickMath.getTickAtSqrtRatio(sqrtPrice);
    }
}
