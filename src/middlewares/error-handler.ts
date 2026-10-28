import type { ErrorRequestHandler } from 'express';
import { AppError, logger } from '#/utils';

const errorHandler: ErrorRequestHandler = (error: unknown, _req, _res, _next): void => {
  if (error instanceof AppError) {
    _res.status(error.statusCode).json({
      error: error.message,
    });
    return;
  }

  logger.error('Unexpected application error', error);

  _res.status(500).json({
    error: 'Internal server error',
  });
};

export { errorHandler };
