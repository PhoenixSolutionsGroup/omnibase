import { Command } from "commander";
import { handleCommandError } from "../../utils/errors";
import { DatabaseMigrationService } from "../../services/db/migrate";
import { getCommandContextWithEnv } from "../../utils/context";
import { userInput } from "../../utils/user-input";
import { logger } from "../../utils/logger";
import { generate } from "../../services/db/generate/generate";

/**
 * @param program - The parent Command object
 */
export function migrateCommands(program: Command): void {
  const migrate = program
    .command("migrate")
    .description("Database migration commands");

  const service = new DatabaseMigrationService();

  migrate
    .command("new")
    .description("Create a new database migration")
    .option(
      "-d, --dir <directory>",
      "Directory to create migration file in",
      "omnibase/db",
    )
    .option("-n, --name <name>", "Migration name (will prompt if not provided)")
    .action(async (options) => {
      try {
        await service.new(options.dir, options.name);
      } catch (error) {
        handleCommandError(error);
      }
    });

  migrate
    .command("push")
    .description("Push migrations from the db directory")
    .option(
      "-d, --dir <directory>",
      "Directory containing migration files",
      "omnibase/db",
    )
    .action(async (options) => {
      try {
        const { env } = await getCommandContextWithEnv(program);
        if (!env.omnibaseServiceKey) {
          throw new Error(
            "OMNIBASE_SERVICE_KEY not found in environment configuration",
          );
        }
        const { omnibaseApiUrl, omnibaseServiceKey } = env;
        await service.push(options.dir, { omnibaseApiUrl, omnibaseServiceKey });
      } catch (error) {
        handleCommandError(error);
      }
    });

  migrate
    .command("reset")
    .description(
      "Reset database: drop all tables and re-apply migrations (DESTRUCTIVE)",
    )
    .option(
      "-d, --dir <directory>",
      "Directory containing migration files",
      "omnibase/db",
    )
    .option("-y, --yes", "Skip confirmation prompt")
    .action(async (options) => {
      const { env } = await getCommandContextWithEnv(program);

      if (!env.omnibaseServiceKey) {
        throw new Error(
          "OMNIBASE_SERVICE_KEY not found in environment configuration",
        );
      }

      if (!options.yes) {
        const input = await userInput(
          "\x1b[31mWARNING: This will DROP ALL TABLES and re-apply migrations.\x1b[0m\nAll data will be lost. Are you sure? (yes/no): ",
        );
        if (input.toLocaleLowerCase() !== "yes") {
          logger.info("Reset cancelled");
        }
      }

      const { omnibaseApiUrl, omnibaseServiceKey } = env;
      await service.reset(options.dir, { omnibaseApiUrl, omnibaseServiceKey });
    });

  migrate
    .command("generate")
    .description("Generate migration SQL from Prisma schema + RLS policies")
    .option(
      "--db-url <url>",
      "Database URL (defaults to postgresql://postgres:postgres@localhost:5432)",
    )
    .option("-n, --name <name>", "Migration name")
    .action(async (options) => {
      let name = options.name;
      if (!name) name = await userInput("Migration name:");

      logger.start("Generating migrations...");
    });

  migrate
    .command("down")
    .description("Rollback a migration")
    .option("-d, --dir <directory>", "Migrations directory", "omnibase/db")
    .option(
      "-n, --name <name>",
      "Specific migration dir name to rollback to (non-interactive)",
    )
    .option(
      "--steps <number>",
      "Number of steps to rollback (non-interactive, overrides --name)",
    )
    .action(async (options) => {
      const ctx = await getCommandContextWithEnv(program);
      await service.down(options.dir);
    });
}
