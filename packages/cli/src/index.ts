#!/usr/bin/env node

import { Command } from "commander";
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
import { selectEnvironment } from "./utils/environment";
import { logger } from "./utils/logger";
import {
  getComposeFiles,
  validateComposeFiles,
  runDockerComposeCommand,
} from "./utils/docker";

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
    "Docker compose mode: 'dev', 'test', 'perf-test', or 'default' (default: default)"
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
  command?: string,
  services: string[] = []
): Promise<void> {
  try {
    const envConfig = await selectEnvironment(envOverride);

    logger.log(`Using environment: ${envConfig.name}`);
    logger.log(`Using mode: ${composeMode || "local"}`);

    const composeFiles = getComposeFiles(composeMode);
    validateComposeFiles(composeFiles);

    runDockerComposeCommand(command || "up", services, {
      mode: composeMode,
      envConfig,
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
      const command = cmdOptions.build ? "up -d --build" : "up -d";
      logger.start("Starting services...");
      await runDockerCompose("local", globalOptions.mode, command);
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
