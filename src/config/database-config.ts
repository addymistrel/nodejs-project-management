import 'dotenv/config';
import { logger } from '#/utils';

const databaseUrl = process.env.DATABASE_URL;
const nodeEnvironment = process.env.NODE_ENV;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not configured');
}

const databaseConfig = {
  url: databaseUrl,
  logging: nodeEnvironment === 'development' ? logger.log.bind(logger) : false,
};

export { databaseConfig };
