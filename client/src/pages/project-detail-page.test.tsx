import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProjectDetailPage } from './project-detail-page';
import { projectService } from '@/services';
import { useAuth } from '@/context';
import { PROJECT_MESSAGES } from '@/constants';
import type { ProjectDetails } from '@/types';

vi.mock('@/services', () => ({
  projectService: {
    getProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
  },
}));

vi.mock('@/context', () => ({
  useAuth: vi.fn(),
}));

describe('ProjectDetailPage (TDD)', () => {
  const mockProjectDetails: ProjectDetails = {
    id: 99,
    name: 'Apollo Project',
    description: 'Detailed description of Apollo',
    createdAt: '2026-02-15T10:00:00.000Z',
    updatedAt: '2026-02-16T12:00:00.000Z',
    filesCount: 5,
    jobsCount: 2,
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

  it('should render project details and statistics', async () => {
    vi.mocked(projectService.getProject).mockResolvedValueOnce(mockProjectDetails);

    render(
      <MemoryRouter initialEntries={['/projects/99']}>
        <Routes>
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(PROJECT_MESSAGES.LOADING_PROJECT)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Apollo Project')).toBeInTheDocument();
      expect(screen.getByText('Detailed description of Apollo')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // filesCount
      expect(screen.getByText('2')).toBeInTheDocument(); // jobsCount
    });
  });

  it('should open edit modal on clicking Edit', async () => {
    vi.mocked(projectService.getProject).mockResolvedValueOnce(mockProjectDetails);

    render(
      <MemoryRouter initialEntries={['/projects/99']}>
        <Routes>
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Apollo Project')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByText(PROJECT_MESSAGES.EDIT_TITLE)).toBeInTheDocument();
  });

  it('should handle project not found error', async () => {
    vi.mocked(projectService.getProject).mockRejectedValueOnce(new Error('Project not found'));

    render(
      <MemoryRouter initialEntries={['/projects/999']}>
        <Routes>
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(PROJECT_MESSAGES.NOT_FOUND_TITLE)).toBeInTheDocument();
    });
  });
});

