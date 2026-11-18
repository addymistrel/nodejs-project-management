import { Router } from 'express';
import { loginController, refreshController, signupController } from '#/controllers';
import { validateRequest } from '#/middlewares';
import { validateLogin, validateRefresh, validateSignup } from '#/validators';
import { asyncHandler } from '#/utils';

const authRouter = Router();

authRouter.post('/signup', validateRequest(validateSignup), asyncHandler(signupController));

authRouter.post('/login', validateRequest(validateLogin), asyncHandler(loginController));

authRouter.post('/refresh', validateRequest(validateRefresh), asyncHandler(refreshController));

export { authRouter };
