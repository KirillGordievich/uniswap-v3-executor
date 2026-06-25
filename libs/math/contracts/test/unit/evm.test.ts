import hre from 'hardhat';

import {
  isUint128,
  isUint160,
  isUint256,
  uint128,
  uint160,
  uint256,
  isInt128,
  isInt256,
} from '@libs/math/evm';

describe('evm', () => {
  let evmMock: ReturnType<typeof hre.ethers.Contract>;

  beforeAll(async () => {
    evmMock = await hre.ethers.getContractFactory('EvmMock').then((factory: { deploy(): Promise<unknown> }) => factory.deploy());
  });

  describe('isUint128', () => {
    it('is correct for integers within bounds', async () => {
      const checks = [0n, 928995n, 2n ** 128n - 1n].map(async (value) => {
        const expected = await evmMock.isUint128(value);
        const actual = isUint128(value);

        expect(actual).toBe(expected);
      });

      await Promise.all(checks);
    });

    it('is correct for other values', () => {
      const values = ['a', null, -298492n, 2n ** 173n];
      for (const value of values) {
        const actual = isUint128(value);
        expect(actual).toBe(false);
      }
    });
  });

  describe('isUint160', () => {
    it('is correct for integers within bounds', async () => {
      const checks = [0n, 928995n, 2n ** 160n - 1n].map(async (value) => {
        const expected = await evmMock.isUint160(value);
        const actual = isUint160(value);

        expect(actual).toBe(expected);
      });

      await Promise.all(checks);
    });

    it('is correct for other values', () => {
      const values = ['a', null, -298492n, 2n ** 173n];
      for (const value of values) {
        const actual = isUint160(value);
        expect(actual).toBe(false);
      }
    });
  });

  describe('isUint256', () => {
    it('is correct for integers within bounds', async () => {
      const checks = [0n, 928995n, 2n ** 256n - 1n].map(async (value) => {
        const expected = await evmMock
          .identityUint256(value)
          .then(() => true)
          .catch(() => false);

        const actual = isUint256(value);

        expect(actual).toBe(expected);
      });

      await Promise.all(checks);
    });

    it('is correct for other values', () => {
      const values = ['a', null, -298492n, 2n ** 280n];
      for (const value of values) {
        const actual = isUint256(value);
        expect(actual).toBe(false);
      }
    });
  });

  describe('isInt128', () => {
    it('is correct for integers within bounds', async () => {
      const checks = [-(2n ** 127n), 0n, 928995n, 2n ** 127n - 1n].map(async (value) => {
        const expected = await evmMock.isInt128(value);
        const actual = isInt128(value);

        expect(actual).toBe(expected);
      });

      await Promise.all(checks);
    });

    it('is correct for other values', () => {
      const values = ['a', null, -(2n ** 169n), 2n ** 173n];
      for (const value of values) {
        const actual = isInt128(value);
        expect(actual).toBe(false);
      }
    });
  });

  describe('isInt256', () => {
    it('is correct for integers within bounds', async () => {
      const checks = [0n, -(2n ** 255n), 2n ** 255n - 1n].map(async (value) => {
        const expected = await evmMock
          .identityInt256(value)
          .then(() => true)
          .catch(() => false);

        const actual = isInt256(value);

        expect(actual).toBe(expected);
      });

      await Promise.all(checks);
    });

    it('is correct for other values', () => {
      const values = ['a', null, -(2n ** 300n), 2n ** 280n];
      for (const value of values) {
        const actual = isInt256(value);
        expect(actual).toBe(false);
      }
    });
  });

  describe('uint128', () => {
    it('is correct', async () => {
      const checks = [-30n, 0n, 928995n, 2n ** 134n].map(async (value) => {
        const expected = await evmMock.toUint128(value).then((result: { toString(): string }) => BigInt(result.toString()));
        const actual = uint128(value);

        expect(actual).toBe(expected);
      });

      await Promise.all(checks);
    });
  });

  describe('uint160', () => {
    it('is correct', async () => {
      const checks = [-30n, 0n, 928995n, 2n ** 172n].map(async (value) => {
        const expected = await evmMock.toUint160(value).then((result: { toString(): string }) => BigInt(result.toString()));
        const actual = uint160(value);

        expect(actual).toBe(expected);
      });

      await Promise.all(checks);
    });
  });

  describe('uint256', () => {
    it('is correct', async () => {
      const y = 2n ** 128n;

      const checks = [-30n, 0n, 928995n, 2n ** 172n].map(async (x) => {
        const expected = await evmMock.mulInt256(x, y).then((result: { toString(): string }) => BigInt(result.toString()));
        const actual = uint256(x * y);

        expect(actual).toBe(expected);
      });

      await Promise.all(checks);
    });
  });
});
