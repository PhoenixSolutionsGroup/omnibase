import path from "path";
import { EnvironmentConfig, findOmnibaseRoot } from "../../utils/environment";
import * as fs from "fs";
import { logger } from "../../utils/logger";
import { ensureMigrationDir, zipMigrationsDir } from "./utils";
import { userInput } from "../../utils/user-input";
import { createConfig } from "../../lib/omnibase";
import { V1ConfigurationApi } from "@omnibase/core-js";
import { generate } from "./generate/generate";
import {
  composeExec,
  DockerComposeOptions,
  runDockerComposeCommand,
} from "../../utils/docker";

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

    const client = new V1ConfigurationApi(config);
    try {
      const response = await client.uploadDatabaseMigrations({
        migrations: blob,
      });
      logger.succeed(response.message);
    } catch (error) {
      logger.fail("Failed to apply migrations");
      if (error instanceof Error) {
        logger.fail(error.message);
      }
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

    // Fetch current version from API
    let currentVersion = -1;
    try {
      const resp = await fetch(
        `${vEnv.omnibaseApiUrl}/api/v1/database/migrations/status`,
        {
          headers: vEnv.omnibaseServiceKey
            ? { "X-Service-Key": vEnv.omnibaseServiceKey }
            : {},
        },
      );
      if (resp.ok) {
        const body = (await resp.json()) as {
          data?: { version: number; dirty: boolean }[];
        };
        const arr = (body.data || []).filter((m) => !m.dirty);
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

    const lastVersion = applied[applied.length - 1].version;
    const currentDir = applied[applied.length - 1].dir;

    const choices = applied
      .slice(0, -1)
      .reverse()
      .map((e) => ({
        name: e.version === lastVersion ? `${e.dir} (current)` : e.dir,
        value: e.dir,
      }));

    if (choices.length === 0) {
      logger.info("No migrations available to rollback");
      return;
    }

    const { select } = await import("@inquirer/prompts");
    const selected = (await select({
      message: `Select migration to rollback to (currently at ${currentDir}):`,
      choices: [
        { name: "None (rollback all)", value: "__none__" },
        ...choices,
        { name: "Cancel", value: "" },
      ],
    })) as string;

    if (!selected) return;

    let steps: number;
    if (selected === "__none__") {
      steps = applied.length;
    } else {
      const idx = applied.findIndex((e) => e.dir === selected);
      steps = applied.length - 1 - idx;
    }

    // Zip migrations and POST to down endpoint
    const zip = zipMigrationsDir(migrationsDir);
    const zipBuffer = zip.toBuffer();
    const blob = new Blob([zipBuffer], { type: "application/zip" });

    const formData = new FormData();
    formData.append("migrations", blob, "migrations.zip");
    formData.append("steps", String(steps));

    const downEndpoint = `${vEnv.omnibaseApiUrl}/api/v1/database/migrations/down`;
    logger.start(`Rolling back ${steps} migration(s)...`);

    try {
      const headers: Record<string, string> = {};
      if (vEnv.omnibaseServiceKey)
        headers["X-Service-Key"] = vEnv.omnibaseServiceKey;

      const response = await fetch(downEndpoint, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as Record<
          string,
          string
        >;
        throw new Error(
          body.error ||
            body.message ||
            `${response.status} - ${response.statusText}`,
        );
      }

      const data = (await response.json()) as { data?: { message?: string } };
      logger.succeed(data.data?.message || `Rolled back ${steps} migration(s)`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to rollback: ${errorMsg}\n` +
          `Please ensure the API is running and accessible.`,
      );
    }
  }

  async typegen() {}
}
