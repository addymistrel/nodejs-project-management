import 'dotenv/config';
import { logger } from '#/utils';

const databaseUrl = process.env.DATABASE_URL;
const nodeEnvironment = process.env.NODE_ENV;
const sslEnabled = process.env.DATABASE_SSL === 'true';
const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false';

const sslEnabledState = {
  require: true,
  rejectUnauthorized,
};

const databaseConfig = {
  url: databaseUrl,
  logging: nodeEnvironment === 'development' ? logger.log.bind(logger) : false,
  ssl: sslEnabled ? sslEnabledState : undefined,
};

export { databaseConfig };
