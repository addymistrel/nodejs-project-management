import {
  PROJECT_DESCRIPTION_MAX_LENGTH,
  PROJECT_NAME_MAX_LENGTH,
  PROJECT_VALIDATION_FIELDS,
} from '#/validators/project/constants.js';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyProjectFields(fields: string[]): boolean {
  return fields.every((field) => (PROJECT_VALIDATION_FIELDS as readonly string[]).includes(field));
}

function isValidString(value: unknown, maxLength: number): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  const string = value.trim();
  return string.length > 0 && string.length <= maxLength;
}

function isValidProjectName(value: unknown): boolean {
  return isValidString(value, PROJECT_NAME_MAX_LENGTH);
}

function isValidProjectDescription(value: unknown): boolean {
  if (value === undefined || value === null) {
    return true;
  }

  return isValidString(value, PROJECT_DESCRIPTION_MAX_LENGTH);
}

function normalizeString(value: string): string {
  return value.trim();
}

function normalizeProjectDescription(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const description = value.trim();
  return description || null;
}

export {
  hasOnlyProjectFields,
  isPlainObject,
  isValidProjectDescription,
  isValidProjectName,
  normalizeProjectDescription,
  normalizeString,
};
