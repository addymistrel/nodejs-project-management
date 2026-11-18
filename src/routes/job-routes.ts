import { Router } from 'express';
import { createZipJobController, getJobController, listJobsController } from '#/controllers';
import { validateRequest } from '#/middlewares';
import { asyncHandler } from '#/utils';
import {
  validateCreateZipJob,
  validateJobId,
  validatePagination,
  validateProjectId,
} from '#/validators';

const jobRouter = Router({ mergeParams: true });

jobRouter.get(
  '/',
  validateRequest(validateProjectId),
  validateRequest(validatePagination),
  asyncHandler(listJobsController),
);

jobRouter.post(
  '/zip',
  validateRequest(validateProjectId),
  validateRequest(validateCreateZipJob),
  asyncHandler(createZipJobController),
);

jobRouter.get(
  '/:jobId',
  validateRequest(validateProjectId),
  validateRequest(validateJobId),
  asyncHandler(getJobController),
);

export { jobRouter };
