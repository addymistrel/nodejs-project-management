import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { initializeModelRelations } from '#/database';
import { errorHandler } from '#/middlewares';
import { fileRouter, jobRouter, projectRouter } from '#/routes';
import { swaggerDocument } from '#/docs';

const app = express();

initializeModelRelations();

app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.get('/api-docs.json', (_request, response) => {
  response.json(swaggerDocument);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/projects', projectRouter);
app.use('/api/projects/:projectId/files', fileRouter);
app.use('/api/projects/:projectId/jobs', jobRouter);

app.use(errorHandler);

export { app };
