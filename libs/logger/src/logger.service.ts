import { Inject, Injectable, Optional } from '@nestjs/common';
import pino, { Logger as PinoLogger, LogFn } from 'pino';

export const LOGGER_CONTEXT = 'LOGGER_CONTEXT';

@Injectable()
export class Logger {
  private _pino: PinoLogger;

  info: LogFn;
  error: LogFn;
  warn: LogFn;
  debug: LogFn;
  fatal: LogFn;

  constructor(@Optional() @Inject(LOGGER_CONTEXT) context?: string) {
    this._pino = pino({ name: context ?? 'App' });
    this.info = this._pino.info.bind(this._pino);
    this.error = this._pino.error.bind(this._pino);
    this.warn = this._pino.warn.bind(this._pino);
    this.debug = this._pino.debug.bind(this._pino);
    this.fatal = this._pino.fatal.bind(this._pino);
  }

  child(bindings: Record<string, unknown>): Logger {
    const child = new Logger();
    child._pino = this._pino.child(bindings);
    child.info = child._pino.info.bind(child._pino);
    child.error = child._pino.error.bind(child._pino);
    child.warn = child._pino.warn.bind(child._pino);
    child.debug = child._pino.debug.bind(child._pino);
    child.fatal = child._pino.fatal.bind(child._pino);

    return child;
  }
}
