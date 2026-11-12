import type { ErrorRequestHandler } from 'express';
import { HTTP_STATUS_CODE } from '#/constants';
import { AppExceptionBase, AppResponse, logger } from '#/utils';
import multer from 'multer';

const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next): void => {
  if (error instanceof multer.MulterError) {
    const statusCode =
      error.code === 'LIMIT_FILE_SIZE'
        ? HTTP_STATUS_CODE.PAYLOAD_TOO_LARGE
        : HTTP_STATUS_CODE.BAD_REQUEST;

    AppResponse.sendError(res, statusCode, error.message);

    return;
  }

  if (error instanceof AppExceptionBase) {
    AppResponse.sendError(res, error.statusCode, error.message);

    return;
  }

  logger.error('Unexpected application error', error);

  AppResponse.sendError(res, HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal server error');
};

export { errorHandler };
