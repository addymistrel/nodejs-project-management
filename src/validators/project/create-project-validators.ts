import { PROJECT_SCHEMA_CONST } from '#/constants';
import type { CreateProjectRequest, ValidationResult } from '#/types';
import {
  PROJECT_DESCRIPTION_MAX_LENGTH,
  PROJECT_NAME_MAX_LENGTH,
} from '#/validators/project/constants.js';
import {
  hasOnlyProjectFields,
  isPlainObject,
  isValidProjectDescription,
  isValidProjectName,
  normalizeProjectDescription,
  normalizeString,
} from '#/validators/project/helpers.js';
import type { Request } from 'express';

function validateRequestBody(body: unknown): ValidationResult {
  if (!isPlainObject(body)) {
    return { isValid: false, message: 'Request body must be an object' };
  }

  return validateProjectFields(body);
}

function validateProjectFields(body: Record<string, unknown>): ValidationResult {
  const fields = PROJECT_SCHEMA_CONST.FIELDS;
  const requestFields = Object.keys(body);

  if (!hasOnlyProjectFields(requestFields)) {
    return getUnsupportedFieldsError(requestFields);
  }

  if (!Object.hasOwn(body, fields.NAME)) {
    return { isValid: false, message: 'Project name is required' };
  }

  return validateProjectValues(body);
}

function getUnsupportedFieldsError(fields: string[]): ValidationResult {
  const schemaFields = PROJECT_SCHEMA_CONST.FIELDS;
  const unsupportedField = fields.find(
    (field) => field !== schemaFields.NAME && field !== schemaFields.DESCRIPTION,
  );

  return {
    isValid: false,
    message: `Unsupported project field(s): ${unsupportedField}`,
  };
}

function validateProjectValues(body: Record<string, unknown>): ValidationResult {
  if (!isValidProjectName(body.name)) {
    return {
      isValid: false,
      message: `Project name must be a non-empty string with a maximum length of ${PROJECT_NAME_MAX_LENGTH} characters`,
    };
  }

  if (!isValidProjectDescription(body.description)) {
    return {
      isValid: false,
      message: `Project description must be null or a string with a maximum length of ${PROJECT_DESCRIPTION_MAX_LENGTH} characters`,
    };
  }

  return { isValid: true };
}

function normalizeProjectBody(body: Record<string, unknown>): CreateProjectRequest {
  return {
    name: normalizeString(body.name as string),
    description: normalizeProjectDescription(body.description),
  };
}

function validateCreateProject(request: Request): ValidationResult {
  const result = validateRequestBody(request.body);

  if (!result.isValid || !isPlainObject(request.body)) {
    return result;
  }

  request.body = normalizeProjectBody(request.body);
  return result;
}

export { validateCreateProject };
