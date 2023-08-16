<h1 align="center">NestJS-Session</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/nestjs-session">
    <img alt="npm" src="https://img.shields.io/npm/v/nestjs-session" />
  </a>
  <a href="https://www.npmjs.com/package/nestjs-session">
    <img alt="npm" src="https://img.shields.io/npm/dm/nestjs-session" />
  </a>
  <a href="https://github.com/iamolegga/nestjs-session/actions">
    <img alt="GitHub branch checks state" src="https://badgen.net/github/checks/iamolegga/nestjs-session" />
  </a>
  <a href="https://codeclimate.com/github/iamolegga/nestjs-session/test_coverage">
    <img src="https://api.codeclimate.com/v1/badges/08bcbca7b2da14b3bbfd/test_coverage" />
  </a>
  <a href="https://snyk.io/test/github/iamolegga/nestjs-session">
    <img alt="Known Vulnerabilities" src="https://snyk.io/test/github/iamolegga/nestjs-session/badge.svg" />
  </a>
  <a href="https://libraries.io/npm/nestjs-session">
    <img alt="Libraries.io" src="https://img.shields.io/librariesio/release/npm/nestjs-session" />
  </a>
  <img alt="Dependabot" src="https://badgen.net/github/dependabot/iamolegga/nestjs-session" />
  <img alt="Supported platforms: Express" src="https://img.shields.io/badge/platforms-Express-green" />
</p>

<p align="center">Idiomatic Session Module for NestJS. Built on top of <a href="https://npm.im/express-session">express-session</a> 😎</p>

This module implements a session with storing data in one of [external stores](https://github.com/expressjs/session#compatible-session-stores) and passing ID of session to client via `Cookie`/`Set-Cookie` headers.

If you want to store data directly in `Cookie`, you can look at [nestjs-cookie-session](https://github.com/iamolegga/nestjs-cookie-session).

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

In controllers use NestJS built-in `Session` decorator:

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

---

**BE AWARE THAT THIS EXAMPLE IS NOT FOR PRODUCTION! IT USES IN-MEMORY STORE, SO YOUR DATA WILL BE LOST ON RESTART. USE OTHER [STORES](https://github.com/expressjs/session#compatible-session-stores)**

---

See [redis-store](https://github.com/tj/connect-redis) example in `examples` folder.

To run examples:

```sh
git clone https://github.com/iamolegga/nestjs-session.git
cd nestjs-session
npm i
npm run build
cd examples/in-memory # or `cd examples/redis-store`
npm i
npm start
```

For Redis example, you should start Redis on localhost:6379.
If you have Docker installed you can start Redis image by `npm run redis` from `redis-store` directory.

## Install

```sh
npm i nestjs-session express-session @types/express-session
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

`NestSessionOptions` is the interface of all options. It has next properties:

- `session` - **required** - [express-session options](https://github.com/expressjs/session#options).
- `forRoutes` - **optional** - same as NestJS buil-in `MiddlewareConfigProxy['forRoutes']` [See examples in official docs](https://docs.nestjs.com/middleware#applying-middleware). Specify routes, that should have access to session. If `forRoutes` and `exclude` will not be set, then sessions will be set to all routes.
- `exclude` - **optional** - same as NestJS buil-in `MiddlewareConfigProxy['exclude']` [See examples in official docs](https://docs.nestjs.com/middleware#applying-middleware). Specify routes, that should not have access to session. If `forRoutes` and `exclude` will not be set, then sessions will be set to all routes.
- `retries` - **optional** - `number` - by default if your session store lost connection to database it will return session as `undefined`, and no errors will be thrown, and then you need to check session in controller. But you can set this property how many times it should retry to get session, and on fail `InternalServerErrorException` will be thrown. If you don't want retries, but just want to `InternalServerErrorException` to be throw, then set to `0`. Set this option, if you dont't want manualy check session inside controllers.
- `retriesStrategy` - **optional** - `(attempt: number) => number` - function that returns number of ms to wait between next attempt. Not calls on first attempt.

### NestSessionAsyncOptions

`NestSessionAsyncOptions` is the interface of options to create session module, that depends on other modules. It has next properties:

- `imports` - **optional** - modules, that session module depends on. See [official docs](https://docs.nestjs.com/modules).
- `inject` - **optional** - providers from `imports`-property modules, that will be passed as arguments to `useFactory` method.
- `useFactory` - **required** - method, that returns `NestSessionOptions`.

## Migration

### v2

`express-session` and `@types/express-session` are moved to peer dependencies, so you can update them independently.

<h2 align="center">Do you use this library?<br/>Don't be shy to give it a star! ★</h2>

<h3 align="center">Also if you are into NestJS you might be interested in one of my <a href="https://github.com/iamolegga#nestjs">other NestJS libs</a>.</h3>
