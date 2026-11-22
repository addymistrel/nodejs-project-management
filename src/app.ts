import express from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { databaseClient, initializeModelRelations } from '#/database';
import { HTTP_STATUS_CODE } from '#/constants';
import { appConfig } from '#/config';
import { jwtAuth, errorHandler } from '#/middlewares';
import { authRouter, fileRouter, jobRouter, projectRouter } from '#/routes';
import { swaggerDocument } from '#/docs';
import { AppResponse } from '#/utils';

const app = express();

initializeModelRelations();

app.disable(appConfig.poweredByHeader);
app.use(helmet());
app.use(
  cors({
    origin: appConfig.cors.origin,
  }),
);
app.use(compression());
app.use(rateLimit(appConfig.rateLimit));
app.use(express.json());

app.get(appConfig.paths.health, async (_request, response) => {
  try {
    await databaseClient.authenticate();
    AppResponse.sendSuccess(response, HTTP_STATUS_CODE.OK, { status: 'ok' });
  } catch {
    AppResponse.sendError(response, HTTP_STATUS_CODE.SERVICE_UNAVAILABLE, 'Database unavailable');
  }
});

if (appConfig.enableApiDocs) {
  app.get(appConfig.paths.apiDocsJson, (_request, response) => {
    response.json(swaggerDocument);
  });
  app.use(appConfig.paths.apiDocs, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/projects', jwtAuth, projectRouter);
app.use('/api/v1/projects/:projectId/files', jwtAuth, fileRouter);
app.use('/api/v1/projects/:projectId/jobs', jwtAuth, jobRouter);

app.use(errorHandler);

export { app };
