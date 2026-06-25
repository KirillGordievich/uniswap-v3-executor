export const UINT128_MIN = 0n;
export const UINT128_MAX = 2n ** 128n - 1n;
export const UINT160_MIN = 0n;
export const UINT160_MAX = 2n ** 160n - 1n;
export const UINT256_MIN = 0n;
export const UINT256_MAX = 2n ** 256n - 1n;

export const INT128_MIN = -(2n ** 127n);
export const INT128_MAX = 2n ** 127n - 1n;
export const INT256_MIN = -(2n ** 255n);
export const INT256_MAX = 2n ** 255n - 1n;

export function isUint128(value: unknown): value is bigint {
  return typeof value === 'bigint' && value >= UINT128_MIN && value <= UINT128_MAX;
}

export function isUint160(value: unknown): value is bigint {
  return typeof value === 'bigint' && value >= UINT160_MIN && value <= UINT160_MAX;
}

export function isUint256(value: unknown): value is bigint {
  return typeof value === 'bigint' && value >= UINT256_MIN && value <= UINT256_MAX;
}

export function isInt128(value: unknown): value is bigint {
  return typeof value === 'bigint' && value >= INT128_MIN && value <= INT128_MAX;
}

export function isInt256(value: unknown): value is bigint {
  return typeof value === 'bigint' && value >= INT256_MIN && value <= INT256_MAX;
}

export function uint128(value: bigint): bigint {
  return value & UINT128_MAX;
}

export function uint160(value: bigint): bigint {
  return value & UINT160_MAX;
}

export function uint256(value: bigint): bigint {
  return value & UINT256_MAX;
}
