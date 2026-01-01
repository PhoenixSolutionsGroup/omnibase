#!/usr/bin/env node

import { Command } from "commander";
import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";
import { addPermissionsCommands } from "./commands/permissions";
import { addEnvironmentCommands } from "./commands/environment";
import { addStripeCommands } from "./commands/stripe";
import { addEmailCommands } from "./commands/email";
import { addDbCommands } from "./commands/db";
import { addAuthCommands } from "./commands/auth";
import { addCloudCommands } from "./commands/cloud";
import { addSyncCommands } from "./commands/sync";
import { addRestartCommands } from "./commands/restart";
import {
  findOmnibaseRoot,
  getProjectName,
  selectEnvironment,
} from "./utils/environment";
import { logger } from "./utils/logger";

const program = new Command();

program
  .name("omnibase")
  .description(
    "OmniBase CLI - Manage Docker Compose services and environment configuration"
  )
  .version("1.0.0")
  .option("--env <environment>", "Override environment for this command")
  .option(
    "--mode <mode>",
    "Docker compose mode: 'dev' or 'default' (default: default)"
  );

function createTemplateFiles(targetDir: string): void {
  const omnibaseDir = path.join(targetDir, "omnibase");
  const templateDir = path.join(__dirname, "..", "templates");

  if (!fs.existsSync(omnibaseDir)) {
    fs.mkdirSync(omnibaseDir, { recursive: true });
  }

  fs.cpSync(templateDir, omnibaseDir, { recursive: true });
}

async function runDockerCompose(
  envOverride?: string,
  composeMode?: string,
  ...args: string[]
): Promise<void> {
  try {
    const projectRoot = findOmnibaseRoot();

    const envConfig = await selectEnvironment(envOverride);
    const envPath = path.join(
      projectRoot,
      "omnibase",
      "environments",
      `.env.${envConfig.name}`
    );

    const composeFileName =
      composeMode === "dev" ? "docker-compose.dev.yml" : "docker-compose.yml";

    const dockerComposePath = path.join(
      __dirname,
      "..",
      "docker",
      composeFileName
    );

    if (!fs.existsSync(dockerComposePath)) {
      throw new Error(
        `docker-compose.yml not found at: ${dockerComposePath}\nMake sure you're in a valid omnibase project directory.`
      );
    }

    const projectName = getProjectName();

    const cmdArgs = [
      "compose",
      "--project-name",
      projectName,
      "-f",
      dockerComposePath,
      "--env-file",
      envPath,
      ...args,
    ];

    logger.log(`Using project name: ${projectName}`);
    logger.log(`Using environment: ${envConfig.name}`);

    execSync(`docker ${cmdArgs.join(" ")}`, {
      stdio: "ignore",
      cwd: projectRoot,
      env: {
        ...process.env,
        OMNIBASE_PROJECT_DIR: projectRoot,
        OMNIBASE_ENV_FILE: envPath,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Docker compose command failed: ${error.message}`);
    }
    throw error;
  }
}

program
  .command("init")
  .description("Initialize a new omnibase project with template files")
  .action(() => {
    const currentDir = process.cwd();
    const omnibaseDir = path.join(currentDir, "omnibase");

    if (fs.existsSync(omnibaseDir)) {
      logger.warn("omnibase directory already exists");
      logger.log(
        "  Remove the existing omnibase directory if you want to reinitialize"
      );
      return;
    }

    logger.start("Initializing omnibase project...");
    createTemplateFiles(currentDir);
    logger.succeed("Project initialized successfully");
    logger.newline();
    logger.log("Next steps:");
    logger.log("  1. Organize the template files in omnibase/ as needed");
    logger.log("  2. Edit the .env files with your configuration");
    logger.log("  3. Edit stripe.config.json with your Stripe products");
    logger.log("  4. Run 'omnibase start' to begin development");
  });

program
  .command("start")
  .description("Start the Docker Compose services")
  .option("--build", "Build images before starting containers")
  .action(async (cmdOptions) => {
    try {
      const globalOptions = program.opts();
      const args = cmdOptions.build ? ["up", "-d", "--build"] : ["up", "-d"];
      logger.start("Starting services...");
      await runDockerCompose("local", globalOptions.mode, ...args);
      logger.succeed("Services started");
    } catch (error) {
      logger.fail(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command("stop")
  .description("Stop the Docker Compose services")
  .action(async () => {
    try {
      const options = program.opts();
      logger.start("Stopping services...");
      await runDockerCompose("local", options.mode, "down");
      logger.succeed("Services stopped");
    } catch (error) {
      logger.fail(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Add environment commands
addEnvironmentCommands(program);

// Add permissions commands
addPermissionsCommands(program);

// Add auth commands
addAuthCommands(program);

// Add stripe commands
addStripeCommands(program);

// Add email commands
addEmailCommands(program);

// Add database commands
addDbCommands(program);

// Add cloud commands
addCloudCommands(program);

// Add sync commands
addSyncCommands(program);

// Add restart commands
addRestartCommands(program);

program.parse();
