import { Controller, Get, Session } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(@Session() session: { views?: number }) {
    session.views = (session.views || 0) + 1;
    return session.views;
  }
}
