export interface Project {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetails extends Project {
  filesCount: number;
  jobsCount: number;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
}

export interface PaginatedProjectsResponse {
  items: Project[];
  total: number;
  limit: number;
  pageNumber: number;
}

export interface PaginationParams {
  pageNumber?: number;
  limit?: number;
}
