import { randomBytes } from 'node:crypto';

export const randomAddress = (): string => '0x' + randomBytes(20).toString('hex');
