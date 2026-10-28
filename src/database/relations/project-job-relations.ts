import { JOB_SCHEMA_CONST, PROJECT_SCHEMA_CONST } from '#/constants';
import { JobModel, ProjectModel } from '#/database';

function initializeProjectJobRelations(): void {
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

export { initializeProjectJobRelations };
