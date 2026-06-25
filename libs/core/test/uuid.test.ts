import { isUuid } from '../src/uuid';

describe('uuid', () => {
  describe('isUuid', () => {
    it('determines UUID correctly', () => {
      const uuid = '79a026fe-cbe7-48fa-af7b-06a9c74a02ab';
      expect(isUuid(uuid)).toBe(true);
    });

    it('ignores hyphenation', () => {
      const uuid = '79a026fecbe748faaf7b-06a9c74a02ab';
      expect(isUuid(uuid)).toBe(true);
    });

    it('is case insensitive', () => {
      const uuid = '79A026FECBE748FAAF7B06A9C74A02AB';
      expect(isUuid(uuid)).toBe(true);
    });

    it('detects incorrect UUIDs', () => {
      const uuid = '79a026fe-cbe7-48fa-af7b';
      expect(isUuid(uuid)).toBe(false);
    });
  });
});
