import { hexToBuffer, uint24ToBuffer } from './converters';
import { Token } from './token';
import { pipFee } from './fee';

export type Path = Array<string | number>;

export type PathPool = {
  tokenSellAddress: string;
  feePips: number;
  tokenBuyAddress: string;
};

export function makePath(tokens: Token[], pools: { fee: number }[]): Path {
  const path: Path = [];

  let i: number;

  for (i = 0; i < tokens.length - 1; i++) {
    path.push(tokens[i].address);
    path.push(pipFee(pools[i].fee));
  }

  path.push(tokens[i].address);

  return path;
}

export function encodePath(path: Path): Buffer {
  let buffer = Buffer.from([]);

  for (let i = 0; i < path.length; i++) {
    const item = path[i];
    const chunk = i % 2 ? uint24ToBuffer(item as number) : hexToBuffer(item as string);
    buffer = Buffer.concat([buffer, chunk]);
  }

  return buffer;
}

export function reversePath(path: Path): Path {
  return [...path].reverse();
}

export function getPathLength(path: Path): number {
  return (path.length - 1) / 2;
}

export function decodePathPool(path: Path, index: number): PathPool {
  const [tokenSellAddress, feePips, tokenBuyAddress] = path.slice(index * 2);

  return { tokenSellAddress, feePips, tokenBuyAddress } as PathPool;
}
