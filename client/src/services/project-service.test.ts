import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectService } from './project-service';
import type { AxiosInstance } from 'axios';
import { API_ENDPOINTS } from '@/constants';
import type {
  CreateProjectInput,
  PaginatedProjectsResponse,
  Project,
  ProjectDetails,
  UpdateProjectInput,
} from '@/types';

describe('ProjectService (TDD)', () => {
  let mockHttp: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let projectService: ProjectService;

  beforeEach(() => {
    mockHttp = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };
    projectService = new ProjectService(mockHttp as unknown as AxiosInstance);
  });

  const mockProject: Project = {
    id: 1,
    name: 'Sample Project',
    description: 'A test project description',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const mockProjectDetails: ProjectDetails = {
    ...mockProject,
    filesCount: 3,
    jobsCount: 1,
  };

  it('should list projects with pagination parameters', async () => {
    const mockPaginated: PaginatedProjectsResponse = {
      items: [mockProject],
      total: 1,
      limit: 10,
      pageNumber: 1,
    };

    mockHttp.get.mockResolvedValueOnce({
      data: { success: true, data: mockPaginated },
    });

    const result = await projectService.listProjects({ pageNumber: 1, limit: 10 });

    expect(mockHttp.get).toHaveBeenCalledWith(API_ENDPOINTS.PROJECTS.BASE, {
      params: { pageNumber: 1, limit: 10 },
    });
    expect(result).toEqual(mockPaginated);
  });

  it('should get project details by id', async () => {
    mockHttp.get.mockResolvedValueOnce({
      data: { success: true, data: mockProjectDetails },
    });

    const result = await projectService.getProject(1);

    expect(mockHttp.get).toHaveBeenCalledWith(API_ENDPOINTS.PROJECTS.BY_ID(1));
    expect(result).toEqual(mockProjectDetails);
  });

  it('should create a new project', async () => {
    const input: CreateProjectInput = {
      name: 'New Project',
      description: 'New Description',
    };

    mockHttp.post.mockResolvedValueOnce({
      data: { success: true, data: mockProject },
    });

    const result = await projectService.createProject(input);

    expect(mockHttp.post).toHaveBeenCalledWith(API_ENDPOINTS.PROJECTS.BASE, input);
    expect(result).toEqual(mockProject);
  });

  it('should update an existing project', async () => {
    const updateInput: UpdateProjectInput = {
      name: 'Updated Project Name',
    };
    const updatedProject = { ...mockProject, name: 'Updated Project Name' };

    mockHttp.patch.mockResolvedValueOnce({
      data: { success: true, data: updatedProject },
    });

    const result = await projectService.updateProject(1, updateInput);

    expect(mockHttp.patch).toHaveBeenCalledWith(API_ENDPOINTS.PROJECTS.BY_ID(1), updateInput);
    expect(result).toEqual(updatedProject);
  });

  it('should delete a project by id', async () => {
    mockHttp.delete.mockResolvedValueOnce({
      data: { success: true, data: { message: 'Project deleted successfully' } },
    });

    await projectService.deleteProject(1);

    expect(mockHttp.delete).toHaveBeenCalledWith(API_ENDPOINTS.PROJECTS.BY_ID(1));
  });

  it('should throw an error when API returns success: false', async () => {
    mockHttp.get.mockResolvedValueOnce({
      data: { success: false, error: 'Project not found' },
    });

    await expect(projectService.getProject(99)).rejects.toThrow('Project not found');
  });
});
