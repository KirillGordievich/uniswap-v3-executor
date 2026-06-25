import hre from 'hardhat';

import { MathError } from '@libs/core/errors';
import {
  getAmount0Delta,
  getAmount1Delta,
  getNextSqrtPriceFromInput,
  getNextSqrtPriceFromOutput,
} from '@libs/math/sqrt-price';

describe('sqrt price math', () => {
  let sqrtPriceMathMock: ReturnType<typeof hre.ethers.Contract>;

  beforeAll(async () => {
    sqrtPriceMathMock = await hre.ethers
      .getContractFactory('SqrtPriceMathMock')
      .then((factory: { deploy(): Promise<unknown> }) => factory.deploy());
  });

  describe('getAmount0Delta', () => {
    it('throws when one of the prices is zero', async () => {
      const sqrtPriceA = 0n;
      const sqrtPriceB = 5n;
      const liquidity = 92849282n;
      const ceil = true;

      expect(() => getAmount0Delta(sqrtPriceA, sqrtPriceB, liquidity, ceil)).toThrow(MathError);

      const errored = await sqrtPriceMathMock
        .getAmount0Delta(sqrtPriceA, sqrtPriceB, liquidity, ceil)
        .then(() => false)
        .catch(() => true);

      expect(errored).toBe(true);
    });

    it('works correctly with ceil is true', async () => {
      const sqrtPriceA = 3323728n;
      const sqrtPriceB = 2699462n;
      const liquidity = 1220987252626n;
      const ceil = true;

      const expected = await sqrtPriceMathMock
        .getAmount0Delta(sqrtPriceA, sqrtPriceB, liquidity, ceil)
        .then((res: { toString(): string }) => BigInt(res.toString()));

      const actual = getAmount0Delta(sqrtPriceA, sqrtPriceB, liquidity, ceil);

      expect(actual).toBe(expected);
    });

    it('works correctly with ceil is false', async () => {
      const sqrtPriceA = 123360082n;
      const sqrtPriceB = 2895998925566n;
      const liquidity = 298894679897682658266n;
      const ceil = false;

      const expected = await sqrtPriceMathMock
        .getAmount0Delta(sqrtPriceA, sqrtPriceB, liquidity, ceil)
        .then((res: { toString(): string }) => BigInt(res.toString()));

      const actual = getAmount0Delta(sqrtPriceA, sqrtPriceB, liquidity, ceil);

      expect(actual).toBe(expected);
    });
  });

  describe('getAmount1Delta', () => {
    it('does not throw when one of the prices is zero', async () => {
      const sqrtPriceA = 0n;
      const sqrtPriceB = 5n;
      const liquidity = 92849282n;
      const ceil = false;

      expect(() => getAmount1Delta(sqrtPriceA, sqrtPriceB, liquidity, ceil)).not.toThrow();

      const errored = await sqrtPriceMathMock
        .getAmount1Delta(sqrtPriceA, sqrtPriceB, liquidity, ceil)
        .then(() => false)
        .catch(() => true);

      expect(errored).toBe(false);
    });

    it('works correctly with ceil is true', async () => {
      const sqrtPriceA = 3323728n;
      const sqrtPriceB = 2699462n;
      const liquidity = 1220987252626n;
      const ceil = true;

      const expected = await sqrtPriceMathMock
        .getAmount1Delta(sqrtPriceA, sqrtPriceB, liquidity, ceil)
        .then((res: { toString(): string }) => BigInt(res.toString()));

      const actual = getAmount1Delta(sqrtPriceA, sqrtPriceB, liquidity, ceil);

      expect(actual).toBe(expected);
    });

    it('works correctly with ceil is false', async () => {
      const sqrtPriceA = 123360082n;
      const sqrtPriceB = 2895998925566n;
      const liquidity = 298894679897682658266n;
      const ceil = false;

      const expected = await sqrtPriceMathMock
        .getAmount1Delta(sqrtPriceA, sqrtPriceB, liquidity, ceil)
        .then((res: { toString(): string }) => BigInt(res.toString()));

      const actual = getAmount1Delta(sqrtPriceA, sqrtPriceB, liquidity, ceil);

      expect(actual).toBe(expected);
    });
  });

  describe('getNextSqrtPriceFromInput', () => {
    describe('when zeroForOne is true', () => {
      const zeroForOne = true;

      it('throws when sqrt price is zero', async () => {
        const sqrtPrice = 0n;
        const liquidity = 92849282n;
        const amount = 123252523n;

        expect(() => getNextSqrtPriceFromInput(sqrtPrice, liquidity, amount, zeroForOne)).toThrow(MathError);

        const errored = await sqrtPriceMathMock
          .getNextSqrtPriceFromInput(sqrtPrice, liquidity, amount, zeroForOne)
          .then(() => false)
          .catch(() => true);

        expect(errored).toBe(true);
      });

      it('throws when liquidity is zero', async () => {
        const sqrtPrice = 2535452n;
        const liquidity = 0n;
        const amount = 123252523n;

        expect(() => getNextSqrtPriceFromInput(sqrtPrice, liquidity, amount, zeroForOne)).toThrow(MathError);

        const errored = await sqrtPriceMathMock
          .getNextSqrtPriceFromInput(sqrtPrice, liquidity, amount, zeroForOne)
          .then(() => false)
          .catch(() => true);

        expect(errored).toBe(true);
      });

      it('returns sqrt price when amount is zero', async () => {
        const sqrtPrice = 2535452n;
        const liquidity = 645222n;
        const amount = 0n;

        const expected = await sqrtPriceMathMock
          .getNextSqrtPriceFromInput(sqrtPrice, liquidity, amount, zeroForOne)
          .then((res: { toString(): string }) => BigInt(res.toString()));

        const actual = getNextSqrtPriceFromInput(sqrtPrice, liquidity, amount, zeroForOne);

        expect(actual).toBe(expected);
      });

      it('works correctly when product and denominator do not overflow', async () => {
        const sqrtPrice = 2535452n;
        const liquidity = 72687568726587265862875628658726080680n;
        const amount = 882n;

        const expected = await sqrtPriceMathMock
          .getNextSqrtPriceFromInput(sqrtPrice, liquidity, amount, zeroForOne)
          .then((res: { toString(): string }) => BigInt(res.toString()));

        const actual = getNextSqrtPriceFromInput(sqrtPrice, liquidity, amount, zeroForOne);

        expect(actual).toBe(expected);
      });

      it('works correctly when product overflows', async () => {
        const sqrtPrice = 2n ** 100n;
        const liquidity = 2n ** 120n;
        const amount = 2n ** 160n - 1n;

        const expected = await sqrtPriceMathMock
          .getNextSqrtPriceFromInput(sqrtPrice, liquidity, amount, zeroForOne)
          .then((res: { toString(): string }) => BigInt(res.toString()));

        const actual = getNextSqrtPriceFromInput(sqrtPrice, liquidity, amount, zeroForOne);

        expect(actual).toBe(expected);
      });

      it('works correctly when denominator overflows', async () => {
        const sqrtPrice = 2n ** 160n - 2n ** 100n;
        const liquidity = 2n ** 127n;
        const amount = 2n ** 96n;

        const expected = await sqrtPriceMathMock
          .getNextSqrtPriceFromInput(sqrtPrice, liquidity, amount, zeroForOne)
          .then((res: { toString(): string }) => BigInt(res.toString()));

        const actual = getNextSqrtPriceFromInput(sqrtPrice, liquidity, amount, zeroForOne);

        expect(actual).toBe(expected);
      });
    });

    describe('when zeroForOne is false', () => {
      const zeroForOne = false;

      it('throws when sqrt price is zero', async () => {
        const sqrtPrice = 0n;
        const liquidity = 92849282n;
        const amount = 123252523n;

        expect(() => getNextSqrtPriceFromInput(sqrtPrice, liquidity, amount, zeroForOne)).toThrow(MathError);
      });

      it('throws when liquidity is zero', async () => {
        const sqrtPrice = 2535452n;
        const liquidity = 0n;
        const amount = 123252523n;

        expect(() => getNextSqrtPriceFromInput(sqrtPrice, liquidity, amount, zeroForOne)).toThrow(MathError);
      });

      it('works when amount does not overflow uint160', async () => {
        const sqrtPrice = 2535452n;
        const liquidity = 257790458604872787686901946127666623n;
        const amount = 123252523n;

        const expected = await sqrtPriceMathMock
          .getNextSqrtPriceFromInput(sqrtPrice, liquidity, amount, zeroForOne)
          .then((res: { toString(): string }) => BigInt(res.toString()));

        const actual = getNextSqrtPriceFromInput(sqrtPrice, liquidity, amount, zeroForOne);

        expect(actual).toBe(expected);
      });

      it('works when amount overflows uint160', async () => {
        const sqrtPrice = 2535452n;
        const liquidity = 2n ** 120n;
        const amount = 2n ** 170n;

        const expected = await sqrtPriceMathMock
          .getNextSqrtPriceFromInput(sqrtPrice, liquidity, amount, zeroForOne)
          .then((res: { toString(): string }) => BigInt(res.toString()));

        const actual = getNextSqrtPriceFromInput(sqrtPrice, liquidity, amount, zeroForOne);

        expect(actual).toBe(expected);
      });
    });
  });

  describe('getNextSqrtPriceFromOutput', () => {
    describe('when zeroForOne is true', () => {
      const zeroForOne = true;

      it('throws when sqrt price is zero', () => {
        expect(() => getNextSqrtPriceFromOutput(0n, 92849282n, 123252523n, zeroForOne)).toThrow(MathError);
      });

      it('throws when liquidity is zero', () => {
        expect(() => getNextSqrtPriceFromOutput(2535452n, 0n, 123252523n, zeroForOne)).toThrow(MathError);
      });

      it('works when amount does not overflow uint160', async () => {
        const sqrtPrice = 2n ** 100n;
        const liquidity = 257790458604872787686901946127666623n;
        const amount = 123252523n;

        const expected = await sqrtPriceMathMock
          .getNextSqrtPriceFromOutput(sqrtPrice, liquidity, amount, zeroForOne)
          .then((res: { toString(): string }) => BigInt(res.toString()));

        const actual = getNextSqrtPriceFromOutput(sqrtPrice, liquidity, amount, zeroForOne);

        expect(actual).toBe(expected);
      });

      it('works when amount overflows uint160', async () => {
        const sqrtPrice = 2n ** 150n;
        const liquidity = 2n ** 120n;
        const amount = 2n ** 162n;

        const expected = await sqrtPriceMathMock
          .getNextSqrtPriceFromOutput(sqrtPrice, liquidity, amount, zeroForOne)
          .then((res: { toString(): string }) => BigInt(res.toString()));

        const actual = getNextSqrtPriceFromOutput(sqrtPrice, liquidity, amount, zeroForOne);

        expect(actual).toBe(expected);
      });

      it('throws when quotient exceeds sqrt price', () => {
        expect(() => getNextSqrtPriceFromOutput(937929592659n, 885828276365n, 2352786n, zeroForOne)).toThrow(MathError);
      });
    });

    describe('when zeroForOne is false', () => {
      const zeroForOne = false;

      it('throws when sqrt price is zero', () => {
        expect(() => getNextSqrtPriceFromOutput(0n, 92849282n, 123252523n, zeroForOne)).toThrow(MathError);
      });

      it('throws when liquidity is zero', () => {
        expect(() => getNextSqrtPriceFromOutput(2535452n, 0n, 123252523n, zeroForOne)).toThrow(MathError);
      });

      it('returns sqrt price when amount is zero', async () => {
        const sqrtPrice = 2535452n;
        const liquidity = 645222n;
        const amount = 0n;

        const expected = await sqrtPriceMathMock
          .getNextSqrtPriceFromOutput(sqrtPrice, liquidity, amount, zeroForOne)
          .then((res: { toString(): string }) => BigInt(res.toString()));

        const actual = getNextSqrtPriceFromOutput(sqrtPrice, liquidity, amount, zeroForOne);

        expect(actual).toBe(expected);
      });

      it('works correctly when product does not overflow and denominator does not underflow', async () => {
        const sqrtPrice = 2535452n;
        const liquidity = 882n;
        const amount = 2n ** 80n;

        const expected = await sqrtPriceMathMock
          .getNextSqrtPriceFromOutput(sqrtPrice, liquidity, amount, zeroForOne)
          .then((res: { toString(): string }) => BigInt(res.toString()));

        const actual = getNextSqrtPriceFromOutput(sqrtPrice, liquidity, amount, zeroForOne);

        expect(actual).toBe(expected);
      });

      it('throws when product overflows', () => {
        expect(() => getNextSqrtPriceFromOutput(2n ** 100n, 2n ** 120n, 2n ** 160n - 1n, zeroForOne)).toThrow(MathError);
      });

      it('throws when denominator underflows', () => {
        expect(() => getNextSqrtPriceFromOutput(2n ** 160n - 2n ** 100n, 2n ** 127n, 2n ** 96n, zeroForOne)).toThrow(MathError);
      });
    });
  });
});
