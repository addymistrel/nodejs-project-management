import { RequestValidator } from '#/types';
import { InvalidRequestException } from '#/utils';
import { NextFunction, Request, RequestHandler, Response } from 'express';

function validateRequest(validator: RequestValidator): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const validationResult = validator(req);

    if (!validationResult.isValid) {
      next(new InvalidRequestException(validationResult.message));
      return;
    }

    next();
  };
}

export { validateRequest };
