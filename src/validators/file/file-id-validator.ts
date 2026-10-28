import { ValidationResult } from '#/types';
import { Request } from 'express';

function validateFileId(req: Request): ValidationResult {
  const { fileId } = req.params;

  if (typeof fileId !== 'string' || !/^[1-9]\d*$/.test(fileId)) {
    return {
      isValid: false,
      message: 'fileId must be a positive integer',
    };
  }

  const parsedFileId = Number(fileId);

  if (!Number.isSafeInteger(parsedFileId)) {
    return {
      isValid: false,
      message: 'fileId must be a safe integer',
    };
  }

  return {
    isValid: true,
  };
}

export { validateFileId };
