import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileTable } from './file-table';
import { FILE_MESSAGES } from '@/constants';
import type { ProjectFile } from '@/types';

describe('FileTable (TDD)', () => {
  const mockFiles: ProjectFile[] = [
    {
      fileId: 1,
      projectId: 10,
      name: 'report.pdf',
      size: 1024,
      type: 'application/pdf',
      uploadedAt: '2026-03-01T00:00:00.000Z',
      isOutput: false,
    },
    {
      fileId: 2,
      projectId: 10,
      name: 'archive.zip',
      size: 4096,
      type: 'application/zip',
      uploadedAt: '2026-03-01T01:00:00.000Z',
      isOutput: true,
    },
  ];

  it('should render empty state when no files exist', () => {
    render(
      <FileTable
        files={[]}
        selectedFileIds={[]}
        onSelectionChange={vi.fn()}
        onDownload={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText(FILE_MESSAGES.EMPTY_FILES_TITLE)).toBeInTheDocument();
  });

  it('should render files and badges correctly', () => {
    render(
      <FileTable
        files={mockFiles}
        selectedFileIds={[]}
        onSelectionChange={vi.fn()}
        onDownload={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('report.pdf')).toBeInTheDocument();
    expect(screen.getByText('archive.zip')).toBeInTheDocument();
    expect(screen.getByText(FILE_MESSAGES.BADGE_OUTPUT_ZIP)).toBeInTheDocument();
  });

  it('should trigger onSelectionChange when checkbox is clicked', () => {
    const onSelectionChange = vi.fn();
    render(
      <FileTable
        files={mockFiles}
        selectedFileIds={[]}
        onSelectionChange={onSelectionChange}
        onDownload={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const checkbox = screen.getByLabelText(/select file 1/i);
    fireEvent.click(checkbox);

    expect(onSelectionChange).toHaveBeenCalledWith([1]);
  });

  it('should trigger onDownload when download button is clicked', () => {
    const onDownload = vi.fn();
    render(
      <FileTable
        files={mockFiles}
        selectedFileIds={[]}
        onSelectionChange={vi.fn()}
        onDownload={onDownload}
        onDelete={vi.fn()}
      />,
    );

    const downloadButtons = screen.getAllByRole('button', { name: /download/i });
    fireEvent.click(downloadButtons[0]);

    expect(onDownload).toHaveBeenCalledWith(mockFiles[0]);
  });

  it('should trigger onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(
      <FileTable
        files={mockFiles}
        selectedFileIds={[]}
        onSelectionChange={vi.fn()}
        onDownload={vi.fn()}
        onDelete={onDelete}
      />,
    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith(mockFiles[0]);
  });
});
