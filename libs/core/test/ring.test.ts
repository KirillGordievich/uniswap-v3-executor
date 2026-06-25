import { Ring } from '../src/ring';

describe('Ring', () => {
  describe('ctor', () => {
    it('works without args', () => {
      const ring = new Ring<number>();
      expect(ring.list()).toEqual([]);
    });

    it('works with args', () => {
      const ring = new Ring<number>(2, 5, 1);
      expect(ring.list()).toEqual([2, 5, 1]);
    });
  });

  describe('size', () => {
    it('works properly', () => {
      const ring = new Ring<number>(3, 1, 0);
      expect(ring.size()).toBe(3);
    });
  });

  describe('list', () => {
    it('works properly', () => {
      const ring = new Ring<number>(3, 1, 0);
      expect(ring.list()).toEqual([3, 1, 0]);
      ring.shift().shift();
      expect(ring.list()).toEqual([0, 3, 1]);
    });
  });

  describe('has', () => {
    it('returns true when item is in the queue', () => {
      const ring = new Ring<number>(3, 1, 0);
      expect(ring.has(1)).toBe(true);
    });

    it('returns false when item is not in the queue', () => {
      const ring = new Ring<number>(3, 1, 0);
      expect(ring.has(5)).toBe(false);
    });
  });

  describe('shift', () => {
    it('does not have effect when queue is empty', () => {
      const ring = new Ring<number>();
      expect(ring.list()).toEqual([]);
      ring.shift();
      expect(ring.list()).toEqual([]);
    });

    it('shifts the queue to the next item', () => {
      const ring = new Ring<number>(2, 5, 9);
      expect(ring.list()).toEqual([2, 5, 9]);
      ring.shift();
      expect(ring.list()).toEqual([5, 9, 2]);
      ring.shift();
      expect(ring.list()).toEqual([9, 2, 5]);
      ring.shift();
      expect(ring.list()).toEqual([2, 5, 9]);
    });
  });

  describe('unshift', () => {
    it('does not have effect when queue is empty', () => {
      const ring = new Ring<number>();
      expect(ring.list()).toEqual([]);
      ring.unshift();
      expect(ring.list()).toEqual([]);
    });

    it('shifts the queue to the previous item', () => {
      const ring = new Ring<number>(2, 5, 9);
      expect(ring.list()).toEqual([2, 5, 9]);
      ring.unshift();
      expect(ring.list()).toEqual([9, 2, 5]);
      ring.unshift();
      expect(ring.list()).toEqual([5, 9, 2]);
      ring.unshift();
      expect(ring.list()).toEqual([2, 5, 9]);
    });
  });

  describe('enqueue', () => {
    it('adds elements to the back of the queue', () => {
      const ring = new Ring<number>(3, 4);
      expect(ring.list()).toEqual([3, 4]);
      ring.enqueue(5, 3, 2);
      expect(ring.list()).toEqual([3, 4, 5, 3, 2]);
    });
  });

  describe('dequeue', () => {
    it('removes elements from the queue', () => {
      const ring = new Ring<number>(5, 2, 7);
      expect(ring.list()).toEqual([5, 2, 7]);
      ring.dequeue(2);
      expect(ring.list()).toEqual([5, 7]);
    });

    it('removes duplicates', () => {
      const ring = new Ring<number>(5, 2, 7).shift().enqueue(2, 7);
      expect(ring.list()).toEqual([2, 7, 5, 2, 7]);
      ring.dequeue(2);
      expect(ring.list()).toEqual([7, 5, 7]);
    });
  });

  describe('peek', () => {
    it('returns the first out item in the queue', () => {
      const ring = new Ring<number>(5, 2, 7);
      expect(ring.peek()).toBe(5);
    });

    it('returns undefined when the queue is empty', () => {
      const ring = new Ring<number>();
      expect(ring.peek()).toBeUndefined();
    });
  });

  describe('pop', () => {
    it('removes the first out item from the queue and returns it', () => {
      const ring = new Ring<number>(5, 2, 7);
      expect(ring.pop()).toBe(5);
      expect(ring.list()).toEqual([2, 7]);
    });

    it('returns undefined when the queue is empty', () => {
      const ring = new Ring<number>();
      expect(ring.pop()).toBeUndefined();
    });
  });

  describe('flush', () => {
    it('clears out the queue', () => {
      const ring = new Ring<number>(2, 3, 7);
      ring.flush();
      expect(ring.list()).toEqual([]);
    });
  });
});
