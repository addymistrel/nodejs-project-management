import { Router } from 'express';
import {
  createProjectController,
  deleteProjectController,
  getProjectController,
  updateProjectController,
} from '#/controllers';
import { validateRequest } from '#/middlewares';
import { asyncHandler } from '#/utils';
import { validateCreateProject, validateProjectId, validateUpdateProject } from '#/validators';

const projectRouter = Router();

projectRouter.post(
  '/',
  validateRequest(validateCreateProject),
  asyncHandler(createProjectController),
);

projectRouter.get(
  '/:projectId',
  validateRequest(validateProjectId),
  asyncHandler(getProjectController),
);

projectRouter.patch(
  '/:projectId',
  validateRequest(validateProjectId),
  validateRequest(validateUpdateProject),
  asyncHandler(updateProjectController),
);

projectRouter.delete(
  '/:projectId',
  validateRequest(validateProjectId),
  asyncHandler(deleteProjectController),
);

export { projectRouter };
