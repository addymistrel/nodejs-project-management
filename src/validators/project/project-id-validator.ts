import { ValidationResult } from '#/types';
import { Request } from 'express';

function validateProjectId(req: Request): ValidationResult {
  const { projectId } = req.params;

  if (typeof projectId !== 'string' || !/^[1-9]\d*$/.test(projectId)) {
    return {
      isValid: false,
      message: 'projectId must be a positive integer',
    };
  }

  const parsedProjectId = Number(projectId);

  if (!Number.isSafeInteger(parsedProjectId)) {
    return {
      isValid: false,
      message: 'projectId must be a safe integer',
    };
  }

  return {
    isValid: true,
  };
}

export { validateProjectId };
