import { databaseClient, FileModel, ProjectModel } from '#/database';
import { FILE_SCHEMA_CONST, JOB_SCHEMA_CONST, PROJECT_SCHEMA_CONST } from '#/constants';
import { CreateProjectRequest, UpdateProjectRequest } from '#/types';
import { QueryTypes } from 'sequelize';

interface ProjectDetails {
  project: ProjectModel;
  filesCount: number;
  jobsCount: number;
}

interface ProjectDetailsRow {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  filesCount: number | string;
  jobsCount: number | string;
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
  const [row] = await databaseClient.query<ProjectDetailsRow>(
    `SELECT p.id, p.name, p.description, p.created_at AS "createdAt", p.updated_at AS "updatedAt",
      (SELECT COUNT(*) FROM "${FILE_SCHEMA_CONST.TABLE_NAME}" f WHERE f.project_id = p.id) AS "filesCount",
      (SELECT COUNT(*) FROM "${JOB_SCHEMA_CONST.TABLE_NAME}" j WHERE j.project_id = p.id) AS "jobsCount"
     FROM "${PROJECT_SCHEMA_CONST.TABLE_NAME}" p
     WHERE p.id = :projectId
     LIMIT 1`,
    {
      replacements: { projectId },
      type: QueryTypes.SELECT,
    },
  );

  if (!row) {
    return null;
  }

  const project = toProjectModel(row);
  return {
    project,
    filesCount: Number(row.filesCount),
    jobsCount: Number(row.jobsCount),
  };
}

function toProjectModel(row: ProjectDetailsRow): ProjectModel {
  return ProjectModel.build(
    {
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    },
    { isNewRecord: false },
  );
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
