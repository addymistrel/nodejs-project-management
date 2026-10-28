import { PROJECT_SCHEMA_CONST } from '#/constants';
import type { UpdateProjectRequest, ValidationResult } from '#/types';
import {
  hasOnlyProjectFields,
  isPlainObject,
  isValidProjectDescription,
  isValidProjectName,
  normalizeString,
} from '#/validators/project/helpers.js';
import type { Request } from 'express';

function validateUpdateBody(body: unknown): ValidationResult {
  if (!isPlainObject(body)) {
    return { isValid: false, message: 'Request body must be an object' };
  }

  const fields = Object.keys(body);

  if (fields.length === 0) {
    return { isValid: false, message: 'At least one project field is required' };
  }

  return validateProjectFields(body, fields);
}

function validateProjectFields(
  body: Record<string, unknown>,
  requestFields: string[],
): ValidationResult {
  if (!hasOnlyProjectFields(requestFields)) {
    return getUnsupportedFieldError(requestFields);
  }

  const fields = PROJECT_SCHEMA_CONST.FIELDS;

  if (Object.hasOwn(body, fields.NAME) && !isValidProjectName(body.name)) {
    return {
      isValid: false,
      message: 'Project name must be a non-empty string with a maximum length of 150 characters',
    };
  }

  if (Object.hasOwn(body, fields.DESCRIPTION) && !isValidProjectDescription(body.description)) {
    return {
      isValid: false,
      message:
        'Project description must be a string or null with a maximum length of 5000 characters',
    };
  }

  return { isValid: true };
}

function getUnsupportedFieldError(fields: string[]): ValidationResult {
  const schemaFields = PROJECT_SCHEMA_CONST.FIELDS;
  const unsupportedField = fields.find(
    (field) => field !== schemaFields.NAME && field !== schemaFields.DESCRIPTION,
  );

  return {
    isValid: false,
    message: `Unsupported project field(s): ${unsupportedField}`,
  };
}

function normalizeUpdateProjectBody(body: Record<string, unknown>): UpdateProjectRequest {
  const fields = PROJECT_SCHEMA_CONST.FIELDS;
  const validatedBody: UpdateProjectRequest = {};

  if (Object.hasOwn(body, fields.NAME)) {
    validatedBody.name = normalizeString(body.name as string);
  }

  if (Object.hasOwn(body, fields.DESCRIPTION)) {
    validatedBody.description = normalizeString(body.description as string);
  }

  return validatedBody;
}

function validateUpdateProject(request: Request): ValidationResult {
  const result = validateUpdateBody(request.body);

  if (!result.isValid || !isPlainObject(request.body)) {
    return result;
  }

  request.body = normalizeUpdateProjectBody(request.body);
  return result;
}

export { validateUpdateProject };
