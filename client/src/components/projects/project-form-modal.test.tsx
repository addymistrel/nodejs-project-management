import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectFormModal } from './project-form-modal';
import { PROJECT_MESSAGES } from '@/constants';
import type { Project } from '@/types';

describe('ProjectFormModal (TDD)', () => {
  it('should render create project form with empty inputs', () => {
    render(
      <ProjectFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        project={null}
      />,
    );

    expect(screen.getByText(PROJECT_MESSAGES.CREATE_TITLE)).toBeInTheDocument();
    expect(screen.getByLabelText(PROJECT_MESSAGES.NAME_LABEL)).toHaveValue('');
    expect(screen.getByLabelText(PROJECT_MESSAGES.DESCRIPTION_LABEL)).toHaveValue('');
    expect(screen.getByRole('button', { name: PROJECT_MESSAGES.SUBMIT_CREATE })).toBeInTheDocument();
  });

  it('should populate inputs when editing existing project', () => {
    const existingProject: Project = {
      id: 1,
      name: 'Existing Project',
      description: 'Existing Description',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    render(
      <ProjectFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        project={existingProject}
      />,
    );

    expect(screen.getByText(PROJECT_MESSAGES.EDIT_TITLE)).toBeInTheDocument();
    expect(screen.getByLabelText(PROJECT_MESSAGES.NAME_LABEL)).toHaveValue('Existing Project');
    expect(screen.getByLabelText(PROJECT_MESSAGES.DESCRIPTION_LABEL)).toHaveValue('Existing Description');
    expect(screen.getByRole('button', { name: PROJECT_MESSAGES.SUBMIT_UPDATE })).toBeInTheDocument();
  });

  it('should call onSubmit with entered data', async () => {
    const onSubmit = vi.fn().mockResolvedValueOnce(undefined);

    render(
      <ProjectFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        project={null}
      />,
    );

    fireEvent.change(screen.getByLabelText(PROJECT_MESSAGES.NAME_LABEL), {
      target: { value: 'New Test Project' },
    });
    fireEvent.change(screen.getByLabelText(PROJECT_MESSAGES.DESCRIPTION_LABEL), {
      target: { value: 'Description of test' },
    });
    fireEvent.click(screen.getByRole('button', { name: PROJECT_MESSAGES.SUBMIT_CREATE }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'New Test Project',
        description: 'Description of test',
      });
    });
  });
});
