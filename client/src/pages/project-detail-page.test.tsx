import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProjectDetailPage } from './project-detail-page';
import { projectService, fileService, jobService } from '@/services';
import { useAuth } from '@/context';
import { PROJECT_MESSAGES } from '@/constants';
import type { ProjectDetails, ProjectFile, ZipJob } from '@/types';

vi.mock('@/services', () => ({
  projectService: {
    getProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
  },
  fileService: {
    listFiles: vi.fn(),
    uploadFiles: vi.fn(),
    downloadFile: vi.fn(),
    deleteFile: vi.fn(),
  },
  jobService: {
    listJobs: vi.fn(),
    createZipJob: vi.fn(),
    getJob: vi.fn(),
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
    filesCount: 1,
    jobsCount: 1,
  };

  const mockFile: ProjectFile = {
    fileId: 501,
    projectId: 99,
    name: 'design-spec.pdf',
    size: 2048,
    type: 'application/pdf',
    uploadedAt: '2026-02-16T12:00:00.000Z',
    isOutput: false,
  };

  const mockJob: ZipJob = {
    jobId: 301,
    projectId: 99,
    type: 'ZIP',
    status: 'COMPLETED',
    progress: 100,
    outputFileId: 901,
    createdAt: '2026-02-16T12:00:00.000Z',
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

    vi.mocked(projectService.getProject).mockResolvedValue(mockProjectDetails);
    vi.mocked(fileService.listFiles).mockResolvedValue({
      items: [mockFile],
      total: 1,
      limit: 10,
      pageNumber: 1,
    });
    vi.mocked(jobService.listJobs).mockResolvedValue({
      items: [mockJob],
      total: 1,
      limit: 5,
      pageNumber: 1,
    });
  });

  it('should render project details, files, and jobs', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/99']}>
        <Routes>
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Apollo Project')).toBeInTheDocument();
      expect(screen.getByText('design-spec.pdf')).toBeInTheDocument();
      expect(screen.getByText('Job #301')).toBeInTheDocument();
    });
  });

  it('should trigger createZipJob when files are selected and archive button is clicked', async () => {
    vi.mocked(jobService.createZipJob).mockResolvedValueOnce({
      ...mockJob,
      jobId: 302,
      status: 'PROCESSING',
      progress: 0,
    });

    render(
      <MemoryRouter initialEntries={['/projects/99']}>
        <Routes>
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('design-spec.pdf')).toBeInTheDocument();
    });

    // Select the file
    const checkbox = screen.getByLabelText(/select file 501/i);
    fireEvent.click(checkbox);

    // Click the Create Zip Archive button
    const zipBtn = screen.getByRole('button', { name: /create zip archive/i });
    expect(zipBtn).toBeInTheDocument();
    fireEvent.click(zipBtn);

    await waitFor(() => {
      expect(jobService.createZipJob).toHaveBeenCalledWith('99', { fileIds: [501] });
    });
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
