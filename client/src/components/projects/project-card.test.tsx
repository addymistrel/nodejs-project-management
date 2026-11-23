import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProjectCard } from './project-card';
import type { Project } from '@/types';

describe('ProjectCard (TDD)', () => {
  const mockProject: Project = {
    id: 42,
    name: 'Awesome Project',
    description: 'This is a description of the project.',
    createdAt: '2026-03-01T12:00:00.000Z',
    updatedAt: '2026-03-02T15:30:00.000Z',
  };

  it('should render project name, description, and formatted date', () => {
    render(
      <BrowserRouter>
        <ProjectCard
          project={mockProject}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      </BrowserRouter>,
    );

    expect(screen.getByText('Awesome Project')).toBeInTheDocument();
    expect(screen.getByText('This is a description of the project.')).toBeInTheDocument();
  });

  it('should render placeholder when description is null or empty', () => {
    const emptyDescProject: Project = {
      ...mockProject,
      description: null,
    };

    render(
      <BrowserRouter>
        <ProjectCard
          project={emptyDescProject}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      </BrowserRouter>,
    );

    expect(screen.getByText(/no description provided/i)).toBeInTheDocument();
  });

  it('should trigger onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    render(
      <BrowserRouter>
        <ProjectCard
          project={mockProject}
          onEdit={onEdit}
          onDelete={vi.fn()}
        />
      </BrowserRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(mockProject);
  });

  it('should trigger onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(
      <BrowserRouter>
        <ProjectCard
          project={mockProject}
          onEdit={vi.fn()}
          onDelete={onDelete}
        />
      </BrowserRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith(mockProject);
  });
});
