import {
  MiddlewareConfigProxy,
  ModuleMetadata,
} from '@nestjs/common/interfaces';
import * as session from 'express-session';
import { createRetriesMiddleware } from './retriesMiddleware';

export interface NestSessionOptions {
  session: session.SessionOptions;
  forRoutes?: Parameters<MiddlewareConfigProxy['forRoutes']>;
  exclude?: Parameters<MiddlewareConfigProxy['exclude']>;
  retries?: number;
  retriesStrategy?: Parameters<typeof createRetriesMiddleware>[2];
}

export const NEST_SESSION_OPTIONS_TOKEN = Symbol('nestjs-session/options');

export interface NestSessionAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    ...args: any[]
  ) => NestSessionOptions | Promise<NestSessionOptions>;
  inject?: any[];
}
