import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Decimal } from 'decimal.js';

import { DatabaseService } from '@libs/database';
import { EthersService } from '@libs/ethers';
import { Logger } from '@libs/logger';
import { isAddress, normalizeAddress, bufferToHex, EvmCallError, parseNumber } from '@libs/core';

import { DigrammaService, Traversal } from './digramma/digramma.service';
import { PoolService } from './pool/pool.service';

@Injectable()
export class SyncerService implements OnModuleInit {
  private readonly lastValueCacheSize: number;
  private readonly tickRangeSize: number;

  constructor(
    private readonly db: DatabaseService,
    private readonly ethersService: EthersService,
    private readonly digramma: DigrammaService,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.lastValueCacheSize = Number(this.configService.getOrThrow<string>('SYNCER_POOL_LVC_SIZE'));
    this.tickRangeSize = Number(this.configService.getOrThrow<string>('SYNCER_POOL_TICK_RANGE_SIZE'));
  }

  async onModuleInit(): Promise<void> {
    const provider = this.ethersService.getProvider();

    const tokens = await this.db.token.findMany({
      select: { address: true, decimals: true, symbol: true, name: true },
    });

    const pools = await this.db.pool.findMany({
      where: { enabled: true },
      select: {
        address: true,
        fee: true,
        token0: { select: { address: true } },
        token1: { select: { address: true } },
      },
    });

    for (const tokenRow of tokens) {
      const address = bufferToHex(tokenRow.address as Buffer);
      const { decimals, symbol, name } = tokenRow;
      this.digramma.setToken({ address, decimals, symbol, name });
    }

    for (const poolRow of pools) {
      const address = bufferToHex(poolRow.address as Buffer);
      const token0Address = bufferToHex(poolRow.token0.address as Buffer);
      const token1Address = bufferToHex(poolRow.token1.address as Buffer);
      const token0 = this.digramma.getToken(token0Address);
      const token1 = this.digramma.getToken(token1Address);
      const fee = Number(poolRow.fee);

      const pool = new PoolService(
        address,
        token0,
        token1,
        fee,
        provider,
        this.lastValueCacheSize,
        this.tickRangeSize,
        this.logger,
      );

      this.digramma.setPool(pool);
    }

    const blockNumber = await provider
      .getBlockNumber()
      .then(parseNumber)
      .catch((error: Error) => {
        throw new EvmCallError('could not get latest block number: ' + error.message);
      });

    const poolInitPromises = this.digramma.listPools().map((pool) => pool.init(blockNumber));
    await Promise.all(poolInitPromises);

    this.logger.info('syncer initialized with %d tokens and %d pools', tokens.length, pools.length);
  }

  async addToken(address: string): Promise<void> {
    if (!isAddress(address)) {
      throw new Error(`decoded string "${address}" is not an address`);
    }

    const normalizedAddress = normalizeAddress(address);

    if (this.digramma.hasToken(normalizedAddress)) {
      throw new Error(`token with address "${normalizedAddress}" is already added`);
    }

    const token = await this.db.token.findFirst({
      where: { address: Buffer.from(normalizedAddress.slice(2), 'hex') },
      select: { decimals: true, symbol: true, name: true },
    });

    if (!token) {
      throw new Error(`token with address "${normalizedAddress}" does not exist`);
    }

    this.digramma.setToken({
      address: normalizedAddress,
      decimals: token.decimals,
      symbol: token.symbol,
      name: token.name,
    });

    this.logger.info('added token "%s"', normalizedAddress);
  }

  existsToken(address: string): boolean {
    return this.digramma.hasToken(normalizeAddress(address));
  }

  listTokens(): string[] {
    return this.digramma.listTokens().map((token) => token.address);
  }

  async deleteToken(address: string): Promise<void> {
    const normalizedAddress = normalizeAddress(address);

    if (!this.digramma.hasToken(normalizedAddress)) {
      return;
    }

    const poolDestroyPromises = this.digramma.listTokenPools(normalizedAddress).map(async (pool) => {
      await pool.destroy();
      this.logger.info('destroyed pool "%s"', pool.address);
      this.digramma.deletePool(pool.address);
    });

    await Promise.all(poolDestroyPromises);

    this.digramma.deleteToken(normalizedAddress);

    this.logger.info('deleted token "%s"', normalizedAddress);
  }

  async addPool(address: string): Promise<void> {
    if (!isAddress(address)) {
      throw new Error(`decoded string "${address}" is not an address`);
    }

    const normalizedAddress = normalizeAddress(address);

    if (this.digramma.hasPool(normalizedAddress)) {
      throw new Error(`pool with address "${normalizedAddress}" is already added`);
    }

    const pool = await this.db.pool.findFirst({
      where: { address: Buffer.from(normalizedAddress.slice(2), 'hex') },
      select: {
        fee: true,
        token0: { select: { address: true } },
        token1: { select: { address: true } },
      },
    });

    if (!pool) {
      throw new Error(`pool with address "${normalizedAddress}" does not exist`);
    }

    const token0Address = bufferToHex(pool.token0.address as Buffer);
    const token1Address = bufferToHex(pool.token1.address as Buffer);
    const fee = Number(pool.fee);

    if (!this.digramma.hasToken(token0Address)) {
      throw new Error(`token 0 "${token0Address}" of pool "${normalizedAddress}" is not added`);
    }

    if (!this.digramma.hasToken(token1Address)) {
      throw new Error(`token 1 "${token1Address}" of pool "${normalizedAddress}" is not added`);
    }

    const token0 = this.digramma.getToken(token0Address);
    const token1 = this.digramma.getToken(token1Address);
    const provider = this.ethersService.getProvider();

    const poolService = new PoolService(
      normalizedAddress,
      token0,
      token1,
      fee,
      provider,
      this.lastValueCacheSize,
      this.tickRangeSize,
      this.logger,
    );
    await poolService.init();

    this.digramma.setPool(poolService);

    this.logger.info('added pool "%s"', normalizedAddress);
  }

  existsPool(address: string): boolean {
    return this.digramma.hasPool(normalizeAddress(address));
  }

  listPools(): string[] {
    return this.digramma.listPools().map((pool) => pool.address);
  }

  async deletePool(address: string): Promise<void> {
    const normalizedAddress = normalizeAddress(address);

    await this.digramma.getPool(normalizedAddress).destroy();
    this.digramma.deletePool(normalizedAddress);

    this.logger.info('deleted pool "%s"', normalizedAddress);
  }

  async resyncPool(address: string): Promise<void> {
    const normalizedAddress = normalizeAddress(address);

    if (!this.digramma.hasPool(normalizedAddress)) {
      throw new Error(`pool "${normalizedAddress}" is not added`);
    }

    await this.digramma.getPool(normalizedAddress).sync();

    this.logger.info('resynced pool "%s"', normalizedAddress);
  }

  async resyncPools(): Promise<void> {
    const provider = this.ethersService.getProvider();

    const blockNumber = await provider
      .getBlockNumber()
      .then(parseNumber)
      .catch((error: Error) => {
        throw new EvmCallError('could not get latest block number: ' + error.message);
      });

    const poolSyncPromises = this.digramma.listPools().map((pool) => pool.sync(blockNumber));
    await Promise.all(poolSyncPromises);

    this.logger.info('resynced pools');
  }

  estimateBuy(tokenSellAddress: string, tokenBuyAddress: string, quantity: string): string {
    const quantitySell = new Decimal(quantity);

    const traversal = this.digramma.traverseBuySimple(
      normalizeAddress(tokenSellAddress),
      normalizeAddress(tokenBuyAddress),
      quantitySell,
    );

    return traversal.estimates[traversal.estimates.length - 1].toString();
  }

  estimateSell(tokenSellAddress: string, tokenBuyAddress: string, quantity: string): string {
    const quantityBuy = new Decimal(quantity);

    const traversal = this.digramma.traverseSellSimple(
      normalizeAddress(tokenSellAddress),
      normalizeAddress(tokenBuyAddress),
      quantityBuy,
    );

    return traversal.estimates[0].toString();
  }

  planBuy(tokenSellAddress: string, tokenBuyAddress: string, quantity: string): { quantitySell: string; quantityBuy: string; path: string[] } {
    const quantitySell = new Decimal(quantity);
    const sellAddress = normalizeAddress(tokenSellAddress);
    const buyAddress = normalizeAddress(tokenBuyAddress);

    const traversal: Traversal = this.digramma.traverseBuySimple(sellAddress, buyAddress, quantitySell);

    const tokenSellDecimals = this.digramma.getToken(sellAddress).decimals;
    const tokenBuyDecimals = this.digramma.getToken(buyAddress).decimals;

    const quantitySellDecimal = traversal.estimates[0]
      .mul('1e' + tokenSellDecimals)
      .ceil();
    const quantityBuyDecimal = traversal.estimates[traversal.estimates.length - 1]
      .mul('1e' + tokenBuyDecimals)
      .floor();

    return {
      quantitySell: quantitySellDecimal.toString(),
      quantityBuy: quantityBuyDecimal.toString(),
      path: traversal.path.map(String),
    };
  }

  planSell(tokenSellAddress: string, tokenBuyAddress: string, quantity: string): { quantitySell: string; quantityBuy: string; path: string[] } {
    const quantityBuy = new Decimal(quantity);
    const sellAddress = normalizeAddress(tokenSellAddress);
    const buyAddress = normalizeAddress(tokenBuyAddress);

    const traversal: Traversal = this.digramma.traverseSellSimple(sellAddress, buyAddress, quantityBuy);

    const tokenSellDecimals = this.digramma.getToken(sellAddress).decimals;
    const tokenBuyDecimals = this.digramma.getToken(buyAddress).decimals;

    const quantitySellDecimal = traversal.estimates[0]
      .mul('1e' + tokenSellDecimals)
      .ceil();
    const quantityBuyDecimal = traversal.estimates[traversal.estimates.length - 1]
      .mul('1e' + tokenBuyDecimals)
      .floor();

    return {
      quantitySell: quantitySellDecimal.toString(),
      quantityBuy: quantityBuyDecimal.toString(),
      path: traversal.path.map(String),
    };
  }

  healthcheck(): { address: string; timestamp: number; blockNumber: number }[] {
    return this.digramma.listPools().map((pool) => ({
      address: pool.address,
      timestamp: pool.timestamp,
      blockNumber: pool.blockNumber,
    }));
  }
}
