import { Test, TestingModule } from '@nestjs/testing';
import { Global, INestApplication, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseService } from '@libs/database';
import { Logger } from '@libs/logger';

import { TokenModule } from '../src/app/token/token.module';
import { EstimateModule } from '../src/app/estimate/estimate.module';
import { HealthModule } from '../src/app/health/health.module';

const TEST_API_KEY = 'test-api-key-12345';

const mockDatabaseService = {
  token: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

const mockSyncerService = {
  EstimateBuy: jest.fn(),
  EstimateSell: jest.fn(),
};

const mockSyncerClient = {
  getService: jest.fn().mockReturnValue(mockSyncerService),
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  fatal: jest.fn(),
  child: jest.fn().mockReturnThis(),
};

@Global()
@Module({
  providers: [
    { provide: DatabaseService, useValue: mockDatabaseService },
    { provide: Logger, useValue: mockLogger },
    { provide: 'SYNCER_PACKAGE', useValue: mockSyncerClient },
  ],
  exports: [DatabaseService, Logger, 'SYNCER_PACKAGE'],
})
class MockGlobalModule {}

async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        load: [
          (): Record<string, unknown> => ({
            API_KEY: TEST_API_KEY,
            DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
            API_HOST: '0.0.0.0',
            API_PORT: 3000,
            SYNCER_GRPC_URL: 'localhost:50051',
          }),
        ],
      }),
      MockGlobalModule,
      TokenModule,
      EstimateModule,
      HealthModule,
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.init();

  return app;
}

export { createTestApp, mockDatabaseService, mockSyncerService, mockLogger, TEST_API_KEY };
