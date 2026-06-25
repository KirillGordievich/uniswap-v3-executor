export function hexToBuffer(hex: string): Buffer {
  const raw = hex.replace(/^0[xX]/, '');
  const normalized = raw.length % 2 ? '0' + raw : raw;

  return Buffer.from(normalized, 'hex');
}

export function bufferToHex(buffer: Buffer | Uint8Array, prefixed = true): string {
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const raw = buf.toString('hex');

  return prefixed ? '0x' + raw : raw;
}

export function integerToBuffer(integer: bigint | number): Buffer {
  const raw = integer.toString(16);
  const hex = raw.length % 2 ? '0' + raw : raw;

  return Buffer.from(hex, 'hex');
}

export function bufferToInteger<T extends number | bigint>(buffer: Buffer, ctor: (hex: string) => T): T {
  const hex = '0x' + buffer.toString('hex');

  return ctor(hex);
}

export function uuidToBuffer(uuid: string): Buffer {
  const hex = uuid.replace(/-/g, '');

  return Buffer.from(hex, 'hex');
}

export function bufferToUuid(buffer: Buffer): string {
  const groups: string[] = [];
  let offset = 0;

  for (const length of [4, 2, 2, 2, 6]) {
    const raw = buffer.slice(offset, offset + length);
    const group = raw.toString('hex');

    offset += length;
    groups.push(group);
  }

  return groups.join('-');
}

export function booleanToBuffer(bool: boolean): Buffer {
  return Buffer.from([+bool]);
}

export function bufferToBoolean([byte]: Buffer): boolean {
  return !!byte;
}

export function uint24ToBuffer(value: number): Buffer {
  const bytes = 3;
  const buffer = Buffer.alloc(bytes);

  for (let i = 0; i < bytes; i++) {
    buffer[i] = value & 0xff;
    value >>>= 8;
  }

  return buffer.reverse();
}
