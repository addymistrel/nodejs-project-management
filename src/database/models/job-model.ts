import { DataTypes, Model } from 'sequelize';
import {
  JOB_SCHEMA_CONST,
  JOB_STATUS_VALUES,
  JOB_STATUSES,
  JOB_TYPE_VALUES,
  JOB_TYPES,
} from '#/constants';
import { databaseClient } from '#/database';
import type { JobStatus, JobType } from '#/types';

interface JobAttributes {
  id: number;
  projectId: number;
  type: JobType;
  status: JobStatus;
  progress: number;
  outputFileId: number | null;
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

class JobModel extends Model implements JobAttributes {
  declare id: number;
  declare projectId: number;
  declare type: JobType;
  declare status: JobStatus;
  declare progress: number;
  declare outputFileId: number | null;
  declare errorMessage: string | null;
  declare startedAt: Date | null;
  declare completedAt: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

JobModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: JOB_SCHEMA_CONST.FIELDS.PROJECT_ID,
    },
    type: {
      type: DataTypes.ENUM(...JOB_TYPE_VALUES),
      allowNull: false,
      defaultValue: JOB_TYPES.ZIP_COMPRESSION,
    },
    status: {
      type: DataTypes.ENUM(...JOB_STATUS_VALUES),
      allowNull: false,
      defaultValue: JOB_STATUSES.PENDING,
    },
    progress: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    outputFileId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: JOB_SCHEMA_CONST.FIELDS.OUTPUT_FILE_ID,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: JOB_SCHEMA_CONST.FIELDS.ERROR_MESSAGE,
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: JOB_SCHEMA_CONST.FIELDS.STARTED_AT,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: JOB_SCHEMA_CONST.FIELDS.COMPLETED_AT,
    },
  },
  {
    sequelize: databaseClient,
    tableName: JOB_SCHEMA_CONST.TABLE_NAME,
    modelName: JOB_SCHEMA_CONST.MODEL_NAME,
    underscored: true,
    timestamps: true,
    indexes: [
      {
        name: JOB_SCHEMA_CONST.INDEXES.PROJECT_ID,
        fields: [JOB_SCHEMA_CONST.FIELDS.PROJECT_ID],
      },
      {
        name: JOB_SCHEMA_CONST.INDEXES.STATUS,
        fields: [JOB_SCHEMA_CONST.FIELDS.STATUS],
      },
      {
        name: JOB_SCHEMA_CONST.INDEXES.PROJECT_STATUS,
        fields: [JOB_SCHEMA_CONST.FIELDS.PROJECT_ID, JOB_SCHEMA_CONST.FIELDS.STATUS],
      },
    ],
  },
);

export { JobModel };
export type { JobAttributes };
