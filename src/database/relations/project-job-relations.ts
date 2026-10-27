import { JOB_SCHEMA_CONST } from '#/constants/job-constants.js';
import { PROJECT_SCHEMA_CONST } from '#/constants/project-constants.js';
import { JobModel } from '#/database/models/job-model.js';
import { ProjectModel } from '#/database/models/project-model.js';

export function initializeProjectJobRelations(): void {
  ProjectModel.hasMany(JobModel, {
    foreignKey: JOB_SCHEMA_CONST.ATTRIBUTES.PROJECT_ID,
    as: PROJECT_SCHEMA_CONST.RELATIONS.JOBS,
    onDelete: 'CASCADE',
    hooks: true,
  });

  JobModel.belongsTo(ProjectModel, {
    foreignKey: JOB_SCHEMA_CONST.ATTRIBUTES.PROJECT_ID,
    as: JOB_SCHEMA_CONST.RELATIONS.PROJECT,
  });
}
