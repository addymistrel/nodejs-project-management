import { Router } from 'express';

import {
  deleteFileController,
  downloadFileController,
  listFilesController,
  uploadFilesController,
} from '#/controllers';
import { fileUpload, validateRequest } from '#/middlewares';
import { asyncHandler } from '#/utils';
import { validateFileId, validateProjectId } from '#/validators';
import { MAX_FILE_PER_UPLOAD } from '#/constants';

const fileRouter = Router({
  mergeParams: true,
});

fileRouter.post(
  '/',
  validateRequest(validateProjectId),
  fileUpload.array('files', MAX_FILE_PER_UPLOAD),
  asyncHandler(uploadFilesController),
);

fileRouter.get('/', validateRequest(validateProjectId), asyncHandler(listFilesController));

fileRouter.delete(
  '/:fileId',
  validateRequest(validateProjectId),
  validateRequest(validateFileId),
  asyncHandler(deleteFileController),
);

fileRouter.get(
  '/:fileId/download',
  validateRequest(validateProjectId),
  validateRequest(validateFileId),
  asyncHandler(downloadFileController),
);

export { fileRouter };
