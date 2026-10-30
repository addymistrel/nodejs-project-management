import { Router } from 'express';
import { createZipJobController, getJobController } from '#/controllers';
import { validateRequest } from '#/middlewares';
import { asyncHandler } from '#/utils';
import { validateCreateZipJob, validateProjectId, validateJobId } from '#/validators';

const jobRouter = Router({ mergeParams: true });

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
