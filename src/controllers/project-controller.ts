import type { Request, Response } from 'express';
import { createProject, deleteProject, getProject, updateProject } from '#/services';

function getProjectId(request: Request): number {
  return Number(request.params.projectId);
}

async function createProjectController(request: Request, response: Response): Promise<void> {
  const project = await createProject(request.body);

  response.status(201).json(project);
}

async function getProjectController(request: Request, response: Response): Promise<void> {
  const projectId = getProjectId(request);
  const project = await getProject(projectId);

  response.status(200).json(project);
}

async function updateProjectController(request: Request, response: Response): Promise<void> {
  const projectId = getProjectId(request);
  const project = await updateProject(projectId, request.body);

  response.status(200).json(project);
}

async function deleteProjectController(request: Request, response: Response): Promise<void> {
  const projectId = getProjectId(request);

  await deleteProject(projectId);

  response.status(204).send();
}

export {
  createProjectController,
  deleteProjectController,
  getProjectController,
  updateProjectController,
};
