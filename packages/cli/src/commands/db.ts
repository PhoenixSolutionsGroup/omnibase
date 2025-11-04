import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
// @ts-ignore - adm-zip doesn't have types
import AdmZip from "adm-zip";
import { findOmnibaseRoot, resolveEnvironment } from "../utils/environment";

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
        console.error("❌ Failed to create migration:");
        console.error(error instanceof Error ? error.message : error);
        process.exit(1);
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
        const parentOptions = program.opts();
        const env = resolveEnvironment(parentOptions.env);

        if (!env.apiKey) {
          throw new Error(
            "OMNIBASE_API_KEY not found in environment configuration"
          );
        }

        await applyMigrations(env.apiUrl, env.apiKey, options.dir);
      } catch (error) {
        console.error("❌ Migration failed:");
        console.error(error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  // Typegen command
  db.command("typegen")
    .description("Generate TypeScript types from database schema")
    .option(
      "-o, --output <path>",
      "Output file path",
      "omnibase/types/database.ts"
    )
    .option(
      "-s, --schema <schemas>",
      "Comma-separated list of schemas to include",
      "public"
    )
    .action(async (options) => {
      try {
        const parentOptions = program.opts();
        const env = resolveEnvironment(parentOptions.env);

        await generateTypes(env, options.output, options.schema);
      } catch (error) {
        console.error("❌ Type generation failed:");
        console.error(error instanceof Error ? error.message : error);
        process.exit(1);
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
    console.log(`📁 Created migrations directory: ${migrationsPath}`);
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

  console.log(`✅ Created migration file: ${filename}`);
  console.log(`📍 Location: ${filePath}`);
  console.log(`\n💡 Edit the file to add your SQL migration commands`);
}

/**
 * Apply migrations by zipping SQL files and sending to API
 */
async function applyMigrations(
  apiUrl: string,
  apiKey: string,
  migrationsDir: string
): Promise<void> {
  const projectRoot = findOmnibaseRoot();
  const migrationsPath = path.join(projectRoot, migrationsDir);

  // Verify migrations directory exists
  if (!fs.existsSync(migrationsPath)) {
    throw new Error(
      `Migrations directory not found: ${migrationsPath}\n` +
        `Please ensure the directory exists and contains .sql migration files.`
    );
  }

  // Get all .sql files from the directory
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

  console.log(`📦 Found ${sqlFiles.length} migration file(s):`);
  sqlFiles.forEach((file) => console.log(`   - ${file}`));

  // Create zip file
  const zip = new AdmZip();
  for (const file of sqlFiles) {
    const filePath = path.join(migrationsPath, file);
    zip.addLocalFile(filePath);
  }

  // Generate zip buffer
  const zipBuffer = zip.toBuffer();
  console.log(`📦 Created migration archive (${zipBuffer.length} bytes)`);

  // Use axios and form-data (same as permissions.ts)
  const FormData = require("form-data");
  const axios = require("axios");

  const formData = new FormData();
  formData.append("migrations", zipBuffer, {
    filename: "migrations.zip",
    contentType: "application/zip",
  });

  // Send to API
  const endpoint = `${apiUrl}/api/v1/database/migrations`;
  console.log(`🚀 Uploading migrations to ${endpoint}...`);

  try {
    const headers: Record<string, string> = {
      ...formData.getHeaders(),
    };

    if (apiKey) {
      headers["x-api-key"] = apiKey;
    }

    const response = await axios.post(endpoint, formData, { headers });

    console.log(
      `✅ ${response.data.message || "Migrations applied successfully"}`
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("fetch")) {
        throw new Error(
          `Failed to connect to API at ${apiUrl}\n` +
            `Please ensure the API is running and accessible.\n` +
            `Original error: ${error.message}`
        );
      }
      throw error;
    }
    throw new Error(`Unknown error occurred: ${error}`);
  }
}

/**
 * Generate TypeScript types from database schema using postgres-meta
 */
async function generateTypes(
  env: { typegenApiUrl?: string },
  outputPath: string,
  schemas: string
): Promise<void> {
  const axios = require("axios");
  const projectRoot = findOmnibaseRoot();

  // Get typegen API URL from environment config or default to localhost
  const typegenApiUrl = env.typegenApiUrl;

  console.log(`🔍 Fetching schema types from ${typegenApiUrl}...`);
  console.log(`📊 Included schemas: ${schemas}`);

  try {
    // Call postgres-meta typegen endpoint
    const url = `${typegenApiUrl}/generators/typescript?included_schemas=${schemas}`;
    const response = await axios.get(url);

    if (!response.data) {
      throw new Error("No type definitions returned from postgres-meta");
    }

    // Prepare output path
    const fullOutputPath = path.join(projectRoot, outputPath);
    const outputDir = path.dirname(fullOutputPath);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📁 Created types directory: ${outputDir}`);
    }

    // Write types to file
    fs.writeFileSync(fullOutputPath, response.data);

    console.log(`✅ Generated TypeScript types`);
    console.log(`📍 Location: ${fullOutputPath}`);
    console.log(
      `\n💡 Import these types in your application to get type-safe database access`
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to generate types from ${typegenApiUrl}\n` +
          `Please ensure postgres-meta is running and accessible.\n` +
          `Original error: ${error.message}`
      );
    }
    throw new Error(`Unknown error occurred: ${error}`);
  }
}
