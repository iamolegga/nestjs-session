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
import {
  NEST_SESSION_OPTIONS_TOKEN,
  NestSessionAsyncOptions,
  NestSessionOptions,
} from './options';
import { createRetriesMiddleware } from './retriesMiddleware';

const defaultRoutes = [{ path: '*', method: RequestMethod.ALL }];

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
    const {
      retries,
      exclude,
      forRoutes = defaultRoutes,
      session,
      retriesStrategy,
    } = this.options;
    let middleware: express.RequestHandler = expressSession(session);

    if (retries !== undefined) {
      middleware = createRetriesMiddleware(
        middleware,
        retries,
        retriesStrategy,
      );
    }

    if (exclude) {
      consumer
        .apply(middleware)
        .exclude(...exclude)
        .forRoutes(...forRoutes);
    } else {
      consumer.apply(middleware).forRoutes(...forRoutes);
    }
  }
}
