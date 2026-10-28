interface CreateProjectRequest {
  name: string;
  description: string | null;
}

interface UpdateProjectRequest {
  name?: string;
  description?: string | null;
}

interface ProjectResponse {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectDetailsResponse extends ProjectResponse {
  filesCount: number;
  jobsCount: number;
}

export type { CreateProjectRequest, UpdateProjectRequest, ProjectResponse, ProjectDetailsResponse };
