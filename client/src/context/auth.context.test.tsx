import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './index';
import { authService } from '@/services';
import * as storageUtils from '@/utils';
import type { AuthData, User } from '@/types';

vi.mock('@/services', () => ({
  authService: {
    login: vi.fn(),
    signup: vi.fn(),
    refresh: vi.fn(),
  },
}));

describe('AuthContext & useAuth (TDD)', () => {
  const mockUser: User = { id: 1, name: 'Alice', email: 'alice@example.com' };
  const mockAuthData: AuthData = {
    user: mockUser,
    token: 'test-token',
    refreshToken: 'test-refresh-token',
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with stored auth data if available', () => {
    storageUtils.setAuthData(mockAuthData);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('test-token');
    expect(result.current.isLoading).toBe(false);
  });

  it('should initialize as unauthenticated when no storage exists', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should successfully log in, update state and local storage', async () => {
    vi.mocked(authService.login).mockResolvedValueOnce(mockAuthData);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({ email: 'alice@example.com', password: 'password123' });
    });

    expect(authService.login).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'password123',
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(storageUtils.getAccessToken()).toBe('test-token');
  });

  it('should successfully sign up, update state and local storage', async () => {
    vi.mocked(authService.signup).mockResolvedValueOnce(mockAuthData);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signup({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'password123',
      });
    });

    expect(authService.signup).toHaveBeenCalledWith({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(storageUtils.getUser()).toEqual(mockUser);
  });

  it('should clear state and storage on logout', () => {
    storageUtils.setAuthData(mockAuthData);

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(storageUtils.getAccessToken()).toBeNull();
  });

  it('should throw an error when useAuth is used outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider',
    );
  });
});
