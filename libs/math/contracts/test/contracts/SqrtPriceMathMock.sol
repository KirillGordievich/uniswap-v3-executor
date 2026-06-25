// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.7.6;

import '@uniswap/v3-core/contracts/libraries/SqrtPriceMath.sol';

/// @title Mock for inspecting sqrt price math functions
/// @notice Thin wrapper for library methods where all methods are public and pure
contract SqrtPriceMathMock {
    /// @notice Get delta in amount of token 0 required to transition from one sqrt price
    // to another, given the current liquidity level
    /// @param sqrtPriceA First sqrt price
    /// @param sqrtPriceB Second sqrt price
    /// @param liquidity Current liquidity level
    /// @param ceil True if the result should be rounded up and false if it should be rounded down
    function getAmount0Delta(
        uint160 sqrtPriceA,
        uint160 sqrtPriceB,
        uint128 liquidity,
        bool ceil
    ) public pure returns (uint256) {
        return SqrtPriceMath.getAmount0Delta(sqrtPriceA, sqrtPriceB, liquidity, ceil);
    }

    /// @notice Get delta in amount of token 1 required to transition from one sqrt price
    // to another, given the current liquidity level
    /// @param sqrtPriceA First sqrt price
    /// @param sqrtPriceB Second sqrt price
    /// @param liquidity Current liquidity level
    /// @param ceil True if the result should be rounded up and false if it should be rounded down
    function getAmount1Delta(
        uint160 sqrtPriceA,
        uint160 sqrtPriceB,
        uint128 liquidity,
        bool ceil
    ) public pure returns (uint256) {
        return SqrtPriceMath.getAmount1Delta(sqrtPriceA, sqrtPriceB, liquidity, ceil);
    }

    /// @notice Get the sqrt price resulting from a swap of the specified amount,
    // given the current sqrt price, liquidity, and the direction of swap
    /// @param sqrtPrice Current sqrt price
    /// @param liquidity Current liquidity
    /// @param amount Sold amount
    /// @param zeroForOne True if token 0 is swapped for token 1 and false otherwise
    function getNextSqrtPriceFromInput(
        uint160 sqrtPrice,
        uint128 liquidity,
        uint256 amount,
        bool zeroForOne
    ) public pure returns (uint160) {
        return SqrtPriceMath.getNextSqrtPriceFromInput(sqrtPrice, liquidity, amount, zeroForOne);
    }

    /// @notice Get the sqrt price resulting from a swap for the specified amount,
    // given the current sqrt price, liquidity, and the direction of swap
    /// @param sqrtPrice Current sqrt price
    /// @param liquidity Current liquidity
    /// @param amount Sold amount
    /// @param zeroForOne True if token 0 is swapped for token 1 and false otherwise
    function getNextSqrtPriceFromOutput(
        uint160 sqrtPrice,
        uint128 liquidity,
        uint256 amount,
        bool zeroForOne
    ) public pure returns (uint160) {
        return SqrtPriceMath.getNextSqrtPriceFromOutput(sqrtPrice, liquidity, amount, zeroForOne);
    }
}
