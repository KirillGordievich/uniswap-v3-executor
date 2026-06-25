import { Decimal } from 'decimal.js';

export const QUANTITY_PATTERN = /^\+?(\d*[1-9]\d*\.?\d*|0*\.\d*[1-9]\d*)(e[+-]?\d+)?$/;

export function unitsToDecimals(units: number | string | Decimal, tokenDecimals: number): bigint {
  const hex = new Decimal(units as string | number)
    .mul('1e' + tokenDecimals)
    .floor()
    .toHex();

  return BigInt(hex);
}

export function decimalsToUnits(decimals: number | string | bigint, tokenDecimals: number): Decimal {
  return new Decimal(decimals.toString()).mul('1e-' + tokenDecimals);
}

export function weiToEther(wei: number | string | bigint): Decimal {
  return decimalsToUnits(wei, 18);
}

export function etherToWei(ether: number | string | Decimal): bigint {
  return unitsToDecimals(ether, 18);
}

export function gweiToWei(gwei: number | string): bigint {
  const hex = new Decimal(gwei).mul(1e9).floor().toHex();

  return BigInt(hex);
}
