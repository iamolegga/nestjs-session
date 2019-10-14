import {
  DynamicModule,
  Global,
  Inject,
  MiddlewareConsumer,
  Module,
  Provider,
  RequestMethod,
} from '@nestjs/common';
import * as express from 'express';
import * as expressSession from 'express-session';
import { createLookupMiddleware } from './lookupMiddleware';
import {
  NEST_SESSION_OPTIONS_TOKEN,
  NestSessionAsyncOptions,
  NestSessionOptions,
} from './options';

const defaultRoutes = { path: '*', method: RequestMethod.ALL };

@Global()
@Module({})
export class SessionCoreModule {
  static forRoot(options: NestSessionOptions): DynamicModule {
    const optionsProvider: Provider<NestSessionOptions> = {
      provide: NEST_SESSION_OPTIONS_TOKEN,
      useValue: options,
    };

    return {
      module: SessionCoreModule,
      providers: [optionsProvider],
    };
  }

  static forRootAsync(options: NestSessionAsyncOptions): DynamicModule {
    const optionsProvider: Provider<
      NestSessionOptions | Promise<NestSessionOptions>
    > = {
      provide: NEST_SESSION_OPTIONS_TOKEN,
      useFactory: options.useFactory,
      inject: options.inject,
    };

    return {
      module: SessionCoreModule,
      imports: options.imports,
      providers: [optionsProvider],
    };
  }

  constructor(
    @Inject(NEST_SESSION_OPTIONS_TOKEN)
    private readonly options: NestSessionOptions,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const { lookup, exclude, forRoutes, session } = this.options;
    let middleware: express.RequestHandler = expressSession(session);

    if (lookup !== undefined) {
      middleware = createLookupMiddleware(middleware, lookup);
    }

    if (forRoutes) {
      consumer.apply(middleware).forRoutes(...forRoutes);
    } else if (exclude) {
      consumer.apply(middleware).exclude(...exclude);
    } else {
      consumer.apply(middleware).forRoutes(defaultRoutes);
    }
  }
}
