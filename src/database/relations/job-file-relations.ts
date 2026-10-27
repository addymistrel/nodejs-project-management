import { FILE_SCHEMA_CONST } from '#/constants/file-constants.js';
import { JOB_SCHEMA_CONST } from '#/constants/job-constants.js';
import { FileModel } from '#/database/models/file-model.js';
import { JobModel } from '#/database/models/job-model.js';

export function initializeJobFileRelations(): void {
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
