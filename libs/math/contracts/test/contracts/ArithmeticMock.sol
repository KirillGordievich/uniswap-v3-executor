// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.7.6;

import '@uniswap/v3-core/contracts/libraries/FullMath.sol';
import '@uniswap/v3-core/contracts/libraries/LowGasSafeMath.sol';
import '@uniswap/v3-core/contracts/libraries/UnsafeMath.sol';

/// @title Mock for inspecting arithmetic functions
/// @notice Thin wrapper for library methods where all methods are public and pure
contract ArithmeticMock {
    /// @notice Safe addition
    /// @param x First addend
    /// @param y Second addend
    /// @return Sum
    function safeAdd(uint256 x, uint256 y) public pure returns (uint256) {
        return LowGasSafeMath.add(x, y);
    }

    /// @notice Safe subtraction
    /// @param x Minuend
    /// @param y Subtrahend
    /// @return Difference
    function safeSub(uint256 x, uint256 y) public pure returns (uint256) {
        return LowGasSafeMath.sub(x, y);
    }

    /// @notice Safe multiplication
    /// @param x Multiplicand
    /// @param y Multiplier
    /// @return Product
    function safeMul(uint256 x, uint256 y) public pure returns (uint256) {
        return LowGasSafeMath.mul(x, y);
    }

    /// @notice Safe division of a product (x * y / z), with the result rounded down
    /// @param x Multiplicand
    /// @param y Multiplier
    /// @param z Divisor
    /// @return Quotient
    function safeMulDivFloor(
        uint256 x,
        uint256 y,
        uint256 z
    ) public pure returns (uint256) {
        return FullMath.mulDiv(x, y, z);
    }

    /// @notice Safe division of a product (x * y / z), with the result rounded up
    /// @param x Multiplicand
    /// @param y Multiplier
    /// @param z Divisor
    /// @return Quotient
    function safeMulDivCeil(
        uint256 x,
        uint256 y,
        uint256 z
    ) public pure returns (uint256) {
        return FullMath.mulDivRoundingUp(x, y, z);
    }

    /// @notice Unsafe division, with the result rounded up
    /// @param x Dividend
    /// @param y Divisor
    /// @return Quotient
    function unsafeDivCeil(uint256 x, uint256 y) public pure returns (uint256) {
        return UnsafeMath.divRoundingUp(x, y);
    }
}
