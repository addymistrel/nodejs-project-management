import 'dotenv/config';
import { logger, parsePositiveInteger } from '#/utils';

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
  dialect: 'postgres' as const,
  logging: nodeEnvironment === 'development' ? logger.log.bind(logger) : false,
  ssl: sslEnabled ? sslEnabledState : undefined,
  pool: {
    max: parsePositiveInteger(process.env.DATABASE_POOL_MAX, 10),
    min: parsePositiveInteger(process.env.DATABASE_POOL_MIN, 2),
    acquire: parsePositiveInteger(process.env.DATABASE_POOL_ACQUIRE, 30_000),
    idle: parsePositiveInteger(process.env.DATABASE_POOL_IDLE, 10_000),
  },
};

export { databaseConfig };
