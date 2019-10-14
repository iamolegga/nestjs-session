import { Module } from '@nestjs/common';
import { NestSessionOptions, SessionModule } from '../../';
import { AppController } from './app.controller';
import { ConfigModule } from './config.module';
import { ConfigService } from './config.service';

@Module({
  imports: [
    SessionModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        config: ConfigService,
      ): Promise<NestSessionOptions> => {
        return { session: { secret: config.SESSION_SECRET } };
      },
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
