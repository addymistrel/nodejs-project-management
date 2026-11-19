import express from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { initializeModelRelations } from '#/database';
import { HTTP_STATUS_CODE } from '#/constants';
import { jwtAuth, errorHandler } from '#/middlewares';
import { authRouter, fileRouter, jobRouter, projectRouter } from '#/routes';
import { swaggerDocument } from '#/docs';
import { AppResponse } from '#/utils';

const app = express();

initializeModelRelations();

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) ?? false,
  }),
);
app.use(compression());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  }),
);
app.use(express.json());

app.get('/api/v1/health', (_request, response) => {
  AppResponse.sendSuccess(response, HTTP_STATUS_CODE.OK, { status: 'ok' });
});

if (process.env.NODE_ENV !== 'production') {
  app.get('/api-docs.json', (_request, response) => {
    response.json(swaggerDocument);
  });
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/projects', jwtAuth, projectRouter);
app.use('/api/v1/projects/:projectId/files', jwtAuth, fileRouter);
app.use('/api/v1/projects/:projectId/jobs', jwtAuth, jobRouter);

app.use(errorHandler);

export { app };
