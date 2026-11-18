import type { Request, Response } from 'express';
import { HTTP_STATUS_CODE } from '#/constants';
import { createProject, deleteProject, getProject, listProjects, updateProject } from '#/services';
import { AppResponse } from '#/utils';
import { getPaginationQuery } from '#/utils';

function getProjectId(req: Request): number {
  return Number(req.params.projectId);
}

async function createProjectController(req: Request, res: Response): Promise<void> {
  const project = await createProject(req.body);

  AppResponse.sendSuccess(res, HTTP_STATUS_CODE.CREATED, project);
}

async function getProjectController(req: Request, res: Response): Promise<void> {
  const projectId = getProjectId(req);
  const project = await getProject(projectId);

  AppResponse.sendSuccess(res, HTTP_STATUS_CODE.OK, project);
}

async function listProjectsController(req: Request, res: Response): Promise<void> {
  const pagination = getPaginationQuery(req);
  const projects = await listProjects(pagination.limit, pagination.pageNumber);

  AppResponse.sendSuccess(res, HTTP_STATUS_CODE.OK, projects);
}

async function updateProjectController(req: Request, res: Response): Promise<void> {
  const projectId = getProjectId(req);
  const project = await updateProject(projectId, req.body);

  AppResponse.sendSuccess(res, HTTP_STATUS_CODE.OK, project);
}

async function deleteProjectController(req: Request, res: Response): Promise<void> {
  const projectId = getProjectId(req);

  await deleteProject(projectId);

  AppResponse.sendSuccess(res, HTTP_STATUS_CODE.OK, { message: 'Project deleted successfully' });
}

export {
  createProjectController,
  deleteProjectController,
  getProjectController,
  listProjectsController,
  updateProjectController,
};
