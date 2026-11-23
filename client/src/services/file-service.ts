import type { AxiosInstance } from 'axios';
import { apiClient } from './api-client';
import { API_ENDPOINTS, HTTP_HEADERS } from '@/constants';
import type {
  ApiResponse,
  PaginatedFilesResponse,
  PaginationParams,
  ProjectFile,
  UploadFilesResponse,
} from '@/types';

export class FileService {
  constructor(private readonly http: AxiosInstance = apiClient) {}

  async listFiles(
    projectId: number | string,
    params?: PaginationParams,
  ): Promise<PaginatedFilesResponse> {
    const response = await this.http.get<ApiResponse<PaginatedFilesResponse>>(
      API_ENDPOINTS.FILES.BASE(projectId),
      { params },
    );

    if (!response.data.success) {
      throw new Error(response.data.error);
    }

    return response.data.data;
  }

  async uploadFiles(projectId: number | string, files: File[]): Promise<ProjectFile[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await this.http.post<ApiResponse<UploadFilesResponse>>(
      API_ENDPOINTS.FILES.BASE(projectId),
      formData,
      {
        headers: {
          [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADERS.MULTIPART_FORM_DATA,
        },
      },
    );

    if (!response.data.success) {
      throw new Error(response.data.error);
    }

    return response.data.data.files;
  }

  async downloadFile(projectId: number | string, fileId: number | string): Promise<Blob> {
    const response = await this.http.get<Blob>(API_ENDPOINTS.FILES.DOWNLOAD(projectId, fileId), {
      responseType: 'blob',
    });

    return response.data;
  }

  async deleteFile(projectId: number | string, fileId: number | string): Promise<void> {
    const response = await this.http.delete<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.FILES.BY_ID(projectId, fileId),
    );

    if (!response.data.success) {
      throw new Error(response.data.error);
    }
  }
}

export const fileService = new FileService();
