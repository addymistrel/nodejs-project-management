import type { QueryInterface } from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import {
  FILE_SCHEMA_CONST,
  PROJECT_SCHEMA_CONST,
  JOB_SCHEMA_CONST,
  JOB_STATUS_VALUES,
  JOB_STATUSES,
  JOB_TYPE_VALUES,
  JOB_TYPES,
} from '#/constants';

async function up({ context: queryInterface }: { context: QueryInterface }): Promise<void> {
  await queryInterface.createTable(JOB_SCHEMA_CONST.TABLE_NAME, {
    [JOB_SCHEMA_CONST.FIELDS.ID]: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    [JOB_SCHEMA_CONST.FIELDS.PROJECT_ID]: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: PROJECT_SCHEMA_CONST.TABLE_NAME,
        key: PROJECT_SCHEMA_CONST.FIELDS.ID,
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    [JOB_SCHEMA_CONST.FIELDS.TYPE]: {
      type: DataTypes.ENUM(...JOB_TYPE_VALUES),
      allowNull: false,
      defaultValue: JOB_TYPES.ZIP_COMPRESSION,
    },
    [JOB_SCHEMA_CONST.FIELDS.STATUS]: {
      type: DataTypes.ENUM(...JOB_STATUS_VALUES),
      allowNull: false,
      defaultValue: JOB_STATUSES.PENDING,
    },
    [JOB_SCHEMA_CONST.FIELDS.PROGRESS]: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    [JOB_SCHEMA_CONST.FIELDS.OUTPUT_FILE_ID]: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: FILE_SCHEMA_CONST.TABLE_NAME,
        key: FILE_SCHEMA_CONST.FIELDS.ID,
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    [JOB_SCHEMA_CONST.FIELDS.ERROR_MESSAGE]: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    [JOB_SCHEMA_CONST.FIELDS.STARTED_AT]: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    [JOB_SCHEMA_CONST.FIELDS.COMPLETED_AT]: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    [JOB_SCHEMA_CONST.FIELDS.CREATED_AT]: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    },
    [JOB_SCHEMA_CONST.FIELDS.UPDATED_AT]: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    },
  });

  await queryInterface.addIndex(JOB_SCHEMA_CONST.TABLE_NAME, [JOB_SCHEMA_CONST.FIELDS.PROJECT_ID], {
    name: JOB_SCHEMA_CONST.INDEXES.PROJECT_ID,
  });
  await queryInterface.addIndex(JOB_SCHEMA_CONST.TABLE_NAME, [JOB_SCHEMA_CONST.FIELDS.STATUS], {
    name: JOB_SCHEMA_CONST.INDEXES.STATUS,
  });
  await queryInterface.addIndex(
    JOB_SCHEMA_CONST.TABLE_NAME,
    [JOB_SCHEMA_CONST.FIELDS.PROJECT_ID, JOB_SCHEMA_CONST.FIELDS.STATUS],
    { name: JOB_SCHEMA_CONST.INDEXES.PROJECT_STATUS },
  );
}

async function down({ context: queryInterface }: { context: QueryInterface }): Promise<void> {
  await queryInterface.dropTable(JOB_SCHEMA_CONST.TABLE_NAME);
}

export default { up, down };
