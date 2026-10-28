import { FileModel, JobModel, ProjectModel } from '#/database';
import { CreateProjectRequest, UpdateProjectRequest } from '#/types';

interface ProjectDetails {
  project: ProjectModel;
  filesCount: number;
  jobsCount: number;
}

async function createProject(projectData: CreateProjectRequest): Promise<ProjectModel> {
  return ProjectModel.create({
    name: projectData.name,
    description: projectData.description,
  });
}

async function findProjectById(projectId: number): Promise<ProjectModel | null> {
  return ProjectModel.findByPk(projectId);
}

async function findProjectDetailsById(projectId: number): Promise<ProjectDetails | null> {
  const project = await findProjectById(projectId);

  if (!project) {
    return null;
  }

  const [filesCount, jobsCount] = await Promise.all([
    FileModel.count({
      where: {
        projectId,
      },
    }),
    JobModel.count({
      where: {
        projectId,
      },
    }),
  ]);

  return {
    project,
    filesCount,
    jobsCount,
  };
}

async function updateProject(
  project: ProjectModel,
  projectData: UpdateProjectRequest,
): Promise<ProjectModel> {
  await project.update(projectData);
  return project;
}

async function deleteProject(project: ProjectModel): Promise<void> {
  await project.destroy();
}

export { createProject, updateProject, deleteProject, findProjectById, findProjectDetailsById };
