import 'dotenv/config';
import { parsePositiveInteger } from '#/utils';

const jobConfig = {
  workerPoolSize: parsePositiveInteger(process.env.JOB_WORKER_POOL_SIZE, 2),
};

export { jobConfig };
