import {
  deleteProjectFile,
  getProjectFile,
  listProjectFiles,
  uploadProjectFiles,
} from '#/services';
import { HTTP_STATUS_CODE } from '#/constants';
import { AppResponse, resolveStoragePath } from '#/utils';
import { Request, Response } from 'express';
import { getPaginationQuery } from '#/utils';

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

  AppResponse.sendSuccess(res, HTTP_STATUS_CODE.CREATED, { projectId, files });
}

async function listFilesController(req: Request, res: Response): Promise<void> {
  const projectId = getProjectId(req);
  const pagination = getPaginationQuery(req);
  const files = await listProjectFiles(projectId, pagination.limit, pagination.pageNumber);

  AppResponse.sendSuccess(res, HTTP_STATUS_CODE.OK, files);
}

async function deleteFileController(req: Request, res: Response): Promise<void> {
  const projectId = getProjectId(req);
  const fileId = getFileId(req);

  await deleteProjectFile(projectId, fileId);

  AppResponse.sendSuccess(res, HTTP_STATUS_CODE.OK, { message: 'File deleted successfully' });
}

async function downloadFileController(req: Request, res: Response): Promise<void> {
  const projectId = getProjectId(req);
  const fileId = getFileId(req);

  const file = await getProjectFile(projectId, fileId);
  const absPath = resolveStoragePath(file.storagePath);

  res.download(absPath, file.name);
}

export { uploadFilesController, listFilesController, deleteFileController, downloadFileController };
