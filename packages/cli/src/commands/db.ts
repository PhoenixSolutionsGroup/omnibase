import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
// @ts-ignore - adm-zip doesn't have types
import AdmZip from "adm-zip";
import {
  EnvironmentConfig,
  findOmnibaseRoot,
  selectEnvironment,
} from "../utils/environment";
import { select } from "@inquirer/prompts";
import { logger } from "../utils/logger";
import { handleCommandError } from "../utils/errors";
import { getCommandContextWithEnv } from "../utils/context";
import { createOmnibaseSDKConfig } from "../utils/api-client";
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
      "omnibase/db"
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
      "omnibase/db"
    )
    .action(async (options) => {
      try {
        const ctx = await getCommandContextWithEnv(program);
        logger.info(`Using environment: ${ctx.env.name}`);

        if (!ctx.env.omnibaseServiceKey) {
          throw new Error(
            "OMNIBASE_SERVICE_KEY not found in environment configuration"
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
      "Reset database: drop all tables and re-apply migrations (DESTRUCTIVE)"
    )
    .option(
      "-d, --dir <directory>",
      "Directory containing migration files",
      "omnibase/db"
    )
    .option("-y, --yes", "Skip confirmation prompt")
    .action(async (options) => {
      try {
        const ctx = await getCommandContextWithEnv(program);
        logger.info(`Using environment: ${ctx.env.name}`);

        if (!ctx.env.omnibaseServiceKey) {
          throw new Error(
            "OMNIBASE_SERVICE_KEY not found in environment configuration"
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
              }
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
          options.dir
        );
      } catch (error) {
        handleCommandError(error);
      }
    });

  // Typegen command
  db.command("typegen")
    .description("Generate types from database schema")
    .option(
      "-o, --output <path>",
      "Output file path (default depends on language)"
    )
    .option(
      "-s, --schema <schemas>",
      "Comma-separated list of schemas to include",
      "public"
    )
    .option("-l, --language <language>", "Target language: typescript, go, swift")
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
              `Unsupported language: ${language}. Supported: ${validLanguages.join(", ")}`
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
  name?: string
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
      "OMNIBASE_SERVICE_KEY not found in environment configuration"
    );
  }

  await applyMigrations(env, "omnibase/db");
}

/**
 * Apply migrations by zipping SQL files and sending to API
 * Note: Using native fetch instead of SDK because SDK doesn't include filename in FormData
 */
async function applyMigrations(
  env: { omnibaseApiUrl: string; omnibaseServiceKey?: string },
  migrationsDir: string
): Promise<void> {
  const projectRoot = findOmnibaseRoot();
  const migrationsPath = path.join(projectRoot, migrationsDir);

  if (!fs.existsSync(migrationsPath)) {
    throw new Error(
      `Migrations directory not found: ${migrationsPath}\n` +
        `Please ensure the directory exists and contains .sql migration files.`
    );
  }

  const sqlFiles = fs
    .readdirSync(migrationsPath)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  if (sqlFiles.length === 0) {
    throw new Error(
      `No .sql files found in ${migrationsPath}\n` +
        `Please add migration files (e.g., 001-seed.sql, 002-rls.sql)`
    );
  }

  logger.log(`Found ${sqlFiles.length} migration file(s):`);
  sqlFiles.forEach((file) => logger.log(`   - ${file}`));

  const zip = new AdmZip();
  for (const file of sqlFiles) {
    const filePath = path.join(migrationsPath, file);
    zip.addLocalFile(filePath);
  }

  const zipBuffer = zip.toBuffer();
  logger.log(`Created migration archive (${zipBuffer.length} bytes)`);

  const formData = new FormData();
  const blob = new Blob([zipBuffer], { type: "application/zip" });
  formData.append("migrations", blob, "migrations.zip");

  const endpoint = `${env.omnibaseApiUrl}/api/v1/database/migrations`;
  logger.start(`Uploading migrations...`);

  try {
    const headers: Record<string, string> = {};
    if (env.omnibaseServiceKey) {
      headers["X-Service-Key"] = env.omnibaseServiceKey;
    }

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
          `${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    logger.succeed(data.message || "Migrations applied successfully");
  } catch (error) {
    const errorMsg = await extractErrorMessage(error);
    throw new Error(
      `Failed to apply migrations: ${errorMsg}\n` +
        `Please ensure the API is running and accessible.`
    );
  }
}

/**
 * Reset database by dropping all tables and re-applying migrations
 * Note: Reset endpoint not in SDK, using native fetch
 */
async function resetMigrations(
  apiUrl: string,
  apiKey: string,
  migrationsDir: string
): Promise<void> {
  const projectRoot = findOmnibaseRoot();
  const migrationsPath = path.join(projectRoot, migrationsDir);

  if (!fs.existsSync(migrationsPath)) {
    throw new Error(
      `Migrations directory not found: ${migrationsPath}\n` +
        `Please ensure the directory exists and contains .sql migration files.`
    );
  }

  const sqlFiles = fs
    .readdirSync(migrationsPath)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  if (sqlFiles.length === 0) {
    throw new Error(
      `No .sql files found in ${migrationsPath}\n` +
        `Please add migration files (e.g., 001-seed.sql, 002-rls.sql)`
    );
  }

  logger.log(`Found ${sqlFiles.length} migration file(s):`);
  sqlFiles.forEach((file) => logger.log(`   - ${file}`));

  const zip = new AdmZip();
  for (const file of sqlFiles) {
    const filePath = path.join(migrationsPath, file);
    zip.addLocalFile(filePath);
  }

  const zipBuffer = zip.toBuffer();
  logger.log(`Created migration archive (${zipBuffer.length} bytes)`);

  const formData = new FormData();
  const blob = new Blob([zipBuffer], { type: "application/zip" });
  formData.append("migrations", blob, "migrations.zip");

  const endpoint = `${apiUrl}/api/v1/database/migrations/reset`;
  logger.start(`Resetting database and applying migrations...`);

  try {
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers["X-Service-Key"] = apiKey;
    }

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
          `${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    logger.succeed(
      data.message || "Database reset and migrations applied successfully"
    );
  } catch (error) {
    const errorMsg = await extractErrorMessage(error);
    throw new Error(
      `Failed to reset database: ${errorMsg}\n` +
        `Please ensure the API is running and accessible.`
    );
  }
}

/**
 * Generate types from database schema via the API
 */
async function generateTypes(
  env: EnvironmentConfig,
  outputPath: string,
  schemas: string,
  language: GenerateDatabaseTypesLanguageEnum
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
        `Please ensure the API is running and accessible.`
    );
  }
}
