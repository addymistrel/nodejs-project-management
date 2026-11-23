export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ZipJob {
  jobId: number;
  projectId: number;
  type: string;
  status: JobStatus;
  progress: number;
  outputFileId?: number;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface CreateZipJobInput {
  fileIds: number[];
}

export interface PaginatedJobsResponse {
  items: ZipJob[];
  total: number;
  limit: number;
  pageNumber: number;
}
