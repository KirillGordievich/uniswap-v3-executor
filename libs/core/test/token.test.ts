import { compareTokenAddresses, compareTokens } from '../src/token';

describe('token', () => {
  describe('compareTokenAddresses', () => {
    it('works with hex correctly', () => {
      const res = compareTokenAddresses(
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      );

      expect(res).toBe(-1);
    });

    it('works with buffer correctly', () => {
      const res = compareTokenAddresses(
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        Buffer.from('6B175474E89094C44Da98b954EedeAC495271d0F', 'hex'),
      );

      expect(res).toBe(1);
    });

    it('detects equal addresses correctly', () => {
      const res = compareTokenAddresses(
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        Buffer.from('A0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 'hex'),
      );

      expect(res).toBe(0);
    });
  });

  describe('compareTokens', () => {
    it('compares tokens by addresses', () => {
      const a = { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 4, symbol: '', name: '' };
      const b = { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 4, symbol: '', name: '' };

      expect(compareTokens(a, b)).toBe(-1);
    });
  });
});
