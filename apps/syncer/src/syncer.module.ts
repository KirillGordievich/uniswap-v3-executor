import { validate } from '@libs/core';
import { DatabaseModule } from '@libs/database';
import { EthersModule } from '@libs/ethers';
import { LoggerModule } from '@libs/logger';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DigrammaService } from './digramma/digramma.service';
import { EnvironmentVariables } from './env.config';
import { SyncerController } from './syncer.controller';
import { SyncerService } from './syncer.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // repo-root .env, whether started from the repo root or via `pnpm --filter` (cwd apps/<app>)
      envFilePath: ['.env', '../../.env'],
      validate: validate(EnvironmentVariables),
    }),
    LoggerModule.forRoot('SyncerApp'),
    DatabaseModule,
    EthersModule,
  ],
  controllers: [SyncerController],
  providers: [SyncerService, DigrammaService],
})
export class SyncerModule {}
