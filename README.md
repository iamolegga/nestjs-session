<h1 align="center">NestJS-Session</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/nestjs-session">
    <img alt="npm" src="https://img.shields.io/npm/v/nestjs-session" />
  </a>
  <img alt="GitHub branch checks state" src="https://badgen.net/github/checks/iamolegga/nestjs-session" />
  <a href="https://codeclimate.com/github/iamolegga/nestjs-session/test_coverage">
    <img src="https://api.codeclimate.com/v1/badges/08bcbca7b2da14b3bbfd/test_coverage" />
  </a>
  <img alt="Supported platforms: Express" src="https://img.shields.io/badge/platforms-Express-green" />
</p>
<p align="center">
  <a href="https://snyk.io/test/github/iamolegga/nestjs-session">
    <img alt="Snyk Vulnerabilities for npm package" src="https://img.shields.io/snyk/vulnerabilities/npm/nestjs-session" />
  </a>
  <a href="https://david-dm.org/iamolegga/nestjs-session">
    <img alt="Dependencies status" src="https://badgen.net/david/dep/iamolegga/nestjs-session">
  </a>
  <img alt="Dependabot" src="https://badgen.net/dependabot/iamolegga/nestjs-session/?icon=dependabot">
  <a href="https://codeclimate.com/github/iamolegga/nestjs-session">
    <img alt="Maintainability" src="https://badgen.net/codeclimate/maintainability/iamolegga/nestjs-session">
  </a>
</p>

<p align="center">Idiomatic Session Module for NestJS. Built on top of <a href="https://npm.im/express-session">express-session</a>😎</p>

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

---

<h2 align="center">Do you use this library?<br/>Don't be shy to give it a star! ★</h2>

Also if you are into NestJS ecosystem you may be interested in one of my other libs:

[nestjs-pino](https://github.com/iamolegga/nestjs-pino)

[![GitHub stars](https://img.shields.io/github/stars/iamolegga/nestjs-pino?style=flat-square)](https://github.com/iamolegga/nestjs-pino)
[![npm](https://img.shields.io/npm/dm/nestjs-pino?style=flat-square)](https://www.npmjs.com/package/nestjs-pino)

Platform agnostic logger for NestJS based on [pino](http://getpino.io/) with request context in every log

---

[nestjs-session](https://github.com/iamolegga/nestjs-session)

[![GitHub stars](https://img.shields.io/github/stars/iamolegga/nestjs-session?style=flat-square)](https://github.com/iamolegga/nestjs-session)
[![npm](https://img.shields.io/npm/dm/nestjs-session?style=flat-square)](https://www.npmjs.com/package/nestjs-session)

Idiomatic session module for NestJS. Built on top of [express-session](https://www.npmjs.com/package/express-session)

---

[nestjs-cookie-session](https://github.com/iamolegga/nestjs-cookie-session)

[![GitHub stars](https://img.shields.io/github/stars/iamolegga/nestjs-cookie-session?style=flat-square)](https://github.com/iamolegga/nestjs-cookie-session)
[![npm](https://img.shields.io/npm/dm/nestjs-cookie-session?style=flat-square)](https://www.npmjs.com/package/nestjs-cookie-session)

Idiomatic cookie session module for NestJS. Built on top of [cookie-session](https://www.npmjs.com/package/cookie-session)

---

[nestjs-roles](https://github.com/iamolegga/nestjs-roles)

[![GitHub stars](https://img.shields.io/github/stars/iamolegga/nestjs-roles?style=flat-square)](https://github.com/iamolegga/nestjs-roles)
[![npm](https://img.shields.io/npm/dm/nestjs-roles?style=flat-square)](https://www.npmjs.com/package/nestjs-roles)

Type safe roles guard and decorator made easy

---

[nestjs-injectable](https://github.com/segmentstream/nestjs-injectable)

[![GitHub stars](https://img.shields.io/github/stars/segmentstream/nestjs-injectable?style=flat-square)](https://github.com/segmentstream/nestjs-injectable)
[![npm](https://img.shields.io/npm/dm/nestjs-injectable?style=flat-square)](https://www.npmjs.com/package/nestjs-injectable)

`@Injectable()` on steroids that simplifies work with inversion of control in your hexagonal architecture

---

[nest-ratelimiter](https://github.com/iamolegga/nestjs-ratelimiter)

[![GitHub stars](https://img.shields.io/github/stars/iamolegga/nestjs-ratelimiter?style=flat-square)](https://github.com/iamolegga/nestjs-ratelimiter)
[![npm](https://img.shields.io/npm/dm/nest-ratelimiter?style=flat-square)](https://www.npmjs.com/package/nest-ratelimiter)

Distributed consistent flexible NestJS rate limiter based on Redis

---

[create-nestjs-middleware-module](https://github.com/iamolegga/create-nestjs-middleware-module)

[![GitHub stars](https://img.shields.io/github/stars/iamolegga/create-nestjs-middleware-module?style=flat-square)](https://github.com/iamolegga/create-nestjs-middleware-module)
[![npm](https://img.shields.io/npm/dm/create-nestjs-middleware-module?style=flat-square)](https://www.npmjs.com/package/create-nestjs-middleware-module)

Create simple idiomatic NestJS module based on Express/Fastify middleware in just a few lines of code with routing out of the box

---

[nestjs-configure-after](https://github.com/iamolegga/nestjs-configure-after)

[![GitHub stars](https://img.shields.io/github/stars/iamolegga/nestjs-configure-after?style=flat-square)](https://github.com/iamolegga/nestjs-configure-after)
[![npm](https://img.shields.io/npm/dm/nestjs-configure-after?style=flat-square)](https://www.npmjs.com/package/nestjs-configure-after)

Declarative configuration of NestJS middleware order
