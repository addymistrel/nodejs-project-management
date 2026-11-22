import 'dotenv/config';

const parsePositiveInteger = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return value && Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const nodeEnvironment = process.env.NODE_ENV ?? 'development';
const uploadsDir = process.env.UPLOADS_DIR?.trim() || 'uploads';
const jwtSecret = process.env.JWT_SECRET?.trim();
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET?.trim() || jwtSecret;

const environmentConfig = {
  nodeEnvironment,
  isTestEnvironment: nodeEnvironment === 'test' || process.env.VITEST === 'true',
  port: parsePositiveInteger(process.env.PORT, 3000),
  uploadsDir,
  jwtSecret,
  jwtRefreshSecret,
  logLevel: process.env.LOG_LEVEL?.trim(),
  corsOrigin:
    process.env.CORS_ORIGIN?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? [],
  databaseUrl: process.env.DATABASE_URL?.trim() || undefined,
  databaseSsl: process.env.DATABASE_SSL === 'true',
  databaseSslRejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',
  databasePool: {
    max: parsePositiveInteger(process.env.DATABASE_POOL_MAX, 10),
    min: parsePositiveInteger(process.env.DATABASE_POOL_MIN, 2),
    acquire: parsePositiveInteger(process.env.DATABASE_POOL_ACQUIRE, 30_000),
    idle: parsePositiveInteger(process.env.DATABASE_POOL_IDLE, 10_000),
  },
  workerPoolSize: parsePositiveInteger(process.env.JOB_WORKER_POOL_SIZE, 2),
};

function validateEnvironment(requiredKeys: Array<keyof typeof environmentConfig>): void {
  const missing = requiredKeys.filter((key) => {
    const value = environmentConfig[key];
    return value === undefined || value === null || value === '';
  });
  if (missing.length > 0) {
    throw new Error(`Missing required environment configuration: ${missing.join(', ')}`);
  }
}

export { environmentConfig, validateEnvironment };
