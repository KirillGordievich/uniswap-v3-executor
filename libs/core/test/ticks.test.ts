import {
  getCompressedTick,
  getFirstTickInTickWord,
  getLastTickInTickWord,
  getTickSpacingFromFee,
  getTickWord,
  getUncompressedTick,
} from '../src/ticks';

describe('ticks', () => {
  describe('getTickSpacingFromFee', () => {
    it('works correctly', () => {
      const entries: [number, number][] = [
        [0.0001, 1],
        [0.0005, 10],
        [0.003, 60],
        [0.01, 200],
      ];

      for (const [fee, tickSpacing] of entries) {
        expect(getTickSpacingFromFee(fee)).toBe(tickSpacing);
      }
    });
  });

  describe('getCompressedTick', () => {
    it('works correctly', () => {
      expect(getCompressedTick(360, 60)).toBe(6);
      expect(getCompressedTick(365, 60)).toBe(6);
    });
  });

  describe('getUncompressedTick', () => {
    it('works correctly', () => {
      expect(getUncompressedTick(6, 60)).toBe(360);
      expect(getUncompressedTick(7, 60)).toBe(420);
    });
  });

  describe('getTickWord', () => {
    it('works correctly', () => {
      expect(getTickWord(2979)).toBe(11);
    });
  });

  describe('getFirstTickInTickWord', () => {
    it('works correctly', () => {
      expect(getFirstTickInTickWord(11)).toBe(2816);
    });
  });

  describe('getLastTickInTickWord', () => {
    it('works correctly', () => {
      expect(getLastTickInTickWord(11)).toBe(3071);
    });
  });
});
