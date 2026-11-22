import 'dotenv/config';
import { environmentConfig } from '#/config/environment-config.js';

const jobConfig = {
  workerPoolSize: environmentConfig.workerPoolSize,
};

export { jobConfig };
