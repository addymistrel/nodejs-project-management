import type { Request, Response } from 'express';
import { createProject, deleteProject, getProject, updateProject } from '#/services';

function getProjectId(req: Request): number {
  return Number(req.params.projectId);
}

async function createProjectController(req: Request, res: Response): Promise<void> {
  const project = await createProject(req.body);

  res.status(201).json(project);
}

async function getProjectController(req: Request, res: Response): Promise<void> {
  const projectId = getProjectId(req);
  const project = await getProject(projectId);

  res.status(200).json(project);
}

async function updateProjectController(req: Request, res: Response): Promise<void> {
  const projectId = getProjectId(req);
  const project = await updateProject(projectId, req.body);

  res.status(200).json(project);
}

async function deleteProjectController(req: Request, res: Response): Promise<void> {
  const projectId = getProjectId(req);

  await deleteProject(projectId);

  res.status(204).send();
}

export {
  createProjectController,
  deleteProjectController,
  getProjectController,
  updateProjectController,
};
