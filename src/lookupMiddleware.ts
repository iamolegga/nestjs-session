import { InternalServerErrorException } from '@nestjs/common';
import * as express from 'express';

export function createLookupMiddleware(
  sessionMiddleware: express.RequestHandler,
  tries: number,
): express.RequestHandler {
  return (req, res, next) => {
    let left = tries;

    function lookupSession(error?: any) {
      if (error) {
        return next(error);
      }

      left -= 1;

      if (req.session !== undefined) {
        return next();
      }

      if (left < 0) {
        return next(new InternalServerErrorException('Cannot create session'));
      }

      sessionMiddleware(req, res, lookupSession);
    }

    lookupSession();
  };
}
