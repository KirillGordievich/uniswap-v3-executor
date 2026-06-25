import hre from 'hardhat';

import { MathError } from '@libs/core/errors';
import { toUint160, toInt128, toInt256 } from '@libs/math/cast';

describe('cast', () => {
  let castMock: ReturnType<typeof hre.ethers.Contract>;

  beforeAll(async () => {
    castMock = await hre.ethers.getContractFactory('CastMock').then((factory: { deploy(): Promise<unknown> }) => factory.deploy());
  });

  describe('toUint160', () => {
    it('returns when value is uint160', async () => {
      const value = 53656574559850017826385n;

      expect(toUint160(value)).toBe(value);

      const castValue = await castMock.toUint160(value).then((res: { toString(): string }) => BigInt(res.toString()));

      expect(castValue).toBe(value);
    });

    it('throws when value is not uint160', async () => {
      const value = 2n ** 250n;

      expect(() => toUint160(value)).toThrow(MathError);

      const errored = await castMock
        .toUint160(value)
        .then(() => false)
        .catch(() => true);

      expect(errored).toBe(true);
    });
  });

  describe('toInt128', () => {
    it('returns when value is int128', async () => {
      const value = -53656574559850017826385n;

      expect(toInt128(value)).toBe(value);

      const castValue = await castMock.toInt128(value).then((res: { toString(): string }) => BigInt(res.toString()));

      expect(castValue).toBe(value);
    });

    it('throws when value is not int128', async () => {
      const value = 2n ** 250n;

      expect(() => toInt128(value)).toThrow(MathError);

      const errored = await castMock
        .toInt128(value)
        .then(() => false)
        .catch(() => true);

      expect(errored).toBe(true);
    });
  });

  describe('toInt256', () => {
    it('returns when value is int256', async () => {
      const value = 53656574559850017826385n;

      expect(toInt256(value)).toBe(value);

      const castValue = await castMock.toInt256(value).then((res: { toString(): string }) => BigInt(res.toString()));

      expect(castValue).toBe(value);
    });

    it('throws when value is not int256', async () => {
      const value = 2n ** 255n + 30n;

      expect(() => toInt256(value)).toThrow(MathError);

      const errored = await castMock
        .toInt256(value)
        .then(() => false)
        .catch(() => true);

      expect(errored).toBe(true);
    });
  });
});
