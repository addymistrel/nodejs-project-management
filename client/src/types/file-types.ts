export interface ProjectFile {
  fileId: number;
  projectId: number;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  isOutput: boolean;
}

export interface PaginatedFilesResponse {
  items: ProjectFile[];
  total: number;
  limit: number;
  pageNumber: number;
}

export interface UploadFilesResponse {
  projectId: number;
  files: ProjectFile[];
}
