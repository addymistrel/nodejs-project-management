interface FileResponse {
  fileId: number;
  projectId: number;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  isOutput: boolean;
}

export type { FileResponse };
