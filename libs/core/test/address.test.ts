import { randomBytes } from 'node:crypto';

import { isAddress, normalizeAddress } from '../src/address';
import { randomAddress } from './helpers';

describe('address', () => {
  describe('isAddress', () => {
    it('returns true for buffers of 20 bytes', () => {
      const buffer = randomBytes(20);
      const is = isAddress(buffer);
      expect(is).toBe(true);
    });

    it('returns true for hex strings of 40 chars with prefix', () => {
      const hex = '0x' + randomBytes(20).toString('hex');
      const is = isAddress(hex);
      expect(is).toBe(true);
    });

    it('returns true for hex strings of 40 chars without prefix', () => {
      const hex = randomBytes(20).toString('hex');
      const is = isAddress(hex);
      expect(is).toBe(true);
    });

    it('is not case sensitive', () => {
      const hex = '0X' + randomBytes(20).toString('hex').toUpperCase();
      const is = isAddress(hex);
      expect(is).toBe(true);
    });

    it('returns false for everything else', () => {
      for (const value of [9, null, undefined, '', 'foo']) {
        const is = isAddress(value);
        expect(is).toBe(false);
      }
    });
  });

  describe('normalizeAddress', () => {
    it('decodes into hex', () => {
      const buffer = randomBytes(20);
      const hex = '0x' + buffer.toString('hex');
      expect(normalizeAddress(buffer)).toBe(hex);
    });

    it('converts to lower case', () => {
      const addressLowerCase = randomAddress();
      const addressUpperCase = addressLowerCase.toUpperCase();
      expect(normalizeAddress(addressUpperCase)).toBe(addressLowerCase);
    });

    it('adds prefix', () => {
      const addressWithPrefix = randomAddress();
      const addressWithoutPrefix = addressWithPrefix.replace(/^0[xX]/, '');
      expect(normalizeAddress(addressWithoutPrefix)).toBe(addressWithPrefix);
    });
  });
});
