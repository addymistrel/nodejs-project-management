import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '#/utils';

const fileService = {
  deleteProjectFile: vi.fn(),
  getProjectFile: vi.fn(),
  listProjectFiles: vi.fn(),
  uploadProjectFiles: vi.fn(),
};

vi.mock('#/services', () => fileService);

const { app } = await import('#/app.js');

const file = {
  fileId: 1,
  projectId: 2,
  name: 'requirements.pdf',
  size: 1024,
  type: 'application/pdf',
  uploadedAt: new Date('2026-01-01T00:00:00.000Z'),
  isOutput: false,
};

describe('File API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists files for a valid project', async () => {
    fileService.listProjectFiles.mockResolvedValue([file]);

    const response = await request(app).get('/api/projects/2/files');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        ...file,
        uploadedAt: file.uploadedAt.toISOString(),
      },
    ]);
    expect(fileService.listProjectFiles).toHaveBeenCalledWith(2);
  });

  it('rejects an upload when no files are provided', async () => {
    fileService.uploadProjectFiles.mockRejectedValue(
      new AppError('At least one file is required', 400),
    );

    const response = await request(app).post('/api/projects/2/files');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'At least one file is required' });
    expect(fileService.uploadProjectFiles).toHaveBeenCalledWith(2, []);
  });

  it('deletes a file belonging to a project', async () => {
    fileService.deleteProjectFile.mockResolvedValue(undefined);

    const response = await request(app).delete('/api/projects/2/files/1');

    expect(response.status).toBe(204);
    expect(fileService.deleteProjectFile).toHaveBeenCalledWith(2, 1);
  });

  it('rejects invalid project and file ids', async () => {
    const response = await request(app).delete('/api/projects/0/files/not-a-number');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'projectId must be a positive integer' });
    expect(fileService.deleteProjectFile).not.toHaveBeenCalled();
  });

  it('returns 404 when a file does not exist', async () => {
    fileService.deleteProjectFile.mockRejectedValue(new AppError('File not found', 404));

    const response = await request(app).delete('/api/projects/2/files/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'File not found' });
  });
});
