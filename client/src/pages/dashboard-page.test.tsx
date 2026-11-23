import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from './dashboard-page';
import { projectService } from '@/services';
import { useAuth } from '@/context';
import { PROJECT_MESSAGES } from '@/constants';
import type { PaginatedProjectsResponse, Project } from '@/types';

vi.mock('@/services', () => ({
  projectService: {
    listProjects: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
  },
}));

vi.mock('@/context', () => ({
  useAuth: vi.fn(),
}));

describe('DashboardPage (TDD)', () => {
  const mockProjects: Project[] = [
    {
      id: 1,
      name: 'Project Alpha',
      description: 'Alpha description',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      name: 'Project Beta',
      description: 'Beta description',
      createdAt: '2026-01-02T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
  ];

  const mockPaginatedResponse: PaginatedProjectsResponse = {
    items: mockProjects,
    total: 2,
    limit: 6,
    pageNumber: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 10, name: 'Alice', email: 'alice@test.com' },
      token: 'jwt-token',
      refreshToken: 'refresh-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('should render loading state initially and then render project cards', async () => {
    vi.mocked(projectService.listProjects).mockResolvedValueOnce(mockPaginatedResponse);

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>,
    );

    expect(screen.getByText(PROJECT_MESSAGES.LOADING_PROJECTS)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('Project Beta')).toBeInTheDocument();
    });
  });

  it('should render empty state when no projects exist', async () => {
    vi.mocked(projectService.listProjects).mockResolvedValueOnce({
      items: [],
      total: 0,
      limit: 6,
      pageNumber: 1,
    });

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(PROJECT_MESSAGES.EMPTY_TITLE)).toBeInTheDocument();
    });
  });

  it('should open create modal when clicking "New Project" button', async () => {
    vi.mocked(projectService.listProjects).mockResolvedValueOnce(mockPaginatedResponse);

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: PROJECT_MESSAGES.CREATE_BUTTON }));

    expect(screen.getByText(PROJECT_MESSAGES.CREATE_TITLE)).toBeInTheDocument();
  });
});
