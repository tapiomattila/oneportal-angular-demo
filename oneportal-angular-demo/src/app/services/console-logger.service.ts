import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

import { Logger } from './logging.service';

export let isProduction = environment.production;

const noop = (): any => undefined;

@Injectable()
export class ConsoleLoggerService implements Logger {

  get info() {
    if (!isProduction) {
      return console.info.bind(console);
    } else {
      return noop;
    }
  }

  get warn() {
    if (!isProduction) {
      return console.warn.bind(console);
    } else {
      return noop;
    }
  }

  get error() {
    if (!isProduction) {
      return console.error.bind(console);
    } else {
      return noop;
    }
  }

  invokeConsoleMethod(type: string, args?: any): void {
    const logFn: Function = (console)[type] || console.log || noop;
    logFn.apply(console, [args]);
  }
}
