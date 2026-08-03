import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import { spawnSync } from "child_process";
import { config as dotenvConfig } from "dotenv";
import {
  findOmnibaseRoot,
  getProjectName,
  resolveEnvFilePath,
  EnvironmentConfig,
} from "./environment";
import {
  loadOmnibaseConfig,
  interpolate,
  localEnvFromConfig,
  VarSource,
} from "../config/omnibase-config";

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
 * Build the env file handed to docker compose.
 *
 * The local env file supplies secrets and machine-specific values; anything
 * declared in omnibase.toml is layered on top so the same config drives local
 * containers and cloud deployments. {VAR} resolves from process.env then the
 * env file — for local dev that file is .env.local, which is exactly where
 * dev-only secrets belong.
 *
 * The original file's text is copied verbatim and the derived values appended,
 * so multi-line values (JWKS blobs and the like) survive untouched and the
 * later definitions win.
 *
 * Returns the original env file path when omnibase.toml contributes nothing,
 * so projects without a toml behave as before.
 */
export function buildEffectiveEnvFile(envName: string): string {
  const envPath = resolveEnvFilePath(envName);
  const root = findOmnibaseRoot();

  const fileText = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, "utf-8")
    : "";
  const fileEnv = fs.existsSync(envPath)
    ? dotenvConfig({ path: envPath }).parsed || {}
    : {};

  const sources: VarSource[] = [process.env as VarSource, fileEnv];
  const cfg = interpolate(loadOmnibaseConfig(root), sources);
  const derived = localEnvFromConfig(cfg);

  if (Object.keys(derived).length === 0) {
    return envPath;
  }

  const appended = Object.entries(derived)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  const body =
    (fileText.endsWith("\n") || fileText === "" ? fileText : fileText + "\n") +
    "\n# --- derived from omnibase.toml (overrides the above) ---\n" +
    appended +
    "\n";

  const effectivePath = path.join(
    os.tmpdir(),
    `omnibase-${getProjectName()}-${envName}.env`
  );
  fs.writeFileSync(effectivePath, body, { mode: 0o600 });

  return effectivePath;
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

  const envPath = buildEffectiveEnvFile(options.envConfig.name);

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

  const envPath = buildEffectiveEnvFile(options.envConfig.name);
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
