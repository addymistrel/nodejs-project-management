import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JobList } from './job-list';
import { JOB_MESSAGES } from '@/constants';
import type { ZipJob } from '@/types';

describe('JobList (TDD)', () => {
  const mockCompletedJob: ZipJob = {
    jobId: 101,
    projectId: 1,
    type: 'ZIP',
    status: 'COMPLETED',
    progress: 100,
    outputFileId: 777,
    createdAt: '2026-03-01T00:00:00.000Z',
    completedAt: '2026-03-01T00:01:00.000Z',
  };

  const mockProcessingJob: ZipJob = {
    jobId: 102,
    projectId: 1,
    type: 'ZIP',
    status: 'PROCESSING',
    progress: 45,
    createdAt: '2026-03-01T00:00:00.000Z',
  };

  const mockFailedJob: ZipJob = {
    jobId: 103,
    projectId: 1,
    type: 'ZIP',
    status: 'FAILED',
    progress: 10,
    error: 'Compression failed due to missing files',
    createdAt: '2026-03-01T00:00:00.000Z',
  };

  it('should render empty state when no jobs exist', () => {
    render(<JobList jobs={[]} onDownloadZip={vi.fn()} />);

    expect(screen.getByText(JOB_MESSAGES.EMPTY_JOBS_TITLE)).toBeInTheDocument();
  });

  it('should render jobs with appropriate status badges', () => {
    render(
      <JobList
        jobs={[mockCompletedJob, mockProcessingJob, mockFailedJob]}
        onDownloadZip={vi.fn()}
      />,
    );

    expect(screen.getByText('Job #101')).toBeInTheDocument();
    expect(screen.getByText('Job #102')).toBeInTheDocument();
    expect(screen.getByText('Job #103')).toBeInTheDocument();

    expect(screen.getByText(JOB_MESSAGES.STATUS_COMPLETED)).toBeInTheDocument();
    expect(screen.getByText(JOB_MESSAGES.STATUS_PROCESSING)).toBeInTheDocument();
    expect(screen.getByText(JOB_MESSAGES.STATUS_FAILED)).toBeInTheDocument();
  });

  it('should show download button for completed job and trigger onDownloadZip', () => {
    const onDownloadZip = vi.fn();
    render(<JobList jobs={[mockCompletedJob]} onDownloadZip={onDownloadZip} />);

    const downloadBtn = screen.getByRole('button', { name: JOB_MESSAGES.DOWNLOAD_ZIP_ACTION });
    expect(downloadBtn).toBeInTheDocument();

    fireEvent.click(downloadBtn);
    expect(onDownloadZip).toHaveBeenCalledWith(777);
  });

  it('should render error message on failed job', () => {
    render(<JobList jobs={[mockFailedJob]} onDownloadZip={vi.fn()} />);

    expect(screen.getByText('Compression failed due to missing files')).toBeInTheDocument();
  });
});
