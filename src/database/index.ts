import { connectToDatabase, databaseClient } from '#/database/database-client.js';
import { initializeModelRelations } from '#/database/model-relations.js';
import { FileModel } from '#/database/models/file-model.js';
import { JobModel } from '#/database/models/job-model.js';
import { ProjectModel } from '#/database/models/project-model.js';
import type { FileAttributes } from '#/database/models/file-model.js';
import type { JobAttributes } from '#/database/models/job-model.js';
import type { ProjectAttributes } from '#/database/models/project-model.js';
import { initializeJobFileRelations } from '#/database/relations/job-file-relations.js';
import { initializeProjectFileRelations } from '#/database/relations/project-file-relations.js';
import { initializeProjectJobRelations } from '#/database/relations/project-job-relations.js';

export {
  databaseClient,
  connectToDatabase,
  initializeModelRelations,
  FileModel,
  JobModel,
  ProjectModel,
  initializeJobFileRelations,
  initializeProjectFileRelations,
  initializeProjectJobRelations,
};
export type { FileAttributes, JobAttributes, ProjectAttributes };
