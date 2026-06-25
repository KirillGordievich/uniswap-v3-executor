import { DynamicModule, Global, Module } from '@nestjs/common';

import { Logger, LOGGER_CONTEXT } from './logger.service';

@Global()
@Module({})
export class LoggerModule {
  static forRoot(context: string): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        { provide: LOGGER_CONTEXT, useValue: context },
        Logger,
      ],
      exports: [Logger],
      global: true,
    };
  }
}
