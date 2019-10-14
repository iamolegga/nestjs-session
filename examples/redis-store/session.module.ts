import * as ConnectRedis from 'connect-redis';
import * as session from 'express-session';
import { RedisService } from 'nestjs-redis';
import { NestSessionOptions, SessionModule } from '../../';
import { ConfigModule } from './config.module';
import { ConfigService } from './config.service';
import { Redis } from './redis.module';

const RedisStore = ConnectRedis(session);

export const Session = SessionModule.forRootAsync({
  imports: [Redis, ConfigModule],
  inject: [RedisService, ConfigService],
  useFactory: (
    redisService: RedisService,
    config: ConfigService,
  ): NestSessionOptions => {
    const redisClient = redisService.getClient();
    const store = new RedisStore({ client: redisClient as any });
    return {
      session: {
        store,
        secret: config.SESSION_SECRET,
      },
    };
  },
});
