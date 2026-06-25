import hre from 'hardhat';
import { Decimal } from 'decimal.js';
import { faker } from '@faker-js/faker';

import { pipFee } from '@libs/core/fee';
import { IntRange } from '@libs/core/intrange';
import { parseBigInt } from '@libs/core/parsers';
import { InsufficientLiquidityError } from '@libs/core/errors';

import { daiUsdc100 } from '../fixtures/dai-usdc-100';
import { daiWeth500 } from '../fixtures/dai-weth-500';
import { shibWeth10000 } from '../fixtures/shib-weth-10000';
import { usdcWeth3000 } from '../fixtures/usdc-weth-3000';

// These imports refer to the syncer app's internal classes.
// For contract-level tests, we import directly from the source.
// In production, this would be tested via the syncer app's own test suite.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Calc } = require('../../../apps/syncer/src/calc/calc.service');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { TickBook } = require('../../../apps/syncer/src/pool/tick-book.service');

const ITERATIONS = 5;

const assertEqualQuantities = (a: Decimal, b: Decimal): void => {
  const delta = a.div(b).minus(1).abs();
  expect(delta.lte(1e-6)).toBe(true);
};

const toTokens = (quantityDecimals: bigint, decimals: number): Decimal => {
  return new Decimal(quantityDecimals.toString()).mul('1e-' + decimals);
};

describe('Calc', () => {
  let UniswapV3PoolMock: { deploy(fee: bigint, tickSpacing: number): Promise<unknown> };

  beforeAll(async () => {
    Decimal.set({ precision: 128, rounding: Decimal.ROUND_DOWN });
    UniswapV3PoolMock = await hre.ethers.getContractFactory('UniswapV3PoolMock');
  });

  for (const data of [daiUsdc100, daiWeth500, usdcWeth3000, shibWeth10000]) {
    describe(data.name, () => {
      let poolMock: unknown;
      let calcs: unknown[];

      beforeAll(async () => {
        const { token0, token1, tickSpacing, liquidity, sqrtPrice, tick, ticks } = data;
        const fee = BigInt(pipFee(data.fee));

        poolMock = await (UniswapV3PoolMock as { deploy(...args: unknown[]): Promise<unknown> }).deploy(fee, tickSpacing);

        const poolInitPromise = (poolMock as { init(...args: unknown[]): Promise<void> }).init(tick, sqrtPrice, liquidity);
        const tickSyncPromises = ticks.map(async (tickLiquidity) => {
          await (poolMock as { sync(...args: unknown[]): Promise<void> }).sync(tickLiquidity.tick, tickLiquidity.liquidityNet);
        });

        await Promise.all([poolInitPromise, ...tickSyncPromises]);

        const tickRange = new IntRange(data.tickRange[0], data.tickRange[1]);
        const tickBook = new TickBook(tickSpacing).init(0, tick, sqrtPrice, liquidity, ticks, tickRange);

        const calc0 = new Calc(token0, token1, fee, tickBook);
        const calc1 = new Calc(token1, token0, fee, tickBook);
        calcs = [calc0, calc1];
      });

      for (const direction of [0, 1]) {
        const zeroForOne = !direction;
        const { token0, token1 } = data;
        const [tokenSell, tokenBuy] = zeroForOne ? [token0, token1] : [token1, token0];

        describe(`${tokenSell.symbol} > ${tokenBuy.symbol}`, () => {
          describe('calcBuy', () => {
            for (let i = 0; i < ITERATIONS; i++) {
              const quantitySellDecimals = faker.datatype.bigInt({
                min: 0n,
                max: data.limits[direction] * 10n ** BigInt(tokenSell.decimals),
              });
              const quantitySell = toTokens(quantitySellDecimals, tokenSell.decimals);

              it(`${quantitySell} ${tokenSell.symbol}`, async () => {
                const calc = calcs[direction] as { calcBuy(q: Decimal): Decimal };

                const expected = await (poolMock as { calcBuy(z: boolean, q: bigint): Promise<unknown> })
                  .calcBuy(zeroForOne, quantitySellDecimals)
                  .then(parseBigInt)
                  .then((quantityDecimals: bigint) => toTokens(quantityDecimals, tokenBuy.decimals));

                const actual = calc.calcBuy(quantitySell);

                assertEqualQuantities(actual, expected);
              });
            }

            it('throws when liquidity is insufficient', () => {
              const calc = calcs[direction] as { calcBuy(q: Decimal): Decimal };
              const quantitySell = new Decimal('1e40');

              expect(() => calc.calcBuy(quantitySell)).toThrow(InsufficientLiquidityError);
            });
          });

          describe('calcSell', () => {
            for (let i = 0; i < ITERATIONS; i++) {
              const quantityBuyDecimals = faker.datatype.bigInt({
                min: 0n,
                max: data.limits[direction ^ 1] * 10n ** BigInt(tokenBuy.decimals),
              });
              const quantityBuy = toTokens(quantityBuyDecimals, tokenBuy.decimals);

              it(`${quantityBuy} ${tokenBuy.symbol}`, async () => {
                const calc = calcs[direction] as { calcSell(q: Decimal): Decimal };

                const expected = await (poolMock as { calcSell(z: boolean, q: bigint): Promise<unknown> })
                  .calcSell(zeroForOne, quantityBuyDecimals)
                  .then(parseBigInt)
                  .then((quantityDecimals: bigint) => toTokens(quantityDecimals, tokenSell.decimals));

                const actual = calc.calcSell(quantityBuy);

                assertEqualQuantities(actual, expected);
              });
            }

            it('throws when liquidity is insufficient', () => {
              const calc = calcs[direction] as { calcSell(q: Decimal): Decimal };
              const quantityBuy = new Decimal('1e40');

              expect(() => calc.calcSell(quantityBuy)).toThrow(InsufficientLiquidityError);
            });
          });
        });
      }
    });
  }
});
