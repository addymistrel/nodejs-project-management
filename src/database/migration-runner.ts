import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { SequelizeStorage, Umzug, type MigrationParams, type RunnableMigration } from 'umzug';
import type { QueryInterface } from 'sequelize';
import { databaseClient } from '#/database/database-client.js';
import { logger } from '#/utils';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationGlob = path.join(currentDirectory, 'migrations/*.ts').replaceAll('\\', '/');

const migrationRunner = new Umzug({
  migrations: {
    glob: migrationGlob,
    resolve: (migration: MigrationParams<QueryInterface>): RunnableMigration<QueryInterface> => {
      if (!migration.path) {
        throw new Error(`Migration path is missing: ${migration.name}`);
      }
      const migrationPath = migration.path;

      return {
        name: migration.name,
        up: async (_params: MigrationParams<QueryInterface>): Promise<unknown> => {
          const loaded = await import(pathToFileURL(migrationPath).href);
          const migrationDefinition = loaded.default ?? loaded;
          return migrationDefinition.up({
            context: databaseClient.getQueryInterface(),
          });
        },
        down: async (_params: MigrationParams<QueryInterface>): Promise<unknown> => {
          const loaded = await import(pathToFileURL(migrationPath).href);
          const migrationDefinition = loaded.default ?? loaded;
          return migrationDefinition.down({
            context: databaseClient.getQueryInterface(),
          });
        },
      };
    },
  },
  context: databaseClient.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize: databaseClient }),
  logger,
});

async function runMigrationCommand(command: string): Promise<void> {
  if (command === 'up') {
    const target = process.argv[3];
    if (target) {
      const pendingMigrations = await migrationRunner.pending();
      if (pendingMigrations.some((migration) => migration.name === target)) {
        await migrationRunner.up({ to: target });
      }
    } else {
      await migrationRunner.up();
    }
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
    logger.error('Migration command failed', error, {
      functionName: 'runMigrationCommand',
      event: 'database.migration.failed',
      command,
    });
    process.exitCode = 1;
  })
  .finally(async () => {
    await databaseClient.close();
  });
