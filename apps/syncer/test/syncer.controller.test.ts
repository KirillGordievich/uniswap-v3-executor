import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

import { SyncerController } from '../src/syncer.controller';
import { SyncerService } from '../src/syncer.service';

describe('SyncerController', () => {
  let controller: SyncerController;
  let syncerService: jest.Mocked<SyncerService>;

  beforeEach(() => {
    syncerService = {
      addToken: jest.fn(),
      existsToken: jest.fn(),
      listTokens: jest.fn(),
      deleteToken: jest.fn(),
      addPool: jest.fn(),
      existsPool: jest.fn(),
      listPools: jest.fn(),
      deletePool: jest.fn(),
      resyncPool: jest.fn(),
      resyncPools: jest.fn(),
      estimateBuy: jest.fn(),
      estimateSell: jest.fn(),
      planBuy: jest.fn(),
      planSell: jest.fn(),
      healthcheck: jest.fn(),
    } as unknown as jest.Mocked<SyncerService>;

    controller = new SyncerController(syncerService);
  });

  describe('AddToken', () => {
    it('calls service.addToken and returns empty', async () => {
      syncerService.addToken.mockResolvedValue(undefined);

      const result = await controller.addToken({ address: '0xabc' });

      expect(result).toEqual({});
      expect(syncerService.addToken).toHaveBeenCalledWith('0xabc');
    });

    it('throws RpcException on error', async () => {
      syncerService.addToken.mockRejectedValue(new Error('not found'));

      await expect(controller.addToken({ address: '0xabc' })).rejects.toThrow(RpcException);
    });
  });

  describe('ExistsToken', () => {
    it('returns exists: true when token exists', () => {
      syncerService.existsToken.mockReturnValue(true);

      const result = controller.existsToken({ address: '0xabc' });

      expect(result).toEqual({ exists: true });
    });

    it('returns exists: false when token does not exist', () => {
      syncerService.existsToken.mockReturnValue(false);

      const result = controller.existsToken({ address: '0xdef' });

      expect(result).toEqual({ exists: false });
    });
  });

  describe('ListTokens', () => {
    it('returns token addresses', () => {
      syncerService.listTokens.mockReturnValue(['0xaaa', '0xbbb']);

      const result = controller.listTokens();

      expect(result).toEqual({ addresses: ['0xaaa', '0xbbb'] });
    });
  });

  describe('DeleteToken', () => {
    it('calls service.deleteToken and returns empty', async () => {
      syncerService.deleteToken.mockResolvedValue(undefined);

      const result = await controller.deleteToken({ address: '0xabc' });

      expect(result).toEqual({});
      expect(syncerService.deleteToken).toHaveBeenCalledWith('0xabc');
    });

    it('throws RpcException on error', async () => {
      syncerService.deleteToken.mockRejectedValue(new Error('fail'));

      await expect(controller.deleteToken({ address: '0xabc' })).rejects.toThrow(RpcException);
    });
  });

  describe('AddPool', () => {
    it('calls service.addPool and returns empty', async () => {
      syncerService.addPool.mockResolvedValue(undefined);

      const result = await controller.addPool({ address: '0xpool' });

      expect(result).toEqual({});
      expect(syncerService.addPool).toHaveBeenCalledWith('0xpool');
    });

    it('throws RpcException on error', async () => {
      syncerService.addPool.mockRejectedValue(new Error('fail'));

      await expect(controller.addPool({ address: '0xpool' })).rejects.toThrow(RpcException);
    });
  });

  describe('ExistsPool', () => {
    it('returns exists: true when pool exists', () => {
      syncerService.existsPool.mockReturnValue(true);

      const result = controller.existsPool({ address: '0xpool' });

      expect(result).toEqual({ exists: true });
    });
  });

  describe('ListPools', () => {
    it('returns pool addresses', () => {
      syncerService.listPools.mockReturnValue(['0xpool1', '0xpool2']);

      const result = controller.listPools();

      expect(result).toEqual({ addresses: ['0xpool1', '0xpool2'] });
    });
  });

  describe('DeletePool', () => {
    it('calls service.deletePool and returns empty', async () => {
      syncerService.deletePool.mockResolvedValue(undefined);

      const result = await controller.deletePool({ address: '0xpool' });

      expect(result).toEqual({});
    });

    it('throws RpcException on error', async () => {
      syncerService.deletePool.mockRejectedValue(new Error('fail'));

      await expect(controller.deletePool({ address: '0xpool' })).rejects.toThrow(RpcException);
    });
  });

  describe('ResyncPool', () => {
    it('calls service.resyncPool and returns empty', async () => {
      syncerService.resyncPool.mockResolvedValue(undefined);

      const result = await controller.resyncPool({ address: '0xpool' });

      expect(result).toEqual({});
    });

    it('throws RpcException with NOT_FOUND on error', async () => {
      syncerService.resyncPool.mockRejectedValue(new Error('not added'));

      try {
        await controller.resyncPool({ address: '0xpool' });
        fail('should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(RpcException);
        expect((error as RpcException).getError()).toEqual({
          code: status.NOT_FOUND,
          message: 'not added',
        });
      }
    });
  });

  describe('ResyncPools', () => {
    it('calls service.resyncPools and returns empty', async () => {
      syncerService.resyncPools.mockResolvedValue(undefined);

      const result = await controller.resyncPools();

      expect(result).toEqual({});
    });
  });

  describe('EstimateBuy', () => {
    it('returns estimated quantity', () => {
      syncerService.estimateBuy.mockReturnValue('1.234');

      const result = controller.estimateBuy({
        tokenSellAddress: '0xsell',
        tokenBuyAddress: '0xbuy',
        quantity: '10',
      });

      expect(result).toEqual({ quantity: '1.234' });
      expect(syncerService.estimateBuy).toHaveBeenCalledWith('0xsell', '0xbuy', '10');
    });

    it('throws RpcException on error', () => {
      syncerService.estimateBuy.mockImplementation(() => {
        throw new Error('insufficient liquidity');
      });

      expect(() =>
        controller.estimateBuy({
          tokenSellAddress: '0xsell',
          tokenBuyAddress: '0xbuy',
          quantity: '10',
        }),
      ).toThrow(RpcException);
    });
  });

  describe('EstimateSell', () => {
    it('returns estimated quantity', () => {
      syncerService.estimateSell.mockReturnValue('5.678');

      const result = controller.estimateSell({
        tokenSellAddress: '0xsell',
        tokenBuyAddress: '0xbuy',
        quantity: '2',
      });

      expect(result).toEqual({ quantity: '5.678' });
    });
  });

  describe('PlanBuy', () => {
    it('returns swap plan', () => {
      syncerService.planBuy.mockReturnValue({
        quantitySell: '1000000',
        quantityBuy: '500000',
        path: ['0xsell', '100', '0xbuy'],
      });

      const result = controller.planBuy({
        tokenSellAddress: '0xsell',
        tokenBuyAddress: '0xbuy',
        quantity: '1.0',
      });

      expect(result).toEqual({
        quantitySell: '1000000',
        quantityBuy: '500000',
        path: ['0xsell', '100', '0xbuy'],
      });
    });
  });

  describe('PlanSell', () => {
    it('returns swap plan', () => {
      syncerService.planSell.mockReturnValue({
        quantitySell: '2000000',
        quantityBuy: '1000000',
        path: ['0xsell', '500', '0xbuy'],
      });

      const result = controller.planSell({
        tokenSellAddress: '0xsell',
        tokenBuyAddress: '0xbuy',
        quantity: '1.0',
      });

      expect(result).toEqual({
        quantitySell: '2000000',
        quantityBuy: '1000000',
        path: ['0xsell', '500', '0xbuy'],
      });
    });
  });

  describe('Healthcheck', () => {
    it('returns pool health data', () => {
      const pools = [
        { address: '0xpool1', timestamp: 1700000000000, blockNumber: 18000000 },
        { address: '0xpool2', timestamp: 1700000001000, blockNumber: 18000001 },
      ];
      syncerService.healthcheck.mockReturnValue(pools);

      const result = controller.healthcheck();

      expect(result).toEqual({ pools });
    });
  });
});
