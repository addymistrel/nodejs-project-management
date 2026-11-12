import { ProjectAttributes } from '#/database';
import * as repositoryFunctions from '#/repositories';
import type {
  CreateProjectRequest,
  ProjectDetailsResponse,
  ProjectResponse,
  UpdateProjectRequest,
} from '#/types';
import { ProjectNotFoundException, logger } from '#/utils';
import { BaseService } from '#/services/base-service.js';

interface ProjectRepository {
  create: typeof repositoryFunctions.createProjectRecord;
  findById: typeof repositoryFunctions.findProjectById;
  findDetailsById: typeof repositoryFunctions.findProjectDetailsById;
  update: typeof repositoryFunctions.updateProjectRecord;
  delete: typeof repositoryFunctions.deleteProjectRecord;
}

const defaultProjectRepository: ProjectRepository = {
  create: (...args) => repositoryFunctions.createProjectRecord(...args),
  findById: (...args) => repositoryFunctions.findProjectById(...args),
  findDetailsById: (...args) => repositoryFunctions.findProjectDetailsById(...args),
  update: (...args) => repositoryFunctions.updateProjectRecord(...args),
  delete: (...args) => repositoryFunctions.deleteProjectRecord(...args),
};

class ProjectService extends BaseService<ProjectRepository> {
  constructor(repository: ProjectRepository) {
    super(repository);
  }

  async createProject(projectData: CreateProjectRequest): Promise<ProjectResponse> {
    const project = await this.repository.create(projectData);
    logger.info('Project created', {
      functionName: 'ProjectService.createProject',
      event: 'project.create.completed',
      projectId: project.id,
    });
    return toProjectResponse(project);
  }

  async getProject(projectId: number): Promise<ProjectDetailsResponse> {
    const projectDetails = await this.repository.findDetailsById(projectId);

    if (!projectDetails) {
      throw new ProjectNotFoundException();
    }

    logger.info('Project details retrieved', {
      functionName: 'ProjectService.getProject',
      event: 'project.get.completed',
      projectId,
    });

    return {
      ...toProjectResponse(projectDetails.project),
      filesCount: projectDetails.filesCount,
      jobsCount: projectDetails.jobsCount,
    };
  }

  async updateProject(
    projectId: number,
    projectData: UpdateProjectRequest,
  ): Promise<ProjectResponse> {
    const project = await this.repository.findById(projectId);

    if (!project) {
      throw new ProjectNotFoundException();
    }

    const updatedProject = await this.repository.update(project, projectData);
    logger.info('Project updated', {
      functionName: 'ProjectService.updateProject',
      event: 'project.update.completed',
      projectId,
    });
    return toProjectResponse(updatedProject);
  }

  async deleteProject(projectId: number): Promise<void> {
    const project = await this.repository.findById(projectId);

    if (!project) {
      throw new ProjectNotFoundException();
    }

    await this.repository.delete(project);
    logger.info('Project deleted', {
      functionName: 'ProjectService.deleteProject',
      event: 'project.delete.completed',
      projectId,
    });
  }
}

function toProjectResponse(project: ProjectAttributes): ProjectResponse {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

const projectService = new ProjectService(defaultProjectRepository);

const createProject = projectService.createProject.bind(projectService);
const deleteProject = projectService.deleteProject.bind(projectService);
const getProject = projectService.getProject.bind(projectService);
const updateProject = projectService.updateProject.bind(projectService);

export { ProjectService, createProject, deleteProject, getProject, updateProject };
export type { ProjectRepository };
