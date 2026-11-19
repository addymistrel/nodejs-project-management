import { APP_CONSTANTS } from '#/constants';
import { environmentConfig } from '#/config';

const appConfig = {
  poweredByHeader: APP_CONSTANTS.POWERED_BY_HEADER,
  cors: {
    origin: environmentConfig.corsOrigin.length > 0 ? environmentConfig.corsOrigin : false,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: APP_CONSTANTS.RATE_LIMIT_STANDARD_HEADERS,
    legacyHeaders: false,
  },
  enableApiDocs: environmentConfig.nodeEnvironment !== 'production',
  paths: {
    health: APP_CONSTANTS.HEALTH_PATH,
    apiDocs: APP_CONSTANTS.API_DOCS_PATH,
    apiDocsJson: APP_CONSTANTS.API_DOCS_JSON_PATH,
  },
};

export { appConfig };
