import type { Request } from 'express';
import type { ValidationResult } from '#/types';

function validateJobId(req: Request): ValidationResult {
  const { jobId } = req.params;

  if (typeof jobId !== 'string' || !/^[1-9]\d*$/.test(jobId)) {
    return { isValid: false, message: 'jobId must be a positive integer' };
  }

  if (!Number.isSafeInteger(Number(jobId))) {
    return { isValid: false, message: 'jobId must be a safe integer' };
  }

  return { isValid: true };
}

export { validateJobId };
