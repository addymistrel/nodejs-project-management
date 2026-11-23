import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobService } from './job-service';
import type { AxiosInstance } from 'axios';
import { API_ENDPOINTS } from '@/constants';
import type { PaginatedJobsResponse, ZipJob } from '@/types';

describe('JobService (TDD)', () => {
  let mockHttp: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
  };
  let jobService: JobService;

  beforeEach(() => {
    mockHttp = {
      get: vi.fn(),
      post: vi.fn(),
    };
    jobService = new JobService(mockHttp as unknown as AxiosInstance);
  });

  const mockJob: ZipJob = {
    jobId: 201,
    projectId: 1,
    type: 'ZIP',
    status: 'COMPLETED',
    progress: 100,
    outputFileId: 505,
    createdAt: '2026-03-01T00:00:00.000Z',
    startedAt: '2026-03-01T00:00:01.000Z',
    completedAt: '2026-03-01T00:00:05.000Z',
  };

  it('should create a zip job with selected file ids', async () => {
    mockHttp.post.mockResolvedValueOnce({
      data: { success: true, data: mockJob },
    });

    const result = await jobService.createZipJob(1, { fileIds: [101, 102] });

    expect(mockHttp.post).toHaveBeenCalledWith(API_ENDPOINTS.JOBS.ZIP(1), {
      fileIds: [101, 102],
    });
    expect(result).toEqual(mockJob);
  });

  it('should list jobs for a project with pagination', async () => {
    const mockPaginated: PaginatedJobsResponse = {
      items: [mockJob],
      total: 1,
      limit: 5,
      pageNumber: 1,
    };

    mockHttp.get.mockResolvedValueOnce({
      data: { success: true, data: mockPaginated },
    });

    const result = await jobService.listJobs(1, { pageNumber: 1, limit: 5 });

    expect(mockHttp.get).toHaveBeenCalledWith(API_ENDPOINTS.JOBS.BASE(1), {
      params: { pageNumber: 1, limit: 5 },
    });
    expect(result).toEqual(mockPaginated);
  });

  it('should get job status by id', async () => {
    mockHttp.get.mockResolvedValueOnce({
      data: { success: true, data: mockJob },
    });

    const result = await jobService.getJob(1, 201);

    expect(mockHttp.get).toHaveBeenCalledWith(API_ENDPOINTS.JOBS.BY_ID(1, 201));
    expect(result).toEqual(mockJob);
  });

  it('should throw error when createZipJob fails', async () => {
    mockHttp.post.mockResolvedValueOnce({
      data: { success: false, error: 'Files do not belong to project' },
    });

    await expect(jobService.createZipJob(1, { fileIds: [999] })).rejects.toThrow(
      'Files do not belong to project',
    );
  });
});
