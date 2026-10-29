import type { ErrorRequestHandler } from 'express';
import { AppError, logger } from '#/utils';
import multer from 'multer';

const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next): void => {
  if (error instanceof multer.MulterError) {
    const statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;

    res.status(statusCode).json({
      error: error.message,
    });

    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: error.message,
    });

    return;
  }

  logger.error('Unexpected application error', error);

  res.status(500).json({
    error: 'Internal server error',
  });
};

export { errorHandler };
