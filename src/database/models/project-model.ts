import { DataTypes, Model } from 'sequelize';

import { databaseClient } from '#/database/database-client.js';
import { PROJECT_SCHEMA_CONST } from '#/constants/project-constants';

export class ProjectModel extends Model {
  declare id: number;
  declare name: string;
  declare description: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

ProjectModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 150],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: databaseClient,
    tableName: PROJECT_SCHEMA_CONST.TABLE_NAME,
    modelName: PROJECT_SCHEMA_CONST.MODEL_NAME,
    underscored: true,
    timestamps: true,
  },
);
