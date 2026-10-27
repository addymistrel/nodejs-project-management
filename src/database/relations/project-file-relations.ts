import { FILE_SCHEMA_CONST, PROJECT_SCHEMA_CONST } from '#/constants';
import { FileModel, ProjectModel } from '#/database/models';

function initializeProjectFileRelations(): void {
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

export { initializeProjectFileRelations };
