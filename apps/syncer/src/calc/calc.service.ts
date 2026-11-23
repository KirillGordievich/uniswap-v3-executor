import { compareTokens, InsufficientLiquidityError, Token } from '@libs/core';
import { toInt256 } from '@libs/math';
import { addDelta } from '@libs/math';
import { computeSwapStepBuy, computeSwapStepSell } from '@libs/math';
import { getSqrtPriceAtTick, getTickAtSqrtPrice } from '@libs/math';
import { Decimal } from 'decimal.js';

import { TickBookService } from '../pool/tick-book.service';

export class CalcService {
  private readonly tokenSell: Token;
  private readonly tokenBuy: Token;
  private readonly zeroForOne: boolean;
  private readonly fee: bigint;
  private readonly tickBook: TickBookService;

  constructor(tokenSell: Token, tokenBuy: Token, fee: bigint, tickBook: TickBookService) {
    this.tokenSell = tokenSell;
    this.tokenBuy = tokenBuy;
    this.zeroForOne = compareTokens(tokenSell, tokenBuy) < 0;
    this.fee = fee;
    this.tickBook = tickBook;
  }

  calcBuy(quantitySell: Decimal): Decimal {
    const quantitySellInteger = quantitySell
      .mul('1e' + this.tokenSell.decimals)
      .floor()
      .toHex();
    let quantitySellRemaining = BigInt(quantitySellInteger);

    let quantityBuy = 0n;
    let { sqrtPrice, tick, liquidity } = this.tickBook;

    while (quantitySellRemaining) {
      const { tick: tickStep, initialized: initializedStep } = this.tickBook.getNextTick(tick, this.zeroForOne);
      const sqrtPriceStepTarget = getSqrtPriceAtTick(tickStep);

      const {
        sqrtPrice: sqrtPriceStep,
        quantitySell: quantitySellStep,
        quantityBuy: quantityBuyStep,
        quantityFee: quantityFeeStep,
      } = computeSwapStepBuy(sqrtPrice, sqrtPriceStepTarget, liquidity, quantitySellRemaining, this.fee);

      if (!quantitySellStep) {
        throw new InsufficientLiquidityError('not enough synced liquidity to estimate purchased quantity');
      }

      quantitySellRemaining -= toInt256(quantitySellStep + quantityFeeStep);
      quantityBuy += quantityBuyStep;

      if (sqrtPriceStep === sqrtPriceStepTarget) {
        if (initializedStep) {
          let liquidityStep = this.tickBook.getLiquidityNet(tickStep)!;

          if (this.zeroForOne) {
            liquidityStep = -liquidityStep;
          }

          liquidity = addDelta(liquidity, liquidityStep);
        }

        tick = this.zeroForOne ? tickStep - 1 : tickStep;
      } else if (sqrtPrice !== sqrtPriceStep) {
        tick = getTickAtSqrtPrice(sqrtPriceStep);
      }

      sqrtPrice = sqrtPriceStep;
    }

    const quantityBuyString = quantityBuy.toString();

    return new Decimal(quantityBuyString).mul('1e-' + this.tokenBuy.decimals);
  }

  calcSell(quantityBuy: Decimal): Decimal {
    const quantityBuyInteger = quantityBuy
      .mul('1e' + this.tokenBuy.decimals)
      .ceil()
      .toHex();
    let quantityBuyRemaining = BigInt(quantityBuyInteger);

    let quantitySell = 0n;
    let { sqrtPrice, tick, liquidity } = this.tickBook;

    while (quantityBuyRemaining) {
      const { tick: tickStep, initialized: initializedStep } = this.tickBook.getNextTick(tick, this.zeroForOne);
      const sqrtPriceStepTarget = getSqrtPriceAtTick(tickStep);

      const {
        sqrtPrice: sqrtPriceStep,
        quantitySell: quantitySellStep,
        quantityBuy: quantityBuyStep,
        quantityFee: quantityFeeStep,
      } = computeSwapStepSell(sqrtPrice, sqrtPriceStepTarget, liquidity, quantityBuyRemaining, this.fee);

      if (!quantityBuyStep) {
        throw new InsufficientLiquidityError('not enough synced liquidity to estimate sold quantity');
      }

      quantityBuyRemaining -= toInt256(quantityBuyStep);
      quantitySell += quantitySellStep + quantityFeeStep;

      if (sqrtPriceStep === sqrtPriceStepTarget) {
        if (initializedStep) {
          let liquidityStep = this.tickBook.getLiquidityNet(tickStep)!;

          if (this.zeroForOne) {
            liquidityStep = -liquidityStep;
          }

          liquidity = addDelta(liquidity, liquidityStep);
        }

        tick = this.zeroForOne ? tickStep - 1 : tickStep;
      } else if (sqrtPrice !== sqrtPriceStep) {
        tick = getTickAtSqrtPrice(sqrtPriceStep);
      }

      sqrtPrice = sqrtPriceStep;
    }

    const quantitySellString = quantitySell.toString();

    return new Decimal(quantitySellString).mul('1e-' + this.tokenSell.decimals);
  }
}
