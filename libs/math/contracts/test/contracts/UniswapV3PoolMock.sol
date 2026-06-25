// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.7.6;

import '@uniswap/v3-core/contracts/libraries/LiquidityMath.sol';
import '@uniswap/v3-core/contracts/libraries/LowGasSafeMath.sol';
import '@uniswap/v3-core/contracts/libraries/SafeCast.sol';
import '@uniswap/v3-core/contracts/libraries/SwapMath.sol';
import '@uniswap/v3-core/contracts/libraries/TickBitmap.sol';
import '@uniswap/v3-core/contracts/libraries/TickMath.sol';

/// @title Mock for inspecting Uniswap v3 pool estimates
/// @notice Alteration of original Uniswap v3 code
contract UniswapV3PoolMock {
    using LowGasSafeMath for uint256;
    using LowGasSafeMath for int256;
    using SafeCast for uint256;
    using SafeCast for int256;
    using TickBitmap for mapping(int16 => uint256);

    struct Cache {
        // current state trackers
        int24 tickState;
        uint160 sqrtPriceState;
        uint128 liquidityState;
        // step calculations
        int24 tickNext;
        bool tickNextInitialized;
        uint160 sqrtPriceNext;
        uint256 amountIn;
        uint256 amountOut;
        uint256 feeAmount;
    }

    uint24 public immutable fee;
    int24 public immutable tickSpacing;

    uint128 public liquidity;
    uint160 public sqrtPrice;
    int24 public tick;
    mapping(int24 => int128) public ticks;
    mapping(int16 => uint256) public tickBitmap;

    /// @param _fee Pool fee in pips
    /// @param _tickSpacing Tick spacing
    constructor(uint24 _fee, int24 _tickSpacing) {
        fee = _fee;
        tickSpacing = _tickSpacing;
    }

    /// @notice Initialize pool with current position
    /// @param _tick Zero slot tick
    /// @param _sqrtPrice Zero slot sqrt price
    /// @param _liquidity Stateent liquidity
    function init(
        int24 _tick,
        uint160 _sqrtPrice,
        uint128 _liquidity
    ) public {
        tick = _tick;
        sqrtPrice = _sqrtPrice;
        liquidity = _liquidity;
    }

    /// @notice Sync tick liquidity
    /// @param _tick Tick at which liquidity is synced
    /// @param _liquidityNet Net liquidity change
    function sync(int24 _tick, int128 _liquidityNet) public {
        ticks[_tick] = _liquidityNet;
        tickBitmap.flipTick(_tick, tickSpacing);
    }

    /// @notice Calculate the purchased quantity
    /// @param zeroForOne True if token 0 is swapped for token 1 and false otherwise
    /// @param quantitySell Quantity of sold token in decimals
    /// @return Quantity of purchased token in decimals
    function calcBuy(bool zeroForOne, int256 quantitySell) public view returns (int256) {
        Cache memory cache = Cache({
            tickState: tick,
            sqrtPriceState: sqrtPrice,
            liquidityState: liquidity,
            tickNext: 0,
            tickNextInitialized: false,
            sqrtPriceNext: 0,
            amountIn: 0,
            amountOut: 0,
            feeAmount: 0
        });

        // (un)traded quantities
        int256 quantitySellRemaining = quantitySell;
        int256 quantityBuy = 0;

        while (quantitySellRemaining != 0) {
            (cache.tickNext, cache.tickNextInitialized) = tickBitmap.nextInitializedTickWithinOneWord(
                cache.tickState,
                tickSpacing,
                zeroForOne
            );

            if (cache.tickNext < TickMath.MIN_TICK) {
                cache.tickNext = TickMath.MIN_TICK;
            } else if (cache.tickNext > TickMath.MAX_TICK) {
                cache.tickNext = TickMath.MAX_TICK;
            }

            cache.sqrtPriceNext = TickMath.getSqrtRatioAtTick(cache.tickNext);

            (cache.sqrtPriceState, cache.amountIn, cache.amountOut, cache.feeAmount) = SwapMath.computeSwapStep(
                cache.sqrtPriceState,
                cache.sqrtPriceNext,
                cache.liquidityState,
                quantitySellRemaining,
                fee
            );

            quantitySellRemaining -= (cache.amountIn + cache.feeAmount).toInt256();
            quantityBuy = quantityBuy.sub(cache.amountOut.toInt256());

            if (cache.sqrtPriceState == cache.sqrtPriceNext) {
                if (cache.tickNextInitialized) {
                    int128 liquidityNet = ticks[cache.tickNext];
                    if (zeroForOne) liquidityNet = -liquidityNet;

                    cache.liquidityState = LiquidityMath.addDelta(cache.liquidityState, liquidityNet);
                }

                cache.tickState = zeroForOne ? cache.tickNext - 1 : cache.tickNext;
            } else {
                cache.tickState = TickMath.getTickAtSqrtRatio(cache.sqrtPriceState);
            }
        }

        return -quantityBuy;
    }

    /// @notice Calculate the sold quantity
    /// @param zeroForOne True if token 0 is swapped for token 1 and false otherwise
    /// @param quantityBuy Quantity of purchased token in decimals
    /// @return Quantity of sold token in decimals
    function calcSell(bool zeroForOne, int256 quantityBuy) public view returns (int256) {
        Cache memory cache = Cache({
            tickState: tick,
            sqrtPriceState: sqrtPrice,
            liquidityState: liquidity,
            tickNext: 0,
            tickNextInitialized: false,
            sqrtPriceNext: 0,
            amountIn: 0,
            amountOut: 0,
            feeAmount: 0
        });

        // (un)traded quantities
        int256 quantitySell = 0;
        int256 quantityBuyRemaining = -quantityBuy;

        while (quantityBuyRemaining != 0) {
            (cache.tickNext, cache.tickNextInitialized) = tickBitmap.nextInitializedTickWithinOneWord(
                cache.tickState,
                tickSpacing,
                zeroForOne
            );

            if (cache.tickNext < TickMath.MIN_TICK) {
                cache.tickNext = TickMath.MIN_TICK;
            } else if (cache.tickNext > TickMath.MAX_TICK) {
                cache.tickNext = TickMath.MAX_TICK;
            }

            cache.sqrtPriceNext = TickMath.getSqrtRatioAtTick(cache.tickNext);

            (cache.sqrtPriceState, cache.amountIn, cache.amountOut, cache.feeAmount) = SwapMath.computeSwapStep(
                cache.sqrtPriceState,
                cache.sqrtPriceNext,
                cache.liquidityState,
                quantityBuyRemaining,
                fee
            );

            quantitySell = quantitySell.add((cache.amountIn + cache.feeAmount).toInt256());
            quantityBuyRemaining += cache.amountOut.toInt256();

            if (cache.sqrtPriceState == cache.sqrtPriceNext) {
                if (cache.tickNextInitialized) {
                    int128 liquidityNet = ticks[cache.tickNext];
                    if (zeroForOne) liquidityNet = -liquidityNet;

                    cache.liquidityState = LiquidityMath.addDelta(cache.liquidityState, liquidityNet);
                }

                cache.tickState = zeroForOne ? cache.tickNext - 1 : cache.tickNext;
            } else {
                cache.tickState = TickMath.getTickAtSqrtRatio(cache.sqrtPriceState);
            }
        }

        return quantitySell;
    }
}
