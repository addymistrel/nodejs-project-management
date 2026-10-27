import path from 'path';
import { fileURLToPath } from 'url';
import { SequelizeStorage, Umzug } from 'umzug';
import { databaseClient } from '#/database/database-client';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationGlob = path.join(currentDirectory, 'migrations/*.ts').replaceAll('\\', '/');

const migrationRunner = new Umzug({
  migrations: {
    glob: migrationGlob,
  },
  context: databaseClient.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize: databaseClient }),
  logger: console,
});

async function runMigrationCommand(command: string): Promise<void> {
  if (command === 'up') {
    await migrationRunner.up();
    return;
  }

  if (command === 'down') {
    await migrationRunner.down();
    return;
  }

  if (command === 'down:all') {
    await migrationRunner.down({ to: 0 });
    return;
  }

  throw new Error(`Unknown migration command: ${command}`);
}

const command = process.argv[2] ?? 'up';

runMigrationCommand(command)
  .catch((error: unknown) => {
    console.error('Migration command failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await databaseClient.close();
  });
