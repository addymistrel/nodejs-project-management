import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { initializeModelRelations } from '#/database';
import { HTTP_STATUS_CODE } from '#/constants';
import { jwtAuth, errorHandler } from '#/middlewares';
import { authRouter, fileRouter, jobRouter, projectRouter } from '#/routes';
import { swaggerDocument } from '#/docs';
import { AppResponse } from '#/utils';

const app = express();

initializeModelRelations();

app.use(express.json());

app.get('/api/v1/health', (_request, response) => {
  AppResponse.sendSuccess(response, HTTP_STATUS_CODE.OK, { status: 'ok' });
});

app.get('/api-docs.json', (_request, response) => {
  response.json(swaggerDocument);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/projects', jwtAuth, projectRouter);
app.use('/api/v1/projects/:projectId/files', jwtAuth, fileRouter);
app.use('/api/v1/projects/:projectId/jobs', jwtAuth, jobRouter);

app.use(errorHandler);

export { app };
