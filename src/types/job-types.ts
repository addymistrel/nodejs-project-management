import type { JOB_STATUSES, JOB_TYPES } from '#/constants/job-constants.js';

type JobType = (typeof JOB_TYPES)[keyof typeof JOB_TYPES];
type JobStatus = (typeof JOB_STATUSES)[keyof typeof JOB_STATUSES];

export { JobType, JobStatus };
