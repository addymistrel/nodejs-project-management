import type { Request } from 'express';
import type { ValidationResult } from '#/types';

function validateCreateZipJob(req: Request): ValidationResult {
  const { fileIds } = req.body as { fileIds?: unknown };

  if (!Array.isArray(fileIds) || fileIds.length === 0) {
    return { isValid: false, message: 'fileIds must contain at least one file ID' };
  }

  if (
    fileIds.some(
      (fileId) => typeof fileId !== 'number' || !Number.isSafeInteger(fileId) || fileId <= 0,
    )
  ) {
    return { isValid: false, message: 'fileIds must contain positive integer IDs' };
  }

  if (new Set(fileIds).size !== fileIds.length) {
    return { isValid: false, message: 'fileIds must not contain duplicates' };
  }

  return { isValid: true };
}

export { validateCreateZipJob };
