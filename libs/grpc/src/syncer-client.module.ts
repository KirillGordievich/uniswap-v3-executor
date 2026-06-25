import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

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
                protoPath: join(process.cwd(), 'libs/grpc/proto/syncer.proto'),
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
