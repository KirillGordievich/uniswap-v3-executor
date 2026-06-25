import { IntRange } from '../src/intrange';

describe('IntRange', () => {
  describe('ctor', () => {
    it('accepts one value', () => {
      const center = 3;
      const intrange = new IntRange(center);
      expect(intrange.lower).toBe(center);
      expect(intrange.upper).toBe(center);
    });

    it('accepts two values', () => {
      const lower = 3;
      const upper = 7;
      const intrange = new IntRange(lower, upper);
      expect(intrange.lower).toBe(lower);
      expect(intrange.upper).toBe(upper);
    });
  });

  describe('clone', () => {
    it('clones range', () => {
      const a = new IntRange(5, 7);
      const b = a.clone();
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });

  describe('valid', () => {
    it('returns true when range is valid', () => {
      const intrange = new IntRange(3, 7);
      expect(intrange.valid()).toBe(true);
    });

    it('returns false when range is invalid', () => {
      const intrange = new IntRange(7, 3);
      expect(intrange.valid()).toBe(false);
    });
  });

  describe('size', () => {
    it('works correctly', () => {
      const intrange = new IntRange(3, 7);
      expect(intrange.size()).toBe(4);
    });
  });

  describe('singleton', () => {
    it('returns true when range has no size', () => {
      const intrange = new IntRange(3);
      expect(intrange.singleton()).toBe(true);
    });

    it('returns false when range is proper', () => {
      const intrange = new IntRange(3, 5);
      expect(intrange.singleton()).toBe(false);
    });
  });

  describe('equals', () => {
    it('returns true when ranges are identical', () => {
      const a = new IntRange(4, 7);
      const b = new IntRange(4, 7);
      expect(a.equals(b)).toBe(true);
    });

    it('returns false when ranges are different', () => {
      const a = new IntRange(4, 7);
      const b = new IntRange(5, 7);
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('includes', () => {
    it('returns true when range includes another', () => {
      const a = new IntRange(1, 10);
      const b = new IntRange(4, 7);
      expect(a.includes(b)).toBe(true);
    });

    it('returns false when range does not include a part of another', () => {
      const a = new IntRange(1, 5);
      const b = new IntRange(4, 7);
      expect(a.includes(b)).toBe(false);
    });
  });

  describe('contains', () => {
    it('returns true when range contains a number', () => {
      const intrange = new IntRange(1, 10);
      expect(intrange.contains(8)).toBe(true);
    });

    it('returns false when range does not contain a number', () => {
      const intrange = new IntRange(1, 10);
      expect(intrange.contains(-2)).toBe(false);
    });
  });

  describe('overlaps', () => {
    it('returns true when range overlaps with another', () => {
      const a = new IntRange(1, 10);
      const b = new IntRange(7, 12);
      expect(a.overlaps(b)).toBe(true);
    });

    it('returns false when ranges do not overlap', () => {
      const a = new IntRange(1, 10);
      const b = new IntRange(-5, -3);
      expect(a.overlaps(b)).toBe(false);
    });
  });

  describe('difference', () => {
    it('returns this range when two ranges do not overlap', () => {
      const a = new IntRange(1, 10);
      const b = new IntRange(-5, -3);
      expect(a.difference(b)).toEqual([a]);
    });

    it('returns nothing when other range contains this one', () => {
      const a = new IntRange(1, 10);
      const b = new IntRange(-5, 30);
      expect(a.difference(b)).toEqual([]);
    });

    it('returns one range when this includes another and one bound is equal', () => {
      const a = new IntRange(1, 10);
      const b = new IntRange(1, 8);
      const c = new IntRange(9, 10);
      expect(a.difference(b)).toEqual([c]);
    });

    it('returns two ranges when this includes another and bounds are different', () => {
      const a = new IntRange(1, 10);
      const b = new IntRange(3, 8);
      const c = new IntRange(1, 2);
      const d = new IntRange(9, 10);
      expect(a.difference(b)).toEqual([c, d]);
    });

    it('returns one range when this overlaps with another', () => {
      const a = new IntRange(1, 10);
      const b = new IntRange(-3, 8);
      const c = new IntRange(9, 10);
      expect(a.difference(b)).toEqual([c]);
    });
  });

  describe('expandLeft', () => {
    it('works correctly', () => {
      const intrange = new IntRange(3, 6).expandLeft(2);
      expect(intrange.lower).toBe(1);
      expect(intrange.upper).toBe(6);
    });
  });

  describe('expandRight', () => {
    it('works correctly', () => {
      const intrange = new IntRange(3, 6).expandRight(2);
      expect(intrange.lower).toBe(3);
      expect(intrange.upper).toBe(8);
    });
  });

  describe('expandBilateral', () => {
    it('works correctly', () => {
      const intrange = new IntRange(3, 6).expandBilateral(2);
      expect(intrange.lower).toBe(1);
      expect(intrange.upper).toBe(8);
    });
  });
});
