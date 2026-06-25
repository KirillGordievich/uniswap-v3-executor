import { BigNumber } from 'ethers';

export function parseNumber(value: number | string | BigNumber): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return Number(value);
  }

  const hex = value.toHexString();

  if (hex[0] === '-') {
    return -Number(hex.slice(1));
  }

  return Number(hex);
}

export function parseBigInt(value: number | string | BigNumber): bigint {
  if (typeof value === 'number' || typeof value === 'string') {
    return BigInt(value);
  }

  const hex = value.toHexString();

  if (hex[0] === '-') {
    return -BigInt(hex.slice(1));
  }

  return BigInt(hex);
}
