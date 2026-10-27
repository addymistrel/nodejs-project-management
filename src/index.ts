import express from 'express';

import { initializeModelRelations } from '#/database';
import { logger } from '#/utils';

const app = express();
const port = Number(process.env.PORT ?? 3000);

initializeModelRelations();

app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
