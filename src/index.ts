import {
  AsyncOptions,
  createModule,
  SyncOptions,
} from 'create-nestjs-middleware-module';
import expressSession from 'express-session';

import { createRetriesMiddleware } from './retriesMiddleware';

interface Options {
  /**
   * express-session options. @see https://github.com/expressjs/session#options
   */
  session: expressSession.SessionOptions;
  /**
   * by default if your session store lost connection to database it will return
   * session as `undefined`, and no errors will be thrown, and then you need to
   * check session in controller. But you can set this property how many times
   * it should retry to get session, and on fail `InternalServerErrorException`
   * will be thrown. If you don't want retries, but just want to
   * `InternalServerErrorException` to be throw, then set to `0`. Set this
   * option, if you dont't want manualy check session inside controllers.
   */
  retries?: number;
  /**
   * function that returns number of ms to wait between next attempt. Not calls
   * on first attempt.
   */
  retriesStrategy?: Parameters<typeof createRetriesMiddleware>[2];
}

export type NestSessionOptions = SyncOptions<Options>;

export type NestSessionAsyncOptions = AsyncOptions<Options>;

export const SessionModule = createModule<Options>((options) => {
  const { retries, session, retriesStrategy } = options;
  let middleware = expressSession(session);

  if (retries !== undefined) {
    middleware = createRetriesMiddleware(middleware, retries, retriesStrategy);
  }

  return middleware;
});
