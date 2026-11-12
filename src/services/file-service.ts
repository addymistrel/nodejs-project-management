import { DEFAULT_MIME_TYPE } from '#/constants';
import { FileModel } from '#/database';
import * as repositoryFunctions from '#/repositories';
import type { FileResponse } from '#/types';
import {
  FileNotFoundException,
  ProjectNotFoundException,
  RequiredFileException,
  getStoragePath,
  resolveStoragePath,
} from '#/utils';
import { unlink } from 'fs/promises';
import { BaseService } from '#/services/base-service.js';

interface FileRepository {
  create: typeof repositoryFunctions.createFileRecords;
  delete: typeof repositoryFunctions.deleteFileRecord;
  findByProjectAndId: typeof repositoryFunctions.findFilesByProjectAndId;
  findByProjectId: typeof repositoryFunctions.findFilesByProjectId;
  findProjectById: typeof repositoryFunctions.findProjectById;
}

const defaultFileRepository: FileRepository = {
  create: (...args) => repositoryFunctions.createFileRecords(...args),
  delete: (...args) => repositoryFunctions.deleteFileRecord(...args),
  findByProjectAndId: (...args) => repositoryFunctions.findFilesByProjectAndId(...args),
  findByProjectId: (...args) => repositoryFunctions.findFilesByProjectId(...args),
  findProjectById: (...args) => repositoryFunctions.findProjectById(...args),
};

class FileService extends BaseService<FileRepository> {
  constructor(repository: FileRepository) {
    super(repository);
  }

  async uploadProjectFiles(
    projectId: number,
    uploadedFiles: Express.Multer.File[],
  ): Promise<FileResponse[]> {
    if (uploadedFiles.length === 0) {
      throw new RequiredFileException();
    }

    try {
      await this.assertProjectExists(projectId);
      const files = await this.repository.create(
        projectId,
        uploadedFiles.map((file) => ({
          name: file.originalname,
          storagePath: getStoragePath(file),
          size: file.size,
          mimeType: file.mimetype || DEFAULT_MIME_TYPE,
        })),
      );

      return files.map(toFileResponse);
    } catch (error: unknown) {
      await Promise.all(uploadedFiles.map((file) => unlink(file.path).catch(() => undefined)));
      throw error;
    }
  }

  async listProjectFiles(projectId: number): Promise<FileResponse[]> {
    await this.assertProjectExists(projectId);
    const files = await this.repository.findByProjectId(projectId);
    return files.map(toFileResponse);
  }

  async getProjectFile(projectId: number, fileId: number): Promise<FileModel> {
    await this.assertProjectExists(projectId);
    const file = await this.repository.findByProjectAndId(projectId, fileId);

    if (!file) {
      throw new FileNotFoundException();
    }

    return file;
  }

  async deleteProjectFile(projectId: number, fileId: number): Promise<void> {
    const file = await this.getProjectFile(projectId, fileId);
    const absPath = resolveStoragePath(file.storagePath);

    await unlink(absPath).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    });

    await this.repository.delete(file);
  }

  private async assertProjectExists(projectId: number): Promise<void> {
    if (!(await this.repository.findProjectById(projectId))) {
      throw new ProjectNotFoundException();
    }
  }
}

function toFileResponse(file: FileModel): FileResponse {
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

const fileService = new FileService(defaultFileRepository);

const deleteProjectFile = fileService.deleteProjectFile.bind(fileService);
const getProjectFile = fileService.getProjectFile.bind(fileService);
const listProjectFiles = fileService.listProjectFiles.bind(fileService);
const uploadProjectFiles = fileService.uploadProjectFiles.bind(fileService);

export {
  FileService,
  deleteProjectFile,
  getProjectFile,
  listProjectFiles,
  toFileResponse,
  uploadProjectFiles,
};
export type { FileRepository };
