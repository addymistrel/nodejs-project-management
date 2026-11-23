import { describe, it, expect, beforeEach } from 'vitest';
import {
  setAuthData,
  getAccessToken,
  getRefreshToken,
  getUser,
  clearAuthData,
  setTokens,
} from './storage-utils';
import { STORAGE_KEYS } from '@/constants';
import type { User } from '@/types';

describe('Storage Utils (TDD)', () => {
  const mockUser: User = { id: 1, name: 'Alice Test', email: 'alice@example.com' };
  const mockToken = 'mock-access-token';
  const mockRefreshToken = 'mock-refresh-token';

  beforeEach(() => {
    localStorage.clear();
  });

  it('should store and retrieve access token, refresh token, and user', () => {
    setAuthData({ user: mockUser, token: mockToken, refreshToken: mockRefreshToken });

    expect(getAccessToken()).toBe(mockToken);
    expect(getRefreshToken()).toBe(mockRefreshToken);
    expect(getUser()).toEqual(mockUser);
  });

  it('should return null when tokens or user do not exist', () => {
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(getUser()).toBeNull();
  });

  it('should safely handle corrupted JSON in user storage', () => {
    localStorage.setItem(STORAGE_KEYS.USER, 'invalid-json{');
    expect(getUser()).toBeNull();
  });

  it('should update only tokens when setTokens is called', () => {
    setAuthData({ user: mockUser, token: mockToken, refreshToken: mockRefreshToken });

    const newAccessToken = 'new-access-token';
    const newRefreshToken = 'new-refresh-token';
    setTokens({ token: newAccessToken, refreshToken: newRefreshToken });

    expect(getAccessToken()).toBe(newAccessToken);
    expect(getRefreshToken()).toBe(newRefreshToken);
    expect(getUser()).toEqual(mockUser);
  });

  it('should remove all auth data on clearAuthData', () => {
    setAuthData({ user: mockUser, token: mockToken, refreshToken: mockRefreshToken });
    clearAuthData();

    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(getUser()).toBeNull();
  });
});
