import { app } from './app.js';
import { connectToDatabase } from '#/database';
import { logger } from '#/utils';

const port = Number(process.env.PORT ?? 3000);

async function startServer(): Promise<void> {
  try {
    await connectToDatabase();

    app.listen(port, () => {
      logger.info('Server listening', {
        functionName: 'startServer',
        event: 'server.started',
        port,
      });
    });
  } catch (error: unknown) {
    logger.error('Server startup failed', error, {
      functionName: 'startServer',
      event: 'server.startup.failed',
    });
    process.exitCode = 1;
  }
}

startServer().catch((error: unknown) => {
  logger.error('Server startup failed unexpectedly', error, {
    functionName: 'startServer',
    event: 'server.startup.failed',
  });
});
