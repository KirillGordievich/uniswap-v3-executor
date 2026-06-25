export const parseInteger = (integer: { toString(): string }): bigint => BigInt(integer.toString());
