import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { SYNCER_PROTO_PATH } from './proto';

export const SYNCER_PACKAGE = 'SYNCER_PACKAGE';

@Global()
@Module({})
export class SyncerClientModule {
  static register(): DynamicModule {
    return {
      global: true,
      module: SyncerClientModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name: SYNCER_PACKAGE,
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
              transport: Transport.GRPC,
              options: {
                package: 'syncer',
                protoPath: SYNCER_PROTO_PATH,
                url: configService.getOrThrow<string>('SYNCER_GRPC_URL'),
              },
            }),
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
