import type { Request } from 'express';

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

type RequestValidator = (request: Request) => ValidationResult;

export type { RequestValidator, ValidationResult };
