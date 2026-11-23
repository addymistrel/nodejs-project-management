import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { API_ENDPOINTS, HTTP_HEADERS } from '@/constants';
import { clearAuthData, getAccessToken, getRefreshToken, setTokens } from '@/utils';
import type { ApiResponse, RefreshData } from '@/types';

export const apiClient: AxiosInstance = axios.create({
  headers: {
    [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADERS.APPLICATION_JSON,
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers[HTTP_HEADERS.AUTHORIZATION] = `${HTTP_HEADERS.BEARER_PREFIX}${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url?.includes(API_ENDPOINTS.AUTH.LOGIN) ||
        originalRequest.url?.includes(API_ENDPOINTS.AUTH.SIGNUP) ||
        originalRequest.url?.includes(API_ENDPOINTS.AUTH.REFRESH)
      ) {
        return Promise.reject(error);
      }

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearAuthData();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers[HTTP_HEADERS.AUTHORIZATION] =
              `${HTTP_HEADERS.BEARER_PREFIX}${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post<ApiResponse<RefreshData>>(
          API_ENDPOINTS.AUTH.REFRESH,
          { refreshToken },
          { headers: { [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADERS.APPLICATION_JSON } },
        );

        if (response.data.success) {
          const newTokens = response.data.data;
          setTokens(newTokens);
          originalRequest.headers[HTTP_HEADERS.AUTHORIZATION] =
            `${HTTP_HEADERS.BEARER_PREFIX}${newTokens.token}`;
          processQueue(null, newTokens.token);
          return apiClient(originalRequest);
        } else {
          throw new Error(response.data.error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthData();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
