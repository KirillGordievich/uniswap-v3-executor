import { bufferToHex } from './converters';

export const ADDRESS_PATTERN = /^(0[xX])?[0-9a-fA-F]{40}$/;

export function isAddress(value: unknown): value is Buffer | string {
  if (Buffer.isBuffer(value)) {
    return value.length === 20;
  }

  if (typeof value === 'string') {
    return ADDRESS_PATTERN.test(value);
  }

  return false;
}

export function normalizeAddress(address: Buffer | string): string {
  if (Buffer.isBuffer(address)) {
    return bufferToHex(address);
  }

  if (/^0[xX]/.test(address)) {
    return address.toLowerCase();
  }

  return '0x' + address.toLowerCase();
}
