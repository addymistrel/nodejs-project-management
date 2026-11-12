import { DEFAULT_MIME_TYPE } from '#/constants';
import { FileModel } from '#/database';
import * as repositoryFunctions from '#/repositories';
import type { FileResponse } from '#/types';
import {
  FileNotFoundException,
  ProjectNotFoundException,
  RequiredFileException,
  getStoragePath,
  logger,
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
      const files = await this.createFiles(projectId, uploadedFiles);
      this.logUploadCompleted(projectId, files.length);
      return files.map(toFileResponse);
    } catch (error: unknown) {
      await this.cleanupUploadedFiles(uploadedFiles);
      this.logUploadFailed(projectId, uploadedFiles.length, error);
      throw error;
    }
  }

  async listProjectFiles(projectId: number): Promise<FileResponse[]> {
    await this.assertProjectExists(projectId);
    const files = await this.repository.findByProjectId(projectId);
    logger.info('Project files listed', {
      functionName: 'FileService.listProjectFiles',
      event: 'file.list.completed',
      projectId,
      fileCount: files.length,
    });
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
    logger.info('Project file deleted', {
      functionName: 'FileService.deleteProjectFile',
      event: 'file.delete.completed',
      projectId,
      fileId,
    });
  }

  private async assertProjectExists(projectId: number): Promise<void> {
    if (!(await this.repository.findProjectById(projectId))) {
      throw new ProjectNotFoundException();
    }
  }

  private async createFiles(
    projectId: number,
    uploadedFiles: Express.Multer.File[],
  ): Promise<FileModel[]> {
    return this.repository.create(
      projectId,
      uploadedFiles.map((file) => ({
        name: file.originalname,
        storagePath: getStoragePath(file),
        size: file.size,
        mimeType: file.mimetype || DEFAULT_MIME_TYPE,
      })),
    );
  }

  private async cleanupUploadedFiles(uploadedFiles: Express.Multer.File[]): Promise<void> {
    await Promise.all(uploadedFiles.map((file) => unlink(file.path).catch(() => undefined)));
  }

  private logUploadCompleted(projectId: number, fileCount: number): void {
    logger.info('Project files uploaded', {
      functionName: 'FileService.uploadProjectFiles',
      event: 'file.upload.completed',
      projectId,
      fileCount,
    });
  }

  private logUploadFailed(projectId: number, fileCount: number, error: unknown): void {
    logger.error('Project file upload failed', error, {
      functionName: 'FileService.uploadProjectFiles',
      event: 'file.upload.failed',
      projectId,
      fileCount,
    });
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
