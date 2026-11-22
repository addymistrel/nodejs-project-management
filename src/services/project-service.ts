import { ProjectAttributes } from '#/database';
import * as repositoryFunctions from '#/repositories';
import type {
  CreateProjectRequest,
  ProjectDetailsResponse,
  ProjectResponse,
  PaginatedResponse,
  UpdateProjectRequest,
} from '#/types';
import { ProjectNotFoundException, logger, resolveStoragePath } from '#/utils';
import { BaseService } from '#/services/base-service.js';
import { rename, unlink } from 'fs/promises';

interface ProjectRepository {
  create: typeof repositoryFunctions.createProjectRecord;
  findById: typeof repositoryFunctions.findProjectById;
  findDetailsById: typeof repositoryFunctions.findProjectDetailsById;
  findMany: typeof repositoryFunctions.findProjects;
  findProjectFiles?: typeof repositoryFunctions.findProjectFiles;
  update: typeof repositoryFunctions.updateProjectRecord;
  delete: typeof repositoryFunctions.deleteProjectRecord;
}

const defaultProjectRepository: ProjectRepository = {
  create: (...args) => repositoryFunctions.createProjectRecord(...args),
  findById: (...args) => repositoryFunctions.findProjectById(...args),
  findDetailsById: (...args) => repositoryFunctions.findProjectDetailsById(...args),
  findMany: (...args) => repositoryFunctions.findProjects(...args),
  findProjectFiles: (...args) => repositoryFunctions.findProjectFiles(...args),
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

  async listProjects(
    limit: number,
    pageNumber: number,
  ): Promise<PaginatedResponse<ProjectResponse>> {
    const offset = (pageNumber - 1) * limit;
    const result = await this.repository.findMany(limit, offset);
    return {
      items: result.rows.map(toProjectResponse),
      total: result.count,
      limit,
      pageNumber,
    };
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

    const quarantinedFiles = await this.quarantineProjectFiles(projectId);

    try {
      await this.repository.delete(project);
    } catch (error: unknown) {
      await this.restoreQuarantinedFiles(quarantinedFiles);
      throw error;
    }

    await this.removeQuarantinedFiles(quarantinedFiles);

    logger.info('Project deleted', {
      functionName: 'ProjectService.deleteProject',
      event: 'project.delete.completed',
      projectId,
    });
  }

  private async quarantineProjectFiles(
    projectId: number,
  ): Promise<Array<{ originalPath: string; quarantinePath: string }>> {
    const files = this.repository.findProjectFiles
      ? await this.repository.findProjectFiles(projectId)
      : [];
    const quarantinedFiles: Array<{ originalPath: string; quarantinePath: string }> = [];

    for (const file of files) {
      const originalPath = resolveStoragePath(file.storagePath);
      const quarantinePath = `${originalPath}.deleting-project-${projectId}-${process.pid}-${Date.now()}`;
      try {
        await rename(originalPath, quarantinePath);
        quarantinedFiles.push({ originalPath, quarantinePath });
      } catch (error: unknown) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          await this.restoreQuarantinedFiles(quarantinedFiles);
          throw error;
        }
      }
    }

    return quarantinedFiles;
  }

  private async removeQuarantinedFiles(
    quarantinedFiles: Array<{ originalPath: string; quarantinePath: string }>,
  ): Promise<void> {
    await Promise.all(
      quarantinedFiles.map(({ quarantinePath }) =>
        unlink(quarantinePath).catch((error: NodeJS.ErrnoException) =>
          error.code === 'ENOENT' ? undefined : Promise.reject(error),
        ),
      ),
    );
  }

  private async restoreQuarantinedFiles(
    quarantinedFiles: Array<{ originalPath: string; quarantinePath: string }>,
  ): Promise<void> {
    await Promise.all(
      quarantinedFiles.map(({ originalPath, quarantinePath }) =>
        rename(quarantinePath, originalPath).catch(() => undefined),
      ),
    );
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
const listProjects = projectService.listProjects.bind(projectService);
const updateProject = projectService.updateProject.bind(projectService);

export { ProjectService, createProject, deleteProject, getProject, listProjects, updateProject };
export type { ProjectRepository };
