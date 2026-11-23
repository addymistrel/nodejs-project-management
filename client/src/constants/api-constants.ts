export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    SIGNUP: '/api/v1/auth/signup',
    REFRESH: '/api/v1/auth/refresh',
  },
  PROJECTS: {
    BASE: '/api/v1/projects',
    BY_ID: (projectId: number | string) => `/api/v1/projects/${projectId}`,
  },
  HEALTH: '/health',
} as const;

export const HTTP_HEADERS = {
  AUTHORIZATION: 'Authorization',
  BEARER_PREFIX: 'Bearer ',
  CONTENT_TYPE: 'Content-Type',
  APPLICATION_JSON: 'application/json',
} as const;
