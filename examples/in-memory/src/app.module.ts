import { Module } from '@nestjs/common';
import { SessionModule } from '../../../dist';
import { AppController } from './app.controller';

@Module({
  imports: [
    SessionModule.forRoot({
      session: { secret: 'qwerty' },
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
