import { Sequelize } from 'sequelize';
import { databaseConfig } from '#/config';
import { logger } from '#/utils';

const databaseOptions = {
  dialect: 'postgres',
  logging: databaseConfig.logging,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
} as const;

const databaseClient = databaseConfig.url
  ? new Sequelize(databaseConfig.url, databaseOptions)
  : new Sequelize(databaseOptions);

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

export { databaseClient, connectToDatabase };
