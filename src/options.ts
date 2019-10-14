import {
  MiddlewareConfigProxy,
  ModuleMetadata,
} from '@nestjs/common/interfaces';
import * as session from 'express-session';

export interface NestSessionOptions {
  session: session.SessionOptions;
  forRoutes?: Parameters<MiddlewareConfigProxy['forRoutes']>;
  exclude?: Parameters<MiddlewareConfigProxy['exclude']>;
  lookup?: number;
}

export const NEST_SESSION_OPTIONS_TOKEN = Symbol('nestjs-session/options');

export interface NestSessionAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    ...args: any[]
  ) => NestSessionOptions | Promise<NestSessionOptions>;
  inject?: any[];
}
