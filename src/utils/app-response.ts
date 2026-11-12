import type { Response } from 'express';
import type { ApiErrorResponse, ApiSuccessResponse } from '#/types';

class AppResponse {
  static sendSuccess<T>(response: Response, statusCode: number, data: T): void {
    response.status(statusCode).json(AppResponse.createSuccess(data));
  }

  static sendError(response: Response, statusCode: number, error: string): void {
    response.status(statusCode).json(AppResponse.createError(error));
  }

  private static createSuccess<T>(data: T): ApiSuccessResponse<T> {
    return {
      success: true,
      data,
    };
  }

  private static createError(error: string): ApiErrorResponse {
    return {
      success: false,
      error,
    };
  }
}

export { AppResponse };
