import { percentFee, pipFee } from '../src/fee';

describe('fee', () => {
  describe('pipFee', () => {
    it('converts percent fee into pip fee', () => {
      expect(pipFee(0.0001)).toBe(100);
    });
  });

  describe('percentFee', () => {
    it('converts pip fee into percent fee', () => {
      expect(percentFee(3000)).toBe(0.003);
    });
  });
});
