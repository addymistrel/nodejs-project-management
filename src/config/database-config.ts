import { environmentConfig } from '#/config/environment-config.js';
import { logger } from '#/utils';

const databaseUrl = environmentConfig.databaseUrl;
const nodeEnvironment = environmentConfig.nodeEnvironment;
const sslEnabledState = {
  require: true,
  rejectUnauthorized: environmentConfig.databaseSslRejectUnauthorized,
};
const testDatabaseConfig = {
  database: 'test',
  username: 'test',
  password: 'test',
  host: '127.0.0.1',
  port: 5432,
};
const runtimeDatabaseConfig = {
  isTestEnvironment: environmentConfig.isTestEnvironment,
  hasDatabaseUrl: typeof databaseUrl === 'string' && databaseUrl.trim().length > 0,
};

const databaseConfig = {
  url: databaseUrl,
  dialect: 'postgres' as const,
  logging: nodeEnvironment === 'development' ? logger.log.bind(logger) : false,
  ssl: environmentConfig.databaseSsl ? sslEnabledState : undefined,
  pool: {
    ...environmentConfig.databasePool,
  },
  test: testDatabaseConfig,
  runtime: runtimeDatabaseConfig,
};

export { databaseConfig };
