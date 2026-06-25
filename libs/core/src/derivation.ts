import createKeccakHash from 'keccak';
import { bufferToHex, hexToBuffer, uint24ToBuffer } from './converters';
import { UNISWAP_V3_FACTORY_ADDRESS, UNISWAP_V3_INIT_CODE_HASH } from './constants';

const prefix = hexToBuffer('ff');
const factoryAddress = hexToBuffer(UNISWAP_V3_FACTORY_ADDRESS);
const initCodeHash = hexToBuffer(UNISWAP_V3_INIT_CODE_HASH);
const addressPadding = Buffer.alloc(12);
const feePadding = Buffer.alloc(29);

export function derivePoolAddress(token0Address: string, token1Address: string, fee: number): string {
  const saltInput = Buffer.concat([
    addressPadding,
    hexToBuffer(token0Address),
    addressPadding,
    hexToBuffer(token1Address),
    feePadding,
    uint24ToBuffer(fee),
  ]);

  const salt = createKeccakHash('keccak256').update(saltInput).digest();
  const addressInput = Buffer.concat([prefix, factoryAddress, salt, initCodeHash]);
  const address = createKeccakHash('keccak256').update(addressInput).digest().subarray(12);

  return bufferToHex(address);
}
