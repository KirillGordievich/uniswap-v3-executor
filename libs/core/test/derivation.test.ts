import { derivePoolAddress } from '../src/derivation';

const data = [
  {
    token0Address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    token1Address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    fee: 100,
    poolAddress: '0x5777d92f208679db4b9778590fa3cab3ac9e2168',
  },
  {
    token0Address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    token1Address: '0xbbaec992fc2d637151daf40451f160bf85f3c8c1',
    fee: 500,
    poolAddress: '0x8ee3cc8e29e72e03c4ab430d7b7e08549f0c71cc',
  },
  {
    token0Address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    token1Address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    fee: 3000,
    poolAddress: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8',
  },
  {
    token0Address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    token1Address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    fee: 10000,
    poolAddress: '0x7bea39867e4169dbe237d55c8242a8f2fcdcc387',
  },
];

describe('derivation', () => {
  describe('derivePoolAddress', () => {
    it('derives pool address correctly', () => {
      for (const item of data) {
        const { token0Address, token1Address, fee, poolAddress } = item;
        const actual = derivePoolAddress(token0Address, token1Address, fee);

        expect(actual).toBe(poolAddress);
      }
    });
  });
});
