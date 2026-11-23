import { status } from '@grpc/grpc-js';
import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';

import { SyncerService } from './syncer.service';

interface AddTokenRequest {
  address: string;
}

interface TokenAddressRequest {
  address: string;
}

interface PoolAddressRequest {
  address: string;
}

interface ExistsResponse {
  exists: boolean;
}

interface ListTokensResponse {
  addresses: string[];
}

interface ListPoolsResponse {
  addresses: string[];
}

interface EstimateRequest {
  tokenSellAddress: string;
  tokenBuyAddress: string;
  quantity: string;
}

interface EstimateResponse {
  quantity: string;
}

interface SwapPlanResponse {
  quantitySell: string;
  quantityBuy: string;
  path: string[];
}

interface PoolHealth {
  address: string;
  timestamp: number;
  blockNumber: number;
}

interface HealthcheckResponse {
  pools: PoolHealth[];
}

interface Empty {}

@Controller()
export class SyncerController {
  constructor(private readonly syncerService: SyncerService) {}

  @GrpcMethod('SyncerService', 'AddToken')
  async addToken(data: AddTokenRequest): Promise<Empty> {
    try {
      await this.syncerService.addToken(data.address);

      return {};
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @GrpcMethod('SyncerService', 'ExistsToken')
  existsToken(data: TokenAddressRequest): ExistsResponse {
    return { exists: this.syncerService.existsToken(data.address) };
  }

  @GrpcMethod('SyncerService', 'ListTokens')
  listTokens(): ListTokensResponse {
    return { addresses: this.syncerService.listTokens() };
  }

  @GrpcMethod('SyncerService', 'DeleteToken')
  async deleteToken(data: TokenAddressRequest): Promise<Empty> {
    try {
      await this.syncerService.deleteToken(data.address);

      return {};
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @GrpcMethod('SyncerService', 'AddPool')
  async addPool(data: PoolAddressRequest): Promise<Empty> {
    try {
      await this.syncerService.addPool(data.address);

      return {};
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @GrpcMethod('SyncerService', 'ExistsPool')
  existsPool(data: PoolAddressRequest): ExistsResponse {
    return { exists: this.syncerService.existsPool(data.address) };
  }

  @GrpcMethod('SyncerService', 'ListPools')
  listPools(): ListPoolsResponse {
    return { addresses: this.syncerService.listPools() };
  }

  @GrpcMethod('SyncerService', 'DeletePool')
  async deletePool(data: PoolAddressRequest): Promise<Empty> {
    try {
      await this.syncerService.deletePool(data.address);

      return {};
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @GrpcMethod('SyncerService', 'ResyncPool')
  async resyncPool(data: PoolAddressRequest): Promise<Empty> {
    try {
      await this.syncerService.resyncPool(data.address);

      return {};
    } catch (error) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @GrpcMethod('SyncerService', 'ResyncPools')
  async resyncPools(): Promise<Empty> {
    try {
      await this.syncerService.resyncPools();

      return {};
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @GrpcMethod('SyncerService', 'EstimateBuy')
  estimateBuy(data: EstimateRequest): EstimateResponse {
    try {
      const quantity = this.syncerService.estimateBuy(data.tokenSellAddress, data.tokenBuyAddress, data.quantity);

      return { quantity };
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @GrpcMethod('SyncerService', 'EstimateSell')
  estimateSell(data: EstimateRequest): EstimateResponse {
    try {
      const quantity = this.syncerService.estimateSell(data.tokenSellAddress, data.tokenBuyAddress, data.quantity);

      return { quantity };
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @GrpcMethod('SyncerService', 'PlanBuy')
  planBuy(data: EstimateRequest): SwapPlanResponse {
    try {
      return this.syncerService.planBuy(data.tokenSellAddress, data.tokenBuyAddress, data.quantity);
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @GrpcMethod('SyncerService', 'PlanSell')
  planSell(data: EstimateRequest): SwapPlanResponse {
    try {
      return this.syncerService.planSell(data.tokenSellAddress, data.tokenBuyAddress, data.quantity);
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @GrpcMethod('SyncerService', 'Healthcheck')
  healthcheck(): HealthcheckResponse {
    return { pools: this.syncerService.healthcheck() };
  }
}
