import {
  Controller,
  Get,
  Module,
  RequestMethod,
  Session,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { SessionModule } from '../src';

import { platforms } from './utils/platforms';
import { doubleRequest } from './utils/request';

describe('routing', () => {
  for (const PlatformAdapter of platforms) {
    describe(PlatformAdapter.name, () => {
      it('forRoutes', async () => {
        @Controller('/')
        class TestController {
          @Get('with-session')
          withSession(@Session() session?: { views?: number }) {
            if (!session) {
              return { views: 1 };
            }
            session.views = (session.views || 0) + 1;
            return { views: session.views };
          }

          @Get('without-session')
          withoutSession(@Session() session?: { views?: number }) {
            if (!session) {
              return { views: 1 };
            }

            session.views = (session.views || 0) + 1;
            return { views: session.views };
          }
        }

        @Module({
          imports: [
            SessionModule.forRoot({
              session: { secret: 'test' },
              forRoutes: [{ method: RequestMethod.ALL, path: 'with-session' }],
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
        const [sessRes1, sessRes2] = await doubleRequest(
          server,
          '/with-session',
        );
        const [noSessRes1, noSessRes2] = await doubleRequest(
          server,
          '/without-session',
        );
        await app.close();

        expect(sessRes1.body.views).toBe(1);
        expect(sessRes2.body.views).toBe(2);

        expect(noSessRes1.body.views).toBe(1);
        expect(noSessRes2.body.views).toBe(1);
      });

      it('exclude', async () => {
        @Controller('/')
        class TestController {
          @Get('with-session')
          withSession(@Session() session?: { views?: number }) {
            if (!session) {
              return { views: 1 };
            }
            session.views = (session.views || 0) + 1;
            return { views: session.views };
          }

          @Get('without-session')
          withoutSession(@Session() session?: { views?: number }) {
            if (!session) {
              return { views: 1 };
            }

            session.views = (session.views || 0) + 1;
            return { views: session.views };
          }
        }

        @Module({
          imports: [
            SessionModule.forRoot({
              session: { secret: 'test' },
              exclude: [{ method: RequestMethod.ALL, path: 'without-session' }],
              forRoutes: [TestController],
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
        const [sessRes1, sessRes2] = await doubleRequest(
          server,
          '/with-session',
        );
        const [noSessRes1, noSessRes2] = await doubleRequest(
          server,
          '/without-session',
        );
        await app.close();

        expect(sessRes1.body.views).toBe(1);
        expect(sessRes2.body.views).toBe(2);

        expect(noSessRes1.body.views).toBe(1);
        expect(noSessRes2.body.views).toBe(1);
      });
    });
  }
});
