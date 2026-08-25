#!/usr/bin/env node

import { Command } from "commander";
import * as path from "path";
import * as fs from "fs";
import { spawn, ChildProcess } from "child_process";
import packageJson from "../package.json";
import { addPermissionsCommands } from "./commands/permissions";
import { addEnvironmentCommands } from "./commands/environment";
import { addStripeCommands } from "./commands/stripe";
import { addEmailCommands } from "./commands/email";
import { addDbCommands } from "./commands/db";
import { addAuthCommands } from "./commands/auth";
import { addCloudCommands } from "./commands/cloud";
import { addSyncCommands } from "./commands/sync";
import { addRestartCommands } from "./commands/restart";
import { selectEnvironment, findOmnibaseRoot } from "./utils/environment";
import { loadConfig } from "./utils/config";
import { logger } from "./utils/logger";
import {
  getComposeFiles,
  validateComposeFiles,
  runDockerComposeCommand,
} from "./utils/docker";

export const program = new Command();

program
  .name("omnibase")
  .description(
    "OmniBase CLI - Manage Docker Compose services and environment configuration",
  )
  .version(packageJson.version)
  .option("--env <environment>", "Override environment for this command")
  .option(
    "--mode <mode>",
    "Docker compose mode: 'dev', 'test', 'perf-test', or 'default' (default: default)",
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
  services: string[] = [],
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
        "  Remove the existing omnibase directory if you want to reinitialize",
      );
      return;
    }

    logger.start("Initializing omnibase project...");
    createTemplateFiles(currentDir);
    logger.succeed("Project initialized successfully");
    logger.newline();
    logger.log("Next steps:");
    logger.log("  1. Edit omnibase/omnibase.toml with your project configuration");
    logger.log("  2. Add secrets to omnibase/.env.local");
    logger.log("  3. Edit stripe.config.json with your Stripe products");
    logger.log("  4. Run 'omnibase start' to begin development");
  });

let childProcesses: ChildProcess[] = [];

function cleanup(): void {
  for (const cp of childProcesses) {
    if (!cp.killed) cp.kill("SIGTERM");
  }
  childProcesses = [];
}

process.on("SIGINT", () => {
  logger.newline();
  logger.info("Shutting down...");
  cleanup();
  process.exit(0);
});

process.on("SIGTERM", () => {
  cleanup();
  process.exit(0);
});

program
  .command("start")
  .description("Start the Docker Compose services and deployment dev servers")
  .option("--build", "Build images before starting containers")
  .action(async (cmdOptions) => {
    try {
      const globalOptions = program.opts();
      const mode = globalOptions.mode || "local";
      const composeCommand = cmdOptions.build ? "up -d --build" : "up -d";

      logger.start("Starting services...");
      await runDockerCompose("local", mode, composeCommand);
      logger.succeed("Control plane services started");

      const root = findOmnibaseRoot();
      const config = loadConfig(root);

      const deployments = config.deployments.length > 0
        ? config.deployments
        : fs.existsSync(path.join(root, "omnibase", "workers"))
          ? [{ name: "default", path: "workers" }]
          : [];

      if (deployments.length === 0) {
        logger.info("No deployments configured. Add [[deployments]] to omnibase.toml");
        return;
      }

      logger.newline();
      logger.log("Starting deployment dev servers:");
      logger.log("");

      const table: string[] = [];
      for (let i = 0; i < deployments.length; i++) {
        const dep = deployments[i];
        const depPath = path.join(root, "omnibase", dep.path ?? dep.name);
        const port = dep.port ?? 8787 + i;

        if (!fs.existsSync(depPath)) {
          logger.warn(`  ${dep.name}: directory not found at ${depPath}`);
          continue;
        }

        const cp = spawn("bun", ["run", "dev"], {
          cwd: depPath,
          stdio: ["ignore", "pipe", "pipe"],
          env: { ...process.env, PORT: String(port) },
        });

        cp.stdout?.on("data", (data: Buffer) => {
          for (const line of data.toString().split("\n").filter(Boolean)) {
            logger.log(`[${dep.name}] ${line}`);
          }
        });

        cp.stderr?.on("data", (data: Buffer) => {
          for (const line of data.toString().split("\n").filter(Boolean)) {
            logger.log(`[${dep.name}] ${line}`);
          }
        });

        cp.on("exit", (code) => {
          if (code !== null && code !== 0) {
            logger.warn(`[${dep.name}] exited with code ${code}`);
          }
        });

        childProcesses.push(cp);
        table.push(`  ${dep.name.padEnd(16)} http://localhost:${port}`);
      }

      logger.newline();
      logger.log("Dev servers running:");
      table.forEach((line) => { logger.log(line); });
      logger.newline();
      logger.log("Press Ctrl+C to stop all services");
    } catch (error) {
      cleanup();
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
      cleanup();
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

if (require.main === module) {
  program.parse();
}
