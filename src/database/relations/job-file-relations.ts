import { FILE_SCHEMA_CONST, JOB_SCHEMA_CONST } from '#/constants';
import { FileModel, JobModel } from '#/database';

function initializeJobFileRelations(): void {
  JobModel.belongsTo(FileModel, {
    foreignKey: JOB_SCHEMA_CONST.ATTRIBUTES.OUTPUT_FILE_ID,
    as: JOB_SCHEMA_CONST.RELATIONS.OUTPUT_FILE,
    onDelete: 'SET NULL',
  });

  FileModel.hasMany(JobModel, {
    foreignKey: FILE_SCHEMA_CONST.ATTRIBUTES.OUTPUT_FILE_ID,
    as: FILE_SCHEMA_CONST.RELATIONS.OUTPUT_JOBS,
  });
}

export { initializeJobFileRelations };
