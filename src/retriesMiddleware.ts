import { InternalServerErrorException } from '@nestjs/common';
import * as express from 'express';

type WaitingStrategy = (attempt: number) => number;

export function createRetriesMiddleware(
  sessionMiddleware: express.RequestHandler,
  retries: number,
  retiesStrategy: WaitingStrategy = () => 0,
): express.RequestHandler {
  return (req, res, next) => {
    let attempt = 0;

    async function lookupSession(error?: any) {
      if (error) {
        return next(error);
      }

      if (req.session !== undefined) {
        return next();
      }

      if (attempt > retries) {
        return next(new InternalServerErrorException('Cannot create session'));
      }

      if (attempt !== 0) {
        await new Promise(r => setTimeout(r, retiesStrategy(attempt)));
      }

      attempt++;

      sessionMiddleware(req, res, lookupSession);
    }

    lookupSession();
  };
}
