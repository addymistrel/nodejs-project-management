import { DEFAULT_MIME_TYPE } from '#/constants';
import { FileAttributes } from '#/database';
import {
  createFileRecords,
  deleteFileRecord,
  findFilesByProjectAndId,
  findFilesByProjectId,
  findProjectById,
} from '#/repositories';
import { FileResponse } from '#/types';
import {
  FileNotFoundException,
  ProjectNotFoundException,
  RequiredFileException,
  getStoragePath,
  resolveStoragePath,
} from '#/utils';
import { unlink } from 'fs/promises';

function toFileResponse(file: FileAttributes): FileResponse {
  return {
    fileId: file.id,
    projectId: file.projectId,
    name: file.name,
    size: Number(file.size),
    type: file.mimeType,
    uploadedAt: file.createdAt,
    isOutput: file.isOutput,
  };
}

async function assertProjectExists(projectId: number): Promise<void> {
  const project = await findProjectById(projectId);

  if (!project) {
    throw new ProjectNotFoundException();
  }
}

async function uploadProjectFiles(
  projectId: number,
  uploadedFiles: Express.Multer.File[],
): Promise<FileResponse[]> {
  if (uploadedFiles.length === 0) {
    throw new RequiredFileException();
  }

  try {
    await assertProjectExists(projectId);

    const files = await createFileRecords(
      projectId,
      uploadedFiles.map((file) => ({
        name: file.originalname,
        storagePath: getStoragePath(file),
        size: file.size,
        mimeType: file.mimetype || DEFAULT_MIME_TYPE,
      })),
    );

    return files.map(toFileResponse);
  } catch (err: unknown) {
    await Promise.all(uploadedFiles.map((file) => unlink(file.path).catch(() => undefined)));

    throw err;
  }
}

async function listProjectFiles(projectId: number): Promise<FileResponse[]> {
  await assertProjectExists(projectId);

  const files = await findFilesByProjectId(projectId);

  return files.map(toFileResponse);
}

async function getProjectFile(projectId: number, fileId: number): Promise<FileAttributes> {
  await assertProjectExists(projectId);

  const file = await findFilesByProjectAndId(projectId, fileId);

  if (!file) {
    throw new FileNotFoundException();
  }

  return file;
}

async function deleteProjectFile(projectId: number, fileId: number): Promise<void> {
  await assertProjectExists(projectId);

  const file = await findFilesByProjectAndId(projectId, fileId);

  if (!file) {
    throw new FileNotFoundException();
  }

  const absPath = resolveStoragePath(file.storagePath);

  await unlink(absPath).catch((err) => {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  });

  await deleteFileRecord(file);
}

export { deleteProjectFile, getProjectFile, listProjectFiles, toFileResponse, uploadProjectFiles };
