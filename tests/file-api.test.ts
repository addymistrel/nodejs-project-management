import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FileNotFoundException, RequiredFileException } from '#/utils';

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
    fileService.listProjectFiles.mockResolvedValue({
      items: [file],
      total: 1,
      limit: 50,
      pageNumber: 1,
    });

    const response = await request(app).get('/api/v1/projects/2/files?limit=50&pageNumber=1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        items: [
          {
            ...file,
            uploadedAt: file.uploadedAt.toISOString(),
          },
        ],
        total: 1,
        limit: 50,
        pageNumber: 1,
      },
    });
    expect(fileService.listProjectFiles).toHaveBeenCalledWith(2, 50, 1);
  });

  it('rejects an upload when no files are provided', async () => {
    fileService.uploadProjectFiles.mockRejectedValue(new RequiredFileException());

    const response = await request(app).post('/api/v1/projects/2/files');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: 'At least one file is required',
    });
    expect(fileService.uploadProjectFiles).toHaveBeenCalledWith(2, []);
  });

  it('deletes a file belonging to a project', async () => {
    fileService.deleteProjectFile.mockResolvedValue(undefined);

    const response = await request(app).delete('/api/v1/projects/2/files/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { message: 'File deleted successfully' },
    });
    expect(fileService.deleteProjectFile).toHaveBeenCalledWith(2, 1);
  });

  it('rejects invalid project and file ids', async () => {
    const response = await request(app).delete('/api/v1/projects/0/files/not-a-number');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: 'projectId must be a positive integer',
    });
    expect(fileService.deleteProjectFile).not.toHaveBeenCalled();
  });

  it('rejects pagination limits above the maximum', async () => {
    const response = await request(app).get('/api/v1/projects/2/files?limit=101');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('limit must be between 1 and 100');
    expect(fileService.listProjectFiles).not.toHaveBeenCalled();
  });

  it('returns 404 when a file does not exist', async () => {
    fileService.deleteProjectFile.mockRejectedValue(new FileNotFoundException());

    const response = await request(app).delete('/api/v1/projects/2/files/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ success: false, error: 'File not found' });
  });
});
