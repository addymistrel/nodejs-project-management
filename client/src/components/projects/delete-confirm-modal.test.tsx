import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteConfirmModal } from './delete-confirm-modal';
import { PROJECT_MESSAGES } from '@/constants';
import type { Project } from '@/types';

describe('DeleteConfirmModal (TDD)', () => {
  const mockProject: Project = {
    id: 1,
    name: 'Target Project',
    description: null,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

  it('should render project name in confirmation message', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        project={mockProject}
      />,
    );

    expect(screen.getByText(PROJECT_MESSAGES.DELETE_CONFIRM_TITLE)).toBeInTheDocument();
    expect(screen.getByText(PROJECT_MESSAGES.DELETE_CONFIRM_DESC)).toBeInTheDocument();
    expect(screen.getByText(mockProject.name)).toBeInTheDocument();
  });

  it('should call onConfirm when confirmed', async () => {
    const onConfirm = vi.fn().mockResolvedValueOnce(undefined);

    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        project={mockProject}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: PROJECT_MESSAGES.DELETE_CONFIRM_ACTION }));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled();
    });
  });
});
