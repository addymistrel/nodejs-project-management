import type { JOB_STATUSES, JOB_TYPES } from '#/constants';

type JobType = (typeof JOB_TYPES)[keyof typeof JOB_TYPES];
type JobStatus = (typeof JOB_STATUSES)[keyof typeof JOB_STATUSES];

interface CreateZipJobRequest {
  fileIds: number[];
}

interface JobResponse {
  jobId: number;
  projectId: number;
  type: JobType;
  status: JobStatus;
  progress: number;
  outputFileId?: number;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export type { CreateZipJobRequest, JobResponse, JobType, JobStatus };
