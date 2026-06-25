import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '@libs/database';
import { LoggerModule } from '@libs/logger';
import { validate } from '@libs/core';
import { SyncerClientModule } from '@libs/grpc';

import { EnvironmentVariables } from './env.config';

import { TokenModule } from './app/token/token.module';
import { EstimateModule } from './app/estimate/estimate.module';
import { HealthModule } from './app/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validate(EnvironmentVariables) }),
    LoggerModule.forRoot('ApiApp'),
    DatabaseModule,
    SyncerClientModule.register(),
    TokenModule,
    EstimateModule,
    HealthModule,
  ],
})
export class AppModule {}
