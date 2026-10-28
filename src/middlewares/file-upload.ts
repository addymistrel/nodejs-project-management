import { MAX_FILE_PER_UPLOAD, MAX_FILE_SIZE_ALLOWED } from '#/constants/file-constants.js';
import { ensureProjectFilesDirectory, getCleanFileName } from '#/utils';
import { Request } from 'express';
import multer from 'multer';

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
      next(null, getCleanFileName(file.originalname));
    },
  }),

  limits: {
    files: MAX_FILE_PER_UPLOAD,
    fileSize: MAX_FILE_SIZE_ALLOWED,
  },
});

export { fileUpload };
