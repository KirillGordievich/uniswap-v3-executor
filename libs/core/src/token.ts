import { normalizeAddress } from './address';

export type Token = {
  address: string;
  decimals: number;
  symbol: string;
  name: string;
};

export const TOKEN_SYMBOL_PATTERN = /^[a-zA-Z0-9]+$/;

export function compareTokenAddresses(tokenAAddress: string | Buffer, tokenBAddress: string | Buffer): number {
  const tokenAAddressNormalized = normalizeAddress(tokenAAddress);
  const tokenBAddressNormalized = normalizeAddress(tokenBAddress);

  return tokenAAddressNormalized.localeCompare(tokenBAddressNormalized);
}

export function compareTokens(tokenA: Token, tokenB: Token): number {
  return compareTokenAddresses(tokenA.address, tokenB.address);
}
