import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import AdmZip from "adm-zip";
import {
  EnvironmentConfig,
  findOmnibaseRoot,
  selectEnvironment,
} from "../../utils/environment";
import { select } from "@inquirer/prompts";
import { logger } from "../../utils/logger";
import { handleCommandError } from "../../utils/errors";
import { getCommandContextWithEnv } from "../../utils/context";
import { createOmnibaseSDKConfig } from "../../utils/api-client";
import {
  GenerateDatabaseTypesLanguageEnum,
  ResponseError,
  V1ConfigurationApi,
} from "@omnibase/core-js";

async function extractErrorMessage(error: unknown): Promise<string> {
  if (error instanceof ResponseError) {
    try {
      const body = await error.response.json();
      return (
        body.error ||
        body.message ||
        `${error.response.status} - ${error.response.statusText}`
      );
    } catch {
      return `${error.response.status} - ${error.response.statusText}`;
    }
  }
  return error instanceof Error ? error.message : "Unknown error occurred";
}

/**
 * Add database commands to the CLI
 */
export function addDbCommands(program: Command): void {
  const db = program.command("db").description("Database management commands");

  // Migration subcommands
  const migrate = db
    .command("migrate")
    .description("Database migration commands");

  migrate
    .command("new")
    .description("Create a new migration file")
    .option(
      "-d, --dir <directory>",
      "Directory to create migration file in",
      "omnibase/db",
    )
    .option("-n, --name <name>", "Migration name (will prompt if not provided)")
    .action(async (options) => {
      try {
        await createMigration(options.dir, options.name);
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
        const ctx = await getCommandContextWithEnv(program);
        logger.info(`Using environment: ${ctx.env.name}`);

        if (!ctx.env.omnibaseServiceKey) {
          throw new Error(
            "OMNIBASE_SERVICE_KEY not found in environment configuration",
          );
        }

        await applyMigrations(ctx.env, options.dir);
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
      try {
        const ctx = await getCommandContextWithEnv(program);
        logger.info(`Using environment: ${ctx.env.name}`);

        if (!ctx.env.omnibaseServiceKey) {
          throw new Error(
            "OMNIBASE_SERVICE_KEY not found in environment configuration",
          );
        }

        // Confirm with user unless --yes flag is provided
        if (!options.yes) {
          const readline = await import("readline");
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });

          const confirmed = await new Promise<boolean>((resolve) => {
            rl.question(
              "\x1b[31mWARNING: This will DROP ALL TABLES and re-apply migrations.\x1b[0m\nAll data will be lost. Are you sure? (yes/no): ",
              (answer) => {
                resolve(answer.toLowerCase() === "yes");
              },
            );
          });

          rl.close();

          if (!confirmed) {
            logger.info("Reset cancelled");
            return;
          }
        }

        await resetMigrations(
          ctx.env.omnibaseApiUrl,
          ctx.env.omnibaseServiceKey,
          options.dir,
        );
      } catch (error) {
        handleCommandError(error);
      }
    });

  // ── Prisma Generate command ──────────────────────────────────────────

  migrate
    .command("generate")
    .description("Generate migration SQL from Prisma schema + RLS policies")
    .option(
      "--db-url <url>",
      "Database URL (defaults to postgresql://postgres:postgres@localhost:5432)",
    )
    .option("-n, --name <name>", "Migration name")
    .option(
      "-b, --blank",
      "Create an empty migration to fill in by hand (data backfills, manual DDL)",
    )
    .action(async (options) => {
      try {
        const root = process.cwd();

        let migrationName = options.name;
        if (!migrationName) {
          const { input } = await import("@inquirer/prompts");
          migrationName = await input({ message: "Migration name:" });
        }

        logger.start(
          options.blank
            ? "Creating blank migration..."
            : "Generating migrations...",
        );

        const { generate } =
          await import("../../services/db/generate/generate");
        const files = await generate({
          projectRoot: root,
          dbUrl: options.dbUrl,
          migrationName,
          blank: options.blank,
        });

        logger.succeed(`Generated ${files.length} file(s):`);
        for (const f of files) logger.log(`  ${f}`);
      } catch (error) {
        handleCommandError(error);
      }
    });

  // ── Migrate Down command ────────────────────────────────────────────

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
      try {
        const root = process.cwd();
        const ctx = await getCommandContextWithEnv(program);
        const migrateDir = options.dir || "omnibase/db";
        const migrationsPath = path.join(root, migrateDir);
        const apiUrl = ctx.env.omnibaseApiUrl;
        const serviceKey = ctx.env.omnibaseServiceKey;
        const {
          default: { select },
        } = await import("@inquirer/prompts");
        const migrationsDir = path.join(migrationsPath, "migrations");

        if (!fs.existsSync(migrationsDir)) {
          throw new Error(`No migrations directory found at ${migrationsDir}`);
        }

        // Fetch current version from API (golang-migrate only stores current, not full history)
        let currentVersion = -1;
        try {
          const resp = await fetch(
            `${apiUrl}/api/v1/database/migrations/status`,
            {
              headers: serviceKey ? { "X-Service-Key": serviceKey } : {},
            },
          );
          if (resp.ok) {
            const body = await resp.json();
            const arr = (body.data || []).filter((m: any) => !m.dirty);
            if (arr.length > 0) currentVersion = arr[0].version;
          }
        } catch {
          logger.warn("Could not fetch migration status from API");
        }

        if (currentVersion < 0) {
          logger.info("No migrations have been applied yet");
          return;
        }

        // All local migration dirs with version <= current are considered applied
        const localDirs = fs
          .readdirSync(migrationsDir)
          .filter((f) => fs.statSync(path.join(migrationsDir, f)).isDirectory())
          .sort();

        type MigrationEntry = { dir: string; version: number };
        const applied: MigrationEntry[] = [];
        for (const d of localDirs) {
          const version = parseInt(d.split("_")[0], 10);
          if (isNaN(version)) continue;
          if (version <= currentVersion) {
            applied.push({ dir: d, version });
          }
        }

        if (applied.length <= 1) {
          logger.info("No migrations available to rollback");
          return;
        }

        const currentDir = applied[applied.length - 1].dir;
        const lastVersion = applied[applied.length - 1].version;

        let steps: number;

        if (options.steps) {
          steps = parseInt(options.steps, 10);
          if (isNaN(steps) || steps < 1)
            throw new Error("--steps must be a positive number");
        } else if (options.name) {
          const idx = applied.findIndex((e) => e.dir.includes(options.name));
          if (idx === -1)
            throw new Error(`No applied migration matching "${options.name}"`);
          steps = applied.length - 1 - idx;
          if (steps <= 0) {
            logger.info(
              `Migration "${options.name}" is already at or below the current version`,
            );
            return;
          }
        } else {
          const choices = applied
            .slice(0, -1)
            .reverse()
            .map((e) => {
              const isCurrent = e.version === lastVersion;
              return {
                name: isCurrent ? `${e.dir} (current)` : e.dir,
                value: e.dir,
              };
            });

          if (choices.length === 0) {
            logger.info("No migrations available to rollback");
            return;
          }

          const selected = (await select({
            message: `Select migration to rollback to (currently at ${currentDir}):`,
            choices: [
              { name: "None (rollback all)", value: "__none__" },
              ...choices,
              { name: "Cancel", value: "" },
            ],
          })) as string;

          if (!selected) return;

          if (selected === "__none__") {
            steps = applied.length;
          } else {
            const idx = applied.findIndex((e) => e.dir === selected);
            steps = applied.length - 1 - idx;
          }
        }

        // Zip migrations and POST to down endpoint
        const zip = zipMigrationsDir(migrationsPath);
        const zipBuffer = zip.toBuffer();

        const formData = new FormData();
        const blob = new Blob([zipBuffer], { type: "application/zip" });
        formData.append("migrations", blob, "migrations.zip");

        formData.append("steps", String(steps));

        const downEndpoint = `${apiUrl}/api/v1/database/migrations/down`;
        logger.start(`Rolling back ${steps} migration(s)...`);

        try {
          const headers: Record<string, string> = {};
          if (serviceKey) headers["X-Service-Key"] = serviceKey;

          const response = await fetch(downEndpoint, {
            method: "POST",
            headers,
            body: formData,
          });

          if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(
              body.error ||
                body.message ||
                `${response.status} - ${response.statusText}`,
            );
          }

          const data = await response.json();
          logger.succeed(
            data.data?.message || `Rolled back ${steps} migration(s)`,
          );
        } catch (error) {
          const errorMsg = await extractErrorMessage(error);
          throw new Error(`Failed to rollback: ${errorMsg}`);
        }
      } catch (error) {
        handleCommandError(error);
      }
    });

  // Typegen command
  db.command("typegen")
    .description("Generate types from database schema")
    .option(
      "-o, --output <path>",
      "Output file path (default depends on language)",
    )
    .option(
      "-s, --schema <schemas>",
      "Comma-separated list of schemas to include",
      "public",
    )
    .option(
      "-l, --language <language>",
      "Target language: typescript, go, swift",
    )
    .action(async (options) => {
      try {
        const ctx = await getCommandContextWithEnv(program);
        logger.info(`Using environment: ${ctx.env.name}`);

        const validLanguages: GenerateDatabaseTypesLanguageEnum[] = [
          "typescript",
          "go",
          "swift",
        ];

        let language: GenerateDatabaseTypesLanguageEnum;

        if (options.language) {
          language = options.language as GenerateDatabaseTypesLanguageEnum;
          if (!validLanguages.includes(language)) {
            throw new Error(
              `Unsupported language: ${language}. Supported: ${validLanguages.join(", ")}`,
            );
          }
        } else {
          language = await select({
            message: "Select target language:",
            choices: validLanguages.map((lang) => ({
              name: lang,
              value: lang,
            })),
          });
        }

        const defaultOutputs: Record<
          GenerateDatabaseTypesLanguageEnum,
          string
        > = {
          typescript: "omnibase/types/omnibase.ts",
          go: "omnibase/types/omnibase.go",
          swift: "omnibase/types/Omnibase.swift",
        };
        const outputPath = options.output || defaultOutputs[language];

        await generateTypes(ctx.env, outputPath, options.schema, language);
      } catch (error) {
        handleCommandError(error);
      }
    });
}

/**
 * Create a new migration file with timestamp prefix
 */
async function createMigration(
  migrationsDir: string,
  name?: string,
): Promise<void> {
  const projectRoot = findOmnibaseRoot();
  const migrationsPath = path.join(projectRoot, migrationsDir);

  // Ensure migrations directory exists
  if (!fs.existsSync(migrationsPath)) {
    fs.mkdirSync(migrationsPath, { recursive: true });
    logger.info(`Created migrations directory: ${migrationsPath}`);
  }

  // Get migration name from user if not provided
  let migrationName = name;
  if (!migrationName) {
    const readline = await import("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    migrationName = await new Promise<string>((resolve) => {
      rl.question("Enter migration name: ", resolve);
    });

    rl.close();

    if (!migrationName || migrationName.trim() === "") {
      throw new Error("Migration name cannot be empty");
    }
  }

  // Clean the migration name (remove special characters, replace spaces with underscores)
  const cleanName = migrationName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\s-]/g, "")
    .replace(/[\s-]+/g, "_");

  // Generate timestamp (Unix timestamp in seconds for simplicity)
  const timestamp = Math.floor(Date.now() / 1000);

  // Create filename
  const filename = `${timestamp}_${cleanName}.sql`;
  const filePath = path.join(migrationsPath, filename);

  // Create migration file with template content
  const template = `-- Migration: ${migrationName}
-- Created: ${new Date().toISOString()}

-- Add your SQL migration here
-- Example:
-- CREATE TABLE IF NOT EXISTS example (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name TEXT NOT NULL,
--     created_at TIMESTAMP DEFAULT NOW()
-- );
`;

  fs.writeFileSync(filePath, template);

  logger.succeed(`Created migration file: ${filename}`);
  logger.log(`   Location: ${filePath}`);
  logger.log(`   Edit the file to add your SQL migration commands`);
}

/**
 * Push database migrations (exported for sync command)
 */
export async function pushDbMigrations(envOverride?: string): Promise<void> {
  const env = await selectEnvironment(envOverride);

  if (!env.omnibaseServiceKey) {
    throw new Error(
      "OMNIBASE_SERVICE_KEY not found in environment configuration",
    );
  }

  await applyMigrations(env, "omnibase/db");
}

function zipMigrationsDir(migrationsRoot: string): AdmZip {
  const migrationsDir = path.join(migrationsRoot, "migrations");
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(
      `No migrations directory found at ${migrationsDir}\n` +
        `Run \`omnibase db migrate generate\` first to create migrations.`,
    );
  }

  const dirs = fs
    .readdirSync(migrationsDir)
    .filter((f) => fs.statSync(path.join(migrationsDir, f)).isDirectory())
    .sort();

  if (dirs.length === 0) {
    throw new Error(
      `No migration directories found in ${migrationsDir}\n` +
        `Run \`omnibase db migrate generate\` first to create migrations.`,
    );
  }

  const zip = new AdmZip();
  let fileCount = 0;
  for (const dir of dirs) {
    for (const f of ["migration.sql", "down.sql"]) {
      const p = path.join(migrationsDir, dir, f);
      if (fs.existsSync(p)) {
        zip.addLocalFile(p, dir);
        fileCount++;
      }
    }
  }

  if (fileCount === 0) {
    throw new Error(
      `No migration.sql files found in ${migrationsDir}/<dir>/\n` +
        `Run \`omnibase db migrate generate\` first to create migrations.`,
    );
  }

  logger.log(`Found ${dirs.length} migration(s) (${fileCount} file(s)):`);
  dirs.forEach((d) => logger.log(`   ${d}`));

  return zip;
}

async function uploadMigrationsZip(
  endpoint: string,
  serviceKey: string | undefined,
  zip: AdmZip,
  successMessage: string,
): Promise<void> {
  const zipBuffer = zip.toBuffer();
  logger.log(`Created migration archive (${zipBuffer.length} bytes)`);

  const formData = new FormData();
  const blob = new Blob([zipBuffer], { type: "application/zip" });
  formData.append("migrations", blob, "migrations.zip");

  logger.start(`Uploading migrations...`);

  try {
    const headers: Record<string, string> = {};
    if (serviceKey) headers["X-Service-Key"] = serviceKey;

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(
        body.error ||
          body.message ||
          `${response.status} - ${response.statusText}`,
      );
    }

    const data = await response.json();
    logger.succeed(data.message || successMessage);
  } catch (error) {
    const errorMsg = await extractErrorMessage(error);
    throw new Error(
      `Failed to apply migrations: ${errorMsg}\n` +
        `Please ensure the API is running and accessible.`,
    );
  }
}

async function applyMigrations(
  env: { omnibaseApiUrl: string; omnibaseServiceKey?: string },
  migrationsDir: string,
): Promise<void> {
  const projectRoot = findOmnibaseRoot();
  const migrationsPath = path.join(projectRoot, migrationsDir);

  if (!fs.existsSync(migrationsPath)) {
    throw new Error(
      `Migrations directory not found: ${migrationsPath}\n` +
        `Please ensure the directory exists and contains migration directories.`,
    );
  }

  const zip = zipMigrationsDir(migrationsPath);
  const endpoint = `${env.omnibaseApiUrl}/api/v1/database/migrations`;
  await uploadMigrationsZip(
    endpoint,
    env.omnibaseServiceKey,
    zip,
    "Migrations applied successfully",
  );
}

async function resetMigrations(
  apiUrl: string,
  apiKey: string,
  migrationsDir: string,
): Promise<void> {
  const projectRoot = findOmnibaseRoot();
  const migrationsPath = path.join(projectRoot, migrationsDir);

  if (!fs.existsSync(migrationsPath)) {
    throw new Error(
      `Migrations directory not found: ${migrationsPath}\n` +
        `Please ensure the directory exists and contains migration directories.`,
    );
  }

  const zip = zipMigrationsDir(migrationsPath);
  const endpoint = `${apiUrl}/api/v1/database/migrations/reset`;
  await uploadMigrationsZip(
    endpoint,
    apiKey,
    zip,
    "Database reset and migrations applied successfully",
  );
}

/**
 * Generate types from database schema via the API
 */
async function generateTypes(
  env: EnvironmentConfig,
  outputPath: string,
  schemas: string,
  language: GenerateDatabaseTypesLanguageEnum,
): Promise<void> {
  const projectRoot = findOmnibaseRoot();

  logger.start(`Generating ${language} types...`);
  logger.log(`   Schemas: ${schemas}`);

  try {
    const config = createOmnibaseSDKConfig(env);
    const api = new V1ConfigurationApi(config);

    const data = await api.generateDatabaseTypes({
      schemas,
      language,
    });

    if (!data) {
      throw new Error("No type definitions returned from API");
    }

    const fullOutputPath = path.join(projectRoot, outputPath);
    const outputDir = path.dirname(fullOutputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      logger.info(`Created types directory: ${outputDir}`);
    }

    fs.writeFileSync(fullOutputPath, data);

    logger.succeed(`Generated ${language} types`);
    logger.log(`   Location: ${fullOutputPath}`);
  } catch (error) {
    const errorMsg = await extractErrorMessage(error);
    throw new Error(
      `Failed to generate types: ${errorMsg}\n` +
        `Please ensure the API is running and accessible.`,
    );
  }
}
