import { MathError } from '@libs/core';

import { safeAdd, safeMulDivCeil, safeMulDivFloor, unsafeDivCeil } from './arithmetic';
import { toUint160 } from './cast';
import { isUint160, uint160, uint256 } from './evm';

const FIXED_POINT_96_RESOLUTION = 96n;
const FIXED_POINT_96_Q96 = 0x1000000000000000000000000n;

export function getAmount0Delta(sqrtPriceA: bigint, sqrtPriceB: bigint, liquidity: bigint, ceil: boolean): bigint {
  if (sqrtPriceA > sqrtPriceB) {
    [sqrtPriceA, sqrtPriceB] = [sqrtPriceB, sqrtPriceA];
  }

  if (!sqrtPriceA || !sqrtPriceB) {
    throw new MathError('sqrt prices cannot be zero');
  }

  const numerator1 = liquidity << FIXED_POINT_96_RESOLUTION;
  const numerator2 = sqrtPriceB - sqrtPriceA;

  return ceil
    ? unsafeDivCeil(safeMulDivCeil(numerator1, numerator2, sqrtPriceB), sqrtPriceA)
    : safeMulDivFloor(numerator1, numerator2, sqrtPriceB) / sqrtPriceA;
}

export function getAmount1Delta(sqrtPriceA: bigint, sqrtPriceB: bigint, liquidity: bigint, ceil: boolean): bigint {
  if (sqrtPriceA > sqrtPriceB) {
    [sqrtPriceA, sqrtPriceB] = [sqrtPriceB, sqrtPriceA];
  }

  return ceil
    ? safeMulDivCeil(liquidity, sqrtPriceB - sqrtPriceA, FIXED_POINT_96_Q96)
    : safeMulDivFloor(liquidity, sqrtPriceB - sqrtPriceA, FIXED_POINT_96_Q96);
}

export function getNextSqrtPriceFromInput(
  sqrtPrice: bigint,
  liquidity: bigint,
  amount: bigint,
  zeroForOne: boolean,
): bigint {
  if (sqrtPrice <= 0n) {
    throw new MathError('sqrt price must be positive');
  }

  if (liquidity <= 0n) {
    throw new MathError('liquidity must be positive');
  }

  if (zeroForOne) {
    if (amount === 0n) {
      return sqrtPrice;
    }

    const numerator1 = liquidity << FIXED_POINT_96_RESOLUTION;
    const product = uint256(amount * sqrtPrice);

    if (product / amount == sqrtPrice) {
      const denominator = uint256(numerator1 + product);

      if (denominator >= numerator1) {
        return uint160(safeMulDivCeil(numerator1, sqrtPrice, denominator));
      }
    }

    return uint160(unsafeDivCeil(numerator1, safeAdd(numerator1 / sqrtPrice, amount)));
  } else {
    const quotient = uint256(
      isUint160(amount)
        ? (amount << FIXED_POINT_96_RESOLUTION) / liquidity
        : safeMulDivFloor(amount, FIXED_POINT_96_Q96, liquidity),
    );

    return toUint160(safeAdd(sqrtPrice, quotient));
  }
}

export function getNextSqrtPriceFromOutput(
  sqrtPrice: bigint,
  liquidity: bigint,
  amount: bigint,
  zeroForOne: boolean,
): bigint {
  if (sqrtPrice <= 0n) {
    throw new MathError('sqrt price must be positive');
  }

  if (liquidity <= 0n) {
    throw new MathError('liquidity must be positive');
  }

  if (zeroForOne) {
    const quotient = uint256(
      isUint160(amount)
        ? unsafeDivCeil(amount << FIXED_POINT_96_RESOLUTION, liquidity)
        : safeMulDivCeil(amount, FIXED_POINT_96_Q96, liquidity),
    );

    if (sqrtPrice <= quotient) {
      throw new MathError('quotient exceeds sqrt price');
    }

    return uint160(sqrtPrice - quotient);
  } else {
    if (amount === 0n) {
      return sqrtPrice;
    }

    const numerator1 = liquidity << FIXED_POINT_96_RESOLUTION;
    const product = uint256(amount * sqrtPrice);

    if (product / amount !== sqrtPrice || numerator1 <= product) {
      throw new MathError('product overflows uint256');
    }

    const denominator = numerator1 - product;

    return toUint160(safeMulDivCeil(numerator1, sqrtPrice, denominator));
  }
}
