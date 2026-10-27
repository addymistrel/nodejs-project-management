import type { QueryInterface } from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import { PROJECT_SCHEMA_CONST } from '#/constants';

async function up({ context: queryInterface }: { context: QueryInterface }): Promise<void> {
  await queryInterface.createTable(PROJECT_SCHEMA_CONST.TABLE_NAME, {
    [PROJECT_SCHEMA_CONST.FIELDS.ID]: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    [PROJECT_SCHEMA_CONST.FIELDS.NAME]: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    [PROJECT_SCHEMA_CONST.FIELDS.DESCRIPTION]: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    [PROJECT_SCHEMA_CONST.FIELDS.CREATED_AT]: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    },
    [PROJECT_SCHEMA_CONST.FIELDS.UPDATED_AT]: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW'),
    },
  });
}

async function down({ context: queryInterface }: { context: QueryInterface }): Promise<void> {
  await queryInterface.dropTable(PROJECT_SCHEMA_CONST.TABLE_NAME);
}

export default { up, down };
