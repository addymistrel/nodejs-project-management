import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileService } from './file-service';
import type { AxiosInstance } from 'axios';
import { API_ENDPOINTS } from '@/constants';
import type { PaginatedFilesResponse, ProjectFile } from '@/types';

describe('FileService (TDD)', () => {
  let mockHttp: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let fileService: FileService;

  beforeEach(() => {
    mockHttp = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    };
    fileService = new FileService(mockHttp as unknown as AxiosInstance);
  });

  const mockFile: ProjectFile = {
    fileId: 101,
    projectId: 1,
    name: 'document.pdf',
    size: 2048,
    type: 'application/pdf',
    uploadedAt: '2026-03-01T00:00:00.000Z',
    isOutput: false,
  };

  it('should list files for a project with pagination', async () => {
    const mockPaginated: PaginatedFilesResponse = {
      items: [mockFile],
      total: 1,
      limit: 10,
      pageNumber: 1,
    };

    mockHttp.get.mockResolvedValueOnce({
      data: { success: true, data: mockPaginated },
    });

    const result = await fileService.listFiles(1, { pageNumber: 1, limit: 10 });

    expect(mockHttp.get).toHaveBeenCalledWith(API_ENDPOINTS.FILES.BASE(1), {
      params: { pageNumber: 1, limit: 10 },
    });
    expect(result).toEqual(mockPaginated);
  });

  it('should upload files using FormData with multipart header', async () => {
    const mockFileList = [new File(['dummy'], 'sample.txt', { type: 'text/plain' })];

    mockHttp.post.mockResolvedValueOnce({
      data: { success: true, data: { projectId: 1, files: [mockFile] } },
    });

    const result = await fileService.uploadFiles(1, mockFileList);

    expect(mockHttp.post).toHaveBeenCalled();
    const [url, formData, config] = mockHttp.post.mock.calls[0];
    expect(url).toBe(API_ENDPOINTS.FILES.BASE(1));
    expect(formData).toBeInstanceOf(FormData);
    expect(config?.headers?.['Content-Type']).toBe('multipart/form-data');
    expect(result).toEqual([mockFile]);
  });

  it('should download a file and return Blob', async () => {
    const mockBlob = new Blob(['sample-content'], { type: 'text/plain' });

    mockHttp.get.mockResolvedValueOnce({
      data: mockBlob,
    });

    const result = await fileService.downloadFile(1, 101);

    expect(mockHttp.get).toHaveBeenCalledWith(API_ENDPOINTS.FILES.DOWNLOAD(1, 101), {
      responseType: 'blob',
    });
    expect(result).toEqual(mockBlob);
  });

  it('should delete a file by id', async () => {
    mockHttp.delete.mockResolvedValueOnce({
      data: { success: true, data: { message: 'File deleted successfully' } },
    });

    await fileService.deleteFile(1, 101);

    expect(mockHttp.delete).toHaveBeenCalledWith(API_ENDPOINTS.FILES.BY_ID(1, 101));
  });

  it('should throw error when listFiles fails', async () => {
    mockHttp.get.mockResolvedValueOnce({
      data: { success: false, error: 'Project not found' },
    });

    await expect(fileService.listFiles(99)).rejects.toThrow('Project not found');
  });
});
