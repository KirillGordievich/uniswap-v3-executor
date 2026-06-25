import { safeMulDivCeil, safeMulDivFloor } from './arithmetic';
import {
  getAmount0Delta,
  getAmount1Delta,
  getNextSqrtPriceFromInput,
  getNextSqrtPriceFromOutput,
} from './sqrt-price';

export function computeSwapStepBuy(
  sqrtPriceCurrent: bigint,
  sqrtPriceTarget: bigint,
  liquidity: bigint,
  quantitySellRemaining: bigint,
  fee: bigint,
): { sqrtPrice: bigint; quantitySell: bigint; quantityBuy: bigint; quantityFee: bigint } {
  const zeroForOne = sqrtPriceCurrent >= sqrtPriceTarget;

  let sqrtPrice: bigint;
  let quantitySell: bigint;
  let quantityBuy: bigint;

  const quantitySellRemainingWithFee = safeMulDivFloor(quantitySellRemaining, 1_000_000n - fee, 1_000_000n);

  quantitySell = zeroForOne
    ? getAmount0Delta(sqrtPriceTarget, sqrtPriceCurrent, liquidity, true)
    : getAmount1Delta(sqrtPriceCurrent, sqrtPriceTarget, liquidity, true);

  let max: boolean;

  if (quantitySellRemainingWithFee >= quantitySell) {
    sqrtPrice = sqrtPriceTarget;
    max = true;
  } else {
    sqrtPrice = getNextSqrtPriceFromInput(sqrtPriceCurrent, liquidity, quantitySellRemainingWithFee, zeroForOne);
    max = false;
  }

  if (zeroForOne) {
    quantitySell = max ? quantitySell : getAmount0Delta(sqrtPrice, sqrtPriceCurrent, liquidity, true);

    quantityBuy = getAmount1Delta(sqrtPrice, sqrtPriceCurrent, liquidity, false);
  } else {
    quantitySell = max ? quantitySell : getAmount1Delta(sqrtPriceCurrent, sqrtPrice, liquidity, true);

    quantityBuy = getAmount0Delta(sqrtPriceCurrent, sqrtPrice, liquidity, false);
  }

  const quantityFee = max ? safeMulDivCeil(quantitySell, fee, 1_000_000n - fee) : quantitySellRemaining - quantitySell;

  return { sqrtPrice, quantitySell, quantityBuy, quantityFee };
}

export function computeSwapStepSell(
  sqrtPriceCurrent: bigint,
  sqrtPriceTarget: bigint,
  liquidity: bigint,
  quantityBuyRemaining: bigint,
  fee: bigint,
): { sqrtPrice: bigint; quantitySell: bigint; quantityBuy: bigint; quantityFee: bigint } {
  const zeroForOne = sqrtPriceCurrent >= sqrtPriceTarget;

  let sqrtPrice: bigint;
  let quantitySell: bigint;
  let quantityBuy: bigint;

  quantityBuy = zeroForOne
    ? getAmount1Delta(sqrtPriceTarget, sqrtPriceCurrent, liquidity, false)
    : getAmount0Delta(sqrtPriceCurrent, sqrtPriceTarget, liquidity, false);

  let max: boolean;

  if (quantityBuyRemaining >= quantityBuy) {
    sqrtPrice = sqrtPriceTarget;
    max = true;
  } else {
    sqrtPrice = getNextSqrtPriceFromOutput(sqrtPriceCurrent, liquidity, quantityBuyRemaining, zeroForOne);
    max = false;
  }

  if (zeroForOne) {
    quantitySell = getAmount0Delta(sqrtPrice, sqrtPriceCurrent, liquidity, true);

    quantityBuy = max ? quantityBuy : getAmount1Delta(sqrtPrice, sqrtPriceCurrent, liquidity, false);
  } else {
    quantitySell = getAmount1Delta(sqrtPriceCurrent, sqrtPrice, liquidity, true);

    quantityBuy = max ? quantityBuy : getAmount0Delta(sqrtPriceCurrent, sqrtPrice, liquidity, false);
  }

  quantityBuy = quantityBuy > quantityBuyRemaining ? quantityBuyRemaining : quantityBuy;

  const quantityFee = safeMulDivCeil(quantitySell, fee, 1_000_000n - fee);

  return { sqrtPrice, quantitySell, quantityBuy, quantityFee };
}
