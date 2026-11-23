import { SYNCER_PROTO_PATH } from '@libs/grpc';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { SyncerModule } from './syncer.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(SyncerModule, {
    transport: Transport.GRPC,
    options: {
      package: 'syncer',
      protoPath: SYNCER_PROTO_PATH,
      url: `0.0.0.0:${process.env.SYNCER_PORT ?? '50051'}`,
    },
  });

  await app.listen();
}

void bootstrap();
