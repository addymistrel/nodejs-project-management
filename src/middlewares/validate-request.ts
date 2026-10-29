import { RequestValidator } from '#/types';
import { AppError } from '#/utils';
import { NextFunction, Request, RequestHandler, Response } from 'express';

function validateRequest(validator: RequestValidator): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const validationResult = validator(req);

    if (!validationResult.isValid) {
      next(new AppError(validationResult.message ?? 'Invalid Request', 400));
      return;
    }

    next();
  };
}

export { validateRequest };
