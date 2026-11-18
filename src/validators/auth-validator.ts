import type { Request } from 'express';
import type { ValidationResult } from '#/types';

function validateSignup(request: Request): ValidationResult {
  const { name, email, password } = request.body ?? {};

  if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 150) {
    return { isValid: false, message: 'name must contain between 1 and 150 characters' };
  }

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return { isValid: false, message: 'email must be a valid email address' };
  }

  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return { isValid: false, message: 'password must contain between 8 and 128 characters' };
  }

  return { isValid: true, message: 'Valid' };
}

function validateLogin(request: Request): ValidationResult {
  const { email, password } = request.body ?? {};

  if (typeof email !== 'string' || !email.trim()) {
    return { isValid: false, message: 'email is required' };
  }

  if (typeof password !== 'string' || !password) {
    return { isValid: false, message: 'password is required' };
  }

  return { isValid: true, message: 'Valid' };
}

function validateRefresh(request: Request): ValidationResult {
  if (typeof request.body?.refreshToken !== 'string' || !request.body.refreshToken.trim()) {
    return { isValid: false, message: 'refreshToken is required' };
  }
  return { isValid: true, message: 'Valid' };
}

export { validateLogin, validateRefresh, validateSignup };
