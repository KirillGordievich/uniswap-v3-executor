import { MathError } from '@libs/core';

import { isUint128 } from './evm';

export function addDelta(x: bigint, y: bigint): bigint {
  const sum = x + y;

  if (!isUint128(sum)) {
    throw new MathError('sum overflows uint128');
  }

  return sum;
}
