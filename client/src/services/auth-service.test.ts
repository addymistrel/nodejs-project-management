import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth-service';
import type { AxiosInstance } from 'axios';
import { API_ENDPOINTS } from '@/constants';
import type { AuthData, LoginCredentials, RefreshData, SignupCredentials } from '@/types';

describe('AuthService (TDD)', () => {
  let mockHttp: {
    post: ReturnType<typeof vi.fn>;
  };
  let authService: AuthService;

  beforeEach(() => {
    mockHttp = {
      post: vi.fn(),
    };
    authService = new AuthService(mockHttp as unknown as AxiosInstance);
  });

  it('should call login endpoint with credentials and return auth data', async () => {
    const credentials: LoginCredentials = {
      email: 'john@example.com',
      password: 'Password123!',
    };
    const mockAuthData: AuthData = {
      user: { id: 1, name: 'John Doe', email: 'john@example.com' },
      token: 'access-jwt',
      refreshToken: 'refresh-jwt',
    };

    mockHttp.post.mockResolvedValueOnce({
      data: { success: true, data: mockAuthData },
    });

    const result = await authService.login(credentials);

    expect(mockHttp.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.LOGIN, credentials);
    expect(result).toEqual(mockAuthData);
  });

  it('should call signup endpoint with user data and return auth data', async () => {
    const signupData: SignupCredentials = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
    };
    const mockAuthData: AuthData = {
      user: { id: 1, name: 'John Doe', email: 'john@example.com' },
      token: 'access-jwt',
      refreshToken: 'refresh-jwt',
    };

    mockHttp.post.mockResolvedValueOnce({
      data: { success: true, data: mockAuthData },
    });

    const result = await authService.signup(signupData);

    expect(mockHttp.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.SIGNUP, signupData);
    expect(result).toEqual(mockAuthData);
  });

  it('should call refresh endpoint with refreshToken and return new tokens', async () => {
    const refreshToken = 'current-refresh-token';
    const mockRefreshData: RefreshData = {
      token: 'new-access-jwt',
      refreshToken: 'new-refresh-jwt',
    };

    mockHttp.post.mockResolvedValueOnce({
      data: { success: true, data: mockRefreshData },
    });

    const result = await authService.refresh(refreshToken);

    expect(mockHttp.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
    expect(result).toEqual(mockRefreshData);
  });

  it('should throw error when api response indicates failure', async () => {
    mockHttp.post.mockResolvedValueOnce({
      data: { success: false, error: 'Invalid credentials' },
    });

    await expect(authService.login({ email: 'bad@test.com', password: 'wrong' })).rejects.toThrow(
      'Invalid credentials',
    );
  });
});
