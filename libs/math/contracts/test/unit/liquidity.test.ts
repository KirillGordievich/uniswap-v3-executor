import hre from 'hardhat';

import { MathError } from '@libs/core/errors';
import { addDelta } from '@libs/math/liquidity';

describe('liquidity math', () => {
  let liquidityMathMock: ReturnType<typeof hre.ethers.Contract>;

  beforeAll(async () => {
    liquidityMathMock = await hre.ethers
      .getContractFactory('LiquidityMathMock')
      .then((factory: { deploy(): Promise<unknown> }) => factory.deploy());
  });

  describe('addDelta', () => {
    it('returns when sum does not overflow uint128', async () => {
      const x = 298352739n;
      const y = 1235784278587n;

      const expected = await liquidityMathMock.addDelta(x, y).then((res: { toString(): string }) => BigInt(res.toString()));
      const actual = addDelta(x, y);

      expect(actual).toBe(expected);
    });

    it('throws when sum overflows uint128', async () => {
      const x = 2n ** 128n - 50n;
      const y = 1235784278587n;

      expect(() => addDelta(x, y)).toThrow(MathError);

      const errored = await liquidityMathMock
        .addDelta(x, y)
        .then(() => false)
        .catch(() => true);

      expect(errored).toBe(true);
    });
  });
});
