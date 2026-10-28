import { ProjectAttributes } from '#/database';
import {
  createProjectRecord,
  deleteProjectRecord,
  findProjectById,
  findProjectDetailsById,
  updateProjectRecord,
} from '#/repositories';
import {
  CreateProjectRequest,
  ProjectDetailsResponse,
  ProjectResponse,
  UpdateProjectRequest,
} from '#/types';
import { AppError } from '#/utils';

function toProjectResponse(project: ProjectAttributes): ProjectResponse {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

async function createProject(projectData: CreateProjectRequest): Promise<ProjectResponse> {
  const project = await createProjectRecord(projectData);

  return toProjectResponse(project);
}

async function getProject(projectId: number): Promise<ProjectDetailsResponse> {
  const projectDetails = await findProjectDetailsById(projectId);

  if (!projectDetails) {
    throw new AppError('Project not found', 404);
  }

  return {
    ...toProjectResponse(projectDetails.project),
    filesCount: projectDetails.filesCount,
    jobsCount: projectDetails.jobsCount,
  };
}

async function updateProject(
  projectId: number,
  projectData: UpdateProjectRequest,
): Promise<ProjectResponse> {
  const project = await findProjectById(projectId);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const updatedProject = await updateProjectRecord(project, projectData);

  return toProjectResponse(updatedProject);
}

async function deleteProject(projectId: number): Promise<void> {
  const project = await findProjectById(projectId);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  await deleteProjectRecord(project);
}

export { createProject, deleteProject, getProject, updateProject };
