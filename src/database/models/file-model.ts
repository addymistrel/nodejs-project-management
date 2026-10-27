import { DataTypes, Model } from 'sequelize';

import { FILE_SCHEMA_CONST } from '#/constants/file-constants.js';
import { databaseClient } from '#/database/database-client.js';

export class FileModel extends Model {
  declare id: number;
  declare projectId: number;
  declare name: string;
  declare storagePath: string;
  declare size: number;
  declare mimeType: string;
  declare checksum: string | null;
  declare isOutput: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

FileModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: FILE_SCHEMA_CONST.FIELDS.PROJECT_ID,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    storagePath: {
      type: DataTypes.STRING(1_000),
      allowNull: false,
      field: FILE_SCHEMA_CONST.FIELDS.STORAGE_PATH,
    },
    size: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    mimeType: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: FILE_SCHEMA_CONST.FIELDS.MIME_TYPE,
    },
    checksum: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
    isOutput: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: FILE_SCHEMA_CONST.FIELDS.IS_OUTPUT,
    },
  },
  {
    sequelize: databaseClient,
    tableName: FILE_SCHEMA_CONST.TABLE_NAME,
    modelName: FILE_SCHEMA_CONST.MODEL_NAME,
    underscored: true,
    timestamps: true,
    indexes: [
      {
        name: FILE_SCHEMA_CONST.INDEXES.PROJECT_ID,
        fields: [FILE_SCHEMA_CONST.FIELDS.PROJECT_ID],
      },
    ],
  },
);
