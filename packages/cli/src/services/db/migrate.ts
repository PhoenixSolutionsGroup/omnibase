import path from "path";
import { EnvironmentConfig, findOmnibaseRoot } from "../../utils/environment";
import * as fs from "fs";
import { logger } from "../../utils/logger";
import { ensureMigrationDir, zipMigrationsDir } from "./utils";
import { userInput } from "../../utils/user-input";
import { createConfig } from "../../lib/omnibase";
import { V1ConfigurationApi } from "@omnibase/core-js";
import { generate } from "./generate/generate";

export class DatabaseMigrationService {
  private migrationPath(migrationsPath: string) {
    return path.join(findOmnibaseRoot(), migrationsPath);
  }

  async new(migrationsDir: string, name?: string): Promise<void> {
    const mPath = this.migrationPath(migrationsDir);
    ensureMigrationDir(mPath);

    if (!name) name = await userInput("Enter migration name: ");

    const cleanName = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_\s-]/g, "")
      .replace(/[\s-]+/g, "_");

    const timestamp = Math.floor(Date.now() / 1000);

    const filename = `${timestamp}_${cleanName}.sql`;
    const filePath = path.join(mPath, filename);

    fs.writeFileSync(filePath, `-- Migration: ${name}`);

    logger.succeed(`Created migration file: ${filename}`);
    logger.log(`   Location: ${filePath}`);
    logger.log(`   Edit the file to add your SQL migration commands`);
  }

  async push(
    migrationsDir: string,
    env: Required<
      Pick<EnvironmentConfig, "omnibaseApiUrl" | "omnibaseServiceKey">
    >,
  ): Promise<void> {
    const mPath = this.migrationPath(migrationsDir);
    ensureMigrationDir(mPath);

    const zip = zipMigrationsDir(mPath).toBuffer();
    const blob = new Blob([zip], { type: "application/zip" });
    const config = createConfig({
      apiKey: env.omnibaseServiceKey,
      basePath: env.omnibaseApiUrl,
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

  async reset(
    migrationsDir: string,
    env: Required<
      Pick<EnvironmentConfig, "omnibaseApiUrl" | "omnibaseServiceKey">
    >,
  ): Promise<void> {
    const mPath = this.migrationPath(migrationsDir);
    ensureMigrationDir(mPath);

    const zip = zipMigrationsDir(mPath).toBuffer();
    // TODO: After migration to @omnibase/core-js
    const blob = new Blob([zip], { type: "application/zip" });
    const config = createConfig({
      apiKey: env.omnibaseServiceKey,
      basePath: env.omnibaseApiUrl,
    });

    const client = new V1ConfigurationApi(config);
    try {
      const response = await client.resetDatabaseMigrations({
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

  async generate(migrationsDir: string, name: string, dbUrl?: string) {
    const files = await generate({
      projectRoot: migrationsDir,
      dbUrl,
      migrationName: name,
    });
    logger.succeed(`Generated ${files.length} file(s):`);
    for (const f of files) logger.log(`  ${f}`);
  }

  async down(migrationsDir: string) {}
}
