import {
  AsyncOptions,
  createModule,
  SyncOptions,
} from 'create-nestjs-middleware-module';
import * as expressSession from 'express-session';
import { createRetriesMiddleware } from './retriesMiddleware';

interface Options {
  session: expressSession.SessionOptions;
  retries?: number;
  retriesStrategy?: Parameters<typeof createRetriesMiddleware>[2];
}

export type NestSessionOptions = SyncOptions<Options>;

export type NestSessionAsyncOptions = AsyncOptions<Options>;

export const SessionModule = createModule<Options>(options => {
  const { retries, session, retriesStrategy } = options;
  let middleware = expressSession(session);

  if (retries !== undefined) {
    middleware = createRetriesMiddleware(middleware, retries, retriesStrategy);
  }

  return middleware;
});
