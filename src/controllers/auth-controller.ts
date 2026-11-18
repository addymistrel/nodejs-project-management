import type { Request, Response } from 'express';
import { HTTP_STATUS_CODE } from '#/constants';
import { login, refresh, signup } from '#/services';
import { AppResponse } from '#/utils';

async function signupController(request: Request, response: Response): Promise<void> {
  const result = await signup(request.body.name, request.body.email, request.body.password);
  AppResponse.sendSuccess(response, HTTP_STATUS_CODE.CREATED, result);
}

async function loginController(request: Request, response: Response): Promise<void> {
  const result = await login(request.body.email, request.body.password);
  AppResponse.sendSuccess(response, HTTP_STATUS_CODE.OK, result);
}

async function refreshController(request: Request, response: Response): Promise<void> {
  const result = await refresh(request.body.refreshToken);
  AppResponse.sendSuccess(response, HTTP_STATUS_CODE.OK, result);
}

export { loginController, refreshController, signupController };
