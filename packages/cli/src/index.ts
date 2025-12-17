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
import { addWorkersCommands } from "./commands/workers";
import {
  resolveEnvironment,
  findOmnibaseRoot,
  getProjectName,
} from "./utils/environment";

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

  // Create omnibase directory
  if (!fs.existsSync(omnibaseDir)) {
    fs.mkdirSync(omnibaseDir, { recursive: true });
  }

  // Copy entire templates directory contents to omnibase/
  fs.cpSync(templateDir, omnibaseDir, { recursive: true });
}

async function runDockerCompose(
  envOverride?: string,
  composeMode?: string,
  ...args: string[]
): Promise<void> {
  try {
    const projectRoot = findOmnibaseRoot();

    // Resolve environment (flag > default > local)
    const envConfig = resolveEnvironment(envOverride);
    const envPath = path.join(
      projectRoot,
      "omnibase",
      "environments",
      `.env.${envConfig.name}`
    );

    // Determine which docker-compose file to use based on --mode flag
    // Default to production (official images) unless explicitly set to 'dev'
    const composeFileName =
      composeMode === "dev" ? "docker-compose.dev.yml" : "docker-compose.yml";

    // Construct the path to docker-compose file (in docker/ directory)
    const dockerComposePath = path.join(
      __dirname,
      "..",
      "docker",
      composeFileName
    );

    // Check if docker-compose.yml exists
    if (!fs.existsSync(dockerComposePath)) {
      throw new Error(
        `docker-compose.yml not found at: ${dockerComposePath}\nMake sure you're in a valid omnibase project directory.`
      );
    }

    // Get project name for Docker Compose namespacing
    const projectName = getProjectName();

    // Prepare docker compose command with env file
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

    console.log(`Using project name: ${projectName}`);
    console.log(`Using environment: ${envConfig.name}`);

    // Execute docker compose command with OMNIBASE_PROJECT_DIR and OMNIBASE_ENV_FILE set
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
      console.log("⚠ omnibase directory already exists");
      console.log(
        "  Remove the existing omnibase directory if you want to reinitialize"
      );
      return;
    }

    console.log("Initializing omnibase project...");
    createTemplateFiles(currentDir);
    console.log("");
    console.log("✓ Project initialized successfully");
    console.log("");
    console.log("Next steps:");
    console.log("  1. Organize the template files in omnibase/ as needed");
    console.log("  2. Edit the .env files with your configuration");
    console.log("  3. Edit stripe.config.json with your Stripe products");
    console.log("  4. Run 'omnibase start' to begin development");
  });

program
  .command("start")
  .description("Start the Docker Compose services")
  .option("--build", "Build images before starting containers")
  .action(async (cmdOptions) => {
    try {
      const globalOptions = program.opts();
      const args = cmdOptions.build ? ["up", "-d", "--build"] : ["up", "-d"];
      await runDockerCompose(globalOptions.env, globalOptions.mode, ...args);
    } catch (error) {
      console.error("✗ Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command("stop")
  .description("Stop the Docker Compose services")
  .action(async () => {
    try {
      const options = program.opts();
      await runDockerCompose(options.env, options.mode, "down");
    } catch (error) {
      console.error("✗ Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Add environment commands
addEnvironmentCommands(program);

// Add permissions commands (now environment-aware)
addPermissionsCommands(program);

// Add auth commands
addAuthCommands(program);

// Add stripe commands
addStripeCommands(program);

// Add email commands
addEmailCommands(program);

// Add database commands (includes migrations and typegen)
addDbCommands(program);

// Add workers commands
addWorkersCommands(program);

program.parse();
