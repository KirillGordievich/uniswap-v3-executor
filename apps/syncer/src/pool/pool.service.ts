import { ITickLensABI, IUniswapV3PoolABI } from '@libs/abi';
import {
  compareTokens,
  EvmCallError,
  getCompressedTick,
  getTickSpacingFromFee,
  getTickWord,
  IntRange,
  LensCallError,
  LVC,
  normalizeAddress,
  parseBigInt,
  parseNumber,
  pipFee,
  PoolCallError,
  Token,
  UNISWAP_V3_TICK_LENS_ADDRESS,
} from '@libs/core';
import { Logger } from '@libs/logger';
import { ethers } from 'ethers';

import { CalcService } from '../calc/calc.service';
import { TickBookService, TickLiquidity } from './tick-book.service';

export class PoolService {
  private readonly _address: string;
  private _calc0: CalcService;
  private _calc1: CalcService;
  private readonly _fee: number;
  private readonly _feePips: bigint;
  private readonly logger: Logger;
  private readonly _poolContract: ethers.Contract;
  private readonly _promises: Set<Promise<unknown>>;
  private readonly _provider: ethers.providers.Provider;
  private readonly _lvc: LVC<TickBookService>;
  private _tickBook: TickBookService;
  private readonly _tickLensContract: ethers.Contract;
  private readonly _tickRangeSizeHalf: number;
  private readonly _tickSpacing: number;
  private _timestamp: number;
  private readonly _token0: Token;
  private readonly _token1: Token;

  constructor(
    address: string | Buffer,
    tokenA: Token,
    tokenB: Token,
    fee: number,
    provider: ethers.providers.Provider,
    lastValueCacheSize: number,
    tickRangeSize: number,
    logger: Logger,
  ) {
    this._address = normalizeAddress(address);
    this.logger = logger.child({ pool: this._address });

    if (compareTokens(tokenA, tokenB) < 0) {
      this._token0 = tokenA;
      this._token1 = tokenB;
    } else {
      this._token0 = tokenB;
      this._token1 = tokenA;
    }

    this._fee = fee;
    this._feePips = BigInt(pipFee(fee));
    this._tickSpacing = getTickSpacingFromFee(fee)!;
    this._tickRangeSizeHalf = Math.floor((tickRangeSize * this._tickSpacing) / 2);

    this._provider = provider;
    this._poolContract = new ethers.Contract(this._address, IUniswapV3PoolABI, provider);
    this._tickLensContract = new ethers.Contract(UNISWAP_V3_TICK_LENS_ADDRESS, ITickLensABI, provider);

    this._lvc = new LVC(lastValueCacheSize);
    this._promises = new Set();
  }

  get address(): string {
    return this._address;
  }

  get token0(): Token {
    return this._token0;
  }

  get token1(): Token {
    return this._token1;
  }

  get fee(): number {
    return this._fee;
  }

  get timestamp(): number {
    return this._timestamp ?? 0;
  }

  get blockNumber(): number {
    return this._tickBook?.blockNumber ?? 0;
  }

  get calc0(): CalcService {
    return this._calc0;
  }

  get calc1(): CalcService {
    return this._calc1;
  }

  private async getSlot0(blockNumber: number | string = 'latest'): Promise<{ tick: number; sqrtPrice: bigint }> {
    try {
      const { tick, sqrtPriceX96 } = await this._poolContract.slot0({ blockTag: blockNumber });

      return {
        tick: parseNumber(tick),
        sqrtPrice: parseBigInt(sqrtPriceX96),
      };
    } catch (error) {
      throw new PoolCallError(
        `could not get pool ${this._address} slot 0 from block ${blockNumber}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async getLiquidity(blockNumber: number | string = 'latest'): Promise<bigint> {
    return this._poolContract
      .liquidity({ blockTag: blockNumber })
      .then(parseBigInt)
      .catch((error: Error) => {
        throw new PoolCallError(
          `could not get pool ${this._address} liquidity from block ${blockNumber}: ${error.message}`,
        );
      });
  }

  private async getTicksInWord(tickWord: number, blockNumber: string | number = 'latest'): Promise<TickLiquidity[]> {
    const data = await this._tickLensContract
      .getPopulatedTicksInWord(this._address, tickWord, { blockTag: blockNumber })
      .catch((error: Error) => {
        throw new LensCallError(
          `could not get pool ticks in word ${tickWord} from block ${blockNumber}: ${error.message}`,
        );
      });

    return data.map((item: { tick: unknown; liquidityNet: unknown; liquidityGross: unknown }) => {
      const tick = parseNumber(item.tick as number);
      const liquidityNet = parseBigInt(item.liquidityNet as string);
      const liquidityGross = parseBigInt(item.liquidityGross as string);

      return { tick, liquidityNet, liquidityGross };
    });
  }

  private async getTicksInRange(
    tickRange: IntRange,
    blockNumber: string | number = 'latest',
  ): Promise<TickLiquidity[]> {
    const tickLowerWord = getTickWord(getCompressedTick(tickRange.lower, this._tickSpacing));
    const tickUpperWord = getTickWord(getCompressedTick(tickRange.upper, this._tickSpacing));

    const ticksInWordPromises: Promise<TickLiquidity[]>[] = [];
    for (let tickWord = tickLowerWord; tickWord <= tickUpperWord; tickWord++) {
      const promise = this.getTicksInWord(tickWord, blockNumber);
      ticksInWordPromises.push(promise);
    }

    const ticks = await Promise.all(ticksInWordPromises);

    return ticks.flat().sort((a, b) => a.tick - b.tick);
  }

  private async awaitPromise(promise: Promise<unknown>): Promise<void> {
    this._promises.add(promise);

    try {
      await promise;
    } catch (error) {
      this.logger.error('pool promise error: %s', error instanceof Error ? error.message : String(error));
    } finally {
      this._promises.delete(promise);
    }
  }

  private listenBurn(): void {
    if (this._poolContract.listenerCount('Burn')) {
      return;
    }

    this._poolContract.on('Burn', async (...data: unknown[]) => {
      const event = data[data.length - 1] as { removed: boolean; args: Record<string, unknown>; blockNumber: unknown };

      const { removed, args } = event;
      const blockNumber = parseNumber(event.blockNumber as number);

      if (removed) {
        return this.awaitPromise(this.onOrphan(blockNumber));
      }

      const tickLower = parseNumber(args.tickLower as number);
      const tickUpper = parseNumber(args.tickUpper as number);

      const tickRange = new IntRange(tickLower, tickUpper);
      const liquidityDelta = parseBigInt(args.amount as string);

      this.logger.info(
        'block %d, burn liquidity %s in tick range from %d to %d',
        blockNumber,
        liquidityDelta,
        tickLower,
        tickUpper,
      );

      this.onBurn(blockNumber, tickRange, liquidityDelta);
    });
  }

  private onBurn(blockNumber: number, tickRange: IntRange, liquidityDelta: bigint): void {
    if (!this._tickBook) {
      return;
    }

    const tickBook = this._tickBook.clone();
    this._lvc.add(tickBook.blockNumber, tickBook);

    this._tickBook.burn(blockNumber, tickRange, liquidityDelta);

    this.recalc();
  }

  private muteBurn(): void {
    this._poolContract.removeAllListeners('Burn');
  }

  private listenMint(): void {
    if (this._poolContract.listenerCount('Mint')) {
      return;
    }

    this._poolContract.on('Mint', async (...data: unknown[]) => {
      const event = data[data.length - 1] as { removed: boolean; args: Record<string, unknown>; blockNumber: unknown };

      const { removed, args } = event;
      const blockNumber = parseNumber(event.blockNumber as number);

      if (removed) {
        return this.awaitPromise(this.onOrphan(blockNumber));
      }

      const tickLower = parseNumber(args.tickLower as number);
      const tickUpper = parseNumber(args.tickUpper as number);

      const tickRange = new IntRange(tickLower, tickUpper);
      const liquidityDelta = parseBigInt(args.amount as string);

      this.logger.info(
        'block %d, mint liquidity %s in tick range from %d to %d',
        blockNumber,
        liquidityDelta,
        tickLower,
        tickUpper,
      );

      this.onMint(blockNumber, tickRange, liquidityDelta);
    });
  }

  private onMint(blockNumber: number, tickRange: IntRange, liquidityDelta: bigint): void {
    if (!this._tickBook) {
      return;
    }

    const tickBook = this._tickBook.clone();
    this._lvc.add(tickBook.blockNumber, tickBook);

    this._tickBook.mint(blockNumber, tickRange, liquidityDelta);

    this.recalc();
  }

  private muteMint(): void {
    this._poolContract.removeAllListeners('Mint');
  }

  private listenSwap(): void {
    if (this._poolContract.listenerCount('Swap')) {
      return;
    }

    this._poolContract.on('Swap', async (...data: unknown[]) => {
      const event = data[data.length - 1] as { removed: boolean; args: Record<string, unknown>; blockNumber: unknown };

      const { removed, args } = event;
      const blockNumber = parseNumber(event.blockNumber as number);

      if (removed) {
        return this.awaitPromise(this.onOrphan(blockNumber));
      }

      const tick = parseNumber(args.tick as number);
      const liquidity = parseBigInt(args.liquidity as string);
      const sqrtPrice = parseBigInt(args.sqrtPriceX96 as string);

      this.logger.info(
        'block %d, swap to tick %d, liquidity %s, sqrt price %s',
        blockNumber,
        tick,
        liquidity,
        sqrtPrice,
      );

      return this.awaitPromise(this.onSwap(blockNumber, tick, liquidity, sqrtPrice));
    });
  }

  private async onSwap(blockNumber: number, tick: number, liquidity: bigint, sqrtPrice: bigint): Promise<void> {
    if (!this._tickBook) {
      return;
    }

    const tickBook = this._tickBook.clone();
    this._lvc.add(tickBook.blockNumber, tickBook);

    this._tickBook.swap(blockNumber, tick, sqrtPrice, liquidity);

    if (tick !== this._tickBook.tick) {
      const tickRange = new IntRange(tick).expandBilateral(this._tickRangeSizeHalf);
      const { lower, upper } = tickRange;

      const tickRangesToSync = tickRange.difference(this._tickBook.tickRange);
      const tickRangePromises = tickRangesToSync.map((tr) => this.getTicksInRange(tr, blockNumber));

      try {
        const tickLiquidities = await Promise.all(tickRangePromises).then((results) => results.flat());

        this.logger.info('block %d, synced missing liquidity in tick range from %d to %d', blockNumber, lower, upper);

        this._tickBook.sync(tickLiquidities, tickRange);
      } catch (error) {
        this.logger.warn(
          'block %d, could not sync missing liquidity in tick range from %d to %d: %s',
          blockNumber,
          lower,
          upper,
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    this.recalc();
  }

  private muteSwap(): void {
    this._poolContract.removeAllListeners('Swap');
  }

  private async onOrphan(blockNumber: number): Promise<void> {
    this._lvc.remove(blockNumber);
    const tickBook = this._lvc.highest();

    if (!tickBook) {
      this.logger.info('block %d orphaned, no recoverable state, resyncing', blockNumber);

      return this.sync();
    }

    this.logger.info('block %d orphaned, recovered state from block %d', blockNumber, tickBook.blockNumber);

    this._tickBook = tickBook;
    this.recalc();
  }

  private recalc(): void {
    this._timestamp = Date.now();
    this._calc0 = new CalcService(this._token0, this._token1, this._feePips, this._tickBook);
    this._calc1 = new CalcService(this._token1, this._token0, this._feePips, this._tickBook);
  }

  async init(blockNumber?: number): Promise<void> {
    await this.sync(blockNumber);

    this.listenBurn();
    this.listenMint();
    this.listenSwap();
  }

  async sync(blockNumber?: number): Promise<void> {
    blockNumber ??= await this._provider
      .getBlockNumber()
      .then(parseNumber)
      .catch((error: Error) => {
        throw new EvmCallError('could not get latest block number: ' + error.message);
      });

    this.logger.info('block %d, resyncing', blockNumber);

    const [{ tick, sqrtPrice }, liquidity] = await Promise.all([
      this.getSlot0(blockNumber),
      this.getLiquidity(blockNumber),
    ]);

    const tickRange = new IntRange(tick).expandBilateral(this._tickRangeSizeHalf);

    this.logger.info(
      'block %d, current tick %d, sqrt price %s, liquidity %s, tick range from %d to %d',
      blockNumber,
      tick,
      sqrtPrice,
      liquidity,
      tickRange.lower,
      tickRange.upper,
    );

    const ticks = await this.getTicksInRange(tickRange, blockNumber);

    this.logger.info(
      'block %d, synced %d ticks in range from %d to %d',
      blockNumber,
      ticks.length,
      ticks[0]?.tick ?? tick,
      ticks[ticks.length - 1]?.tick ?? tick,
    );

    if (this._tickBook) {
      const tickBook = this._tickBook.clone();
      this._lvc.add(tickBook.blockNumber, tickBook);
    }

    this._tickBook ??= new TickBookService(this._tickSpacing);
    this._tickBook.init(blockNumber, tick, sqrtPrice, liquidity, ticks, tickRange);
    this.recalc();
  }

  async destroy(): Promise<void> {
    this.muteBurn();
    this.muteMint();
    this.muteSwap();

    await Promise.all([...this._promises]);
  }
}
