import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  public readonly SESSION_SECRET = process.env.SESSION_SECRET || 'supersecret';
}
