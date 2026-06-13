import * as path from "path";
import * as fs from "fs";
import { spawnSync } from "child_process";
import {
  findOmnibaseRoot,
  getProjectName,
  EnvironmentConfig,
} from "./environment";

/**
 * Get the path to the CLI's docker directory
 */
export function getDockerDir(): string {
  return path.join(__dirname, "..", "..", "docker");
}

/**
 * Get the list of compose files for a given mode
 */
export function getComposeFiles(mode?: string): string[] {
  const dockerDir = getDockerDir();
  const baseFile = path.join(dockerDir, "docker-compose.base.yml");

  const files = [baseFile];

  if (mode === "dev") {
    files.push(path.join(dockerDir, "docker-compose.dev.yml"));
  } else if (mode === "test") {
    files.push(path.join(dockerDir, "docker-compose.test.yml"));
  } else if (mode === "perf-test") {
    files.push(path.join(dockerDir, "docker-compose.perf-test.yml"));
  } else {
    // No mode specified - use local compose with persistent volumes
    files.push(path.join(dockerDir, "docker-compose.local.yml"));
  }

  return files;
}

/**
 * Validate that all compose files exist
 */
export function validateComposeFiles(files: string[]): void {
  for (const file of files) {
    if (!fs.existsSync(file)) {
      throw new Error(
        `Compose file not found at: ${file}\nMake sure you're in a valid omnibase project directory.`,
      );
    }
  }
}

export interface DockerComposeOptions {
  mode?: string;
  envConfig: EnvironmentConfig;
  stdio?: "inherit" | "ignore" | "pipe";
}

/**
 * Run a docker compose command with the correct compose files and environment
 */
export function runDockerComposeCommand(
  command: string,
  services: string[],
  options: DockerComposeOptions,
): void {
  const projectRoot = findOmnibaseRoot();
  const projectName = getProjectName();
  const composeFiles = getComposeFiles(options.mode);

  validateComposeFiles(composeFiles);

  const envPath = path.join(
    projectRoot,
    "omnibase",
    "environments",
    `.env.${options.envConfig.name}`,
  );

  const composeArgs = composeFiles.flatMap((f) => ["-f", f]);
  const serviceArgs = services.length > 0 ? services : [];

  const commandParts = command.split(/\s+/);
  const cmdArgs = [
    "compose",
    "--project-name",
    projectName,
    ...composeArgs,
    "--env-file",
    envPath,
    ...commandParts,
    ...serviceArgs,
  ];

  const result = spawnSync("docker", cmdArgs, {
    stdio: options.stdio || "inherit",
    cwd: projectRoot,
    env: {
      ...process.env,
      OMNIBASE_PROJECT_DIR: projectRoot,
      OMNIBASE_ENV_FILE: envPath,
    },
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: docker ${cmdArgs.join(" ")}`);
  }
}

/**
 * Run a command inside a running docker compose service
 */
export function composeExec(
  service: string,
  cmd: string[],
  options: DockerComposeOptions,
): void {
  const projectRoot = findOmnibaseRoot();
  const projectName = getProjectName();
  const composeFiles = getComposeFiles(options.mode);

  validateComposeFiles(composeFiles);

  const envPath = path.join(
    projectRoot,
    "omnibase",
    "environments",
    `.env.${options.envConfig.name}`,
  );
  const composeArgs = composeFiles.flatMap((f) => ["-f", f]);
  const cmdArgs = [
    "compose",
    "--project-name",
    projectName,
    ...composeArgs,
    "--env-file",
    envPath,
    "exec",
    "-T",
    service,
    ...cmd,
  ];

  const result = spawnSync("docker", cmdArgs, {
    stdio: options.stdio || "inherit",
    cwd: projectRoot,
    env: {
      ...process.env,
      OMNIBASE_PROJECT_DIR: projectRoot,
      OMNIBASE_ENV_FILE: envPath,
    },
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: docker ${cmdArgs.join(" ")}`);
  }
}

/**
 * Restart a docker service
 */
export async function restartDockerService(
  service: string,
  options: DockerComposeOptions,
): Promise<boolean> {
  try {
    runDockerComposeCommand("restart", [service], options);
    return true;
  } catch (error: any) {
    return false;
  }
}
