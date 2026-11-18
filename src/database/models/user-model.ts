import { DataTypes, Model } from 'sequelize';
import { databaseClient } from '#/database';
import { USER_SCHEMA_CONST } from '#/constants';

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

class UserModel extends Model implements UserAttributes {
  declare id: number;
  declare name: string;
  declare email: string;
  declare passwordHash: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

UserModel.init(
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
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize: databaseClient,
    tableName: USER_SCHEMA_CONST.TABLE_NAME,
    modelName: USER_SCHEMA_CONST.MODEL_NAME,
    underscored: true,
    timestamps: true,
  },
);

export { UserModel };
export type { UserAttributes };
