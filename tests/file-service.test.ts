import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '#/utils';
import path from 'path';

const repository = vi.hoisted(() => ({
  createFileRecords: vi.fn(),
  deleteFileRecord: vi.fn(),
  findFilesByProjectAndId: vi.fn(),
  findFilesByProjectId: vi.fn(),
  findProjectById: vi.fn(),
}));

vi.mock('#/repositories', () => repository);

const { deleteProjectFile, getProjectFile, listProjectFiles, uploadProjectFiles } =
  await import('#/services');

const project = { id: 2 };
const fileRecord = {
  id: 1,
  projectId: 2,
  name: 'requirements.pdf',
  storagePath: path.join('uploads', '2', 'files', 'requirements.pdf'),
  size: 1024,
  mimeType: 'application/pdf',
  checksum: null,
  isOutput: false,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const uploadedFile: Express.Multer.File = {
  fieldname: 'files',
  originalname: 'requirements.pdf',
  encoding: '7bit',
  mimetype: 'application/pdf',
  size: 1024,
  destination: 'uploads/2/files',
  filename: 'requirements.pdf',
  path: 'uploads/2/files/requirements.pdf',
  buffer: Buffer.from('file'),
  stream: undefined as never,
};

describe('File service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploads files and maps database records to API responses', async () => {
    repository.findProjectById.mockResolvedValue(project);
    repository.createFileRecords.mockResolvedValue([fileRecord]);

    const result = await uploadProjectFiles(2, [uploadedFile]);

    expect(result).toEqual([
      {
        fileId: 1,
        projectId: 2,
        name: 'requirements.pdf',
        size: 1024,
        type: 'application/pdf',
        uploadedAt: fileRecord.createdAt,
        isOutput: false,
      },
    ]);
    expect(repository.createFileRecords).toHaveBeenCalledWith(2, [
      {
        name: 'requirements.pdf',
        storagePath: path.join('uploads', '2', 'files', 'requirements.pdf'),
        size: 1024,
        mimeType: 'application/pdf',
      },
    ]);
  });

  it('rejects uploads when no files are provided', async () => {
    await expect(uploadProjectFiles(2, [])).rejects.toMatchObject({
      message: 'At least one file is required',
      statusCode: 400,
    });

    expect(repository.findProjectById).not.toHaveBeenCalled();
  });

  it('rejects uploads for a missing project', async () => {
    repository.findProjectById.mockResolvedValue(null);

    await expect(uploadProjectFiles(999, [uploadedFile])).rejects.toMatchObject({
      message: 'Project not found',
      statusCode: 404,
    });
    expect(repository.createFileRecords).not.toHaveBeenCalled();
  });

  it('lists project files as API responses', async () => {
    repository.findProjectById.mockResolvedValue(project);
    repository.findFilesByProjectId.mockResolvedValue([fileRecord]);

    await expect(listProjectFiles(2)).resolves.toEqual([
      {
        fileId: 1,
        projectId: 2,
        name: 'requirements.pdf',
        size: 1024,
        type: 'application/pdf',
        uploadedAt: fileRecord.createdAt,
        isOutput: false,
      },
    ]);
  });

  it('gets a file belonging to the project', async () => {
    repository.findProjectById.mockResolvedValue(project);
    repository.findFilesByProjectAndId.mockResolvedValue(fileRecord);

    await expect(getProjectFile(2, 1)).resolves.toBe(fileRecord);
  });

  it('throws not found when getting a missing file', async () => {
    repository.findProjectById.mockResolvedValue(project);
    repository.findFilesByProjectAndId.mockResolvedValue(null);

    await expect(getProjectFile(2, 999)).rejects.toBeInstanceOf(AppError);
    await expect(getProjectFile(2, 999)).rejects.toMatchObject({
      message: 'File not found',
      statusCode: 404,
    });
  });

  it('deletes an existing file record', async () => {
    repository.findProjectById.mockResolvedValue(project);
    repository.findFilesByProjectAndId.mockResolvedValue(fileRecord);
    repository.deleteFileRecord.mockResolvedValue(undefined);

    await expect(deleteProjectFile(2, 1)).resolves.toBeUndefined();

    expect(repository.deleteFileRecord).toHaveBeenCalledWith(fileRecord);
  });

  it('throws not found without deleting when the file is missing', async () => {
    repository.findProjectById.mockResolvedValue(project);
    repository.findFilesByProjectAndId.mockResolvedValue(null);

    await expect(deleteProjectFile(2, 999)).rejects.toMatchObject({
      message: 'File not found',
      statusCode: 404,
    });
    expect(repository.deleteFileRecord).not.toHaveBeenCalled();
  });
});
