import { STORAGE_KEYS } from '@/constants';
import type { AuthData, RefreshData, User } from '@/types';

export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export function getUser(): User | null {
  const rawUser = localStorage.getItem(STORAGE_KEYS.USER);
  if (!rawUser) {
    return null;
  }
  try {
    return JSON.parse(rawUser) as User;
  } catch {
    return null;
  }
}

export function setAuthData(data: AuthData): void {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.token);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
}

export function setTokens(tokens: RefreshData): void {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.token);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
}

export function clearAuthData(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}
