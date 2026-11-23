import type { AxiosInstance } from 'axios';
import { apiClient } from './api-client';
import { API_ENDPOINTS } from '@/constants';
import type {
  ApiResponse,
  AuthData,
  LoginCredentials,
  RefreshData,
  SignupCredentials,
} from '@/types';

export class AuthService {
  constructor(private readonly http: AxiosInstance = apiClient) {}

  async login(credentials: LoginCredentials): Promise<AuthData> {
    const response = await this.http.post<ApiResponse<AuthData>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
    );

    if (!response.data.success) {
      throw new Error(response.data.error);
    }

    return response.data.data;
  }

  async signup(credentials: SignupCredentials): Promise<AuthData> {
    const response = await this.http.post<ApiResponse<AuthData>>(
      API_ENDPOINTS.AUTH.SIGNUP,
      credentials,
    );

    if (!response.data.success) {
      throw new Error(response.data.error);
    }

    return response.data.data;
  }

  async refresh(refreshToken: string): Promise<RefreshData> {
    const response = await this.http.post<ApiResponse<RefreshData>>(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    });

    if (!response.data.success) {
      throw new Error(response.data.error);
    }

    return response.data.data;
  }
}

export const authService = new AuthService();
