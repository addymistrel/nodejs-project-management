import 'dotenv/config';
import { logger } from '#/utils';

const databaseUrl = process.env.DATABASE_URL;
const nodeEnvironment = process.env.NODE_ENV;

const databaseConfig = {
  url: databaseUrl,
  logging: nodeEnvironment === 'development' ? logger.log.bind(logger) : false,
};

export { databaseConfig };
