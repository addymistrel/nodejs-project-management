import { FileModel, JobModel, ProjectModel } from '#/database';
import { CreateProjectRequest, UpdateProjectRequest } from '#/types';

interface ProjectDetails {
  project: ProjectModel;
  filesCount: number;
  jobsCount: number;
}

async function createProjectRecord(projectData: CreateProjectRequest): Promise<ProjectModel> {
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

async function updateProjectRecord(
  project: ProjectModel,
  projectData: UpdateProjectRequest,
): Promise<ProjectModel> {
  await project.update(projectData);
  return project;
}

async function deleteProjectRecord(project: ProjectModel): Promise<void> {
  await project.destroy();
}

export {
  createProjectRecord,
  updateProjectRecord,
  deleteProjectRecord,
  findProjectById,
  findProjectDetailsById,
};
