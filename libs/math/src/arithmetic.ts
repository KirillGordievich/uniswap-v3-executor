import { MathError } from '@libs/core';

import { isUint256 } from './evm';

export function safeAdd(x: bigint, y: bigint): bigint {
  const sum = x + y;

  if (!isUint256(sum)) {
    throw new MathError('sum overflows uint256');
  }

  return sum;
}

export function safeSub(x: bigint, y: bigint): bigint {
  const difference = x - y;

  if (!isUint256(difference)) {
    throw new MathError('difference underflows uint256');
  }

  return difference;
}

export function safeMul(x: bigint, y: bigint): bigint {
  const product = x * y;

  if (!isUint256(product)) {
    throw new MathError('product overflows uint256');
  }

  return product;
}

export function safeMulDivFloor(x: bigint, y: bigint, z: bigint): bigint {
  if (!z) {
    throw new MathError('division by zero');
  }

  const quotient = (x * y) / z;

  if (!isUint256(quotient)) {
    throw new MathError('quotient overflows uint256');
  }

  return quotient;
}

export function safeMulDivCeil(x: bigint, y: bigint, z: bigint): bigint {
  if (!z) {
    throw new MathError('division by zero');
  }

  const product = x * y;
  const quotient = product / z;

  if (!isUint256(quotient)) {
    throw new MathError('quotient overflows uint256');
  }

  return quotient + (product % z ? 1n : 0n);
}

export function unsafeDivCeil(x: bigint, y: bigint): bigint {
  if (!y) {
    return 0n;
  }

  return x / y + (x % y ? 1n : 0n);
}
