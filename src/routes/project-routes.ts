import { Router } from 'express';
import {
  createProjectController,
  deleteProjectController,
  getProjectController,
  listProjectsController,
  updateProjectController,
} from '#/controllers';
import { validateRequest } from '#/middlewares';
import { asyncHandler } from '#/utils';
import {
  validateCreateProject,
  validatePagination,
  validateProjectId,
  validateUpdateProject,
} from '#/validators';

const projectRouter = Router();

projectRouter.get('/', validateRequest(validatePagination), asyncHandler(listProjectsController));

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
