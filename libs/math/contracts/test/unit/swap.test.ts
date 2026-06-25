import hre from 'hardhat';

import { computeSwapStepBuy, computeSwapStepSell } from '@libs/math/swap';
import { parseInteger } from '../helpers';

interface SwapStepResponse {
  sqrtPrice: { toString(): string };
  quantitySell: { toString(): string };
  quantityBuy: { toString(): string };
  quantityFee: { toString(): string };
}

function parseResponse(response: SwapStepResponse): {
  sqrtPrice: bigint;
  quantitySell: bigint;
  quantityBuy: bigint;
  quantityFee: bigint;
} {
  return {
    sqrtPrice: parseInteger(response.sqrtPrice),
    quantitySell: parseInteger(response.quantitySell),
    quantityBuy: parseInteger(response.quantityBuy),
    quantityFee: parseInteger(response.quantityFee),
  };
}

describe('swap math', () => {
  let swapMathMock: ReturnType<typeof hre.ethers.Contract>;

  beforeAll(async () => {
    swapMathMock = await hre.ethers.getContractFactory('SwapMathMock').then((factory: { deploy(): Promise<unknown> }) => factory.deploy());
  });

  describe('computeSwapStepBuy', () => {
    it('calculates correctly when zero for one and does not reach target price', async () => {
      const sqrtPriceCurrent = 2765677496429857528965n;
      const sqrtPriceTarget = 2765677490429857508930n;
      const liquidity = 9298289375982956276515n;
      const quantitySellRemaining = 29845665276587376937n;
      const fee = 10000n;

      const expected = await swapMathMock
        .computeSwapStepBuy(sqrtPriceCurrent, sqrtPriceTarget, liquidity, quantitySellRemaining, fee)
        .then(parseResponse);

      const actual = computeSwapStepBuy(sqrtPriceCurrent, sqrtPriceTarget, liquidity, quantitySellRemaining, fee);

      expect(actual).toEqual(expected);
    });

    it('calculates correctly when zero for one and reaches target price', async () => {
      const sqrtPriceCurrent = 2765677496429857528965n;
      const sqrtPriceTarget = 2765677496409807528065n;
      const liquidity = 9298289375982956276515n;
      const quantitySellRemaining = 29845665276587376937n;
      const fee = 3000n;

      const expected = await swapMathMock
        .computeSwapStepBuy(sqrtPriceCurrent, sqrtPriceTarget, liquidity, quantitySellRemaining, fee)
        .then(parseResponse);

      const actual = computeSwapStepBuy(sqrtPriceCurrent, sqrtPriceTarget, liquidity, quantitySellRemaining, fee);

      expect(actual).toEqual(expected);
    });

    it('calculates correctly when one for zero and does not reach target price', async () => {
      const sqrtPriceCurrent = 2765677496429857528965n;
      const sqrtPriceTarget = 52765679996459857528965n;
      const liquidity = 9298289375982956276515n;
      const quantitySellRemaining = 298455873787n;
      const fee = 500n;

      const expected = await swapMathMock
        .computeSwapStepBuy(sqrtPriceCurrent, sqrtPriceTarget, liquidity, quantitySellRemaining, fee)
        .then(parseResponse);

      const actual = computeSwapStepBuy(sqrtPriceCurrent, sqrtPriceTarget, liquidity, quantitySellRemaining, fee);

      expect(actual).toEqual(expected);
    });

    it('calculates correctly when one for zero and reaches target price', async () => {
      const sqrtPriceCurrent = 2765677496429857528965n;
      const sqrtPriceTarget = 2765677496429957528965n;
      const liquidity = 9298289375982956276515n;
      const quantitySellRemaining = 29845665276587376937n;
      const fee = 100n;

      const expected = await swapMathMock
        .computeSwapStepBuy(sqrtPriceCurrent, sqrtPriceTarget, liquidity, quantitySellRemaining, fee)
        .then(parseResponse);

      const actual = computeSwapStepBuy(sqrtPriceCurrent, sqrtPriceTarget, liquidity, quantitySellRemaining, fee);

      expect(actual).toEqual(expected);
    });
  });

  describe('computeSwapStepSell', () => {
    it('calculates correctly when zero for one and does not reach target price', async () => {
      const sqrtPriceCurrent = 2765677496429857528965n;
      const sqrtPriceTarget = 429857508930n;
      const liquidity = 9298289375982956276515n;
      const quantitySellRemaining = 298487376937n;
      const fee = 10000n;

      const expected = await swapMathMock
        .computeSwapStepSell(sqrtPriceCurrent, sqrtPriceTarget, liquidity, quantitySellRemaining, fee)
        .then(parseResponse);

      const actual = computeSwapStepSell(sqrtPriceCurrent, sqrtPriceTarget, liquidity, quantitySellRemaining, fee);

      expect(actual).toEqual(expected);
    });

    it('calculates correctly when zero for one and reaches target price', async () => {
      const sqrtPriceCurrent = 2765677496429857528965n;
      const sqrtPriceTarget = 2765677496409807528065n;
      const liquidity = 9298289375982956276515n;
      const quantitySellRemaining = 29845665276587376937n;
      const fee = 3000n;

      const expected = await swapMathMock
        .computeSwapStepSell(sqrtPriceCurrent, sqrtPriceTarget, liquidity, quantitySellRemaining, fee)
        .then(parseResponse);

      const actual = computeSwapStepSell(sqrtPriceCurrent, sqrtPriceTarget, liquidity, quantitySellRemaining, fee);

      expect(actual).toEqual(expected);
    });

    it('calculates correctly when one for zero and does not reach target price', async () => {
      const sqrtPriceCurrent = 2765677496429857528965n;
      const sqrtPriceTarget = 52765679996459857528965n;
      const liquidity = 9298289375982956276515n;
      const quantitySellRemaining = 298455873787n;
      const fee = 500n;

      const expected = await swapMathMock
        .computeSwapStepSell(sqrtPriceCurrent, sqrtPriceTarget, liquidity, quantitySellRemaining, fee)
        .then(parseResponse);

      const actual = computeSwapStepSell(sqrtPriceCurrent, sqrtPriceTarget, liquidity, quantitySellRemaining, fee);

      expect(actual).toEqual(expected);
    });

    it('calculates correctly when one for zero and reaches target price', async () => {
      const sqrtPriceCurrent = 2765677496429857528965n;
      const sqrtPriceTarget = 2765677496429957528965n;
      const liquidity = 9298289375982956276515n;
      const quantitySellRemaining = 29845665276587376937n;
      const fee = 100n;

      const expected = await swapMathMock
        .computeSwapStepSell(sqrtPriceCurrent, sqrtPriceTarget, liquidity, quantitySellRemaining, fee)
        .then(parseResponse);

      const actual = computeSwapStepSell(sqrtPriceCurrent, sqrtPriceTarget, liquidity, quantitySellRemaining, fee);

      expect(actual).toEqual(expected);
    });
  });
});
