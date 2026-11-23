export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    SIGNUP: '/api/v1/auth/signup',
    REFRESH: '/api/v1/auth/refresh',
  },
  HEALTH: '/health',
} as const;

export const HTTP_HEADERS = {
  AUTHORIZATION: 'Authorization',
  BEARER_PREFIX: 'Bearer ',
  CONTENT_TYPE: 'Content-Type',
  APPLICATION_JSON: 'application/json',
} as const;
