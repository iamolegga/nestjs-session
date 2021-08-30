import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  public readonly REDIS_PORT = Number(process.env.REDIS_PORT || 6379);
  public readonly REDIS_HOST = process.env.REDIS_HOST;
  public readonly SESSION_SECRET = process.env.SESSION_SECRET || 'supersecret';
}
