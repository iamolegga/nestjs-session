# Nestjs session

Idiomatic Session Module for NestJS.
Built on top of [express-session](https://npm.im/express-session) 😎

## Example

Register module:

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { NestSessionOptions, SessionModule } from 'nestjs-session';
import { ViewsController } from './views.controller';

@Module({
  imports: [

    // sync params:

    SessionModule.forRoot({
      session: { secret: 'keyboard cat' },
    }),

    // or async:

    SessionModule.forRootAsync({
      imports: [ConfigModule],
      inject: [Config],
      //              TIP: to get autocomplete in return object
      //                  add `NestSessionOptions` here ↓↓↓
      useFactory: async (config: Config): Promise<NestSessionOptions> => {
        return {
          session: { secret: config.secret },
        };
      },
    }),
  ],
  controllers: [ViewsController],
})
export class AppModule {}
```

Use in controllers with NestJS built-in `Session` decorator:

```ts
// views.controller.ts
import { Controller, Get, Session } from '@nestjs/common';

@Controller('views')
export class ViewsController {
  @Get()
  getViews(@Session() session: { views?: number }) {
    session.views = (session.views || 0) + 1;
    return session.views;
  }
}
```

__BE AWARE THAT THIS EXAMPLE IS NOT FOR PRODUCTION! IT USES IN-MEMORY STORE, SO YOUR DATA WILL BE LOST ON RESTART. USE OTHER [STORES](https://github.com/expressjs/session#compatible-session-stores)__

See [redis-store](https://github.com/tj/connect-redis) example in `examples` folder.

## Install

```sh
npm i nestjs-session
```

or

```sh
yarn add nestjs-session
```

## API

### SessionModule

`SessionModule` class has two static methods, that returns `DynamicModule`, that you need to import:

- `SessionModule.forRoot` for sync configuration without dependencies
- `SessionModule.forRootAsync` for sync/async configuration with dependencies

### SessionModule.forRoot

Accept `NestSessionOptions`. Returns NestJS `DynamicModule` for import.

### SessionModule.forRootAsync

Accept `NestSessionAsyncOptions`. Returns NestJS `DynamicModule` for import.

### NestSessionOptions

`NestSessionOptions` is interface of all options, has next properties:

- `session` - __required__ - [express-session options](https://github.com/expressjs/session#options).
- `forRoutes` - __optional__ - same as NestJS buil-in `MiddlewareConfigProxy['forRoutes']` [See exmaples in official docs](https://docs.nestjs.com/middleware#applying-middleware). Specify routes, that should have access to session. If `forRoutes` and `exclude` will not be set, then sessions will be set to all routes.
- `exclude` - __optional__ - same as NestJS buil-in `MiddlewareConfigProxy['exclude']` [See exmaples in official docs](https://docs.nestjs.com/middleware#applying-middleware). Specify routes, that should not have access to session. If `forRoutes` and `exclude` will not be set, then sessions will be set to all routes.
- `lookup` - __optional__ - `number` - by default if your session store lost connection to database it will return session as `undefined`, and no errors will be thrown, and then you need to check session in controller. But you can set this property how many times it should retry to get session, and on fail `InternalServerErrorException` will be thrown. If you don't want retires, but just want to `InternalServerErrorException` to be throw, then set to `0`. Set this option, if you dont't want manualy check session inside controllers.

### NestSessionAsyncOptions

`NestSessionAsyncOptions` is interface of options to create session module, that depends on other modules, has next properties:

- `imports` - __optional__ - modules, that session module depends on. See [official docs](https://docs.nestjs.com/modules).
- `inject` - __optional__ - providers from `imports`-property modules, that will be passed as arguments to `useFactory` method.
- `useFactory` - __required__ - method, that returns `NestSessionOptions`.
