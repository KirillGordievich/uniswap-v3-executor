import { decodePathPool, encodePath, getPathLength, reversePath } from '../src/path';

describe('path', () => {
  describe('encodePath', () => {
    it('works correctly with one pool paths', () => {
      const path = ['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 100, '0xdac17f958d2ee523a2206206994597c13d831ec7'];

      const hex = 'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000064dac17f958d2ee523a2206206994597c13d831ec7';

      expect(encodePath(path).toString('hex')).toBe(hex);
    });

    it('works correctly with multi pool paths', () => {
      const path = [
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        100,
        '0xdac17f958d2ee523a2206206994597c13d831ec7',
        500,
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      ];

      const hex =
        'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000064dac17f958d2ee523a2206206994597c13d831ec70001f4c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

      expect(encodePath(path).toString('hex')).toBe(hex);
    });
  });

  describe('reversePath', () => {
    it('works correctly', () => {
      const path = [
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        100,
        '0xdac17f958d2ee523a2206206994597c13d831ec7',
        500,
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      ];

      expect(reversePath(path)).toEqual([...path].reverse());
    });
  });

  describe('getPathLength', () => {
    it('works correctly', () => {
      const path = [
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        100,
        '0xdac17f958d2ee523a2206206994597c13d831ec7',
        500,
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      ];

      expect(getPathLength(path)).toBe(2);
    });
  });

  describe('decodePathPool', () => {
    it('works correctly with first pools', () => {
      const path = [
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        100,
        '0xdac17f958d2ee523a2206206994597c13d831ec7',
        500,
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      ];

      expect(decodePathPool(path, 0)).toEqual({
        tokenSellAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        feePips: 100,
        tokenBuyAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      });
    });

    it('works correctly with pools in the middle', () => {
      const path = [
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        100,
        '0xdac17f958d2ee523a2206206994597c13d831ec7',
        500,
        '0xc02aa100a39b223fe8d0a0e5c4f27ead9083c756cc2',
      ];

      expect(decodePathPool(path, 1)).toEqual({
        tokenSellAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        feePips: 500,
        tokenBuyAddress: '0xc02aa100a39b223fe8d0a0e5c4f27ead9083c756cc2',
      });
    });
  });
});
