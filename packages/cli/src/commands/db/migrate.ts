import { Command } from "commander";
import { handleCommandError } from "../../utils/errors";
import { DatabaseMigrationService } from "../../services/db/migrate";
import { getCommandContextWithEnv } from "../../utils/context";
import { userInput } from "../../utils/user-input";
import { logger } from "../../utils/logger";
import { selectEnvironment } from "../../utils/environment";

/**
 * @param program - The parent Command object
 */
export function dbMigrateCommands(program: Command): void {
  const migrate = program
    .command("migrate")
    .summary("Database migration management")
    .description(
      "Create, apply, and roll back database migrations.\n\n" +
      "Use `new` to scaffold a blank migration file, `generate` to produce " +
      "migration SQL from your Prisma schema and RLS policies, `push` to " +
      "apply pending migrations to the database, `reset` to drop and " +
      "re-apply everything, and `down` to roll back applied migrations.",
    );

  const service = new DatabaseMigrationService();

  migrate
    .command("new")
    .summary("Create a new database migration")
    .description(
      "Create a blank migration file with a timestamp prefix.\n\n" +
      "Use this when you need to write custom SQL that doesn't come from " +
      "the Prisma schema diff — for example, data backfills, extensions, " +
      "or manual DDL.\n\n" +
      "Before: ensure the migrations directory exists (or use `--dir`).\n" +
      "After: edit the generated file with your SQL statements.",
    )
    .option(
      "-d, --dir <directory>",
      "Directory to create migration file in",
      "omnibase/db/migrations",
    )
    .option("-n, --name <name>", "Migration name (will prompt if not provided)")
    .action(async (options) => {
      try {
        await service.new(options.dir, options.name);
      } catch (error) {
        await handleCommandError(error);
      }
    });

  migrate
    .command("push")
    .summary("Apply pending migrations to the database")
    .description(
      "Apply any pending migration files to the connected database.\n\n" +
      "Run this after creating or generating migration files to apply them " +
      "to your database. Uses the API endpoint for the selected environment.\n\n" +
      "Before: ensure migration files exist in the migrations directory.\n" +
      "After: the database schema is updated to match the applied migrations.",
    )
    .option(
      "-d, --dir <directory>",
      "Directory containing migration files",
      "omnibase/db/migrations",
    )
    .action(async (options) => {
      try {
        const ctx = await getCommandContextWithEnv(program);

        await service.push(options.dir, ctx.env);
      } catch (error) {
        await handleCommandError(error);
      }
    });

  migrate
    .command("reset")
    .summary("Drop all tables and re-apply all migrations (destructive)")
    .description(
      "Completely reset the database by dropping all tables and re-applying " +
      "every migration from scratch.\n\n" +
      "Use this during local development when you want a clean database state. " +
      "This is **destructive** — all data will be lost.\n\n" +
      "Before: ensure the database connection is configured and migrations exist.\n" +
      "After: the database is recreated with all migrations applied.\n\n" +
      "The command will prompt for confirmation unless `--yes` is provided.",
    )
    .option(
      "-d, --dir <directory>",
      "Directory containing migration files",
      "omnibase/db/migrations",
    )
    .option("-y, --yes", "Skip confirmation prompt")
    .action(async (options) => {
      const env = await selectEnvironment("local");

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
          return;
        }
      }

      await service.reset(options.dir, env);
    });

  migrate
    .command("generate")
    .summary("Generate migration files from Prisma schema + RLS policies")
    .description(
      "Generate migration SQL by diffing the Prisma schema against the " +
      "applied migration history, then appending RLS policy changes.\n\n" +
      "Use this as the primary way to create schema migrations. It uses a " +
      "shadow database to replay the migration history and produce " +
      "deterministic up/down diffs. RLS policies from `omnibase/db/policies/` " +
      "are appended to the migration.\n\n" +
      "Before: ensure your Prisma schema is up to date and a PostgreSQL " +
      "instance is available for the shadow database.\n" +
      "After: migration files are created in the migrations directory. " +
      "Run `push` to apply them.",
    )
    .option(
      "--db-url <url>",
      "Database URL (defaults to postgresql://postgres:postgres@localhost:5432)",
    )
    .option(
      "-d, --dir <directory>",
      "Directory containing migration files",
      "omnibase/db/migrations",
    )
    .option(
      "-s, --schema-dir <director>",
      "Directory containing prisma schema file",
      "omnibase/db/schema",
    )
    .option(
      "-p, --policy-dir <directory>",
      "Directory containing Omnibase policy definitions",
      "omnibase/db/policies",
    )
    .option("-n, --name <name>", "Migration name")
    .action(async (options) => {
      let name = options.name;
      if (!name) name = await userInput("Migration name:");

      logger.start("Generating migrations...");
      await service.generate(
        options.dir,
        name,
        options.schemaDir,
        options.policyDir,
        options.dbUrl,
      );
    });

  migrate
    .command("down")
    .summary("Roll back one or more applied migrations")
    .description(
      "Roll back the most recent migration(s) by applying their down.sql files " +
      "in reverse order.\n\n" +
      "Use this to undo recently applied migrations during development. " +
      "You can specify the number of steps or a target migration name.\n\n" +
      "Before: ensure the API is running and the environment is configured.\n" +
      "After: the specified migrations are rolled back from the database.",
    )
    .option("-d, --dir <directory>", "Migrations directory", "omnibase/db/migrations")
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
      await service.down(options.dir, ctx.env);
    });
}
