import hre from 'hardhat';

import { MathError } from '@libs/core/errors';
import {
  safeAdd,
  safeMul,
  safeMulDivCeil,
  safeMulDivFloor,
  safeSub,
  unsafeDivCeil,
} from '@libs/math/arithmetic';

describe('arithmetic', () => {
  let arithmeticMock: ReturnType<typeof hre.ethers.Contract>;

  beforeAll(async () => {
    arithmeticMock = await hre.ethers
      .getContractFactory('ArithmeticMock')
      .then((factory: { deploy(): Promise<unknown> }) => factory.deploy());
  });

  describe('safeAdd', () => {
    it('returns when no overflow is detected', async () => {
      const x = 989505029487962n;
      const y = 7611675473651648154861514n;
      const sum = await arithmeticMock.safeAdd(x, y).then((value: { toHexString(): string }) => BigInt(value.toHexString()));

      expect(safeAdd(x, y)).toBe(sum);
    });

    it('throws when overflow is detected', async () => {
      const x = 989505029487962n;
      const y = 2n ** 256n - 1n;
      await arithmeticMock.safeAdd(x, y).catch(() => undefined);

      expect(() => safeAdd(x, y)).toThrow(MathError);
    });
  });

  describe('safeSub', () => {
    it('returns when no underflow is detected', async () => {
      const x = 7611675473651648154861514n;
      const y = 989505029487962n;
      const difference = await arithmeticMock.safeSub(x, y).then((value: { toHexString(): string }) => BigInt(value.toHexString()));

      expect(safeSub(x, y)).toBe(difference);
    });

    it('throws when underflow is detected', async () => {
      const x = 989505029487962n;
      const y = 2n ** 256n - 1n;
      await arithmeticMock.safeSub(x, y).catch(() => undefined);

      expect(() => safeSub(x, y)).toThrow(MathError);
    });
  });

  describe('safeMul', () => {
    it('returns when no overflow is detected', async () => {
      const x = 989505029487962n;
      const y = 7611675473651648154861514n;
      const product = await arithmeticMock.safeMul(x, y).then((value: { toHexString(): string }) => BigInt(value.toHexString()));

      expect(safeMul(x, y)).toBe(product);
    });

    it('throws when overflow is detected', async () => {
      const x = 989505029487962n;
      const y = 2n ** 256n - 1n;
      await arithmeticMock.safeMul(x, y).catch(() => undefined);

      expect(() => safeMul(x, y)).toThrow(MathError);
    });
  });

  describe('safeMulDivFloor', () => {
    it('throws when denominator is zero', async () => {
      const x = 989505029487962n;
      const y = 7611675473651648154861514n;
      const z = 0n;
      await arithmeticMock.safeMulDivFloor(x, y, z).catch(() => undefined);

      expect(() => safeMulDivFloor(x, y, z)).toThrow(MathError);
    });

    it('returns when no overflow is detected', async () => {
      const x = 989505029487962n;
      const y = 7611675473651648154861514n;
      const z = 298958952n;
      const quotient = await arithmeticMock.safeMulDivFloor(x, y, z).then((value: { toHexString(): string }) => BigInt(value.toHexString()));

      expect(safeMulDivFloor(x, y, z)).toBe(quotient);
    });

    it('throws when overflow is detected', async () => {
      const x = 2n ** 253n;
      const y = 2n ** 256n - 1n;
      const z = 92n;
      await arithmeticMock.safeMulDivFloor(x, y, y).catch(() => undefined);

      expect(() => safeMulDivFloor(x, y, z)).toThrow(MathError);
    });
  });

  describe('safeMulDivCeil', () => {
    it('throws when denominator is zero', async () => {
      const x = 989505029487962n;
      const y = 7611675473651648154861514n;
      const z = 0n;
      await arithmeticMock.safeMulDivCeil(x, y, z).catch(() => undefined);

      expect(() => safeMulDivCeil(x, y, z)).toThrow(MathError);
    });

    it('returns when no overflow is detected and result is fractional', async () => {
      const x = 989505029487964n;
      const y = 7611675473651648154861514n;
      const z = 298958952n;
      const quotient = await arithmeticMock.safeMulDivCeil(x, y, z).then((value: { toHexString(): string }) => BigInt(value.toHexString()));

      expect(safeMulDivCeil(x, y, z)).toBe(quotient);
    });

    it('returns when no overflow is detected and result is integer', async () => {
      const x = 989505029487963n;
      const y = 7611675473651648154861514n;
      const z = 989505029487963n;
      const quotient = await arithmeticMock.safeMulDivCeil(x, y, z).then((value: { toHexString(): string }) => BigInt(value.toHexString()));

      expect(safeMulDivCeil(x, y, z)).toBe(quotient);
    });

    it('throws when overflow is detected', async () => {
      const x = 2n ** 253n;
      const y = 2n ** 256n - 1n;
      const z = 92n;
      await arithmeticMock.safeMulDivCeil(x, y, y).catch(() => undefined);

      expect(() => safeMulDivCeil(x, y, z)).toThrow(MathError);
    });
  });

  describe('unsafeDivCeil', () => {
    it('returns zero when denominator is zero', async () => {
      const x = 2n;
      const y = 0n;
      const quotient = await arithmeticMock.unsafeDivCeil(x, y).then((value: { toHexString(): string }) => BigInt(value.toHexString()));

      expect(unsafeDivCeil(x, y)).toBe(quotient);
    });

    it('returns when underflow is detected', async () => {
      const x = 13284785724785287582n;
      const y = 2984928928759827925762875692692876522525n;
      const quotient = await arithmeticMock.unsafeDivCeil(x, y).then((value: { toHexString(): string }) => BigInt(value.toHexString()));

      expect(unsafeDivCeil(x, y)).toBe(quotient);
    });

    it('returns when no underflow is detected and result is fractional', async () => {
      const x = 13284785724785287582n;
      const y = 88982848825n;
      const quotient = await arithmeticMock.unsafeDivCeil(x, y).then((value: { toHexString(): string }) => BigInt(value.toHexString()));

      expect(unsafeDivCeil(x, y)).toBe(quotient);
    });

    it('returns when no underflow is detected and result is integer', async () => {
      const x = 13284785724785287582n;
      const y = x / 2n;
      const quotient = await arithmeticMock.unsafeDivCeil(x, y).then((value: { toHexString(): string }) => BigInt(value.toHexString()));

      expect(unsafeDivCeil(x, y)).toBe(quotient);
    });
  });
});
