import createTree, { Tree } from 'functional-red-black-tree';

import {
  IntRange,
  getCompressedTick,
  getFirstTickInTickWord,
  getLastTickInTickWord,
  getTickWord,
  getUncompressedTick,
} from '@libs/core';

export type TickLiquidity = {
  tick: number;
  liquidityNet: bigint;
  liquidityGross: bigint;
};

export type TickNext = {
  tick: number;
  initialized: boolean;
};

export class TickBookService {
  private _blockNumber: number;
  private _liquidity: bigint;
  private _sqrtPrice: bigint;
  private _tick: number;
  private _tickRange: IntRange;
  private _tickSpacing: number;
  private _tickTree: Tree<number, TickLiquidity>;

  constructor(tickSpacing: number) {
    this._tickSpacing = tickSpacing;
    this._tickTree = createTree();
  }

  private updateTickLiquidity(tick: number, liquidityDelta: bigint, upper: boolean): void {
    const liquidityGrossDelta = liquidityDelta;
    const liquidityNetDelta = upper ? -liquidityDelta : liquidityDelta;

    let tickLiquidity = this._tickTree.get(tick);

    if (!tickLiquidity) {
      tickLiquidity = { tick, liquidityNet: liquidityNetDelta, liquidityGross: liquidityGrossDelta };
      this._tickTree = this._tickTree.insert(tick, tickLiquidity);

      return;
    }

    tickLiquidity.liquidityGross += liquidityGrossDelta;

    if (!tickLiquidity.liquidityGross) {
      this._tickTree = this._tickTree.remove(tick);

      return;
    }

    tickLiquidity.liquidityNet += liquidityNetDelta;
  }

  get blockNumber(): number {
    return this._blockNumber;
  }

  get tick(): number {
    return this._tick;
  }

  get sqrtPrice(): bigint {
    return this._sqrtPrice;
  }

  get liquidity(): bigint {
    return this._liquidity;
  }

  get tickRange(): IntRange {
    return this._tickRange;
  }

  init(
    blockNumber: number,
    tick: number,
    sqrtPrice: bigint,
    liquidity: bigint,
    tickLiquidities: TickLiquidity[],
    tickRange: IntRange,
  ): this {
    this._blockNumber = blockNumber;
    this._tick = tick;
    this._sqrtPrice = sqrtPrice;
    this._liquidity = liquidity;
    this.sync(tickLiquidities, tickRange);

    return this;
  }

  burn(blockNumber: number, tickRange: IntRange, liquidityDelta: bigint): this {
    this._blockNumber = blockNumber;

    const { lower, upper } = tickRange;

    if (this._tickRange.contains(lower)) {
      this.updateTickLiquidity(lower, -liquidityDelta, false);
    }

    if (this._tickRange.contains(upper)) {
      this.updateTickLiquidity(upper, -liquidityDelta, true);
    }

    return this;
  }

  clone(): TickBookService {
    const tickBook = new TickBookService(this._tickSpacing);

    tickBook._blockNumber = this._blockNumber;
    tickBook._liquidity = this._liquidity;
    tickBook._sqrtPrice = this._sqrtPrice;
    tickBook._tick = this._tick;
    tickBook._tickRange = this._tickRange?.clone();
    tickBook._tickTree = this._tickTree;

    return tickBook;
  }

  getLiquidityNet(tick: number): bigint | undefined {
    const liquidity = this._tickTree.get(tick);

    if (liquidity) {
      return liquidity.liquidityNet;
    }

    return undefined;
  }

  getNextTick(tick: number, zeroForOne: boolean): TickNext {
    const compressedTick = getCompressedTick(tick, this._tickSpacing);

    if (zeroForOne) {
      const compressedTickWord = getTickWord(compressedTick);
      const compressedTickMinimum = getFirstTickInTickWord(compressedTickWord);
      const tickMinimum = getUncompressedTick(compressedTickMinimum, this._tickSpacing);

      const minimum = Math.max(tickMinimum, this._tickRange.lower);

      const nextTick = this._tickTree.le(tick).key;
      const initialized = nextTick !== undefined && nextTick >= minimum;

      return { tick: initialized ? nextTick : minimum, initialized };
    } else {
      const compressedTickWord = getTickWord(compressedTick + 1);
      const compressedTickMaximum = getLastTickInTickWord(compressedTickWord);
      const tickMaximum = getUncompressedTick(compressedTickMaximum, this._tickSpacing);

      const maximum = Math.min(tickMaximum, this._tickRange.upper);

      const nextTick = this._tickTree.gt(tick).key;
      const initialized = nextTick !== undefined && nextTick <= maximum;

      return { tick: initialized ? nextTick : maximum, initialized };
    }
  }

  mint(blockNumber: number, tickRange: IntRange, liquidityDelta: bigint): this {
    this._blockNumber = blockNumber;

    const { lower, upper } = tickRange;

    if (this._tickRange.contains(lower)) {
      this.updateTickLiquidity(lower, liquidityDelta, false);
    }

    if (this._tickRange.contains(upper)) {
      this.updateTickLiquidity(upper, liquidityDelta, true);
    }

    return this;
  }

  swap(blockNumber: number, tick: number, sqrtPrice: bigint, liquidity: bigint): this {
    this._blockNumber = blockNumber;
    this._tick = tick;
    this._sqrtPrice = sqrtPrice;
    this._liquidity = liquidity;

    return this;
  }

  sync(tickLiquidities: TickLiquidity[], tickRange: IntRange): this {
    const { lower, upper } = tickRange;

    for (const tickLiquidity of tickLiquidities) {
      const { tick } = tickLiquidity;

      if (tick < lower || tick > upper) {
        continue;
      }

      const iter = this._tickTree.find(tick);
      this._tickTree = iter.node ? iter.update(tickLiquidity) : this._tickTree.insert(tick, tickLiquidity);
    }

    this._tickRange = tickRange.clone();

    return this;
  }
}
