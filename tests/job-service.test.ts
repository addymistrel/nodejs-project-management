import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '#/utils';

const repository = vi.hoisted(() => ({
  createFileRecords: vi.fn(),
  createZipJobRecord: vi.fn(),
  findFilesByProjectAndId: vi.fn(),
  findJobByProjectAndId: vi.fn(),
  findProjectById: vi.fn(),
  markJobProcessing: vi.fn(),
}));

vi.mock('#/repositories', () => repository);
vi.mock('worker_threads', () => ({
  Worker: class {
    on(): this {
      return this;
    }
  },
}));

const { createZipJob, getZipJob } = await import('#/services');

const project = { id: 2 };
const file = {
  id: 1,
  projectId: 2,
  name: 'requirements.pdf',
  storagePath: 'uploads\\2\\files\\requirements.pdf',
};
const job = {
  id: 7,
  projectId: 2,
  type: 'ZIP_COMPRESSION' as const,
  status: 'PROCESSING' as const,
  progress: 25,
  outputFileId: null,
  errorMessage: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  startedAt: new Date('2026-01-01T00:00:01.000Z'),
  completedAt: null,
  reload: vi.fn(),
};

describe('Job service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a ZIP job after validating project files', async () => {
    repository.findProjectById.mockResolvedValue(project);
    repository.findFilesByProjectAndId.mockResolvedValue(file);
    repository.createZipJobRecord.mockResolvedValue(job);
    repository.markJobProcessing.mockResolvedValue(undefined);
    job.reload.mockResolvedValue(job);

    const result = await createZipJob(2, { fileIds: [1] });

    expect(result).toEqual({
      jobId: 7,
      projectId: 2,
      type: 'ZIP_COMPRESSION',
      status: 'PROCESSING',
      progress: 25,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
    });
    expect(repository.createZipJobRecord).toHaveBeenCalledWith(2);
    expect(repository.markJobProcessing).toHaveBeenCalledWith(7);
    expect(job.reload).toHaveBeenCalled();
  });

  it('returns a ZIP job response for a project', async () => {
    repository.findProjectById.mockResolvedValue(project);
    repository.findJobByProjectAndId.mockResolvedValue(job);

    await expect(getZipJob(2, 7)).resolves.toEqual({
      jobId: 7,
      projectId: 2,
      type: 'ZIP_COMPRESSION',
      status: 'PROCESSING',
      progress: 25,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
    });
  });

  it('rejects creation for a missing project', async () => {
    repository.findProjectById.mockResolvedValue(null);

    await expect(createZipJob(999, { fileIds: [1] })).rejects.toMatchObject({
      message: 'Project not found',
      statusCode: 404,
    });
    expect(repository.createZipJobRecord).not.toHaveBeenCalled();
  });

  it('rejects creation when a file does not belong to the project', async () => {
    repository.findProjectById.mockResolvedValue(project);
    repository.findFilesByProjectAndId.mockResolvedValue(null);

    await expect(createZipJob(2, { fileIds: [999] })).rejects.toMatchObject({
      message: 'File does not belong to this project',
      statusCode: 400,
    });
    expect(repository.createZipJobRecord).not.toHaveBeenCalled();
  });

  it('returns 404 when getting a missing job', async () => {
    repository.findProjectById.mockResolvedValue(project);
    repository.findJobByProjectAndId.mockResolvedValue(null);

    await expect(getZipJob(2, 999)).rejects.toBeInstanceOf(AppError);
    await expect(getZipJob(2, 999)).rejects.toMatchObject({
      message: 'Job not found',
      statusCode: 404,
    });
  });
});
