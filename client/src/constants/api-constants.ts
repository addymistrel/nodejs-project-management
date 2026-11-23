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
  FILES: {
    BASE: (projectId: number | string) => `/api/v1/projects/${projectId}/files`,
    BY_ID: (projectId: number | string, fileId: number | string) =>
      `/api/v1/projects/${projectId}/files/${fileId}`,
    DOWNLOAD: (projectId: number | string, fileId: number | string) =>
      `/api/v1/projects/${projectId}/files/${fileId}/download`,
  },
  JOBS: {
    BASE: (projectId: number | string) => `/api/v1/projects/${projectId}/jobs`,
    ZIP: (projectId: number | string) => `/api/v1/projects/${projectId}/jobs/zip`,
    BY_ID: (projectId: number | string, jobId: number | string) =>
      `/api/v1/projects/${projectId}/jobs/${jobId}`,
  },
  HEALTH: '/health',
} as const;

export const HTTP_HEADERS = {
  AUTHORIZATION: 'Authorization',
  BEARER_PREFIX: 'Bearer ',
  CONTENT_TYPE: 'Content-Type',
  APPLICATION_JSON: 'application/json',
  MULTIPART_FORM_DATA: 'multipart/form-data',
} as const;
