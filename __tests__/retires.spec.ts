import { Controller, Get, Module, Session } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Handler } from 'express';
import { MemoryStore } from 'express-session';
import * as request from 'supertest';
import { SessionModule } from '../src';
import { fastifyExtraWait } from './utils/fastifyExtraWait';
import { platforms } from './utils/platforms';
import { doubleRequest } from './utils/request';

describe('retries', () => {
  for (const PlatformAdapter of platforms) {
    describe(PlatformAdapter.name, () => {
      it('session is undefined with disconnected store', async () => {
        @Controller('/')
        class TestController {
          @Get()
          get(@Session() session?: { views?: number }) {
            return { sessionType: typeof session };
          }
        }

        const store = new MemoryStore();

        // tslint:disable-next-line max-classes-per-file
        @Module({
          imports: [
            SessionModule.forRoot({ session: { secret: 'test', store } }),
          ],
          controllers: [TestController],
        })
        class TestModule {}

        const app = await NestFactory.create(
          TestModule,
          new PlatformAdapter(),
          { logger: false },
        );
        const server = app.getHttpServer();

        await app.init();
        await fastifyExtraWait(PlatformAdapter, app);

        (store as any).emit('disconnect');

        const result = await request(server).get('/');
        await app.close();

        expect(result.body).toEqual({ sessionType: 'undefined' });
      });

      it('controllers should be blocked with disconnected store and set retries', async () => {
        let isControllerCalled = false;

        // tslint:disable-next-line max-classes-per-file
        @Controller('/')
        class TestController {
          @Get()
          get() {
            isControllerCalled = true;
          }
        }

        const store = new MemoryStore();

        // tslint:disable-next-line max-classes-per-file
        @Module({
          imports: [
            SessionModule.forRoot({
              session: { secret: 'test', store },
              retries: 0,
            }),
          ],
          controllers: [TestController],
        })
        class TestModule {}

        const app = await NestFactory.create(
          TestModule,
          new PlatformAdapter(),
          { logger: false },
        );
        const server = app.getHttpServer();

        await app.init();
        await fastifyExtraWait(PlatformAdapter, app);

        (store as any).emit('disconnect');
        const result = await request(server).get('/');
        await app.close();

        expect(result.status).toBe(500);
        expect(isControllerCalled).toBeFalsy();
      });

      it('retries should work when reconnected', async () => {
        let isControllerCalled = false;

        // tslint:disable-next-line max-classes-per-file
        @Controller('/')
        class TestController {
          @Get()
          get() {
            isControllerCalled = true;
          }
        }

        const store = new MemoryStore();

        // tslint:disable-next-line max-classes-per-file
        @Module({
          imports: [
            SessionModule.forRoot({
              session: { secret: 'test', store },
              retries: 1,
            }),
          ],
          controllers: [TestController],
        })
        class TestModule {}

        const app = await NestFactory.create(
          TestModule,
          new PlatformAdapter(),
          { logger: false },
        );
        app.use(((_req, _res, next) => {
          next();
          process.nextTick(() => {
            (store as any).emit('connect');
          });
        }) as Handler);
        const server = app.getHttpServer();

        await app.init();
        await fastifyExtraWait(PlatformAdapter, app);

        (store as any).emit('disconnect');
        const reqPromise = request(server).get('/');

        const result = await reqPromise;
        await app.close();

        expect(result.status).toBe(200);
        expect(isControllerCalled).toBeTruthy();
      });

      it('controllers should be blocked with error in store and set retries', async () => {
        let callTimes = 0;

        // tslint:disable-next-line max-classes-per-file
        @Controller('/')
        class TestController {
          @Get()
          get() {
            callTimes++;
          }
        }

        const store = new MemoryStore();
        store.get = (_sid, cb) => cb(new Error());

        // tslint:disable-next-line max-classes-per-file
        @Module({
          imports: [
            SessionModule.forRoot({
              session: { secret: 'test', store },
              retries: 0,
            }),
          ],
          controllers: [TestController],
        })
        class TestModule {}

        const app = await NestFactory.create(
          TestModule,
          new PlatformAdapter(),
          { logger: false },
        );
        const server = app.getHttpServer();

        await app.init();
        await fastifyExtraWait(PlatformAdapter, app);

        const [, result] = await doubleRequest(server);
        await app.close();

        expect(result.status).toBe(500);
        expect(callTimes).toBe(1);
      });
    });
  }
});
