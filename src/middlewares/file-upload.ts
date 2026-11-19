import { MAX_FILE_PER_UPLOAD, MAX_FILE_SIZE_ALLOWED } from '#/constants/file-constants.js';
import { ensureProjectFilesDirectory, getUniqueFileName } from '#/utils';
import { findProjectById } from '#/repositories';
import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { InvalidRequestException, ProjectNotFoundException } from '#/utils';

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/json',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'text/csv',
  'text/tab-separated-values',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

const allowedExtensions = new Set([
  '.pdf',
  '.json',
  '.zip',
  '.txt',
  '.csv',
  '.tsv',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
]);

function validateProjectExistsForUpload(req: Request, _res: Response, next: NextFunction): void {
  const projectId = Number(req.params.projectId);

  findProjectById(projectId)
    .then((project) => {
      if (!project) {
        next(new ProjectNotFoundException());
        return;
      }
      next();
    })
    .catch(next);
}

const fileUpload = multer({
  storage: multer.diskStorage({
    destination: async (req: Request, _file, next): Promise<void> => {
      try {
        const projectId = Number(req.params.projectId);
        const dir = await ensureProjectFilesDirectory(projectId);

        next(null, dir);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unable to prepare upload directory');
        next(error, '');
      }
    },

    filename: (_req, file, next): void => {
      next(null, getUniqueFileName(file.originalname));
    },
  }),

  limits: {
    files: MAX_FILE_PER_UPLOAD,
    fileSize: MAX_FILE_SIZE_ALLOWED,
  },
  fileFilter: (_req, file, next): void => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (allowedMimeTypes.has(file.mimetype) && allowedExtensions.has(extension)) {
      next(null, true);
      return;
    }
    next(new InvalidRequestException('Unsupported file type'));
  },
});

export { fileUpload, validateProjectExistsForUpload };
