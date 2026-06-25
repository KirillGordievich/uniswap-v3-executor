import hre from 'hardhat';
import { randomInt } from 'node:crypto';

import { MathError } from '@libs/core/errors';
import {
  getSqrtPriceAtTick,
  TICK_MAX,
  TICK_MIN,
  getTickAtSqrtPrice,
  SQRT_RATIO_MIN,
  SQRT_RATIO_MAX,
} from '@libs/math/tick';

describe('tick math', () => {
  let tickMathMock: ReturnType<typeof hre.ethers.Contract>;

  beforeAll(async () => {
    tickMathMock = await hre.ethers.getContractFactory('TickMathMock').then((factory: { deploy(): Promise<unknown> }) => factory.deploy());
  });

  describe('getSqrtPriceAtTick', () => {
    it('throws if tick is outside the range', async () => {
      const ticks = [TICK_MIN - 20, TICK_MAX * 2];

      for (const tick of ticks) {
        expect(() => getSqrtPriceAtTick(tick)).toThrow(MathError);

        const errored = await tickMathMock
          .getSqrtPriceAtTick(tick)
          .then(() => false)
          .catch(() => true);

        expect(errored).toBe(true);
      }
    });

    it('calculates correctly', async () => {
      const checks: Promise<void>[] = [];

      for (let i = 0; i < 30; i++) {
        checks.push(
          (async () => {
            const tick = randomInt(2 * TICK_MAX) - TICK_MAX;
            const expected = await tickMathMock.getSqrtPriceAtTick(tick).then((res: { toString(): string }) => BigInt(res.toString()));
            const actual = getSqrtPriceAtTick(tick);

            expect(actual).toBe(expected);
          })(),
        );
      }

      await Promise.all(checks);
    });
  });

  describe('getTickAtSqrtPrice', () => {
    it('throws if sqrt ratio is outside the range', () => {
      const ratios = [SQRT_RATIO_MIN - 20n, SQRT_RATIO_MAX * 2n];

      for (const sqrtRatio of ratios) {
        expect(() => getTickAtSqrtPrice(sqrtRatio)).toThrow(MathError);
      }
    });

    it('calculates correctly', async () => {
      const checks: Promise<void>[] = [];

      for (let i = 0; i < 30; i++) {
        checks.push(
          (async () => {
            const range = SQRT_RATIO_MAX - SQRT_RATIO_MIN;
            const offset = BigInt(randomInt(Number(range > BigInt(Number.MAX_SAFE_INTEGER) ? Number.MAX_SAFE_INTEGER : range)));
            const sqrtRatio = SQRT_RATIO_MIN + offset;

            const expected = await tickMathMock.getTickAtSqrtPrice(sqrtRatio).then((res: { toString(): string }) => Number(res.toString()));
            const actual = getTickAtSqrtPrice(sqrtRatio);

            expect(actual).toBe(expected);
          })(),
        );
      }

      await Promise.all(checks);
    });
  });
});
