import express from 'express';

import { initializeModelRelations } from '#/database';
import { errorHandler } from '#/middlewares';
import { fileRouter, jobRouter, projectRouter } from '#/routes';

const app = express();

initializeModelRelations();

app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use('/api/projects', projectRouter);
app.use('/api/projects/:projectId/files', fileRouter);
app.use('/api/projects/:projectId/jobs', jobRouter);

app.use(errorHandler);

export { app };
