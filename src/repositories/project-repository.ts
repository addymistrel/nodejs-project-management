import { databaseClient, FileModel, JobModel, ProjectModel } from '#/database';
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

async function findProjects(
  limit: number,
  offset: number,
): Promise<{ rows: ProjectModel[]; count: number }> {
  const result = await ProjectModel.findAndCountAll({
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });
  return { rows: result.rows, count: result.count };
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
  await databaseClient.transaction(async (transaction) => {
    await project.destroy({ transaction });
  });
}

async function findProjectFiles(projectId: number): Promise<FileModel[]> {
  return FileModel.findAll({ where: { projectId } });
}

export {
  createProjectRecord,
  updateProjectRecord,
  deleteProjectRecord,
  findProjectById,
  findProjectDetailsById,
  findProjects,
  findProjectFiles,
};
