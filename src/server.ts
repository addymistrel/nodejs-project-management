import { app } from './app.js';
import { connectToDatabase, disconnectDatabase } from '#/database';
import { logger } from '#/utils';
import type { Server } from 'http';
import { environmentConfig, validateEnvironment } from '#/config';

const port = environmentConfig.port;
let httpServer: Server | undefined;
let shuttingDown = false;

async function startServer(): Promise<void> {
  try {
    validateEnvironment(['databaseUrl', 'jwtSecret', 'jwtRefreshSecret']);
    await connectToDatabase();
    httpServer = app.listen(port, () => {
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

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  logger.info('Server shutdown started', {
    functionName: 'shutdown',
    event: 'server.shutdown.started',
    signal,
  });

  await closeHttpServer();
  await disconnectDatabase();
  logger.info('Server shutdown completed', {
    functionName: 'shutdown',
    event: 'server.shutdown.completed',
  });
  process.exit(0);
}

async function closeHttpServer(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    if (!httpServer) {
      resolve();
      return;
    }
    httpServer.close((error) => (error ? reject(error) : resolve()));
  });
}

function registerLifecycleHandlers(): void {
  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.once(signal, () => {
      void shutdown(signal).catch((error: unknown) => {
        logger.error('Graceful shutdown failed', error, {
          functionName: 'shutdown',
          event: 'server.shutdown.failed',
        });
        process.exit(1);
      });
    });
  }

  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled promise rejection', reason, {
      functionName: 'process',
      event: 'process.unhandled_rejection',
    });
  });
}

registerLifecycleHandlers();

startServer().catch((error: unknown) => {
  logger.error('Server startup failed unexpectedly', error, {
    functionName: 'startServer',
    event: 'server.startup.failed',
  });
});
