import { Sequelize } from 'sequelize';
import { databaseConfig } from '#/config';
import { logger } from '#/utils';

const databaseClient = new Sequelize(databaseConfig.url, {
  dialect: 'postgres',
  logging: databaseConfig.logging,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

async function connectToDatabase(): Promise<void> {
  try {
    await databaseClient.authenticate();
    logger.info('Database connection established');
  } catch (error: unknown) {
    logger.error('Unable to connect to the database', error);
    throw error;
  }
}

export { databaseClient, connectToDatabase };
