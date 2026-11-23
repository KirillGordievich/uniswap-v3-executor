import { validate } from '@libs/core';
import { DatabaseModule } from '@libs/database';
import { SyncerClientModule } from '@libs/grpc';
import { LoggerModule } from '@libs/logger';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EstimateModule } from './app/estimate/estimate.module';
import { HealthModule } from './app/health/health.module';
import { TokenModule } from './app/token/token.module';
import { EnvironmentVariables } from './env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // repo-root .env, whether started from the repo root or via `pnpm --filter` (cwd apps/<app>)
      envFilePath: ['.env', '../../.env'],
      validate: validate(EnvironmentVariables),
    }),
    LoggerModule.forRoot('ApiApp'),
    DatabaseModule,
    SyncerClientModule.register(),
    TokenModule,
    EstimateModule,
    HealthModule,
  ],
})
export class AppModule {}
