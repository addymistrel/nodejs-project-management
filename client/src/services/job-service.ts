import type { AxiosInstance } from 'axios';
import { apiClient } from './api-client';
import { API_ENDPOINTS } from '@/constants';
import type {
  ApiResponse,
  CreateZipJobInput,
  PaginatedJobsResponse,
  PaginationParams,
  ZipJob,
} from '@/types';

export class JobService {
  constructor(private readonly http: AxiosInstance = apiClient) {}

  async createZipJob(projectId: number | string, data: CreateZipJobInput): Promise<ZipJob> {
    const response = await this.http.post<ApiResponse<ZipJob>>(
      API_ENDPOINTS.JOBS.ZIP(projectId),
      data,
    );

    if (!response.data.success) {
      throw new Error(response.data.error);
    }

    return response.data.data;
  }

  async listJobs(
    projectId: number | string,
    params?: PaginationParams,
  ): Promise<PaginatedJobsResponse> {
    const response = await this.http.get<ApiResponse<PaginatedJobsResponse>>(
      API_ENDPOINTS.JOBS.BASE(projectId),
      { params },
    );

    if (!response.data.success) {
      throw new Error(response.data.error);
    }

    return response.data.data;
  }

  async getJob(projectId: number | string, jobId: number | string): Promise<ZipJob> {
    const response = await this.http.get<ApiResponse<ZipJob>>(
      API_ENDPOINTS.JOBS.BY_ID(projectId, jobId),
    );

    if (!response.data.success) {
      throw new Error(response.data.error);
    }

    return response.data.data;
  }
}

export const jobService = new JobService();
