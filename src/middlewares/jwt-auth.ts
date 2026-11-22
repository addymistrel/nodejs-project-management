import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { HTTP_STATUS_CODE } from '#/constants';
import { AppResponse } from '#/utils';
import { environmentConfig } from '#/config';

function isAccessToken(token: string, secret: string): boolean {
  try {
    const payload = jwt.verify(token, secret, {
      issuer: 'nodejs-project-management',
    });
    return typeof payload !== 'string' && payload.type !== 'refresh';
  } catch {
    return false;
  }
}

function jwtAuth(request: Request, response: Response, next: NextFunction): void {
  if (environmentConfig.nodeEnvironment === 'test') {
    next();
    return;
  }

  const secret = environmentConfig.jwtSecret;
  if (!secret) {
    AppResponse.sendError(
      response,
      HTTP_STATUS_CODE.SERVICE_UNAVAILABLE,
      'JWT_SECRET is not configured',
    );
    return;
  }

  const authorization = request.header('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    AppResponse.sendError(response, HTTP_STATUS_CODE.UNAUTHORIZED, 'Unauthorized');
    return;
  }

  if (!isAccessToken(authorization.slice(7), secret)) {
    AppResponse.sendError(response, HTTP_STATUS_CODE.UNAUTHORIZED, 'Unauthorized');
    return;
  }
  next();
}

export { jwtAuth };
