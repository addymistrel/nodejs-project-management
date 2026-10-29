import {
  deleteProjectFile,
  getProjectFile,
  listProjectFiles,
  uploadProjectFiles,
} from '#/services';
import { resolveStoragePath } from '#/utils';
import { Request, Response } from 'express';

function getProjectId(req: Request): number {
  return Number(req.params.projectId);
}

function getFileId(req: Request): number {
  return Number(req.params.fileId);
}

function getUploadedFiles(req: Request): Express.Multer.File[] {
  if (!Array.isArray(req.files)) {
    return [];
  }

  return req.files;
}

async function uploadFilesController(req: Request, res: Response): Promise<void> {
  const projectId = getProjectId(req);
  const uploadedFiles = getUploadedFiles(req);

  const files = await uploadProjectFiles(projectId, uploadedFiles);

  res.status(201).json({
    projectId,
    files,
  });
}

async function listFilesController(req: Request, res: Response): Promise<void> {
  const projectId = getProjectId(req);
  const files = await listProjectFiles(projectId);

  res.status(200).json(files);
}

async function deleteFileController(req: Request, res: Response): Promise<void> {
  const projectId = getProjectId(req);
  const fileId = getFileId(req);

  await deleteProjectFile(projectId, fileId);

  res.status(204).send();
}

async function downloadFileController(req: Request, res: Response): Promise<void> {
  const projectId = getProjectId(req);
  const fileId = getFileId(req);

  const file = await getProjectFile(projectId, fileId);
  const absPath = resolveStoragePath(file.storagePath);

  res.download(absPath, file.name);
}

export { uploadFilesController, listFilesController, deleteFileController, downloadFileController };
