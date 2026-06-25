import { BigNumber } from 'ethers';

import { parseNumber, parseBigInt } from '../src/parsers';

describe('parsers', () => {
  const values = [5, 0, -30];

  describe('parseNumber', () => {
    it('parses numbers correctly', () => {
      for (const value of values) {
        expect(parseNumber(value)).toBe(value);
      }
    });

    it('parses strings correctly', () => {
      for (const value of values) {
        const string = value.toString();
        expect(parseNumber(string)).toBe(value);
      }
    });

    it('parses BigNumbers correctly', () => {
      for (const value of values) {
        const bigNumber = BigNumber.from(value);
        expect(parseNumber(bigNumber)).toBe(value);
      }
    });
  });

  describe('parseBigInt', () => {
    it('parses a number correctly', () => {
      for (const value of values) {
        const bigInt = BigInt(value);
        expect(parseBigInt(value)).toBe(bigInt);
      }
    });

    it('parses strings correctly', () => {
      for (const value of values) {
        const bigInt = BigInt(value);
        const string = value.toString();
        expect(parseBigInt(string)).toBe(bigInt);
      }
    });

    it('parses a BigNumber correctly', () => {
      for (const value of values) {
        const bigNumber = BigNumber.from(value);
        const bigInt = BigInt(value);
        expect(parseBigInt(bigNumber)).toBe(bigInt);
      }
    });
  });
});
