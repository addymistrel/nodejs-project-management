import {
  DEFAULT_FILE_NAME_PREFIX,
  FILE_FOLDER_NAME,
  JOB_FOLDER_NAME,
  UPLOAD_DEFAULT_DIR,
} from '#/constants';
import { randomUUID } from 'crypto';
import { mkdir } from 'fs/promises';
import path from 'path';

const uploadsFolderRoot = path.resolve(process.env.UPLOADS_DIR ?? UPLOAD_DEFAULT_DIR);

function getProjectFilesDir(projectId: number): string {
  return path.join(uploadsFolderRoot, String(projectId), FILE_FOLDER_NAME);
}

function getProjectJobsDir(projectId: number): string {
  return path.join(uploadsFolderRoot, String(projectId), JOB_FOLDER_NAME);
}

function getCleanFileName(name: string): string {
  const basename = path
    .basename(name)
    .replace(/[<>:"/\\|?*\p{Cc}]/gu, '_')
    .trim();
  let fileName = basename;
  if (!fileName) {
    fileName = `${DEFAULT_FILE_NAME_PREFIX}${randomUUID()}`;
  }
  return fileName;
}

async function ensureProjectFilesDirectory(projectId: number): Promise<string> {
  const dir = getProjectFilesDir(projectId);

  await mkdir(dir, { recursive: true });

  return dir;
}

async function ensureProjectJobsDirectory(projectId: number): Promise<string> {
  const dir = getProjectJobsDir(projectId);

  await mkdir(dir, { recursive: true });

  return dir;
}

function getStoragePath(file: Express.Multer.File): string {
  return path.relative(process.cwd(), file.path);
}

function resolveStoragePath(storagePath: string): string {
  const resolvedPath = path.resolve(process.cwd(), storagePath);
  const rootPathWithSep = `${uploadsFolderRoot}${path.sep}`;

  if (resolvedPath !== uploadsFolderRoot && !resolvedPath.startsWith(rootPathWithSep)) {
    throw new Error('Stored file path is outside the uploads directory');
  }

  return resolvedPath;
}

export {
  ensureProjectFilesDirectory,
  ensureProjectJobsDirectory,
  getProjectFilesDir,
  getProjectJobsDir,
  getStoragePath,
  resolveStoragePath,
  getCleanFileName,
};
