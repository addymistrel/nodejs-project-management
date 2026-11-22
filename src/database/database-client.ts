import { Sequelize } from 'sequelize';
import { databaseConfig } from '#/config';
import { logger } from '#/utils';

function getDatabaseClient(): Sequelize {
  const commonOptions = {
    dialect: databaseConfig.dialect,
    logging: databaseConfig.logging,
    pool: databaseConfig.pool,
  } as const;

  if (databaseConfig.runtime.isTestEnvironment) {
    return new Sequelize(
      databaseConfig.test.database,
      databaseConfig.test.username,
      databaseConfig.test.password,
      {
        ...commonOptions,
        host: databaseConfig.test.host,
        port: databaseConfig.test.port,
      },
    );
  }

  if (!databaseConfig.runtime.hasDatabaseUrl) {
    throw new Error('DATABASE_URL is not configured');
  }

  return new Sequelize(databaseConfig.url as string, {
    ...commonOptions,
    dialectOptions: databaseConfig.ssl ? { ssl: databaseConfig.ssl } : undefined,
  });
}

const databaseClient = getDatabaseClient();

async function connectToDatabase(): Promise<void> {
  if (!databaseConfig.url) {
    throw new Error('DATABASE_URL is not configured');
  }

  try {
    await databaseClient.authenticate();
    logger.info('Database connection established', {
      functionName: 'connectDatabase',
      event: 'database.connection.established',
    });
  } catch (error: unknown) {
    logger.error('Unable to connect to the database', error, {
      functionName: 'connectDatabase',
      event: 'database.connection.failed',
    });
    throw error;
  }
}

async function disconnectDatabase(): Promise<void> {
  await databaseClient.close();
}

export { databaseClient, connectToDatabase, disconnectDatabase, getDatabaseClient };
