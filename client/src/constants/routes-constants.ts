export const APP_ROUTES = {
  ROOT: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  PROJECT_DETAILS: '/projects/:projectId',
} as const;

export function getProjectDetailsPath(projectId: number | string): string {
  return `/projects/${projectId}`;
}
