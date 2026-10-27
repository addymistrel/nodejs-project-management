import { FILE_SCHEMA_CONST, PROJECT_SCHEMA_CONST } from '#/constants';
import type { QueryInterface } from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';

async function up({ context: queryInterface }: { context: QueryInterface }): Promise<void> {
  await queryInterface.createTable(FILE_SCHEMA_CONST.TABLE_NAME, {
    [FILE_SCHEMA_CONST.FIELDS.ID]: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    [FILE_SCHEMA_CONST.FIELDS.PROJECT_ID]: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: PROJECT_SCHEMA_CONST.TABLE_NAME,
        key: PROJECT_SCHEMA_CONST.FIELDS.ID,
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    [FILE_SCHEMA_CONST.FIELDS.NAME]: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    [FILE_SCHEMA_CONST.FIELDS.STORAGE_PATH]: {
      type: DataTypes.STRING(1_000),
      allowNull: false,
    },
    [FILE_SCHEMA_CONST.FIELDS.SIZE]: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    [FILE_SCHEMA_CONST.FIELDS.MIME_TYPE]: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    [FILE_SCHEMA_CONST.FIELDS.CHECKSUM]: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
    [FILE_SCHEMA_CONST.FIELDS.IS_OUTPUT]: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    [FILE_SCHEMA_CONST.FIELDS.CREATED_AT]: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    },
    [FILE_SCHEMA_CONST.FIELDS.UPDATED_AT]: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    },
  });

  await queryInterface.addIndex(
    FILE_SCHEMA_CONST.TABLE_NAME,
    [FILE_SCHEMA_CONST.FIELDS.PROJECT_ID],
    {
      name: FILE_SCHEMA_CONST.INDEXES.PROJECT_ID,
    },
  );
}

async function down({ context: queryInterface }: { context: QueryInterface }): Promise<void> {
  await queryInterface.dropTable(FILE_SCHEMA_CONST.TABLE_NAME);
}

export default { up, down };
