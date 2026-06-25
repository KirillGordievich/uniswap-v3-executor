import { LVC } from '../src/lvc';

describe('lvc', () => {
  describe('get', () => {
    it('gets an added item', () => {
      const lvc = new LVC<string>(2);
      lvc.add(1, 'foo');
      expect(lvc.get(1)).toBe('foo');
    });

    it('returns undefined if not found', () => {
      const lvc = new LVC<string>(2);
      lvc.add(2, 'foo');
      expect(lvc.get(1)).toBeUndefined();
    });
  });

  describe('highest', () => {
    it('gets the item with the highest order', () => {
      const lvc = new LVC<string>(2);
      lvc.add(1, 'foo');
      lvc.add(2, 'bar');
      expect(lvc.highest()).toBe('bar');
    });

    it('returns undefined if no items found', () => {
      const lvc = new LVC<string>(2);
      expect(lvc.highest()).toBeUndefined();
    });
  });

  describe('lowest', () => {
    it('gets the item with the lowest order', () => {
      const lvc = new LVC<string>(2);
      lvc.add(1, 'foo');
      lvc.add(2, 'bar');
      expect(lvc.lowest()).toBe('foo');
    });

    it('returns undefined if no items found', () => {
      const lvc = new LVC<string>(2);
      expect(lvc.lowest()).toBeUndefined();
    });
  });

  describe('add', () => {
    it('adds new item', () => {
      const lvc = new LVC<string>(2);
      lvc.add(1, 'foo');
      expect(lvc.get(1)).toBe('foo');
    });

    it('replaces item if added', () => {
      const lvc = new LVC<string>(2);
      lvc.add(1, 'foo');
      lvc.add(1, 'bar');
      expect(lvc.get(1)).toBe('bar');
    });

    it('removes lowest order item if size is reached', () => {
      const lvc = new LVC<string>(2);
      lvc.add(1, 'foo');
      lvc.add(2, 'bar');
      lvc.add(3, 'baz');
      expect(lvc.highest()).toBe('baz');
      expect(lvc.lowest()).toBe('bar');
    });
  });

  describe('remove', () => {
    it('removes item by its order', () => {
      const lvc = new LVC<string>(2);
      lvc.add(1, 'foo');
      lvc.add(2, 'bar');
      lvc.remove(2);
      expect(lvc.highest()).toBe('foo');
    });
  });
});
