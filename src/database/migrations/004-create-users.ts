import type { QueryInterface } from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import { USER_SCHEMA_CONST } from '#/constants';

const USER_TABLE_DEFINITION = {
  [USER_SCHEMA_CONST.FIELDS.ID]: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  [USER_SCHEMA_CONST.FIELDS.NAME]: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  [USER_SCHEMA_CONST.FIELDS.EMAIL]: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  [USER_SCHEMA_CONST.FIELDS.PASSWORD_HASH]: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  [USER_SCHEMA_CONST.FIELDS.CREATED_AT]: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn('NOW'),
  },
  [USER_SCHEMA_CONST.FIELDS.UPDATED_AT]: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn('NOW'),
  },
};

async function up({ context: queryInterface }: { context: QueryInterface }): Promise<void> {
  await queryInterface.createTable(USER_SCHEMA_CONST.TABLE_NAME, USER_TABLE_DEFINITION);
  await queryInterface.addIndex(USER_SCHEMA_CONST.TABLE_NAME, ['email'], {
    unique: true,
    name: 'users_email_unique',
  });
}

async function down({ context: queryInterface }: { context: QueryInterface }): Promise<void> {
  await queryInterface.dropTable(USER_SCHEMA_CONST.TABLE_NAME);
}

export default { up, down };
