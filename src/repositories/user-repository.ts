import { UserModel } from '#/database';

async function createUserRecord(
  name: string,
  email: string,
  passwordHash: string,
): Promise<UserModel> {
  return UserModel.create({ name, email, passwordHash });
}

async function findUserByEmail(email: string): Promise<UserModel | null> {
  return UserModel.findOne({ where: { email } });
}

async function findUserById(userId: number): Promise<UserModel | null> {
  return UserModel.findByPk(userId);
}

export { createUserRecord, findUserByEmail, findUserById };
