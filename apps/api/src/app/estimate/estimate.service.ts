import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';

import { Logger } from '@libs/logger';

interface ISyncerService {
  EstimateBuy(data: { tokenSellAddress: string; tokenBuyAddress: string; quantity: string }): Observable<{ quantity: string }>;
  EstimateSell(data: { tokenSellAddress: string; tokenBuyAddress: string; quantity: string }): Observable<{ quantity: string }>;
}

@Injectable()
export class EstimateService implements OnModuleInit {
  private syncerService: ISyncerService;

  constructor(
    @Inject('SYNCER_PACKAGE') private readonly syncerClient: ClientGrpc,
    private readonly logger: Logger,
  ) {}

  onModuleInit(): void {
    this.syncerService = this.syncerClient.getService<ISyncerService>('SyncerService');
  }

  async estimateBuy(tokenSellAddress: string, tokenBuyAddress: string, quantity: string): Promise<string> {
    const response = await lastValueFrom(
      this.syncerService.EstimateBuy({ tokenSellAddress, tokenBuyAddress, quantity }),
    );

    return response.quantity;
  }

  async estimateSell(tokenSellAddress: string, tokenBuyAddress: string, quantity: string): Promise<string> {
    const response = await lastValueFrom(
      this.syncerService.EstimateSell({ tokenSellAddress, tokenBuyAddress, quantity }),
    );

    return response.quantity;
  }
}
