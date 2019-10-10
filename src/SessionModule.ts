import { DynamicModule, Module } from '@nestjs/common';
import { NestSessionAsyncOptions, NestSessionOptions } from './options';
import { SessionCoreModule } from './SessionCoreModule';

@Module({})
export class SessionModule {
  static forRoot(options: NestSessionOptions): DynamicModule {
    return {
      module: SessionModule,
      imports: [SessionCoreModule.forRoot(options)],
    };
  }

  static forRootAsync(options: NestSessionAsyncOptions): DynamicModule {
    return {
      module: SessionModule,
      imports: [SessionCoreModule.forRootAsync(options)],
    };
  }
}
