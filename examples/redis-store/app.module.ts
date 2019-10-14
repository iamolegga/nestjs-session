import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { Session } from './session.module';

@Module({
  imports: [Session],
  controllers: [AppController],
})
export class AppModule {}
