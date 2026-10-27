import { Sequelize } from 'sequelize';
import { databaseConfig } from '#/config/database-config';

const databaseClient = new Sequelize(databaseConfig.url, {
  dialect: 'postgres',
  logging: databaseConfig.logging,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

async function connectToDatabase(): Promise<void> {
  try {
    await databaseClient.authenticate();
    console.log('Database Connected Successfully');
  } catch (err) {
    console.log('Unable to connect to the database', err);
    throw err;
  }
}

export { databaseClient, connectToDatabase };
