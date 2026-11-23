import type { AxiosInstance } from 'axios';
import { apiClient } from './api-client';
import { API_ENDPOINTS } from '@/constants';
import type {
  ApiResponse,
  CreateProjectInput,
  PaginatedProjectsResponse,
  PaginationParams,
  Project,
  ProjectDetails,
  UpdateProjectInput,
} from '@/types';

export class ProjectService {
  constructor(private readonly http: AxiosInstance = apiClient) {}

  async listProjects(params?: PaginationParams): Promise<PaginatedProjectsResponse> {
    const response = await this.http.get<ApiResponse<PaginatedProjectsResponse>>(
      API_ENDPOINTS.PROJECTS.BASE,
      { params },
    );

    if (!response.data.success) {
      throw new Error(response.data.error);
    }

    return response.data.data;
  }

  async getProject(projectId: number | string): Promise<ProjectDetails> {
    const response = await this.http.get<ApiResponse<ProjectDetails>>(
      API_ENDPOINTS.PROJECTS.BY_ID(projectId),
    );

    if (!response.data.success) {
      throw new Error(response.data.error);
    }

    return response.data.data;
  }

  async createProject(data: CreateProjectInput): Promise<Project> {
    const response = await this.http.post<ApiResponse<Project>>(API_ENDPOINTS.PROJECTS.BASE, data);

    if (!response.data.success) {
      throw new Error(response.data.error);
    }

    return response.data.data;
  }

  async updateProject(projectId: number | string, data: UpdateProjectInput): Promise<Project> {
    const response = await this.http.patch<ApiResponse<Project>>(
      API_ENDPOINTS.PROJECTS.BY_ID(projectId),
      data,
    );

    if (!response.data.success) {
      throw new Error(response.data.error);
    }

    return response.data.data;
  }

  async deleteProject(projectId: number | string): Promise<void> {
    const response = await this.http.delete<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.PROJECTS.BY_ID(projectId),
    );

    if (!response.data.success) {
      throw new Error(response.data.error);
    }
  }
}

export const projectService = new ProjectService();
