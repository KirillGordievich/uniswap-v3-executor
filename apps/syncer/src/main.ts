import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { SyncerModule } from './syncer.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(SyncerModule, {
    transport: Transport.GRPC,
    options: {
      package: 'syncer',
      protoPath: join(process.cwd(), 'libs/grpc/proto/syncer.proto'),
      url: `0.0.0.0:${process.env.SYNCER_PORT ?? '50051'}`,
    },
  });

  await app.listen();
}

void bootstrap();
