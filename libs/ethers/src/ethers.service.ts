import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

import { Logger } from '@libs/logger';

interface ProviderConfig {
  name: string;
  url: string;
  apiKey?: string;
  timeout: number;
  priority: number;
}

@Injectable()
export class EthersService implements OnModuleInit, OnModuleDestroy {
  private provider: ethers.providers.FallbackProvider;

  private readonly providerConfigs: ProviderConfig[] = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.providerConfigs = this.buildProviderConfigs();
  }

  async onModuleInit(): Promise<void> {
    const providers = this.providerConfigs.map((config) => {
      const provider = new ethers.providers.JsonRpcProvider(
        { url: config.url, timeout: config.timeout },
      );

      return { provider, priority: config.priority, stallTimeout: config.timeout };
    });

    if (providers.length === 0) {
      throw new Error('No Ethers RPC providers configured');
    }

    this.provider = new ethers.providers.FallbackProvider(providers, 1);
    this.logger.info(`EthersService initialized with ${providers.length} providers`);
  }

  async onModuleDestroy(): Promise<void> {
    // FallbackProvider doesn't have a close method, but we can clean up WebSocket providers if any
  }

  getProvider(): ethers.providers.FallbackProvider {
    return this.provider;
  }

  private buildProviderConfigs(): ProviderConfig[] {
    const configs: ProviderConfig[] = [];

    const providerNames = ['ANKR', 'GETBLOCK', 'LLAMANODES', 'NOWNODES'];

    for (const name of providerNames) {
      const enabled = this.configService.get<boolean>(`ETHERS_${name}_ENABLED`);
      if (!enabled) continue;

      const url = this.configService.get<string>(`ETHERS_${name}_URL`);
      if (!url) continue;

      configs.push({
        name,
        url,
        apiKey: this.configService.get<string>(`ETHERS_${name}_API_KEY`),
        timeout: Number(this.configService.get<string>(`ETHERS_${name}_TIMEOUT`) ?? '10000'),
        priority: Number(this.configService.get<string>(`ETHERS_${name}_PRIORITY`) ?? '1'),
      });
    }

    return configs;
  }
}
