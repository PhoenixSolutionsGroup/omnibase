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
import { addDocsCommands } from "./commands/docs";
import { selectEnvironment, findOmnibaseRoot } from "./utils/environment";
import { loadConfig, loadWranglerConfigFile, resolveStartEnv } from "./utils/config";
import { logger } from "./utils/logger";
import {
  SummaryEntry,
  formatStartSummary,
  waitForApiReady,
} from "./utils/start-summary";
import {
  getComposeFiles,
  validateComposeFiles,
  runDockerComposeCommand,
  spawnDockerComposeCommand,
} from "./utils/docker";
import { writeAgentPointers } from "./utils/agent-files";
import {
  VERSION_REPOS,
  fetchLatestVersions,
  pinVersionsInToml,
} from "./utils/versions";

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

  const envExample = path.join(omnibaseDir, ".env.example");
  const envLocal = path.join(omnibaseDir, ".env.local");
  if (fs.existsSync(envExample) && !fs.existsSync(envLocal)) {
    fs.copyFileSync(envExample, envLocal);
  }

  writeAgentPointers(targetDir);
}

async function pinTemplateVersions(targetDir: string): Promise<void> {
  const tomlPath = path.join(targetDir, "omnibase", "omnibase.toml");
  const versions = await fetchLatestVersions();
  const missing = Object.keys(VERSION_REPOS).filter((k) => !versions[k]);
  if (missing.length > 0) {
    logger.warn(
      `Could not resolve the latest ${missing.join(", ")} version(s) from Docker Hub; [versions] left unpinned`,
    );
    return;
  }
  const toml = fs.readFileSync(tomlPath, "utf-8");
  fs.writeFileSync(tomlPath, pinVersionsInToml(toml, versions));
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

async function startDockerComposeAttached(
  envOverride: string | undefined,
  composeMode: string | undefined,
  command: string,
): Promise<ChildProcess> {
  const envConfig = await selectEnvironment(envOverride);

  logger.log(`Using environment: ${envConfig.name}`);
  logger.log(`Using mode: ${composeMode || "local"}`);

  const composeFiles = getComposeFiles(composeMode);
  validateComposeFiles(composeFiles);

  return spawnDockerComposeCommand(command, [], {
    mode: composeMode,
    envConfig,
  });
}

program
  .command("init")
  .summary("Initialize a new omnibase project")
  .description(
    "Scaffold an `omnibase/` directory with the project template files.\n\n" +
    "Creates `omnibase/omnibase.toml`, `omnibase/.env.local`, a Stripe " +
    "config, and the default `omnibase/db/` layout. If an `omnibase/` " +
    "directory already exists the command exits without changing anything.\n\n" +
    "The generated `omnibase.toml` has a `[versions]` block pinning `auth`, " +
    "`api`, and `perm` to the latest versions published on Docker Hub, so " +
    "new projects don't pick up breaking images without a config change. " +
    "If Docker Hub can't be reached, the block stays commented out and " +
    "`omnibase start` runs `latest`.\n\n" +
    "```bash\n" +
    "omnibase init\n" +
    "```\n\n" +
    "After: edit `omnibase/omnibase.toml`, add secrets to " +
    "`omnibase/.env.local`, then run `omnibase start`."
  )
  .action(async () => {
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
    await pinTemplateVersions(currentDir);
    logger.succeed("Project initialized successfully");
    logger.newline();
    logger.log("Next steps:");
    logger.log("  1. Edit omnibase/omnibase.toml with your project configuration");
    logger.log("  2. Add secrets to omnibase/.env.local");
    logger.log("  3. Edit stripe.config.json with your Stripe products");
    logger.log("  4. Run 'omnibase start' to begin development");
  });

let childProcesses: ChildProcess[] = [];
let composeProcess: ChildProcess | null = null;

function cleanup(): void {
  for (const cp of childProcesses) {
    if (!cp.killed) cp.kill("SIGTERM");
  }
  childProcesses = [];
}

// An attached `docker compose up` stops its containers on SIGINT; wait for it
// to finish instead of exiting underneath it.
function shutdown(signal: NodeJS.Signals): void {
  cleanup();
  const compose = composeProcess;
  if (compose && compose.exitCode === null && compose.signalCode === null) {
    if (signal === "SIGTERM") compose.kill("SIGTERM");
    return;
  }
  process.exit(0);
}

process.on("SIGINT", () => {
  logger.newline();
  logger.info("Shutting down...");
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

program
  .command("start")
  .summary("Start services and deployment dev servers")
  .description(
    "Start the local control-plane services with Docker Compose, then spawn " +
    "a dev server for every deployment configured in omnibase.toml (or " +
    "`omnibase/workers/`).\n\n" +
    "The control plane runs in the foreground with `docker compose up`, " +
    "streaming its logs; press Ctrl+C to stop everything. Pass `-d` to start " +
    "the containers detached (`docker compose up -d`) and stop them later " +
    "with `omnibase stop`. Each deployment " +
    "directory runs `bun run dev` on `http://localhost:<port>` (default " +
    "ports start at 8787 and increment per deployment).\n\n" +
    "Once the API reports ready, a summary lists the URL of each service " +
    "(API, data API, auth, Postgres, Adminer, Mailpit, storage) and each " +
    "deployment dev server.\n\n" +
    "Image versions: `auth`, `api`, and `perm` run the tags pinned under " +
    "`[versions]` in omnibase.toml. Services not listed there run `latest`.\n\n" +
    "Environment variables: the dev-server processes receive the same " +
    "resolved env as a cloud deploy — `process.env` → `omnibase/.env.<branch>` " +
    "(and `omnibase/.env.local` for the local environment), plus the " +
    "deployment's wrangler " +
    "`[vars]` after `{VAR}` interpolation. See the env resolution model on " +
    "the [`cloud env`](/cli/cloud/env) page.\n\n" +
    "```bash\n" +
    "omnibase start\n" +
    "omnibase start -d\n" +
    "omnibase start --build\n" +
    "```"
  )
  .option("--build", "Build images before starting containers")
  .option("-d, --detach", "Run containers in the background")
  .action(async (cmdOptions) => {
    try {
      const globalOptions = program.opts();
      const mode = globalOptions.mode || "local";
      const detached = Boolean(cmdOptions.detach);
      const composeCommand = [
        "up",
        detached ? "-d" : "",
        cmdOptions.build ? "--build" : "",
      ].filter(Boolean).join(" ");

      if (detached) {
        logger.start("Starting services...");
        await runDockerCompose(globalOptions.env || "local", mode, composeCommand);
        logger.succeed("Control plane services started");
      } else {
        logger.info("Starting services...");
        const compose = await startDockerComposeAttached(
          globalOptions.env || "local",
          mode,
          composeCommand,
        );
        composeProcess = compose;
        compose.on("error", (error) => {
          cleanup();
          logger.fail(`Docker compose failed to start: ${error.message}`);
          process.exit(1);
        });
        compose.on("exit", (code) => {
          cleanup();
          process.exit(code ?? 0);
        });
      }

      const root = findOmnibaseRoot();
      const config = loadConfig(root);
      const envName = globalOptions.env || "local";

      const deployments = config.deployments.length > 0
        ? config.deployments
        : fs.existsSync(path.join(root, "omnibase", "workers"))
          ? [{ name: "default", path: "workers" }]
          : [];

      if (deployments.length === 0) {
        logger.info("No deployments configured. Add [[deployments]] to omnibase.toml");
      } else {
        logger.newline();
        logger.log("Starting deployment dev servers:");
        logger.log("");
      }

      const started: SummaryEntry[] = [];
      for (let i = 0; i < deployments.length; i++) {
        const dep = deployments[i];
        const depPath = path.join(root, "omnibase", dep.path ?? dep.name);
        const port = dep.port ?? 8787 + i;

        if (!fs.existsSync(depPath)) {
          logger.warn(`  ${dep.name}: directory not found at ${depPath}`);
          continue;
        }

        const wranglerConfig = loadWranglerConfigFile(depPath);
        const env = resolveStartEnv(root, envName, wranglerConfig);

        const cp = spawn("bun", ["run", "dev"], {
          cwd: depPath,
          stdio: ["ignore", "pipe", "pipe"],
          env: { ...env, PORT: String(port) },
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
        started.push({ name: dep.name, url: `http://localhost:${port}` });
      }

      logger.newline();
      logger.info("Waiting for services to be ready...");
      const ready = await waitForApiReady();
      logger.newline();
      if (ready) {
        logger.succeed("Omnibase is running");
      } else {
        logger.warn("API did not report ready within 2 minutes; services may still be starting");
      }
      formatStartSummary(started).forEach((line) => { logger.log(line); });
      logger.newline();
      logger.log(
        detached
          ? "Press Ctrl+C to stop the dev servers (run 'omnibase stop' to stop the containers)"
          : "Press Ctrl+C to stop all services",
      );
    } catch (error) {
      cleanup();
      logger.fail(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command("stop")
  .summary("Stop the Docker Compose services")
  .description(
    "Stop the local control-plane services started by `omnibase start` and " +
    "terminate any spawned deployment dev servers.\n\n" +
    "Runs `docker compose down` for the current compose mode.\n\n" +
    "```bash\n" +
    "omnibase stop\n" +
    "```"
  )
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

// Add docs commands
addDocsCommands(program);

if (require.main === module) {
  program.parse();
}
