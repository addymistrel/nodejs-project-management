import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not configured');
}

export const databaseConfig = {
  url: databaseUrl,
  logging: NODE_ENV === 'development' ? console.log : false,
};
