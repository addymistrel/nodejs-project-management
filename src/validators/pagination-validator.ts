import type { Request } from 'express';
import type { ValidationResult } from '#/types';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function validateLimit(limit: unknown): ValidationResult | null {
  if (limit !== undefined && !/^\d+$/.test(String(limit))) {
    return { isValid: false, message: 'limit must be a positive integer' };
  }

  const parsedLimit = limit === undefined ? DEFAULT_LIMIT : Number(limit);
  if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > MAX_LIMIT) {
    return { isValid: false, message: `limit must be between 1 and ${MAX_LIMIT}` };
  }

  return null;
}

function validatePageNumber(pageNumber: unknown): ValidationResult | null {
  if (pageNumber !== undefined && !/^\d+$/.test(String(pageNumber))) {
    return { isValid: false, message: 'pageNumber must be a positive integer' };
  }

  const parsedPageNumber = pageNumber === undefined ? 1 : Number(pageNumber);
  if (!Number.isInteger(parsedPageNumber) || parsedPageNumber < 1) {
    return { isValid: false, message: 'pageNumber must be a positive integer' };
  }

  return null;
}

function validatePagination(request: Request): ValidationResult {
  const limitError = validateLimit(request.query.limit);
  if (limitError) {
    return limitError;
  }

  const pageNumberError = validatePageNumber(request.query.pageNumber);
  if (pageNumberError) {
    return pageNumberError;
  }

  return { isValid: true, message: 'Valid' };
}

export { validatePagination };
