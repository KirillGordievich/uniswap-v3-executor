import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '@libs/database';
import { EthersModule } from '@libs/ethers';
import { LoggerModule } from '@libs/logger';
import { validate } from '@libs/core';

import { EnvironmentVariables } from './env.config';
import { SyncerController } from './syncer.controller';
import { SyncerService } from './syncer.service';
import { DigrammaService } from './digramma/digramma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validate(EnvironmentVariables) }),
    LoggerModule.forRoot('SyncerApp'),
    DatabaseModule,
    EthersModule,
  ],
  controllers: [SyncerController],
  providers: [SyncerService, DigrammaService],
})
export class SyncerModule {}
