import { MathError } from '@libs/core';

import { isInt128, isInt256, isUint160 } from './evm';

export function toUint160(x: bigint): bigint {
  if (!isUint160(x)) {
    throw new MathError('result overflows or underflows uint160');
  }

  return x;
}

export function toInt128(x: bigint): bigint {
  if (!isInt128(x)) {
    throw new MathError('result overflows or underflows int128');
  }

  return x;
}

export function toInt256(x: bigint): bigint {
  if (!isInt256(x)) {
    throw new MathError('result overflows or underflows int256');
  }

  return x;
}
