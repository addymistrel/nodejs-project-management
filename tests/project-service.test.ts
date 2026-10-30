import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../src/utils/app-error.js';

const repository = vi.hoisted(() => ({
  createProjectRecord: vi.fn(),
  deleteProjectRecord: vi.fn(),
  findProjectById: vi.fn(),
  findProjectDetailsById: vi.fn(),
  updateProjectRecord: vi.fn(),
}));

vi.mock('#/repositories', () => repository);

const { createProject, deleteProject, getProject, updateProject } =
  await import('../src/services/project-service.js');

const project = {
  id: 1,
  name: 'Website redesign',
  description: 'Refresh the public website',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('Project service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a project and returns the public project fields', async () => {
    repository.createProjectRecord.mockResolvedValue(project);

    const result = await createProject({
      name: project.name,
      description: project.description,
    });

    expect(result).toEqual(project);
    expect(repository.createProjectRecord).toHaveBeenCalledWith({
      name: project.name,
      description: project.description,
    });
  });

  it('gets a project with file and job counts', async () => {
    repository.findProjectDetailsById.mockResolvedValue({
      project,
      filesCount: 4,
      jobsCount: 2,
    });

    const result = await getProject(project.id);

    expect(result).toEqual({
      ...project,
      filesCount: 4,
      jobsCount: 2,
    });
    expect(repository.findProjectDetailsById).toHaveBeenCalledWith(project.id);
  });

  it('throws a not-found AppError when getting a missing project', async () => {
    repository.findProjectDetailsById.mockResolvedValue(null);

    const promise = getProject(999);

    await expect(promise).rejects.toMatchObject({
      message: 'Project not found',
      statusCode: 404,
    });
    await expect(promise).rejects.toBeInstanceOf(AppError);
  });

  it('updates an existing project and returns the updated fields', async () => {
    const updatedProject = { ...project, name: 'Updated website' };
    repository.findProjectById.mockResolvedValue(project);
    repository.updateProjectRecord.mockResolvedValue(updatedProject);

    const result = await updateProject(project.id, { name: updatedProject.name });

    expect(result).toEqual(updatedProject);
    expect(repository.findProjectById).toHaveBeenCalledWith(project.id);
    expect(repository.updateProjectRecord).toHaveBeenCalledWith(project, {
      name: updatedProject.name,
    });
  });

  it('throws a not-found AppError when updating a missing project', async () => {
    repository.findProjectById.mockResolvedValue(null);

    await expect(updateProject(999, { name: 'Updated website' })).rejects.toMatchObject({
      message: 'Project not found',
      statusCode: 404,
    });
    expect(repository.updateProjectRecord).not.toHaveBeenCalled();
  });

  it('deletes an existing project', async () => {
    repository.findProjectById.mockResolvedValue(project);
    repository.deleteProjectRecord.mockResolvedValue(undefined);

    await expect(deleteProject(project.id)).resolves.toBeUndefined();

    expect(repository.findProjectById).toHaveBeenCalledWith(project.id);
    expect(repository.deleteProjectRecord).toHaveBeenCalledWith(project);
  });

  it('throws a not-found AppError when deleting a missing project', async () => {
    repository.findProjectById.mockResolvedValue(null);

    await expect(deleteProject(999)).rejects.toMatchObject({
      message: 'Project not found',
      statusCode: 404,
    });
    expect(repository.deleteProjectRecord).not.toHaveBeenCalled();
  });
});
