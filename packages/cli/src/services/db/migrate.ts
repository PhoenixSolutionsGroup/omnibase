import path from "path";
import { EnvironmentConfig, findOmnibaseRoot } from "../../utils/environment";
import * as fs from "fs";
import { logger } from "../../utils/logger";
import { ensureMigrationDir, zipMigrationsDir } from "./utils";
import { userInput } from "../../utils/user-input";
import { createConfig } from "../../lib/omnibase";
import { V1DatabaseApi } from "@omnibase/core-js";

type GenerateDatabaseTypesLanguageEnum = "typescript" | "go" | "swift";
import { generate } from "./generate/generate";
import {
  composeExec,
  DockerComposeOptions,
  runDockerComposeCommand,
} from "../../utils/docker";

export type MigrationEntry = { dir: string; version: number };

export const ROLLBACK_ALL = "__none__";

export function resolveAppliedMigrations(
  localDirs: string[],
  currentVersion: number,
): MigrationEntry[] {
  const applied: MigrationEntry[] = [];
  for (const d of [...localDirs].sort()) {
    const version = parseInt(d.split("_")[0], 10);
    if (isNaN(version)) continue;
    if (version <= currentVersion) applied.push({ dir: d, version });
  }
  return applied;
}

export function rollbackTargets(applied: MigrationEntry[]): string[] {
  return applied
    .slice(0, -1)
    .reverse()
    .map((e) => e.dir);
}

export function rollbackSteps(
  applied: MigrationEntry[],
  selected: string,
): number {
  if (selected === ROLLBACK_ALL) return applied.length;
  const idx = applied.findIndex((e) => e.dir === selected);
  if (idx < 0) return 0;
  return applied.length - 1 - idx;
}

export class DatabaseMigrationService {
  private verifyEnv(
    env: EnvironmentConfig,
  ): Required<
    Pick<EnvironmentConfig, "omnibaseApiUrl" | "omnibaseServiceKey">
  > {
    if (!env.omnibaseApiUrl || !env.omnibaseServiceKey)
      throw new Error(
        "Both OMNIBASE_API_URL and OMNIBASE_SERVICE_KEY must be set",
      );
    return {
      omnibaseApiUrl: env.omnibaseApiUrl,
      omnibaseServiceKey: env.omnibaseServiceKey,
    };
  }

  async new(migrationsDir: string, name?: string): Promise<void> {
    ensureMigrationDir(migrationsDir);

    if (!name) name = await userInput("Enter migration name: ");

    const cleanName = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_\s-]/g, "")
      .replace(/[\s-]+/g, "_");

    const timestamp = Math.floor(Date.now() / 1000);
    const dirName = `${timestamp}_${cleanName}`;
    const dir = path.join(migrationsDir, dirName);

    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "migration.sql"),
      `-- Migration: ${name}\n`,
    );
    fs.writeFileSync(path.join(dir, "down.sql"), "");

    logger.succeed(`Created migration: ${dirName}`);
    logger.log(`  ${path.join(dir, "migration.sql")}`);
    logger.log(`  ${path.join(dir, "down.sql")}`);
  }

  async push(migrationsDir: string, env: EnvironmentConfig): Promise<void> {
    const vEnv = this.verifyEnv(env);
    ensureMigrationDir(migrationsDir);

    const zip = zipMigrationsDir(migrationsDir).toBuffer();
    const blob = new Blob([zip], { type: "application/zip" });
    const config = createConfig({
      apiKey: vEnv.omnibaseServiceKey,
      basePath: vEnv.omnibaseApiUrl,
    });

    const client = new V1DatabaseApi(config);
    try {
      const response = (await client.uploadDatabaseMigrations({
        migrations: blob,
      })) as { message?: string };
      logger.succeed(response.message || "Migrations applied successfully");
    } catch (error) {
      logger.fail("Failed to apply migrations");
      throw error;
    }
  }

  async reset(migrationsDir: string, env: EnvironmentConfig): Promise<void> {
    this.verifyEnv(env);
    const dockerOpts: DockerComposeOptions = { envConfig: env, stdio: "pipe" };
    logger.start("Ensuring postgres is running...");
    runDockerComposeCommand("up -d", ["postgres"], dockerOpts);
    logger.succeed("Postgres running");

    logger.start("Dropping and recreating database...");
    composeExec(
      "postgres",
      [
        "psql",
        "-U",
        "postgres",
        "-c",
        "DROP DATABASE IF EXISTS db WITH (FORCE)",
        "-c",
        "CREATE DATABASE db",
      ],
      dockerOpts,
    );
    logger.succeed("Successfully recreated database");

    logger.start("Applying init migrations...");
    runDockerComposeCommand("restart", ["db-migrate"], dockerOpts);
    logger.succeed("Successfully applied init migrations");

    logger.start("Ensuring rest-api is running...");
    runDockerComposeCommand("restart", ["rest-api"], dockerOpts);
    logger.succeed("Rest API running");

    logger.start("Applying permissions migrations...");
    runDockerComposeCommand("restart", ["permissions-migrate"], dockerOpts);
    logger.succeed("Permissions migrations applied");

    logger.start("Applying auth migrations...");
    runDockerComposeCommand("restart", ["auth-migrate"], dockerOpts);
    logger.succeed("Auth migrations applied");

    logger.start("Applying user migrations...");
    await this.push(migrationsDir, env);
    logger.succeed("Finished reset");
  }

  async generate(
    migrationsDir: string,
    name: string,
    schemaDir: string,
    policiesDir: string,
    dbUrl?: string,
  ) {
    ensureMigrationDir(migrationsDir);
    const files = await generate({
      migrationsDir,
      schemaDir,
      policiesDir,
      dbUrl,
      migrationName: name,
    });
    logger.succeed(`Generated ${files.length} file(s):`);
    for (const f of files) logger.log(`  ${f}`);
  }

  async down(migrationsDir: string, env: EnvironmentConfig) {
    const vEnv = this.verifyEnv(env);
    ensureMigrationDir(migrationsDir);

    const config = createConfig({ apiKey: vEnv.omnibaseServiceKey, basePath: vEnv.omnibaseApiUrl });
    const client = new V1DatabaseApi(config);

    // Fetch current version from API
    let currentVersion = -1;
    try {
      const res = await client.getDatabaseMigrationStatus()
      if (!res || res.length < 1) throw new Error()
      currentVersion = res[0].version
    } catch {
      logger.warn("Could not fetch migration status from API");
    }

    if (currentVersion < 0) {
      logger.info("No migrations have been applied yet");
      return;
    }

    const localDirs = fs
      .readdirSync(migrationsDir)
      .filter((f) => fs.statSync(path.join(migrationsDir, f)).isDirectory());

    const applied = resolveAppliedMigrations(localDirs, currentVersion);

    if (applied.length < 1) {
      logger.info("No migrations available to rollback");
      return;
    }

    const currentDir = applied[applied.length - 1].dir;

    const choices = rollbackTargets(applied).map((dir) => ({
      name: dir,
      value: dir,
    }));

    const { select } = await import("@inquirer/prompts");
    const selected = (await select({
      message: `Select migration to rollback to (currently at ${currentDir}):`,
      choices: [
        { name: "None (rollback all)", value: ROLLBACK_ALL },
        ...choices,
        { name: "Cancel", value: "" },
      ],
    })) as string;

    if (!selected) return;

    const steps = rollbackSteps(applied, selected);

    // Zip migrations and POST to down endpoint
    const zip = zipMigrationsDir(migrationsDir);
    const zipBuffer = zip.toBuffer();
    const blob = new Blob([zipBuffer], { type: "application/zip" });

    try {
      logger.start(`Rolling back ${steps} migration(s)...`);
      const res = await client.rollbackDatabaseMigrations({ migrations: blob, steps: String(steps) })
      if (!res) throw new Error()
      logger.succeed(res.message || `Rolled back ${steps} migration(s)`);
    } catch (error) {
      logger.fail("Failed to rollback migrations");
    }
  }

  async typegen(
    env: EnvironmentConfig,
    language: GenerateDatabaseTypesLanguageEnum,
    schemas: string,
    outputPath: string,
  ) {
    const vEnv = this.verifyEnv(env);
    const config = createConfig({
      apiKey: vEnv.omnibaseServiceKey,
      basePath: vEnv.omnibaseApiUrl,
    });
    const client = new V1DatabaseApi(config);

    try {
      const data = await client.generateDatabaseTypes({ language, schemas });

      if (!data) {
        throw new Error("No type definitions returned from API");
      }

      const fullOutputPath = path.join(findOmnibaseRoot(), outputPath);
      const outputDir = path.dirname(fullOutputPath);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        logger.info(`Created types directory: ${outputDir}`);
      }

      fs.writeFileSync(fullOutputPath, data);

      logger.succeed(`Generated ${language} types`);
      logger.log(`   Location: ${fullOutputPath}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to generate types: ${errorMsg}\n` +
        "Please ensure the API is running and accessible.",
      );
    }
  }
}
