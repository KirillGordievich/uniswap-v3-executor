// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.7.6;

import '@uniswap/v3-core/contracts/libraries/SwapMath.sol';

/// @title Mock for inspecting swap math functions
/// @notice Thin wrapper for library methods where all methods are public and pure
contract SwapMathMock {
    /// @notice Compute purchase parameters of a swap step, given the current state of the swap
    /// @param sqrtPriceCurrent Current sqrt price
    /// @param sqrtPriceTarget Target sqrt price for the swap step
    /// @param liquidity Current liquidity level
    /// @param quantitySellRemaining Remaining quantity available for sale in the swap step
    /// @param fee Pool fee in pips
    /// @return sqrtPrice Sqrt price after the swap step
    /// @return quantitySell Quantity sold in the swap step
    /// @return quantityBuy Quantity purchased in the swap step
    /// @return quantityFee Quantity spent on pool fees in the swap step
    function computeSwapStepBuy(
        uint160 sqrtPriceCurrent,
        uint160 sqrtPriceTarget,
        uint128 liquidity,
        int256 quantitySellRemaining,
        uint24 fee
    )
        public
        pure
        returns (
            uint160 sqrtPrice,
            uint256 quantitySell,
            uint256 quantityBuy,
            uint256 quantityFee
        )
    {
        (sqrtPrice, quantitySell, quantityBuy, quantityFee) = SwapMath.computeSwapStep(
            sqrtPriceCurrent,
            sqrtPriceTarget,
            liquidity,
            quantitySellRemaining,
            fee
        );
    }

    /// @notice Compute sale parameters of a swap step, given the current state of the swap
    /// @param sqrtPriceCurrent Current sqrt price
    /// @param sqrtPriceTarget Target sqrt price for the swap step
    /// @param liquidity Current liquidity level
    /// @param quantityBuyRemaining Remaining quantity that has to be purchased
    /// @param fee Pool fee in pips
    /// @return sqrtPrice Sqrt price after the swap step
    /// @return quantitySell Quantity sold in the swap step
    /// @return quantityBuy Quantity purchased in the swap step
    /// @return quantityFee Quantity spent on pool fees in the swap step
    function computeSwapStepSell(
        uint160 sqrtPriceCurrent,
        uint160 sqrtPriceTarget,
        uint128 liquidity,
        int256 quantityBuyRemaining,
        uint24 fee
    )
        public
        pure
        returns (
            uint160 sqrtPrice,
            uint256 quantitySell,
            uint256 quantityBuy,
            uint256 quantityFee
        )
    {
        (sqrtPrice, quantitySell, quantityBuy, quantityFee) = SwapMath.computeSwapStep(
            sqrtPriceCurrent,
            sqrtPriceTarget,
            liquidity,
            -quantityBuyRemaining,
            fee
        );
    }
}
