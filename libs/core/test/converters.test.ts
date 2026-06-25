import {
  booleanToBuffer,
  bufferToBoolean,
  bufferToHex,
  bufferToInteger,
  bufferToUuid,
  hexToBuffer,
  integerToBuffer,
  uint24ToBuffer,
  uuidToBuffer,
} from '../src/converters';

describe('converters', () => {
  describe('hexToBuffer', () => {
    it('strips away the prefix', () => {
      const hex = '0xab0f';
      const buffer = Buffer.from([0xab, 0x0f]);
      expect(hexToBuffer(hex).equals(buffer)).toBe(true);
    });

    it('is case insensitive', () => {
      const hex = '0XAB0F';
      const buffer = Buffer.from([0xab, 0x0f]);
      expect(hexToBuffer(hex).equals(buffer)).toBe(true);
    });

    it('works with shortened strings', () => {
      const hex = 'ab0';
      const buffer = Buffer.from([0x0a, 0xb0]);
      expect(hexToBuffer(hex).equals(buffer)).toBe(true);
    });

    it('works with proper strings', () => {
      const hex = '6ab0';
      const buffer = Buffer.from([0x6a, 0xb0]);
      expect(hexToBuffer(hex).equals(buffer)).toBe(true);
    });
  });

  describe('bufferToHex', () => {
    it('adds prefix when needed', () => {
      const buffer = Buffer.from([0x78, 0x5d]);
      const hex = '0x785d';
      expect(bufferToHex(buffer)).toBe(hex);
    });

    it('strips prefix when needed', () => {
      const buffer = Buffer.from([0x78, 0x5d]);
      const hex = '785d';
      expect(bufferToHex(buffer, false)).toBe(hex);
    });
  });

  describe('integerToBuffer', () => {
    it('works with leading zero numbers', () => {
      const integer = 0x7bc;
      const buffer = Buffer.from([0x07, 0xbc]);
      expect(integerToBuffer(integer).equals(buffer)).toBe(true);
    });

    it('works with other numbers', () => {
      const integer = 0x37bc;
      const buffer = Buffer.from([0x37, 0xbc]);
      expect(integerToBuffer(integer).equals(buffer)).toBe(true);
    });

    it('works with leading zero bigints', () => {
      const integer = 0x7bcn;
      const buffer = Buffer.from([0x07, 0xbc]);
      expect(integerToBuffer(integer).equals(buffer)).toBe(true);
    });

    it('works with other bigints', () => {
      const integer = 0x37bcn;
      const buffer = Buffer.from([0x37, 0xbc]);
      expect(integerToBuffer(integer).equals(buffer)).toBe(true);
    });
  });

  describe('bufferToInteger', () => {
    it('works with numbers', () => {
      const integer = 0x7bc;
      const buffer = Buffer.from([0x07, 0xbc]);
      expect(bufferToInteger(buffer, Number)).toBe(integer);
    });

    it('works with bigints', () => {
      const integer = 0x67bcn;
      const buffer = Buffer.from([0x67, 0xbc]);
      expect(bufferToInteger(buffer, BigInt)).toBe(integer);
    });
  });

  describe('uuidToBuffer', () => {
    it('works with proper UUIDs', () => {
      const uuid = '4ee069fa-2c7c-4835-9d86-e51a878d4463';
      const buffer = Buffer.from([
        0x4e, 0xe0, 0x69, 0xfa, 0x2c, 0x7c, 0x48, 0x35, 0x9d, 0x86, 0xe5, 0x1a, 0x87, 0x8d, 0x44, 0x63,
      ]);
      expect(uuidToBuffer(uuid).equals(buffer)).toBe(true);
    });

    it('is insensitive to hyphenation', () => {
      const uuid = '4ee069fa2c7c-48359d86e51a878d4463';
      const buffer = Buffer.from([
        0x4e, 0xe0, 0x69, 0xfa, 0x2c, 0x7c, 0x48, 0x35, 0x9d, 0x86, 0xe5, 0x1a, 0x87, 0x8d, 0x44, 0x63,
      ]);
      expect(uuidToBuffer(uuid).equals(buffer)).toBe(true);
    });

    it('is case insensitive', () => {
      const uuid = '4EE069FA-2C7C-4835-9D86-E51A878D4463';
      const buffer = Buffer.from([
        0x4e, 0xe0, 0x69, 0xfa, 0x2c, 0x7c, 0x48, 0x35, 0x9d, 0x86, 0xe5, 0x1a, 0x87, 0x8d, 0x44, 0x63,
      ]);
      expect(uuidToBuffer(uuid).equals(buffer)).toBe(true);
    });
  });

  describe('bufferToUuid', () => {
    it('works properly', () => {
      const uuid = '4ee069fa-2c7c-4835-9d86-e51a878d4463';
      const buffer = Buffer.from([
        0x4e, 0xe0, 0x69, 0xfa, 0x2c, 0x7c, 0x48, 0x35, 0x9d, 0x86, 0xe5, 0x1a, 0x87, 0x8d, 0x44, 0x63,
      ]);
      expect(bufferToUuid(buffer)).toBe(uuid);
    });
  });

  describe('booleanToBuffer', () => {
    it('works with true', () => {
      const buffer = Buffer.from([1]);
      expect(booleanToBuffer(true).equals(buffer)).toBe(true);
    });

    it('works with false', () => {
      const buffer = Buffer.from([0]);
      expect(booleanToBuffer(false).equals(buffer)).toBe(true);
    });
  });

  describe('bufferToBoolean', () => {
    it('works with true', () => {
      const buffer = Buffer.from([1]);
      expect(bufferToBoolean(buffer)).toBe(true);
    });

    it('works with false', () => {
      const buffer = Buffer.from([0]);
      expect(bufferToBoolean(buffer)).toBe(false);
    });
  });

  describe('uint24ToBuffer', () => {
    it('works correctly', () => {
      const uint = 0xfc2859;
      const buffer = Buffer.from([0xfc, 0x28, 0x59]);
      expect(uint24ToBuffer(uint).equals(buffer)).toBe(true);
    });
  });
});
