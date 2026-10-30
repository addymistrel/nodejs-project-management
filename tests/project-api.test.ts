import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../src/utils/app-error.js';

const projectService = {
  createProject: vi.fn(),
  deleteProject: vi.fn(),
  getProject: vi.fn(),
  updateProject: vi.fn(),
};

vi.mock('#/services', () => projectService);

const { app } = await import('../src/app.js');

const project = {
  id: 1,
  name: 'Website redesign',
  description: 'Refresh the public website',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('Project API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a project and normalizes its input', async () => {
    projectService.createProject.mockResolvedValue(project);

    const response = await request(app).post('/api/projects').send({
      name: '  Website redesign  ',
      description: '  Refresh the public website  ',
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: 1,
      name: 'Website redesign',
      description: 'Refresh the public website',
    });
    expect(projectService.createProject).toHaveBeenCalledWith({
      name: 'Website redesign',
      description: 'Refresh the public website',
    });
  });

  it('returns project details for a valid id', async () => {
    projectService.getProject.mockResolvedValue({
      ...project,
      filesCount: 2,
      jobsCount: 3,
    });

    const response = await request(app).get('/api/projects/1');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 1,
      name: 'Website redesign',
      filesCount: 2,
      jobsCount: 3,
    });
    expect(projectService.getProject).toHaveBeenCalledWith(1);
  });

  it('updates a project with a partial payload', async () => {
    projectService.updateProject.mockResolvedValue({
      ...project,
      name: 'Updated website',
    });

    const response = await request(app).patch('/api/projects/1').send({
      name: ' Updated website ',
    });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated website');
    expect(projectService.updateProject).toHaveBeenCalledWith(1, {
      name: 'Updated website',
    });
  });

  it('deletes an existing project', async () => {
    projectService.deleteProject.mockResolvedValue(undefined);

    const response = await request(app).delete('/api/projects/1');

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
    expect(projectService.deleteProject).toHaveBeenCalledWith(1);
  });

  it.each([
    [{}, 'Project name is required'],
    [
      { name: '   ' },
      'Project name must be a non-empty string with a maximum length of 150 characters',
    ],
    [{ name: 'Valid name', unexpected: true }, 'Unsupported project field(s): unexpected'],
  ])('rejects invalid create payload %j', async (payload, message) => {
    const response = await request(app).post('/api/projects').send(payload);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: message });
    expect(projectService.createProject).not.toHaveBeenCalled();
  });

  it.each(['/api/projects/0', '/api/projects/not-a-number'])(
    'rejects invalid project id %s',
    async (url) => {
      const response = await request(app).get(url);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'projectId must be a positive integer' });
      expect(projectService.getProject).not.toHaveBeenCalled();
    },
  );

  it('rejects an empty update payload', async () => {
    const response = await request(app).patch('/api/projects/1').send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'At least one project field is required' });
    expect(projectService.updateProject).not.toHaveBeenCalled();
  });

  it('returns 404 when the service cannot find a project', async () => {
    projectService.getProject.mockRejectedValue(new AppError('Project not found', 404));

    const response = await request(app).get('/api/projects/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Project not found' });
  });
});
