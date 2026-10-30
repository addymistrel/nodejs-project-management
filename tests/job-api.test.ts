import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '#/utils';

const jobService = {
  createZipJob: vi.fn(),
  getZipJob: vi.fn(),
};

vi.mock('#/services', () => jobService);

const { app } = await import('#/app.js');

const job = {
  jobId: 7,
  projectId: 2,
  type: 'ZIP_COMPRESSION',
  status: 'PROCESSING',
  progress: 25,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  startedAt: new Date('2026-01-01T00:00:01.000Z'),
};

describe('Job API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a ZIP job for valid file IDs', async () => {
    jobService.createZipJob.mockResolvedValue(job);

    const response = await request(app)
      .post('/api/projects/2/jobs/zip')
      .send({
        fileIds: [1, 3],
      });

    expect(response.status).toBe(202);
    expect(response.body).toMatchObject({
      jobId: 7,
      projectId: 2,
      type: 'ZIP_COMPRESSION',
      status: 'PROCESSING',
      progress: 25,
    });
    expect(jobService.createZipJob).toHaveBeenCalledWith(2, { fileIds: [1, 3] });
  });

  it('returns the current ZIP job status', async () => {
    jobService.getZipJob.mockResolvedValue(job);

    const response = await request(app).get('/api/projects/2/jobs/7');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      jobId: 7,
      projectId: 2,
      status: 'PROCESSING',
      progress: 25,
    });
    expect(jobService.getZipJob).toHaveBeenCalledWith(2, 7);
  });

  it.each([
    [{}, 'fileIds must contain at least one file ID'],
    [{ fileIds: [] }, 'fileIds must contain at least one file ID'],
    [{ fileIds: [1, 1] }, 'fileIds must not contain duplicates'],
    [{ fileIds: [0] }, 'fileIds must contain positive integer IDs'],
  ])('rejects invalid ZIP job payload %j', async (payload, message) => {
    const response = await request(app).post('/api/projects/2/jobs/zip').send(payload);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: message });
    expect(jobService.createZipJob).not.toHaveBeenCalled();
  });

  it('rejects an invalid job id', async () => {
    const response = await request(app).get('/api/projects/2/jobs/not-a-number');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'jobId must be a positive integer' });
    expect(jobService.getZipJob).not.toHaveBeenCalled();
  });

  it('returns 404 when the job does not exist', async () => {
    jobService.getZipJob.mockRejectedValue(new AppError('Job not found', 404));

    const response = await request(app).get('/api/projects/2/jobs/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Job not found' });
  });
});
