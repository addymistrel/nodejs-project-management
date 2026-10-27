import { FILE_SCHEMA_CONST } from '#/constants/file-constants.js';
import { PROJECT_SCHEMA_CONST } from '#/constants/project-constants.js';
import { FileModel } from '#/database/models/file-model.js';
import { ProjectModel } from '#/database/models/project-model.js';

export function initializeProjectFileRelations(): void {
  ProjectModel.hasMany(FileModel, {
    foreignKey: FILE_SCHEMA_CONST.ATTRIBUTES.PROJECT_ID,
    as: PROJECT_SCHEMA_CONST.RELATIONS.FILES,
    onDelete: 'CASCADE',
    hooks: true,
  });

  FileModel.belongsTo(ProjectModel, {
    foreignKey: FILE_SCHEMA_CONST.ATTRIBUTES.PROJECT_ID,
    as: FILE_SCHEMA_CONST.RELATIONS.PROJECT,
  });
}
